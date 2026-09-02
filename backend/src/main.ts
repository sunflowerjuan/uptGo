import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);
	const config = app.get(ConfigService);

	const prefix = config.get<string>("API_PREFIX", "api");
	app.setGlobalPrefix(prefix);

	app.use(helmet());

	app.enableCors({
		origin: config.get<string>("CORS_ORIGIN", "http://localhost:5173"),
		credentials: true,
	});

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	const swaggerConfig = new DocumentBuilder()
		.setTitle("UPTGO API")
		.setDescription(
			"Backend oficial de la plataforma UPTGO.\n\n" +
				"Administra autenticación, usuarios, notificaciones push, " +
				"OAuth Google y metadatos de sincronización.",
		)
		.setVersion("1.0")
		.addBearerAuth(
			{ type: "http", scheme: "bearer", bearerFormat: "JWT" },
			"access-token",
		)
		.build();

	const document = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup(`${prefix}/docs`, app, document, {
		swaggerOptions: { persistAuthorization: true },
	});

	const port = config.get<number>("PORT", 3000);
	await app.listen(port);
}

void bootstrap();
