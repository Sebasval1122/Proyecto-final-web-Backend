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

Si quieres, puedo:
- Añadir autenticación (JWT)
- Conectar a una base de datos (MongoDB / PostgreSQL)
- Añadir tests y CI
