import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateSubscriptionDto {
	@ApiProperty({
		description:
			"URL del endpoint del servicio de push (proporcionado por el navegador)",
	})
	@IsUrl({ require_tld: false })
	@IsNotEmpty()
	endpoint: string;

	@ApiProperty({
		description:
			"Clave pública del cliente en base64url (campo keys.p256dh de la suscripción)",
	})
	@IsString()
	@IsNotEmpty()
	p256dh: string;

	@ApiProperty({
		description:
			"Secreto de autenticación del cliente en base64url (campo keys.auth de la suscripción)",
	})
	@IsString()
	@IsNotEmpty()
	auth: string;

	@ApiPropertyOptional({
		description: "User-Agent del dispositivo",
		example: "Mozilla/5.0 (Linux; Android 14...)",
	})
	@IsString()
	@IsOptional()
	userAgent?: string;
}
