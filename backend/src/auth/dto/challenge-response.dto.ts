import { ApiProperty } from '@nestjs/swagger';

export class ChallengeResponseDto {
  @ApiProperty({ description: 'Token firmado (JWT) que contiene el challenge — enviar de vuelta en el paso complete' })
  challengeToken: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    description: 'Opciones para pasar directamente a navigator.credentials.create() o navigator.credentials.get()',
  })
  options: Record<string, unknown>;
}
