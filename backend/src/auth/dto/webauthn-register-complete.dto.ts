import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsString } from "class-validator";

export class WebAuthnRegisterCompleteDto {
	@ApiProperty({
		description: "Token del challenge recibido en /webauthn/register/begin",
	})
	@IsString()
	@IsNotEmpty()
	challengeToken: string;

	@ApiProperty({
		description:
			"Respuesta de navigator.credentials.create() serializada como JSON",
		type: "object",
		additionalProperties: true,
	})
	@IsObject()
	credential: Record<string, unknown>;
}
