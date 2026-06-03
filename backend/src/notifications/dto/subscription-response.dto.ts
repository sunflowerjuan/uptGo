import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { PushSubscription } from '@prisma/client';

export class SubscriptionResponseDto {
  @ApiProperty({ example: 'uuid-v4' })
  id: string;

  @ApiProperty({ example: 'https://fcm.googleapis.com/fcm/send/...' })
  endpoint: string;

  @ApiPropertyOptional({ example: 'Mozilla/5.0 (Linux; Android 14...)', nullable: true })
  userAgent: string | null;

  @ApiProperty()
  createdAt: Date;

  static from(sub: PushSubscription): SubscriptionResponseDto {
    const dto = new SubscriptionResponseDto();
    dto.id = sub.id;
    dto.endpoint = sub.endpoint;
    dto.userAgent = sub.userAgent;
    dto.createdAt = sub.createdAt;
    return dto;
  }
}
