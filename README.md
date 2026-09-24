# COMUNICACIONES-FLANDES

App del equipo de Comunicaciones de la Alcaldía de Flandes (antes PRENSA). Front estático (GitHub Pages) sobre FLANDES_CORE (app `COMUNICACIONES`). Mismo kit, estilos, cielo, cohete, esqueletos, Insights, foto de perfil, modo oscuro, login compacto y firma que las otras apps.

Roles: **ADMIN** (ve todas, reparte, edita, manda al grupo y corrige el directorio) y **COMUNICADOR** (ve las que tiene asignadas y les cambia el estado). El DEV entra a todo.

## Fase 9 · qué hay aquí
- **Inicio**: el login trae el arranque y dentro la lista entera de solicitudes (un solo viaje). Burbujas, resumen tocable (pendientes, en proceso, entrega vencida, sin asignar, realizadas) y las próximas entregas. Comunicados y directorio se piden en segundo plano.
- **Solicitudes** (`js/solicitudes.js`): pastillas de estado y de persona, búsqueda, las abiertas por fecha de entrega. **Detalle**: estado con un toque, repartir (WhatsApp a quien se agrega), editar, enviar al grupo, copiar, WhatsApp y llamada a quien la pide. **Nueva solicitud** desde la app.
- **Repartir** (`js/repartir.js`, solo ADMIN): la carga de cada persona y lo que está sin asignar, asignado en la misma tarjeta.
- **Mis informes** (`js/informes.js`): por periodo (fecha de entrega o de ingreso), estado y persona; PDF por bloques y Excel; y el enlace a la hoja personal de informes si la persona la tiene.
- **Comunicados** (`js/comunicados.js`) y **Directorio** (`js/directorio.js`, el ADMIN agrega y corrige).
- Soporte en la tarjeta del inicio y en el menú del perfil. Insights en todas las vistas.
