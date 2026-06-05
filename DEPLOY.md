# UPTGO - Guia de despliegue gratis

Esta guia describe el despliegue recomendado para la PWA UPTGO usando:

- **Cloudflare Pages** para el frontend PWA en `https://uptgo.space`.
- **Koyeb Free** para el backend NestJS en `https://api.uptgo.space`.
- **Neon Free** para PostgreSQL.
- **Google Cloud** para OAuth 2.0 y acceso a Google Drive.

El proyecto es un monorepo:

```text
uptGo/
  frontend/  # React + Vite + vite-plugin-pwa
  backend/   # NestJS + Prisma + PostgreSQL
```

## 0. Estado actual antes de desplegar

Antes de publicar, corrige estos bloqueos detectados en el repositorio:

1. El frontend no compila con `npm run build`.
   - `frontend/src/services/api.ts`: la clase `ApiError` usa parameter properties y `erasableSyntaxOnly` no lo permite.
   - `frontend/src/services/auth.service.ts`: los casts de WebAuthn deben pasar por `unknown` o tiparse con los tipos de `@simplewebauthn/browser`.
   - `frontend/src/screens/Notes.tsx`: `ReminderRow` esta declarado pero no se usa.

2. El test e2e del backend esta desactualizado.
   - `backend/test/app.e2e-spec.ts` prueba `GET /`, pero el backend real usa prefijo global `/api`.
   - Cambia el test para validar `GET /api/health` o elimina el test de plantilla.

3. El archivo `backend/.env` local contiene secretos reales.
   - No copies esos valores a GitHub ni a este documento.
   - Rota el `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, `JWT_REFRESH_SECRET` y las llaves VAPID antes de produccion.
   - El `.gitignore` ya ignora `.env`, pero verifica que nunca hayan sido publicados.

Comandos de validacion esperados antes de desplegar:

```bash
cd frontend
npm run build

cd ../backend
npm run build
npm run test
```

## 1. Arquitectura final recomendada

Usa dominios separados:

| Servicio      | URL                       | Plataforma       |
| ------------- | ------------------------- | ---------------- |
| PWA frontend  | `https://uptgo.space`     | Cloudflare Pages |
| API backend   | `https://api.uptgo.space` | Koyeb            |
| Base de datos | URL privada Neon          | Neon Postgres    |

No recomiendo poner el backend en Vercel como primera opcion porque el backend actual es un servidor NestJS normal (`node dist/main`), no una API serverless adaptada. Koyeb permite ejecutar el backend casi como ya esta.

## 2. Variables de entorno necesarias

### 2.1 Frontend

Configurar en Cloudflare Pages:

```env
VITE_API_URL=https://api.uptgo.space/api
VITE_BACKEND_URL=https://api.uptgo.space
```

Estas variables son leidas en `frontend/src/services/api.ts`.

### 2.2 Backend

Configurar en Koyeb:

```env
NODE_ENV=production
PORT=3000
API_PREFIX=api

DATABASE_URL=<NEON_POSTGRES_POOLED_CONNECTION_STRING>

CORS_ORIGIN=https://uptgo.space

THROTTLE_TTL=60000
THROTTLE_LIMIT=100

JWT_SECRET=<nuevo-secreto-largo-aleatorio>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<nuevo-secreto-largo-aleatorio-distinto>
JWT_REFRESH_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
GOOGLE_CALLBACK_URL=https://api.uptgo.space/api/auth/google/callback

WEBAUTHN_RP_ID=uptgo.space
WEBAUTHN_RP_NAME=UPTGO
WEBAUTHN_ORIGIN=https://uptgo.space

VAPID_PUBLIC_KEY=<vapid-public-key>
VAPID_PRIVATE_KEY=<vapid-private-key>
VAPID_SUBJECT=mailto:admin@uptgo.space
```

Notas importantes:

- `CORS_ORIGIN` tambien se usa para redirigir el callback de Google al frontend.
- `WEBAUTHN_RP_ID` debe ser el dominio raiz, no incluir `https://`.
- `WEBAUTHN_ORIGIN` si debe incluir `https://`.
- `GOOGLE_CALLBACK_URL` debe coincidir exactamente con el URI autorizado en Google Cloud.
- Para Neon + Prisma, usa preferiblemente la URL pooled si Neon te la da.

## 3. Crear la base de datos en Neon

1. Entra a Neon y crea un proyecto nuevo llamado `uptgo`.
2. Crea una base de datos, por ejemplo `uptgo`.
3. Copia la cadena de conexion de PostgreSQL.
4. Usa la cadena pooled si esta disponible.
5. Guarda esa cadena como `DATABASE_URL` en Koyeb.

Despues de crear el backend en Koyeb, ejecuta migraciones de Prisma una vez:

```bash
cd backend
npx prisma migrate deploy
```

Si lo haces desde tu maquina local, exporta temporalmente la `DATABASE_URL` de Neon antes de correr el comando. No la guardes en Git.

En PowerShell:

```powershell
$env:DATABASE_URL="<NEON_POSTGRES_CONNECTION_STRING>"
npx prisma migrate deploy
```

## 4. Configurar Google Cloud OAuth

El backend usa `passport-google-oauth20` con estos scopes:

```text
email
profile
https://www.googleapis.com/auth/drive.file
```

Tambien fuerza `access_type=offline` y `prompt=consent`, porque necesita `refresh_token` para Google Drive.

### 4.1 Crear o preparar el proyecto

1. Entra a Google Cloud Console.
2. Crea un proyecto, por ejemplo `UPTGO`.
3. Abre **APIs & Services**.
4. Activa **Google Drive API**.

### 4.2 Configurar pantalla de consentimiento

1. Ve a **Google Auth Platform** o **OAuth consent screen**.
2. Tipo de usuario:
   - Para pruebas academicas: **External** en modo **Testing**.
   - Si quieres que cualquiera use la app: **External** en **Production**, posiblemente con verificacion de Google por usar Drive.
3. Configura:
   - App name: `UPTGO`
   - User support email: tu correo
   - Developer contact information: tu correo
4. Authorized domains:
   - `uptgo.space`
5. Agrega scopes:
   - `email`
   - `profile`
   - `https://www.googleapis.com/auth/drive.file`
6. Si queda en modo Testing, agrega los correos de prueba en **Test users**.

Nota: `drive.file` puede requerir revision si pasas a produccion publica. Para una entrega controlada, Testing con usuarios autorizados suele ser suficiente.

### 4.3 Crear credenciales OAuth

1. Ve a **Credentials**.
2. Crea **OAuth client ID**.
3. Tipo de aplicacion: **Web application**.
4. Nombre: `UPTGO Web`.
5. Authorized JavaScript origins:

```text
https://uptgo.space
```

6. Authorized redirect URIs:

```text
https://api.uptgo.space/api/auth/google/callback
```

7. Guarda el `Client ID` y `Client Secret`.
8. En Koyeb configura:

```env
GOOGLE_CLIENT_ID=<client-id>
GOOGLE_CLIENT_SECRET=<client-secret>
GOOGLE_CALLBACK_URL=https://api.uptgo.space/api/auth/google/callback
```

Para desarrollo local puedes mantener otro OAuth client o agregar tambien:

```text
Authorized JavaScript origins:
http://localhost:5173

Authorized redirect URIs:
http://localhost:3000/api/auth/google/callback
```

## 5. Generar llaves VAPID para Web Push

El backend usa `web-push` y necesita:

```env
VAPID_PUBLIC_KEY=<public>
VAPID_PRIVATE_KEY=<private>
VAPID_SUBJECT=mailto:admin@uptgo.space
```

Genera un par nuevo:

```bash
cd backend
npx web-push generate-vapid-keys
```

Guarda las llaves en Koyeb. No las publiques en GitHub.

## 6. Desplegar backend en Koyeb

### 6.1 Preparar servicio

1. Entra a Koyeb.
2. Crea una app llamada `uptgo-api`.
3. Selecciona deploy desde GitHub.
4. Repositorio: `sunflowerjuan/uptGo` o el repositorio actual.
5. Rama: la rama estable que vayas a desplegar.
6. Builder: **Buildpack**.
7. Work directory: `backend`.
8. Build command:

```bash
npm run build
```

9. Run command:

```bash
npm run start:prod
```

10. Exposed port:

```text
3000
```

11. Variables de entorno: pega todas las variables del backend listadas en la seccion 2.2.

### 6.2 Validar backend

Cuando Koyeb termine, tendras una URL temporal similar a:

```text
https://<service-name>-<org>.koyeb.app
```

Prueba:

```bash
curl https://<koyeb-url>/api/health
```

Si `/api/health` responde, el backend esta levantado y conectado a Postgres.

### 6.3 Conectar `api.uptgo.space`

1. En Koyeb, abre el servicio `uptgo-api`.
2. Ve a **Settings** o **Domains**.
3. Agrega custom domain:

```text
api.uptgo.space
```

4. Koyeb te dara un registro DNS, normalmente un `CNAME`.
5. En Cloudflare DNS crea el registro indicado:

```text
Type: CNAME
Name: api
Target: <target-entregado-por-koyeb>
Proxy: DNS only si Koyeb lo requiere; proxied si Koyeb lo permite
```

6. Espera la validacion SSL.
7. Prueba:

```bash
curl https://api.uptgo.space/api/health
```

Si cambias la URL del backend despues, actualiza tambien:

```env
GOOGLE_CALLBACK_URL=https://api.uptgo.space/api/auth/google/callback
```

en Koyeb y en Google Cloud.

## 7. Desplegar frontend en Cloudflare Pages

### 7.1 Crear proyecto Pages

1. Entra a Cloudflare.
2. Agrega el dominio `uptgo.space` a Cloudflare si aun no esta.
3. Si tu dominio esta en otro registrador, cambia los nameservers en el registrador a los nameservers que Cloudflare te indique.
4. Ve a **Workers & Pages**.
5. Crea un proyecto Pages conectado a GitHub.
6. Selecciona el repositorio.
7. Configura:

```text
Project name: uptgo
Production branch: main o develop, segun tu flujo
Root directory: frontend
Framework preset: Vite
Build command: npm run build
Build output directory: dist
```

8. Variables de entorno de Pages:

```env
VITE_API_URL=https://api.uptgo.space/api
VITE_BACKEND_URL=https://api.uptgo.space
```

9. Ejecuta el primer deploy.

### 7.2 Conectar `uptgo.space`

1. En Cloudflare Pages, abre el proyecto `uptgo`.
2. Ve a **Custom domains**.
3. Agrega:

```text
uptgo.space
```

4. Cloudflare creara o sugerira los DNS necesarios.
5. Agrega tambien:

```text
www.uptgo.space
```

6. Configura redireccion de `www.uptgo.space` a `uptgo.space`, o deja ambos apuntando al mismo proyecto.

### 7.3 SSL y PWA

La PWA, WebAuthn y Push necesitan HTTPS. Cloudflare Pages entrega HTTPS automaticamente para el dominio.

Verifica en navegador:

```text
https://uptgo.space
https://uptgo.space/manifest.webmanifest
https://uptgo.space/sw.js
```

En DevTools revisa:

- Application -> Manifest
- Application -> Service Workers
- Lighthouse -> PWA

## 8. Ajustes recomendados en el proyecto

### 8.1 Crear archivos de ejemplo de entorno

Puedes mantener `backend/.env.example`, pero agrega tambien un ejemplo para frontend:

```text
frontend/.env.example
```

Contenido sugerido:

```env
VITE_API_URL=http://localhost:3000/api
VITE_BACKEND_URL=http://localhost:3000
```

### 8.2 Ajustar `vite.config.ts`

La config actual tiene:

```ts
server: {
  allowedHosts: ['unfantastic-abbigail-semiacademically.ngrok-free.dev'],
}
```

Eso solo afecta desarrollo local con Vite. Para produccion no bloquea Cloudflare Pages, pero conviene dejarlo documentado o quitarlo si ya no usas ese ngrok.

### 8.3 Corregir build frontend

Antes de Cloudflare Pages, el frontend debe compilar localmente:

```bash
cd frontend
npm run build
```

Cloudflare Pages fallara si este comando falla.

### 8.4 Corregir e2e backend

Actualiza el test e2e para probar:

```text
GET /api/health
```

No uses el test de plantilla `GET /` si el backend real usa `app.setGlobalPrefix('api')`.

### 8.5 Migraciones de Prisma

En produccion usa:

```bash
npx prisma migrate deploy
```

No uses:

```bash
npx prisma migrate dev
```

`migrate dev` es para desarrollo local.

## 9. Checklist final

### Backend

- [ ] `npm run build` pasa en `backend`.
- [ ] `npm run test` pasa en `backend`.
- [ ] `DATABASE_URL` apunta a Neon.
- [ ] Migraciones aplicadas con `prisma migrate deploy`.
- [ ] `https://api.uptgo.space/api/health` responde.
- [ ] `CORS_ORIGIN=https://uptgo.space`.
- [ ] Google OAuth usa `https://api.uptgo.space/api/auth/google/callback`.
- [ ] WebAuthn usa `WEBAUTHN_RP_ID=uptgo.space`.
- [ ] VAPID generado de nuevo y guardado en Koyeb.

### Frontend

- [ ] `npm run build` pasa en `frontend`.
- [ ] Cloudflare Pages usa root directory `frontend`.
- [ ] Variables `VITE_API_URL` y `VITE_BACKEND_URL` apuntan a `api.uptgo.space`.
- [ ] `https://uptgo.space` carga la PWA.
- [ ] `manifest.webmanifest` carga.
- [ ] `sw.js` carga.
- [ ] Login con email funciona.
- [ ] Login con Google funciona.
- [ ] WebAuthn funciona en HTTPS.
- [ ] Push notifications funcionan con permiso del navegador.

### Google Cloud

- [ ] Drive API habilitada.
- [ ] Authorized domain: `uptgo.space`.
- [ ] Authorized JavaScript origin: `https://uptgo.space`.
- [ ] Authorized redirect URI: `https://api.uptgo.space/api/auth/google/callback`.
- [ ] Test users configurados si la app esta en modo Testing.
- [ ] `GOOGLE_CLIENT_SECRET` rotado antes de produccion.

## 10. Problemas comunes

### Error `redirect_uri_mismatch`

El valor de `GOOGLE_CALLBACK_URL` en Koyeb no coincide exactamente con Google Cloud.

Debe ser:

```text
https://api.uptgo.space/api/auth/google/callback
```

### Error CORS

Revisa en Koyeb:

```env
CORS_ORIGIN=https://uptgo.space
```

No debe tener `/` al final.

### WebAuthn falla en produccion

Revisa:

```env
WEBAUTHN_RP_ID=uptgo.space
WEBAUTHN_ORIGIN=https://uptgo.space
```

WebAuthn no funciona correctamente si usas HTTP o si el RP ID no corresponde al dominio.

### Prisma no conecta a Neon

Verifica:

- `DATABASE_URL` esta completa.
- La URL tiene SSL si Neon lo requiere.
- Usas la URL pooled si tienes errores de muchas conexiones.
- Ejecutaste `npx prisma migrate deploy`.

### La PWA instala pero llama a localhost

Cloudflare Pages no recibio las variables:

```env
VITE_API_URL=https://api.uptgo.space/api
VITE_BACKEND_URL=https://api.uptgo.space
```

Recuerda que en Vite las variables `VITE_*` se incrustan en build time. Despues de cambiarlas, debes redeployar.

## 11. Referencias oficiales

- Cloudflare Pages custom domains: https://developers.cloudflare.com/pages/configuration/custom-domains/
- Cloudflare Pages SPA serving: https://developers.cloudflare.com/pages/configuration/serving-pages/
- Koyeb build from Git: https://www.koyeb.com/docs/build-and-deploy/build-from-git
- Koyeb environment variables: https://www.koyeb.com/docs/build-and-deploy/environment-variables
- Prisma + Neon: https://docs.prisma.io/docs/v6/orm/overview/databases/neon
- Google OAuth clients: https://support.google.com/cloud/answer/6158849
- Google OAuth app audience/testing: https://support.google.com/cloud/answer/15549945
- Google Drive API scopes: https://developers.google.com/drive/api/guides/api-specific-auth
