import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token (corta duración)', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token (larga duración)', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;

  @ApiProperty({ description: 'Tipo de token', example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ description: 'Segundos hasta la expiración del access token', example: 900 })
  expiresIn: number;

  @ApiProperty({ type: UserResponseDto, description: 'Perfil del usuario autenticado' })
  user: UserResponseDto;
}
