import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'juan@uptc.edu.co', description: 'Correo electrónico institucional' })
  @IsEmail()
  @Transform(({ value }: { value: string }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'Juan Ávila', description: 'Nombre completo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'MiContraseña123!', description: 'Contraseña (mínimo 8 caracteres)' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiPropertyOptional({ example: 'Ingeniería de Sistemas y Computación' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  program?: string;

  @ApiPropertyOptional({ example: '8' })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  semester?: string;
}
