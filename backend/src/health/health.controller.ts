import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import {
	HealthCheck,
	HealthCheckService,
	type HealthCheckResult,
	type HealthIndicatorResult,
} from "@nestjs/terminus";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
	constructor(
		private readonly health: HealthCheckService,
		private readonly prisma: PrismaService,
	) {}

	@Get()
	@HealthCheck()
	@ApiOperation({ summary: "Estado de la API y la base de datos" })
	check(): Promise<HealthCheckResult> {
		return this.health.check([() => this.checkDatabase()]);
	}

	private async checkDatabase(): Promise<HealthIndicatorResult> {
		await this.prisma.$queryRaw`SELECT 1`;
		return { database: { status: "up" } };
	}
}
