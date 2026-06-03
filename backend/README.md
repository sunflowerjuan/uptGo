# UPTGO Backend

Backend oficial de la plataforma UPTGO, desarrollado con **NestJS** sobre una arquitectura **Offline First**.

El backend **no almacena** notas académicas, audios, fotografías, PDFs ni documentos multimedia — esos datos residen en IndexedDB en el dispositivo del usuario y se sincronizan opcionalmente con Google Drive.

El backend administra exclusivamente: autenticación, usuarios, notificaciones push, OAuth Google y metadatos de sincronización.

---

## Stack tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| Node.js | ≥20 | Runtime |
| NestJS | ^11 | Framework principal |
| TypeScript | ^5.7 | Lenguaje (modo estricto) |
| PostgreSQL | 16 | Base de datos |
| Prisma ORM | ^6 | Acceso a base de datos |
| Swagger / OpenAPI | ^11 | Documentación de API |
| Helmet | ^8 | Seguridad HTTP |
| ThrottlerModule | ^6 | Rate limiting |
| class-validator | ^0.14 | Validación de DTOs |
| Docker | ≥24 | Entorno local de BD |

---

## Requisitos previos

- Node.js ≥ 20
- Docker Desktop (para levantar PostgreSQL localmente)
- npm ≥ 10

---

## Instalación y configuración

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env
# Editar .env con los valores de tu entorno

# 3. Levantar PostgreSQL con Docker
docker compose up -d

# 4. Ejecutar migraciones de Prisma
npm run prisma:migrate

# 5. Iniciar en modo desarrollo
npm run start:dev
```

---

## Variables de entorno

| Variable | Descripción | Default |
|---|---|---|
| `DATABASE_URL` | Cadena de conexión PostgreSQL | — |
| `PORT` | Puerto del servidor | `3000` |
| `API_PREFIX` | Prefijo global de rutas | `api` |
| `CORS_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |
| `THROTTLE_TTL` | Ventana de rate limiting (ms) | `60000` |
| `THROTTLE_LIMIT` | Máximo de requests por ventana | `100` |

---

## Comandos disponibles

```bash
npm run start:dev        # Modo desarrollo (hot reload)
npm run start:prod       # Modo producción
npm run build            # Compilar TypeScript
npm run lint             # ESLint con auto-fix
npm run test             # Unit tests
npm run test:e2e         # Tests end-to-end
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:generate  # Regenerar Prisma Client
npm run prisma:studio    # Abrir Prisma Studio (UI de BD)
```

---

## Documentación de la API

Con el servidor corriendo, la documentación Swagger está disponible en:

```
http://localhost:3000/api/docs
```

---

## Estructura del proyecto

```
backend/
├── prisma/
│   ├── schema.prisma          # Modelos de base de datos
│   └── migrations/            # Historial de migraciones
├── src/
│   ├── main.ts                # Bootstrap (Swagger, Helmet, Pipes)
│   ├── app.module.ts          # Módulo raíz
│   ├── prisma/
│   │   ├── prisma.module.ts   # Módulo global de Prisma
│   │   └── prisma.service.ts  # Cliente Prisma con lifecycle
│   ├── health/
│   │   ├── health.module.ts
│   │   └── health.controller.ts  # GET /api/health
│   └── users/
│       ├── dto/
│       │   ├── create-user.dto.ts   # Validación de creación
│       │   ├── update-user.dto.ts   # Validación de actualización
│       │   └── user-response.dto.ts # Respuesta sin datos sensibles
│       ├── users.controller.ts      # Endpoints REST
│       ├── users.service.ts         # Lógica de negocio
│       └── users.module.ts
├── docker-compose.yml
├── .env.example
└── avances.md                 # Registro de cambios por fase
```

---

## Endpoints disponibles

### Health

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | Estado de la API y base de datos |

### Users

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/users` | Crear usuario |
| `GET` | `/api/users` | Listar usuarios activos |
| `GET` | `/api/users/:id` | Obtener usuario por ID |
| `PATCH` | `/api/users/:id` | Actualizar perfil |
| `DELETE` | `/api/users/:id` | Eliminar usuario (soft delete) |

---

## Modelo de datos

```
User
  id           UUID (PK)
  email        String (unique)
  passwordHash String? (solo se llena en Fase 3 — Auth)
  provider     AuthProvider (LOCAL | GOOGLE)
  name         String
  program      String?
  semester     String?
  initials     String?
  profileData  Json?
  deletedAt    DateTime? (soft delete)
  createdAt    DateTime
  updatedAt    DateTime
```

`passwordHash` nunca se expone en las respuestas de la API.

---

## Roadmap

| Fase | Estado | Descripción |
|---|---|---|
| Fase 1 — Infraestructura | Completada | NestJS, Prisma, Docker, Swagger, Rate Limiting |
| Fase 2 — Usuarios | Completada | CRUD, perfil, soft delete |
| Fase 3 — Auth | Pendiente | Registro, Login, JWT, Refresh Tokens |
| Fase 4 — Google OAuth | Pendiente | Login con Google, OAuth 2.0 |
| Fase 5 — Push Notifications | Pendiente | Web Push, suscripciones |
| Fase 6 — Sincronización | Pendiente | Google Drive, Sync Metadata |

---

## Flujo Git

```bash
git checkout develop && git pull origin develop
git checkout -b feature/nombre-feature

# Al finalizar
git push origin feature/nombre-feature
# Abrir Pull Request: feature/* → develop
```
