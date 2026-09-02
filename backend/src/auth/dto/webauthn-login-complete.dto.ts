import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsObject, IsString } from "class-validator";

export class WebAuthnLoginCompleteDto {
	@ApiProperty({ example: "juan@uptc.edu.co" })
	@IsEmail()
	@Transform(({ value }: { value: string }) => value.toLowerCase().trim())
	email: string;

	@ApiProperty({
		description: "Token del challenge recibido en /webauthn/login/begin",
	})
	@IsString()
	@IsNotEmpty()
	challengeToken: string;

	@ApiProperty({
		description:
			"Respuesta de navigator.credentials.get() serializada como JSON",
		type: "object",
		additionalProperties: true,
	})
	@IsObject()
	credential: Record<string, unknown>;
}
