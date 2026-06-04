# Backend - Proyecto Final (TypeScript + Express)

Estructura base del backend en TypeScript y Express para el proyecto final.

Requisitos:
- Node.js >= 16
- npm o yarn

Instalación:

```bash
npm install
```

Variables de entorno:
- Copiar `.env.example` a `.env` y ajustar si es necesario.

Comandos útiles:

- `npm run dev` - Ejecutar en modo desarrollo (ts-node-dev)
- `npm run build` - Compilar TypeScript a `dist/`
- `npm run start` - Ejecutar el build compilado
- `npm run typecheck` - Comprobar tipos

Estructura creada:

- `src/` - Código fuente TypeScript
	- `src/index.ts` - Punto de entrada
	- `src/routes/` - Definición de rutas
	- `src/controllers/` - Controladores
	- `src/middleware/` - Middlewares (p.ej. manejo de errores)
	- `src/config/` - Configuración y dotenv
	- `src/utils/` - Utilidades

Prueba rápida:

```bash
npm run dev
# Luego abrir http://localhost:4000/api/health
```

Autenticación (endpoints):

- `POST /api/auth/register` - Body: `{ "email":"a@b.com", "password":"123456", "name":"Nombre" }` → devuelve `token` y `user`
- `POST /api/auth/login` - Body: `{ "email":"a@b.com", "password":"123456" }` → devuelve `token` y `user`
- `GET /api/auth/me` - Header: `Authorization: Bearer <token>` → devuelve `user`

Recuerda copiar `.env.example` a `.env` y establecer `JWT_SECRET`.

Autorización por roles:
- Roles soportados: `admin`, `dealer`, `user`.
- Middlewares:
	- `requireAuth` - valida JWT y expone `userId` y `userRole` en la request.
	- `requireRole(...)` - restringe el acceso a rutas según roles permitidos.

Rutas de ejemplo protegidas:
- `GET /api/protected/admin` - solo `admin`.
- `GET /api/protected/dealer-area` - `admin` o `dealer`.
- `GET /api/protected/profile` - cualquier usuario autenticado.

Nota: en este scaffold los usuarios se guardan en memoria. Para producción conecta un DB y evita aceptar `role` en el registro sin autorización.

Si quieres, puedo:
- Añadir autenticación (JWT)
- Conectar a una base de datos (MongoDB / PostgreSQL)
- Añadir tests y CI
