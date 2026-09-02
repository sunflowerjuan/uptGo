import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail } from "class-validator";

export class WebAuthnLoginBeginDto {
	@ApiProperty({
		example: "juan@uptc.edu.co",
		description: "Correo del usuario para buscar sus credenciales registradas",
	})
	@IsEmail()
	@Transform(({ value }: { value: string }) => value.toLowerCase().trim())
	email: string;
}
