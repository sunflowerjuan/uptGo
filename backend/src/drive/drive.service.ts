import {
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AuthProvider } from "@prisma/client";
import type { Auth, drive_v3 } from "googleapis";
import { google } from "googleapis";
import { Readable } from "stream";
import { PrismaService } from "../prisma/prisma.service";
import { DriveFileResponseDto } from "./dto/drive-file-response.dto";
import type { DriveFolderResponseDto } from "./dto/drive-folder-response.dto";
import type { UploadAttachmentDto } from "./dto/upload-attachment.dto";
import type { UploadBackupDto } from "./dto/upload-backup.dto";

const UPTGO_FOLDER_NAME = "UPTGO Backup";
const ATTACHMENTS_FOLDER_NAME = "UPTGO Attachments";
const FOLDER_MIME = "application/vnd.google-apps.folder";
const JSON_MIME = "application/json";

@Injectable()
export class DriveService {
	private readonly logger = new Logger(DriveService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly config: ConfigService,
	) {}

	private createOAuth2Client(): Auth.OAuth2Client {
		return new google.auth.OAuth2(
			this.config.getOrThrow<string>("GOOGLE_CLIENT_ID"),
			this.config.getOrThrow<string>("GOOGLE_CLIENT_SECRET"),
		);
	}

	private async getAuthenticatedDrive(userId: string): Promise<drive_v3.Drive> {
		const token = await this.prisma.oAuthToken.findFirst({
			where: { userId, provider: AuthProvider.GOOGLE },
		});

		if (!token) {
			throw new ForbiddenException(
				"No hay tokens de Google. Inicia sesión con Google nuevamente para autorizar el acceso a Drive.",
			);
		}

		if (!token.refreshToken) {
			throw new ForbiddenException(
				"No se encontró un refresh token de Google. Cierra sesión e inicia sesión de nuevo.",
			);
		}

		const oauth2Client = this.createOAuth2Client();
		oauth2Client.setCredentials({
			access_token: token.accessToken,
			refresh_token: token.refreshToken,
		});

		oauth2Client.on("tokens", (tokens) => {
			if (tokens.access_token) {
				void this.prisma.oAuthToken.update({
					where: { userId_provider: { userId, provider: AuthProvider.GOOGLE } },
					data: {
						accessToken: tokens.access_token,
						...(tokens.expiry_date != null
							? { expiresAt: new Date(tokens.expiry_date) }
							: {}),
					},
				});
			}
		});

		return google.drive({ version: "v3", auth: oauth2Client });
	}

	async getOrCreateFolder(userId: string): Promise<DriveFolderResponseDto> {
		const drive = await this.getAuthenticatedDrive(userId);

		const syncMeta = await this.prisma.syncMetadata.findUnique({
			where: { userId },
		});

		if (syncMeta?.driveFolderId) {
			try {
				const { data } = await drive.files.get({
					fileId: syncMeta.driveFolderId,
					fields: "id, name, trashed",
				});
				if (!data.trashed && data.id) {
					return {
						folderId: data.id,
						folderName: data.name ?? UPTGO_FOLDER_NAME,
					};
				}
			} catch {
				this.logger.debug(
					`Carpeta cacheada no encontrada para usuario ${userId}, creando nueva`,
				);
			}
		}

		const { data: searchResult } = await drive.files.list({
			q: `name='${UPTGO_FOLDER_NAME}' and mimeType='${FOLDER_MIME}' and trashed=false`,
			fields: "files(id, name)",
			spaces: "drive",
		});

		let folderId: string;
		let folderName: string;

		const existing = searchResult.files?.[0];
		if (existing?.id) {
			folderId = existing.id;
			folderName = existing.name ?? UPTGO_FOLDER_NAME;
		} else {
			const { data: created } = await drive.files.create({
				requestBody: { name: UPTGO_FOLDER_NAME, mimeType: FOLDER_MIME },
				fields: "id, name",
			});

			if (!created.id) {
				throw new InternalServerErrorException(
					"Google Drive no devolvió un ID para la carpeta creada",
				);
			}

			folderId = created.id;
			folderName = created.name ?? UPTGO_FOLDER_NAME;
		}

		await this.prisma.syncMetadata.upsert({
			where: { userId },
			create: { userId, driveFolderId: folderId },
			update: { driveFolderId: folderId },
		});

		return { folderId, folderName };
	}

	async listBackups(userId: string): Promise<DriveFileResponseDto[]> {
		const drive = await this.getAuthenticatedDrive(userId);
		const { folderId } = await this.getOrCreateFolder(userId);

		const { data } = await drive.files.list({
			q: `'${folderId}' in parents and trashed=false`,
			fields: "files(id, name, size, createdTime, modifiedTime, mimeType)",
			orderBy: "modifiedTime desc",
		});

		return (data.files ?? []).map((file) =>
			DriveFileResponseDto.fromDriveFile(file),
		);
	}

	async uploadBackup(
		userId: string,
		dto: UploadBackupDto,
	): Promise<DriveFileResponseDto> {
		const drive = await this.getAuthenticatedDrive(userId);
		const { folderId } = await this.getOrCreateFolder(userId);

		const { data } = await drive.files.create({
			requestBody: {
				name: dto.fileName,
				mimeType: JSON_MIME,
				parents: [folderId],
				description: dto.description,
			},
			media: {
				mimeType: JSON_MIME,
				body: JSON.stringify(dto.content),
			},
			fields: "id, name, size, createdTime, modifiedTime, mimeType",
		});

		return DriveFileResponseDto.fromDriveFile(data);
	}

	async getBackup(
		userId: string,
		fileId: string,
	): Promise<DriveFileResponseDto> {
		const drive = await this.getAuthenticatedDrive(userId);

		try {
			const { data } = await drive.files.get({
				fileId,
				fields: "id, name, size, createdTime, modifiedTime, mimeType",
			});
			return DriveFileResponseDto.fromDriveFile(data);
		} catch {
			throw new NotFoundException(
				`Archivo ${fileId} no encontrado en Google Drive`,
			);
		}
	}

	async deleteBackup(userId: string, fileId: string): Promise<void> {
		const drive = await this.getAuthenticatedDrive(userId);

		try {
			await drive.files.delete({ fileId });
		} catch {
			throw new NotFoundException(
				`Archivo ${fileId} no encontrado en Google Drive`,
			);
		}
	}

	async downloadBackupContent(
		userId: string,
		fileId: string,
	): Promise<Record<string, unknown>> {
		const drive = await this.getAuthenticatedDrive(userId);

		try {
			const response = await drive.files.get(
				{ fileId, alt: "media" },
				{ responseType: "json" },
			);
			return response.data as Record<string, unknown>;
		} catch {
			throw new NotFoundException(
				`Backup ${fileId} no encontrado en Google Drive`,
			);
		}
	}

	private async getOrCreateAttachmentsFolder(
		drive: drive_v3.Drive,
		parentFolderId: string,
	): Promise<string> {
		const { data } = await drive.files.list({
			q: `name='${ATTACHMENTS_FOLDER_NAME}' and mimeType='${FOLDER_MIME}' and '${parentFolderId}' in parents and trashed=false`,
			fields: "files(id)",
			spaces: "drive",
		});

		const existing = data.files?.[0];
		if (existing?.id) return existing.id;

		const { data: created } = await drive.files.create({
			requestBody: {
				name: ATTACHMENTS_FOLDER_NAME,
				mimeType: FOLDER_MIME,
				parents: [parentFolderId],
			},
			fields: "id",
		});

		if (!created.id)
			throw new InternalServerErrorException(
				"No se pudo crear la carpeta de adjuntos",
			);
		return created.id;
	}

	async uploadAttachment(
		userId: string,
		dto: UploadAttachmentDto,
	): Promise<DriveFileResponseDto> {
		const drive = await this.getAuthenticatedDrive(userId);
		const { folderId } = await this.getOrCreateFolder(userId);
		const attachmentsFolderId = await this.getOrCreateAttachmentsFolder(
			drive,
			folderId,
		);

		const buffer = Buffer.from(dto.content, "base64");
		const readable = Readable.from([buffer]);

		const { data } = await drive.files.create({
			requestBody: {
				name: dto.fileName,
				mimeType: dto.mimeType,
				parents: [attachmentsFolderId],
				description: dto.parentId
					? `parent:${dto.parentType ?? "unknown"}:${dto.parentId}`
					: undefined,
			},
			media: { mimeType: dto.mimeType, body: readable },
			fields: "id, name, size, createdTime, modifiedTime, mimeType",
		});

		return DriveFileResponseDto.fromDriveFile(data);
	}

	async downloadAttachment(
		userId: string,
		fileId: string,
	): Promise<{ content: string; mimeType: string; name: string }> {
		const drive = await this.getAuthenticatedDrive(userId);

		try {
			const { data: meta } = await drive.files.get({
				fileId,
				fields: "name, mimeType",
			});
			const response = await drive.files.get(
				{ fileId, alt: "media" },
				{ responseType: "arraybuffer" },
			);

			const base64 = Buffer.from(response.data as ArrayBuffer).toString(
				"base64",
			);

			return {
				content: base64,
				mimeType: meta.mimeType ?? "application/octet-stream",
				name: meta.name ?? fileId,
			};
		} catch {
			throw new NotFoundException(
				`Adjunto ${fileId} no encontrado en Google Drive`,
			);
		}
	}

	async deleteAttachment(userId: string, fileId: string): Promise<void> {
		const drive = await this.getAuthenticatedDrive(userId);

		try {
			await drive.files.delete({ fileId });
		} catch {
			throw new NotFoundException(
				`Adjunto ${fileId} no encontrado en Google Drive`,
			);
		}
	}
}
