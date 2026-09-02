import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import type { CreateUserDto } from "./dto/create-user.dto";
import type { UpdateUserDto } from "./dto/update-user.dto";
import { UserResponseDto } from "./dto/user-response.dto";

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: CreateUserDto): Promise<UserResponseDto> {
		const existing = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});

		if (existing) {
			throw new ConflictException("El correo electrónico ya está registrado");
		}

		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				name: dto.name,
				program: dto.program,
				semester: dto.semester,
				initials: dto.initials,
				profileData: dto.profileData as Prisma.InputJsonValue | undefined,
			},
		});

		return UserResponseDto.from(user);
	}

	async findAll(): Promise<UserResponseDto[]> {
		const users = await this.prisma.user.findMany({
			where: { deletedAt: null },
			orderBy: { createdAt: "desc" },
		});

		return users.map((user) => UserResponseDto.from(user));
	}

	async findOne(id: string): Promise<UserResponseDto> {
		const user = await this.prisma.user.findFirst({
			where: { id, deletedAt: null },
		});

		if (!user) {
			throw new NotFoundException(`Usuario con id ${id} no encontrado`);
		}

		return UserResponseDto.from(user);
	}

	async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
		await this.findOne(id);

		const user = await this.prisma.user.update({
			where: { id },
			data: {
				name: dto.name,
				program: dto.program,
				semester: dto.semester,
				initials: dto.initials,
				profileData: dto.profileData as Prisma.InputJsonValue | undefined,
			},
		});

		return UserResponseDto.from(user);
	}

	async remove(id: string): Promise<void> {
		await this.findOne(id);

		await this.prisma.user.update({
			where: { id },
			data: { deletedAt: new Date() },
		});
	}
}
