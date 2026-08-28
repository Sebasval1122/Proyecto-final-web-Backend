# Proyecto Final — Backend (TypeScript + Express)

Backend del proyecto DrivePoint: API REST en TypeScript con Express, PostgreSQL y JWT para la plataforma de compra, venta y alquiler de vehículos.

## Stack

- **Runtime:** Node.js >= 20
- **Framework:** Express 4
- **Lenguaje:** TypeScript 5
- **Base de datos:** PostgreSQL (client: `postgres`)
- **Autenticación:** JWT (jsonwebtoken) + bcryptjs para hashes de contraseña
- **Validación:** Zod
- **Logging:** Morgan + logger interno

## Instalación

```bash
npm install
```

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```bash
# Servidor
PORT=4000
NODE_ENV=development

# Base de datos (PostgreSQL/Supabase)
DATABASE_URL=postgresql://postgres:***@db.hwzmhhjrwxfowfokasaj.supabase.co:5432/postgres

# Alternativa: variables individuales
# DB_HOST=db.hwzmhhjrwxfowfokasaj.supabase.co
# DB_PORT=5432
# DB_NAME=postgres
# DB_USER=postgres
# DB_PASSWORD=tu_password_aqui

# JWT
JWT_SECRET=tu_clave_secreta_muy_larga_y_aleatoria
```

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Arranca el servidor en modo desarrollo (ts-node-dev) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm run start` | Ejecuta el build compilado |
| `npm run typecheck` | Verifica tipos sin compilar |

## API

### Authentication

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Registra un nuevo usuario |
| `POST` | `/api/auth/login` | Login y obtención de token |
| `GET` | `/api/auth/me` | Perfil del usuario autenticado (Bearer token) |

#### Ejemplos

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.com","password":"123456","name":"Nombre"}'

curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@b.com","password":"123456"}'

curl http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

### Health checks

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/health` | Estado básico del servicio |
| `GET` | `/api/health/ready` | Readiness: verifica conexión a DB |

### Roles y autorización

Roles soportados: `admin`, `dealer`, `user`.

- `requireAuth` — valida JWT y expone `userId` y `userRole` en la request.
- `requireRole(...)` — restringe acceso según roles permitidos.

## Estructura del proyecto

```
src/
├── index.ts                      # Punto de entrada
├── config/index.ts               # Configuración (env, JWT, DB)
├── application/
│   ├── use-cases/                # Casos de uso (RegisterUser, LoginUser, GetUserById)
│   ├── services/                 # Interfaces de servicios (ITokenService, IPasswordHasher)
│   ├── dtos/                     # DTOs (UserDTO)
│   └── interfaces/               # Entidades y repositorios (User, IUserRepository)
├── domain/
│   ├── entities/                 # User entity
│   └── repositories/             # IUserRepository interface
├── infrastructure/
│   ├── database/
│   │   ├── postgres.ts           # Pool postgres + initDb()
│   │   └── repositories/         # PostgresUserRepository
│   ├── security/
│   │   ├── BcryptHasher.ts      # Hash de contraseñas
│   │   └── JwtService.ts        # Generación y verificación de JWT
│   └── utils/
│       └── logger.ts             # Logger interno
└── interface/
    ├── routes/                   # Rutas (auth, health, protected)
    ├── controllers/              # AuthController, HealthController
    ├── middleware/               # requireAuth, requireRole, validate, errorHandler
    └── validation/               # Zod schemas
```

## Notas de implementación

- Código organizado con Clean Architecture (capas de dominio, aplicación, infraestructura, interfaz).
- Uso de DTOs para la capa de presentación.
- Manejo centralizado de errores vía `AppError` + `errorHandler`.
- Pool de conexiones PostgreSQL con verificación de tablas en `initDb()`.
- Health checks con verificación de conexión a DB (`/api/health/ready`).

## Desarrollo

```bash
npm run dev
# Abrir http://localhost:4000/api/health
```

Linting y typecheck:

```bash
npm run typecheck     # Verificar tipos
npx tsc --noEmit      # Comprobación estricta
```

## Próximos pasos

- Añadir tests unitarios (Vitest/Jest).
- CI con GitHub Actions (lint + typecheck + build).
- Migraciones de base de datos (p.ej. Flyway o knex).
- Logs estructurados (pino/winston).
- Rate limiting y CORS configurado explícitamente.
