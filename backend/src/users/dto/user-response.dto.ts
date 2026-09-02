import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AuthProvider, type User } from "@prisma/client";

export class UserResponseDto {
	@ApiProperty({ example: "uuid-v4" })
	id: string;

	@ApiProperty({ example: "juan@uptc.edu.co" })
	email: string;

	@ApiProperty({ enum: AuthProvider, example: AuthProvider.LOCAL })
	provider: AuthProvider;

	@ApiProperty({ example: "Juan Ávila" })
	name: string;

	@ApiPropertyOptional({
		example: "Ingeniería de Sistemas y Computación",
		nullable: true,
	})
	program: string | null;

	@ApiPropertyOptional({ example: "8", nullable: true })
	semester: string | null;

	@ApiPropertyOptional({ example: "JA", nullable: true })
	initials: string | null;

	@ApiPropertyOptional({
		type: "object",
		additionalProperties: true,
		nullable: true,
	})
	profileData: Record<string, unknown> | null;

	@ApiProperty()
	createdAt: Date;

	@ApiProperty()
	updatedAt: Date;

	static from(user: User): UserResponseDto {
		const dto = new UserResponseDto();
		dto.id = user.id;
		dto.email = user.email;
		dto.provider = user.provider;
		dto.name = user.name;
		dto.program = user.program;
		dto.semester = user.semester;
		dto.initials = user.initials;
		dto.profileData = user.profileData as Record<string, unknown> | null;
		dto.createdAt = user.createdAt;
		dto.updatedAt = user.updatedAt;
		return dto;
	}
}
