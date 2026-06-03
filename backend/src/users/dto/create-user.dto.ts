import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ example: 'juan@uptc.edu.co', description: 'Correo electrónico único del usuario' })
  @IsEmail()
  @Transform(({ value }: { value: string }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'Juan Ávila', description: 'Nombre completo del usuario' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Ingeniería de Sistemas y Computación', description: 'Programa académico' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  program?: string;

  @ApiPropertyOptional({ example: '8', description: 'Semestre actual' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  semester?: string;

  @ApiPropertyOptional({ example: 'JA', description: 'Iniciales del usuario (máx. 3 caracteres)' })
  @IsString()
  @IsOptional()
  @MaxLength(3)
  initials?: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
    description: 'Datos de perfil extendidos en formato JSON',
    example: { avatar: 'url', bio: 'Estudiante de Ingeniería' },
  })
  @IsObject()
  @IsOptional()
  profileData?: Record<string, unknown>;
}
