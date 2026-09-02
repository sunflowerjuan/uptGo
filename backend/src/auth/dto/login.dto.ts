import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
	@ApiProperty({ example: "juan@uptc.edu.co" })
	@IsEmail()
	@Transform(({ value }: { value: string }) => value.toLowerCase().trim())
	email: string;

	@ApiProperty({ example: "MiContraseña123!" })
	@IsString()
	@IsNotEmpty()
	password: string;
}
