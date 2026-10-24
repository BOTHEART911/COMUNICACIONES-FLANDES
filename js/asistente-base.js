/* COMUNICACIONES-FLANDES · BASE SEMBRADA DEL ASISTENTE (24/10/2026)
   Respaldo embebido: la usa el asistente la primera vez y en la entrada.
   La de verdad vive en el CORE (hoja ASISTENTE_TEMAS) y se edita en ADMIN;
   cuando cambia, llega con el arranque y reemplaza esta en el teléfono.
   Generado desde la semilla: no se edita a mano. */
window.ASISTENTE_BASE = [
{
"id": "CM-INICIO",
"app": "COMUNICACIONES",
"vista": "",
"titulo": "Ir al inicio",
"frases": [
"ir al inicio",
"volver al inicio",
"pantalla principal",
"menu principal",
"regresar al menu"
],
"respuesta": "Te llevo a tu **inicio**: ahí están los bloques de la app y el resumen de Comunicaciones.",
"accion": "ir:inicio",
"estado": "",
"activo": true,
"orden": 1
},
{
"id": "CM-QUE-ME-TOCA",
"app": "COMUNICACIONES",
"vista": "inicio,solicitudes,repartir",
"titulo": "¿Qué tengo pendiente?",
"frases": [
"que tengo pendiente",
"que me toca hacer",
"que tengo que hacer hoy",
"que me falta",
"que hago primero",
"tengo algo pendiente",
"que es lo mas urgente",
"por donde empiezo hoy"
],
"respuesta": "{{queMeToca}}",
"accion": "",
"estado": "",
"activo": true,
"orden": 2
},
{
"id": "CM-ABIERTAS",
"app": "COMUNICACIONES",
"vista": "inicio,solicitudes",
"titulo": "¿Cuántas solicitudes hay abiertas?",
"frases": [
"cuantas solicitudes hay abiertas",
"solicitudes abiertas",
"cuantas solicitudes tengo",
"mis solicitudes",
"que me han pedido",
"solicitudes por atender",
"cuantas me faltan"
],
"respuesta": "{{abiertas}}",
"accion": "ir:abiertas",
"estado": "",
"activo": true,
"orden": 3
},
{
"id": "CM-PRIMERO",
"app": "COMUNICACIONES",
"vista": "inicio,solicitudes",
"titulo": "¿Qué se entrega primero?",
"frases": [
"que se entrega primero",
"proximas entregas",
"que vence primero",
"cual es la mas proxima",
"que tengo para esta semana",
"entregas de la semana",
"que se publica pronto"
],
"respuesta": "{{proximas}}",
"accion": "ir:abiertas",
"estado": "",
"activo": true,
"orden": 4
},
{
"id": "CM-VENCIDAS",
"app": "COMUNICACIONES",
"vista": "inicio,solicitudes",
"titulo": "¿Hay entregas vencidas?",
"frases": [
"hay entregas vencidas",
"solicitudes vencidas",
"que se me paso",
"cuales estan atrasadas",
"que esta atrasado",
"entregas atrasadas",
"se paso la fecha de entrega",
"cuales salen en rojo"
],
"respuesta": "{{vencidas}}",
"accion": "ir:vencidas",
"estado": "",
"activo": true,
"orden": 5
},
{
"id": "CM-HOY",
"app": "COMUNICACIONES",
"vista": "inicio,solicitudes",
"titulo": "¿Qué se entrega hoy?",
"frases": [
"que se entrega hoy",
"que hay para hoy",
"que tengo hoy",
"que se entrega manana",
"que hay para manana"
],
"respuesta": "{{hoy}}",
"accion": "ir:abiertas",
"estado": "",
"activo": true,
"orden": 6
},
{
"id": "CM-SIN-ASIGNAR",
"app": "COMUNICACIONES",
"vista": "inicio,repartir,solicitudes",
"titulo": "¿Cuántas faltan por repartir?",
"frases": [
"cuantas faltan por repartir",
"sin asignar",
"solicitudes sin asignar",
"que falta repartir",
"que no tiene responsable",
"pendientes de asignacion",
"que llego nuevo"
],
"respuesta": "{{sinAsignar}}",
"accion": "ir:repartir",
"estado": "",
"activo": true,
"orden": 7
},
{
"id": "CM-CARGA",
"app": "COMUNICACIONES",
"vista": "inicio,repartir",
"titulo": "¿Cómo va la carga del equipo?",
"frases": [
"como va la carga del equipo",
"carga del equipo",
"cuantas tiene cada uno",
"quien tiene mas trabajo",
"trabajo de cada persona",
"cuantas tiene cada comunicador"
],
"respuesta": "{{cargaEquipo}}",
"accion": "ir:repartir",
"estado": "",
"activo": true,
"orden": 8
},
{
"id": "CM-A-QUIEN",
"app": "COMUNICACIONES",
"vista": "repartir,solicitud",
"titulo": "¿A quién le asigno?",
"frases": [
"a quien le asigno",
"a quien se la doy",
"quien esta mas libre",
"quien tiene menos trabajo",
"a quien reparto"
],
"respuesta": "{{aQuien}}",
"accion": "ir:repartir",
"estado": "",
"activo": true,
"orden": 9
},
{
"id": "CM-MES",
"app": "COMUNICACIONES",
"vista": "inicio,informes",
"titulo": "¿Cuántas he hecho este mes?",
"frases": [
"cuantas he hecho este mes",
"cuantas realice",
"cuantas llevo este mes",
"solicitudes realizadas este mes",
"cuanto he trabajado",
"que he hecho este mes"
],
"respuesta": "{{mesHechas}}",
"accion": "ir:registros",
"estado": "",
"activo": true,
"orden": 10
},
{
"id": "CM-LISTA-COMO",
"app": "COMUNICACIONES",
"vista": "solicitudes",
"titulo": "¿Cómo se lee la lista?",
"frases": [
"como se lee la lista",
"como funciona la lista",
"que significan los colores",
"por que sale en rojo",
"en que orden salen",
"como busco una solicitud",
"filtrar solicitudes"
],
"respuesta": "Las **abiertas** salen por **fecha de entrega**: la que vence primero, arriba; en **rojo**, las que ya pasaron. Arriba filtras por **estado** (Abiertas, En proceso, Entrega vencida, Realizadas, Todas) y, si eres ADMIN, por **persona**, **Sin asignar** o **Externas**. La búsqueda acepta código, evento, secretaría o quién la pide o la atiende.",
"accion": "ir:abiertas",
"estado": "",
"activo": true,
"orden": 11
},
{
"id": "CM-CALENDARIO",
"app": "COMUNICACIONES",
"vista": "solicitudes",
"titulo": "Ver las solicitudes en calendario",
"frases": [
"ver en calendario",
"calendario de solicitudes",
"vista calendario",
"ver por mes",
"agenda de entregas",
"calendario"
],
"respuesta": "Arriba de la lista está el interruptor **Lista ⇄ Calendario**: el calendario muestra las mismas solicitudes, con los mismos filtros, en el día de su entrega. La app recuerda cuál prefieres.",
"accion": "ir:abiertas",
"estado": "",
"activo": true,
"orden": 12
},
{
"id": "CM-EN-PROCESO",
"app": "COMUNICACIONES",
"vista": "inicio,solicitudes",
"titulo": "Ver las que están en proceso",
"frases": [
"en proceso",
"solicitudes en proceso",
"que se esta haciendo",
"las que estoy haciendo"
],
"respuesta": "Te llevo a la lista con la pastilla **En proceso** puesta.",
"accion": "ir:enProceso",
"estado": "",
"activo": true,
"orden": 13
},
{
"id": "CM-REALIZADAS",
"app": "COMUNICACIONES",
"vista": "inicio,solicitudes,informes",
"titulo": "Ver las realizadas",
"frases": [
"realizadas",
"solicitudes realizadas",
"las que ya hice",
"terminadas",
"las entregadas",
"historial de solicitudes"
],
"respuesta": "Te llevo a la lista con la pastilla **Realizadas** puesta. Para descargarlas por periodo usa **MIS REGISTROS**.",
"accion": "ir:realizadas",
"estado": "",
"activo": true,
"orden": 14
},
{
"id": "CM-MIAS",
"app": "COMUNICACIONES",
"vista": "solicitudes",
"titulo": "Ver solo las mías",
"frases": [
"ver solo las mias",
"mis asignadas",
"las que tengo asignadas",
"las que me toca a mi"
],
"respuesta": "{{mias}}",
"accion": "ir:mias",
"estado": "",
"activo": true,
"orden": 15
},
{
"id": "CM-EXTERNAS",
"app": "COMUNICACIONES",
"vista": "inicio,solicitudes,solicitantes",
"titulo": "¿Qué son las solicitudes externas?",
"frases": [
"solicitudes externas",
"que es externa",
"externas",
"lo que piden por la web",
"solicitudes de la web",
"pedidos de personas que no son contratistas"
],
"respuesta": "Una **Externa** la pidió un **solicitante externo** (alguien que no es contratista ni supervisor) desde la web de solicitudes a Prensa. Entra a la lista como las demás, con la marca **Externa**, y al pasar a En proceso y a Realizada le llega un WhatsApp. {{externas}}",
"accion": "ir:externas",
"estado": "",
"activo": true,
"orden": 16
},
{
"id": "CM-MAS-PIDEN",
"app": "COMUNICACIONES",
"vista": "solicitudes,informes",
"titulo": "¿Qué es lo que más piden?",
"frases": [
"que es lo que mas piden",
"que piden mas",
"requerimientos mas pedidos",
"que tipo de solicitudes llegan",
"cuantas fotos piden",
"cuantos videos piden"
],
"respuesta": "{{masPiden}}",
"accion": "",
"estado": "",
"activo": true,
"orden": 17
},
{
"id": "CM-REFRESCAR",
"app": "COMUNICACIONES",
"vista": "solicitudes,inicio",
"titulo": "No veo una solicitud nueva",
"frases": [
"no veo una solicitud nueva",
"no me aparece la solicitud",
"actualizar la lista",
"refrescar",
"la lista no se actualiza",
"me dijeron que me asignaron y no la veo"
],
"respuesta": "La lista llega al entrar y se pone al día por detrás. Toca **Refrescar** (en la barra de búsqueda de SOLICITUDES o en el resumen del inicio) y la trae de nuevo. Si eres COMUNICADOR, solo ves las que **tienes asignadas**: si no te la han asignado, no te aparece.",
"accion": "ir:abiertas",
"estado": "",
"activo": true,
"orden": 18
},
{
"id": "CM-FALTA",
"app": "COMUNICACIONES",
"vista": "solicitud",
"titulo": "¿Cuánto falta para la entrega?",
"frases": [
"cuanto falta para la entrega",
"para cuando es",
"cuando se entrega",
"que dia es la entrega",
"cuando es el evento",
"cuanto tiempo me queda"
],
"respuesta": "{{falta}}",
"accion": "",
"estado": "",
"activo": true,
"orden": 19
},
{
"id": "CM-ESTADO",
"app": "COMUNICACIONES",
"vista": "solicitud,solicitudes",
"titulo": "Cambiar el estado de una solicitud",
"frases": [
"cambiar el estado",
"marcar realizada",
"marcar en proceso",
"ya la hice",
"ya termine",
"como la marco como hecha",
"pasar a realizada",
"como cierro la solicitud"
],
"respuesta": "Abre la solicitud y, en **QUIÉN LA ATIENDE**, toca el estado: **En proceso** o **Realizada** (ADMIN también ve Pendiente). Se guarda con un toque. Si la pidió un contratista le llega un aviso, y si es externa, un WhatsApp, al pasar a En proceso y a Realizada. Solo la cambia quien la tiene asignada o el ADMIN.",
"accion": "ir:abiertas",
"estado": "",
"activo": true,
"orden": 20
},
{
"id": "CM-REPARTIR",
"app": "COMUNICACIONES",
"vista": "repartir,solicitud,inicio",
"titulo": "¿Cómo reparto una solicitud?",
"frases": [
"como reparto una solicitud",
"asignar una solicitud",
"repartir",
"asignar a alguien",
"como asigno",
"darle la solicitud a alguien",
"quien la atiende"
],
"respuesta": "En **REPARTIR** está lo **sin asignar**, de la entrega más próxima a la más lejana, y arriba la **carga del equipo**. Toca las caras de quienes la atienden y **Asignar**: pasa a **En proceso** y a cada persona le llega un WhatsApp con el código y la fecha. También se hace desde la solicitud con **Repartir**.",
"accion": "ir:repartir",
"estado": "",
"activo": true,
"orden": 21
},
{
"id": "CM-REASIGNAR",
"app": "COMUNICACIONES",
"vista": "solicitud,repartir",
"titulo": "¿Cómo la paso a otra persona?",
"frases": [
"como la paso a otra persona",
"cambiar a quien se asigna",
"reasignar",
"quitarle la solicitud a alguien",
"cambiar el responsable",
"agregar otra persona"
],
"respuesta": "Abre la solicitud y toca **Cambiar a quién se asigna**: marca a la persona nueva (o quita la que estaba) y guarda. Solo a las personas que **agregues** les llega el WhatsApp. Esto lo hace el ADMIN.",
"accion": "ir:abiertas",
"estado": "",
"activo": true,
"orden": 22
},
{
"id": "CM-EDITAR",
"app": "COMUNICACIONES",
"vista": "solicitud",
"titulo": "Corregir los datos de una solicitud",
"frases": [
"corregir los datos",
"editar la solicitud",
"cambiar la fecha de entrega",
"cambiar el evento",
"arreglar un dato",
"esta mal la fecha"
],
"respuesta": "En la solicitud, **Editar los datos** (ADMIN) corrige qué piden, los detalles, la fecha de entrega, el evento, el lugar y quién la pide. Lo que guardes reemplaza lo que había, sin cambiar el estado.",
"accion": "ir:abiertas",
"estado": "",
"activo": true,
"orden": 23
},
{
"id": "CM-GRUPO",
"app": "COMUNICACIONES",
"vista": "solicitud",
"titulo": "Enviar al grupo de Comunicaciones",
"frases": [
"enviar al grupo",
"mandar al grupo",
"compartir con el equipo",
"avisar al grupo de whatsapp",
"resumen al grupo"
],
"respuesta": "En la solicitud, **Enviar al grupo** (ADMIN) manda el resumen al grupo de WhatsApp de Comunicaciones. Si solo necesitas el texto, **Copiar los datos** lo deja en el portapapeles.",
"accion": "ir:abiertas",
"estado": "",
"activo": true,
"orden": 24
},
{
"id": "CM-NOTIFICAR",
"app": "COMUNICACIONES",
"vista": "solicitud",
"titulo": "¿Para qué sirve Notificar?",
"frases": [
"para que sirve notificar",
"notificar",
"copia de la asignacion",
"mandar la asignacion por whatsapp",
"reenviar la asignacion",
"no le llego el whatsapp"
],
"respuesta": "**Notificar** (ADMIN) abre el WhatsApp de **tu** teléfono con la copia de la asignación ya escrita, para cada persona asignada. Sale solo cuando la solicitud está **En proceso** y tiene a alguien asignado. Sirve si a alguien no le llegó el aviso.",
"accion": "ir:abiertas",
"estado": "",
"activo": true,
"orden": 25
},
{
"id": "CM-COPIAR",
"app": "COMUNICACIONES",
"vista": "solicitud",
"titulo": "Copiar los datos de la solicitud",
"frases": [
"copiar los datos",
"copiar la solicitud",
"pasar los datos",
"compartir la solicitud"
],
"respuesta": "En la solicitud, **Copiar los datos** deja en el portapapeles el código, el estado, el evento, la fecha, el lugar y los detalles, listos para pegar donde quieras.",
"accion": "ir:abiertas",
"estado": "",
"activo": true,
"orden": 26
},
{
"id": "CM-CONTACTO",
"app": "COMUNICACIONES",
"vista": "solicitud",
"titulo": "Contactar a quien la pide",
"frases": [
"contactar a quien la pide",
"llamar al que pidio",
"escribirle al solicitante",
"whatsapp del solicitante",
"quien pidio la solicitud",
"telefono de quien la pide"
],
"respuesta": "En **QUIÉN LA PIDE** están su cargo y secretaría y, si dejó un celular, los botones **WhatsApp** y **Llamar**. Si la pidió un contratista desde su app, ahí dice el contrato.",
"accion": "ir:abiertas",
"estado": "",
"activo": true,
"orden": 27
},
{
"id": "CM-NUEVA",
"app": "COMUNICACIONES",
"vista": "inicio,solicitudes,nueva",
"titulo": "Registrar una solicitud",
"frases": [
"registrar una solicitud",
"nueva solicitud",
"crear solicitud",
"me pidieron por whatsapp",
"me llamaron para pedir",
"me pidieron en persona",
"anotar un pedido"
],
"respuesta": "En **NUEVA SOLICITUD** registras lo que te pidieron por llamada, WhatsApp o en persona. Lo obligatorio: **qué piden**, los **detalles**, la **fecha de entrega** (no puede ser pasada), **quién la pide** y su **secretaría**. Si escoges a alguien del equipo queda **En proceso** de una vez; si no, **Pendiente** para repartir.",
"accion": "ir:nueva",
"estado": "",
"activo": true,
"orden": 28
},
{
"id": "CM-ANTELACION",
"app": "COMUNICACIONES",
"vista": "nueva,solicitantes",
"titulo": "¿Hay antelación mínima?",
"frases": [
"hay antelacion minima",
"con cuantos dias se pide",
"cuantos dias de anticipacion",
"por que no me deja la fecha",
"puedo pedir para hoy",
"fecha de entrega minima"
],
"respuesta": "Los contratistas y los solicitantes externos piden con **3 días** de antelación desde su app o la web. Aquí la registra el propio equipo, así que solo se exige que la fecha **no haya pasado**.",
"accion": "ir:nueva",
"estado": "",
"activo": true,
"orden": 29
},
{
"id": "CM-REGISTROS",
"app": "COMUNICACIONES",
"vista": "inicio,informes",
"titulo": "Descargar lo que he hecho",
"frases": [
"descargar lo que hice",
"mis registros",
"mis informes",
"reporte de solicitudes",
"excel de solicitudes",
"pdf de lo que hice",
"informe del mes",
"informe gerencial"
],
"respuesta": "En **MIS REGISTROS** escoges el periodo y si cuenta la fecha de **entrega** o de **ingreso** (ADMIN también escoge la persona). El **PDF** sale por bloques (uno por solicitud), el **Excel** una fila por solicitud y el **Informe gerencial** trae portada, cifras y gráficas.",
"accion": "ir:registros",
"estado": "",
"activo": true,
"orden": 30
},
{
"id": "CM-PERIODO",
"app": "COMUNICACIONES",
"vista": "informes",
"titulo": "Resúmeme el periodo",
"frases": [
"resumeme el periodo",
"resumen del periodo",
"cuantas solicitudes en el periodo",
"totales del periodo",
"que estoy viendo"
],
"respuesta": "{{periodo}}",
"accion": "ir:registros",
"estado": "",
"activo": true,
"orden": 31
},
{
"id": "CM-COMUNICADO",
"app": "COMUNICACIONES",
"vista": "inicio,comunicados",
"titulo": "Publicar un comunicado",
"frases": [
"publicar un comunicado",
"nuevo comunicado",
"avisar a todos los contratistas",
"mandar un aviso",
"publicar un aviso",
"adjuntar documentos al comunicado"
],
"respuesta": "En **COMUNICADOS** toca **Nuevo comunicado**: escribe, adjunta documentos (PDF, imágenes, Word, Excel) y publica. Llega como notificación a los teléfonos de los contratistas y queda en su app.",
"accion": "ir:comunicados",
"estado": "",
"activo": true,
"orden": 32
},
{
"id": "CM-RETIRAR",
"app": "COMUNICACIONES",
"vista": "comunicados",
"titulo": "Retirar un comunicado",
"frases": [
"retirar un comunicado",
"quitar un comunicado",
"borrar comunicado",
"me equivoque en el comunicado",
"volver a publicar"
],
"respuesta": "En el comunicado, **Retirar** lo quita de la app de los contratistas **sin borrarlo**: lo puedes **volver a publicar** cuando quieras. Solo retiras los tuyos.",
"accion": "ir:comunicados",
"estado": "",
"activo": true,
"orden": 33
},
{
"id": "CM-MIS-COMUNICADOS",
"app": "COMUNICACIONES",
"vista": "comunicados",
"titulo": "¿Cuántos comunicados he publicado?",
"frases": [
"cuantos comunicados he publicado",
"mis comunicados",
"comunicados publicados",
"cuantos retirados"
],
"respuesta": "{{comunicados}}",
"accion": "ir:comunicados",
"estado": "",
"activo": true,
"orden": 34
},
{
"id": "CM-DIRECTORIO",
"app": "COMUNICACIONES",
"vista": "inicio,directorio",
"titulo": "El directorio de la Alcaldía",
"frases": [
"directorio",
"donde queda una dependencia",
"telefono de una secretaria",
"correo de una oficina",
"direccion de la alcaldia",
"contactos de las dependencias"
],
"respuesta": "El **DIRECTORIO** tiene las dependencias de la Alcaldía con dirección, correo, WhatsApp y teléfono: toca para escribir, llamar o ver cómo llegar. El ADMIN de Comunicaciones las **agrega** y **corrige**, y el cambio lo ven de una vez las demás apps.",
"accion": "ir:directorio",
"estado": "",
"activo": true,
"orden": 35
},
{
"id": "CM-DIR-INCOMPLETO",
"app": "COMUNICACIONES",
"vista": "directorio",
"titulo": "¿Cuáles tienen datos incompletos?",
"frases": [
"cuales tienen datos incompletos",
"dependencias sin correo",
"dependencias sin telefono",
"que falta en el directorio"
],
"respuesta": "{{dirIncompletos}}",
"accion": "ir:directorio",
"estado": "",
"activo": true,
"orden": 36
},
{
"id": "CM-SOLICITANTES",
"app": "COMUNICACIONES",
"vista": "inicio,solicitantes",
"titulo": "Registrar un solicitante externo",
"frases": [
"registrar un solicitante externo",
"nuevo solicitante",
"solicitantes externos",
"alguien que no es contratista quiere pedir",
"dar acceso a la web de solicitudes",
"agregar solicitante"
],
"respuesta": "En **SOLICITANTES EXTERNOS** toca **Nuevo solicitante** con su nombre, dependencia, cargo y **WhatsApp**. Luego **Enviar enlace por WhatsApp**: al abrirlo entra de una vez a la web, pide con antelación y ve en qué va cada solicitud.",
"accion": "ir:solicitantes",
"estado": "",
"activo": true,
"orden": 37
},
{
"id": "CM-ENLACE",
"app": "COMUNICACIONES",
"vista": "solicitantes",
"titulo": "Reenviar el enlace a un solicitante",
"frases": [
"reenviar el enlace",
"no le llego el enlace",
"mandar el enlace otra vez",
"cambio el whatsapp",
"el enlace no sirve"
],
"respuesta": "En su tarjeta, **Enviar enlace por WhatsApp** abre el chat de esa persona con el mensaje y el enlace listos (o el botón de compartir para otro medio). Si le cambias el **WhatsApp**, el enlace viejo deja de servir: mándale el nuevo.",
"accion": "ir:solicitantes",
"estado": "",
"activo": true,
"orden": 38
},
{
"id": "CM-INACTIVAR",
"app": "COMUNICACIONES",
"vista": "solicitantes",
"titulo": "Quitarle el acceso a un solicitante",
"frases": [
"quitarle el acceso",
"inactivar solicitante",
"bloquear a un solicitante",
"ya no debe pedir",
"reactivar solicitante"
],
"respuesta": "En su tarjeta, **Inactivar** le quita el acceso a la web; lo puedes **activar** de nuevo cuando quieras.",
"accion": "ir:solActivos",
"estado": "",
"activo": true,
"orden": 39
},
{
"id": "CM-NUNCA",
"app": "COMUNICACIONES",
"vista": "solicitantes",
"titulo": "¿Quiénes nunca han entrado?",
"frases": [
"quienes nunca han entrado",
"quien no ha abierto el enlace",
"solicitantes que no han entrado",
"quien no ha usado la web"
],
"respuesta": "{{solNunca}}",
"accion": "ir:solActivos",
"estado": "",
"activo": true,
"orden": 40
},
{
"id": "CM-QUIEN-PIDE",
"app": "COMUNICACIONES",
"vista": "solicitantes",
"titulo": "¿Quién pide más?",
"frases": [
"quien pide mas",
"solicitante que mas pide",
"cuantas ha pedido cada uno",
"quien mas usa la web"
],
"respuesta": "{{solQuienPide}}",
"accion": "ir:solicitantes",
"estado": "",
"activo": true,
"orden": 41
},
{
"id": "CM-PERMISOS",
"app": "COMUNICACIONES",
"vista": "inicio",
"titulo": "¿Qué puede hacer mi usuario?",
"frases": [
"que puede hacer mi usuario",
"mis permisos",
"por que no veo",
"no me aparece",
"que rol tengo",
"no tengo acceso a esa vista",
"por que no puedo repartir"
],
"respuesta": "{{permisos}}",
"accion": "soporte",
"estado": "",
"activo": true,
"orden": 42
},
{
"id": "CM-FOTO",
"app": "COMUNICACIONES",
"vista": "",
"titulo": "Cambiar mi foto",
"frases": [
"cambiar mi foto",
"foto de perfil",
"poner mi foto",
"actualizar foto"
],
"respuesta": "Toca tu foto (o tus iniciales) en el saludo, o el menú de tu perfil → **Foto de perfil**. Es la misma en todas las apps de la Alcaldía.",
"accion": "foto",
"estado": "",
"activo": true,
"orden": 43
},
{
"id": "CM-CLAVE",
"app": "COMUNICACIONES",
"vista": "",
"titulo": "Cambiar mi contraseña",
"frases": [
"cambiar mi contraseña",
"actualizar contraseña",
"nueva clave",
"cambiar clave"
],
"respuesta": "Desde el menú de tu perfil → **Actualizar contraseña**.",
"accion": "clave",
"estado": "",
"activo": true,
"orden": 44
},
{
"id": "CM-INSTALAR",
"app": "COMUNICACIONES",
"vista": "",
"titulo": "Instalar la app",
"frases": [
"instalar la app",
"poner la app en el celular",
"descargar la app",
"acceso directo"
],
"respuesta": "Puedes instalarla en tu teléfono o computador para abrirla como una app más.",
"accion": "instalar",
"estado": "",
"activo": true,
"orden": 45
},
{
"id": "CM-AVISOS",
"app": "COMUNICACIONES",
"vista": "",
"titulo": "¿Me llegan los avisos al teléfono?",
"frases": [
"me llegan los avisos",
"notificaciones",
"no me llegan avisos",
"activar notificaciones"
],
"respuesta": "{{avisosTelefono}}",
"accion": "",
"estado": "",
"activo": true,
"orden": 46
},
{
"id": "CM-GUIA",
"app": "COMUNICACIONES",
"vista": "",
"titulo": "Guía rápida en PDF",
"frases": [
"guia rapida",
"manual de la app",
"guia en pdf",
"como se usa la app",
"tutorial"
],
"respuesta": "Aquí tienes la **guía rápida** de Comunicaciones en PDF.",
"accion": "guia",
"estado": "",
"activo": true,
"orden": 47
},
{
"id": "CM-SOPORTE",
"app": "COMUNICACIONES",
"vista": "",
"titulo": "Hablar con soporte",
"frases": [
"hablar con soporte",
"reportar un error",
"algo no funciona",
"necesito ayuda de una persona",
"la app falla",
"contactar soporte"
],
"respuesta": "Cuéntale a **soporte** qué pasó: llega al equipo de desarrollo y te responden en la app.",
"accion": "soporte",
"estado": "",
"activo": true,
"orden": 48
},
{
"id": "CME-OLVIDE",
"app": "COMUNICACIONES",
"vista": "entrada",
"titulo": "Olvidé mi contraseña",
"frases": [
"olvide mi contraseña",
"no recuerdo la clave",
"recuperar contraseña",
"perdi la clave",
"no me acuerdo la contraseña"
],
"respuesta": "Escribe tu **documento** y toca **Olvidé mi contraseña**: te llega una nueva por WhatsApp.",
"accion": "olvide",
"estado": "",
"activo": true,
"orden": 49
},
{
"id": "CME-ENTRAR",
"app": "COMUNICACIONES",
"vista": "entrada",
"titulo": "¿Cómo entro?",
"frases": [
"como entro",
"como ingreso",
"iniciar sesion",
"no puedo entrar",
"que usuario pongo"
],
"respuesta": "Entra con tu **documento** (sin puntos) y tu **contraseña**. Si no la tienes o no te funciona, usa **Olvidé mi contraseña**.",
"accion": "documento",
"estado": "",
"activo": true,
"orden": 50
},
{
"id": "CME-ACCESO",
"app": "COMUNICACIONES",
"vista": "entrada",
"titulo": "No tengo acceso a Comunicaciones",
"frases": [
"no tengo acceso",
"no tengo usuario",
"crear usuario",
"quien me da acceso",
"pedir acceso a comunicaciones"
],
"respuesta": "Los usuarios de Comunicaciones (ADMIN y equipo) los crea el **administrador** del ecosistema. Pídeselo a tu jefe o al administrador. Si quieres **pedirle algo** a Comunicaciones: los contratistas lo hacen desde su app y las demás personas desde la web de solicitudes, con el enlace que les manda Comunicaciones.",
"accion": "",
"estado": "",
"activo": true,
"orden": 51
},
{
"id": "CME-INSTALAR",
"app": "COMUNICACIONES",
"vista": "entrada",
"titulo": "Instalar la app",
"frases": [
"instalar la app",
"poner la app en el celular",
"descargar la app",
"acceso directo"
],
"respuesta": "Puedes instalarla en tu teléfono o computador para abrirla como una app más.",
"accion": "instalar",
"estado": "",
"activo": true,
"orden": 52
},
{
"id": "CME-QUE-ES",
"app": "COMUNICACIONES",
"vista": "entrada",
"titulo": "¿Para qué sirve esta app?",
"frases": [
"para que sirve",
"que es esta app",
"que hago aqui",
"que es comunicaciones"
],
"respuesta": "**Comunicaciones** es la app del equipo de Prensa: recibir y **repartir** lo que le piden (eventos, piezas, fotos, video y publicaciones), marcar en qué va cada solicitud, publicar **comunicados** a los contratistas y mantener el **directorio** de la Alcaldía.",
"accion": "",
"estado": "",
"activo": true,
"orden": 53
}
];
