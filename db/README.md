Base de datos (db)

Este directorio contiene el esquema SQL idempotente para la aplicación (marketplace / rental).

Archivos:
- `schema.sql`: esquema completo listo para ejecutar en PostgreSQL / Supabase.

Cómo aplicar el esquema:

1) Usando `psql` con `DATABASE_URL`:

   psql "$DATABASE_URL" -f db/schema.sql

   - Requiere que la variable `DATABASE_URL` esté definida en el entorno.
   - Si usas usuario/host/puerto separados, puedes usar:

   psql "postgresql://USER:PASSWORD@HOST:PORT/DBNAME" -f db/schema.sql

   Asegúrate de url-encode la contraseña si tiene caracteres especiales.

2) Usando el editor SQL de Supabase:

   - Abre el panel SQL del proyecto Supabase y pega el contenido de `db/schema.sql`.
   - Ejecuta la consulta.

Notas importantes:
- El script crea la extensión `pgcrypto` para `gen_random_uuid()`; Supabase la soporta.
- El archivo es idempotente: usa `IF NOT EXISTS` y bloques `DO $$` para evitar errores si ya existe.
- Variables de entorno útiles: `DATABASE_URL` o `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.

Si quieres, puedo ejecutar el script contra tu instancia Supabase desde este entorno — necesitaría que confirmes que quieres suministrar las credenciales aquí.
