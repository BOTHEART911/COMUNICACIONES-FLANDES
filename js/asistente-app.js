/* ============================================================
   COMUNICACIONES-FLANDES · ADAPTADOR DEL ASISTENTE DE AYUDA
   24/10/2026 · entrega 7 (la pieza es la misma de CONTRATISTA,
   SUPERVISIÓN, CONTRATACIÓN, CONTABILIDAD y TESORERÍA)

   La pieza kit/asistente.js no sabe nada de esta app. Aquí se le dice:
     · a dónde puede llevar (destino), con qué rótulo y con qué pastilla
       ya puesta (abiertas, entrega vencida, en proceso, realizadas,
       mías, sin asignar, externas; solicitantes activos),
     · qué está cerrado y por qué (puerta): el permiso de la vista
       (llave PERMISOS de CONFIG, igual que el menú y el enrutador) y lo
       que solo hace el ADMIN (repartir, ver por persona),
     · lo más urgente al abrir (urgente): entregas vencidas → solicitudes
       sin asignar (ADMIN) → lo que se entrega hoy o mañana → las
       abiertas de la persona,
     · los datos reales de las respuestas ({{clave}}).

   TODO sale de lo que la app ya trajo: la lista entera de solicitudes
   llega con el arranque (bandeja) y, si la persona ya los abrió,
   comunicados, directorio, solicitantes y mis registros. Ningún dato
   viaja al servidor para responder.

   La base embebida (js/asistente-base.js) es el respaldo para la primera
   apertura y la pantalla de entrada; la del CORE la reemplaza en cuanto
   llega con el arranque (solo cuando cambia su sello).
   ============================================================ */
(function () {
  'use strict';

  var K = window.KIT;
  if (!K || !K.piezas.asistente) return;

  function APP() { return window.COMUNICACIONES_APP || {}; }
  function yo() { try { return (APP().yo && APP().yo()) || {}; } catch (e) { return {}; } }
  function SO() { return window.SOLIS || null; }
  function RE() { return window.REPARTIR || null; }
  function IF() { return window.INFORMES || null; }
  function CO() { return window.COMUS || null; }
  function DI() { return window.DIRECTORIO || null; }
  function SX() { return window.SOLICITANTES || null; }

  function bandeja() { try { return SO() && SO()._datos ? SO()._datos() : null; } catch (e) { return null; } }
  function todas() { var b = bandeja(); return (b && b.lista) || []; }
  function abiertas() { return todas().filter(function (x) { return x._abierta; }); }
  function admin() { var b = bandeja(); return !!(b && b.todas); }
  function U() { return SO()._util; }
  function hoyIso() { try { return U().hoyIso(); } catch (e) { return ''; } }

  function nombre(s) {
    var t = K.piezas.personas ? K.piezas.personas.nombrePropio(s) : String(s || '');
    return t.replace(/ (De|Del|La|Las|Los|Y|E|En) /g, function (m) { return m.toLowerCase(); })
            .replace(/ (De|Del|La|Las|Los|Y|E|En) /g, function (m) { return m.toLowerCase(); });
  }
  function plural(n, uno, varios) { return n + ' ' + (n === 1 ? uno : varios); }
  function lista(filas, fmt, max) {
    max = max || 5;
    var t = filas.slice(0, max).map(fmt).join('\n');
    if (filas.length > max) t += '\n… y ' + (filas.length - max) + ' más.';
    return t;
  }
  function que(x) { return x.evento || String(x.detalles || '').replace(/\s+/g, ' ').slice(0, 50) || 'Solicitud'; }
  function linea(x) {
    var q = x.asignados && x.asignados.length ? ' · ' + x.asignados.map(function (a) { return nombre(String(a).split(' ')[0]); }).join(', ')
                                              : (admin() ? ' · sin asignar' : '');
    return '· **' + x.codigo + '** — ' + que(x) +
      (x.publicacion ? ', entrega ' + U().fechaCorta(x.publicacion) + ' (' + U().relativo(x.publicacion) + ')' : '') + q;
  }
  function porEntrega(l) {
    return l.slice().sort(function (a, b) { return String(a.publicacion || '9999').localeCompare(String(b.publicacion || '9999')) || String(a.codigo).localeCompare(String(b.codigo)); });
  }
  function vencidas() { var h = hoyIso(); return porEntrega(abiertas().filter(function (x) { return x.publicacion && x.publicacion < h; })); }
  function sinAsignar() { return porEntrega(abiertas().filter(function (x) { return !x.asignados.length; })); }
  function proximas(dias) {
    var h = hoyIso();
    return porEntrega(abiertas().filter(function (x) { var n = x.publicacion ? U().diasHasta(x.publicacion) : null; return x.publicacion && x.publicacion >= h && n !== null && n <= dias; }));
  }

  var CARGANDO = 'Las solicitudes todavía están llegando: pregúntame de nuevo en un momento.';
  var SOLO_ADMIN = 'Eso lo ve el **ADMIN** de Comunicaciones: tú ves las solicitudes que tienes asignadas.';

  /* ---------- permisos ---------- */

  function puede(perm) { try { return APP().puede ? APP().puede(perm) : true; } catch (e) { return true; } }

  /* ---------- lo más urgente al abrir ---------- */

  function urgente() {
    if (!puede('solicitudes')) return null;
    if (!bandeja()) return null;
    var v = vencidas();
    if (v.length) {
      return { texto: '**' + plural(v.length, 'solicitud tiene', 'solicitudes tienen') + ' la entrega vencida** y sigue' + (v.length === 1 ? '' : 'n') +
        ' abierta' + (v.length === 1 ? '' : 's') + '; la de **' + v[0].codigo + '** (' + que(v[0]) + ') era ' + U().relativo(v[0].publicacion) + '.', accion: 'ir:vencidas' };
    }
    var s = admin() && puede('repartir') ? sinAsignar() : [];
    if (s.length) {
      return { texto: 'Hay **' + plural(s.length, 'solicitud', 'solicitudes') + ' sin asignar**' +
        (s[0].publicacion ? '; la más próxima se entrega ' + U().relativo(s[0].publicacion) : '') + '.', accion: 'ir:repartir' };
    }
    var p = proximas(1);
    if (p.length) {
      return { texto: '**' + plural(p.length, 'solicitud se entrega', 'solicitudes se entregan') + ' hoy o mañana**: ' + p[0].codigo + ' (' + que(p[0]) + ') ' + U().relativo(p[0].publicacion) + '.', accion: 'ir:abiertas' };
    }
    var a = abiertas().length;
    if (a) return { texto: 'Tienes **' + plural(a, 'solicitud abierta', 'solicitudes abiertas') + '**' + (admin() ? ' en Comunicaciones' : ' asignada' + (a === 1 ? '' : 's')) + '.', accion: 'ir:abiertas' };
    return null;
  }

  /* ---------- a dónde puede llevar ---------- */

  /* [rótulo, ruta, filtro, solo ADMIN] */
  var DESTINOS = {
    inicio:       ['Ir al inicio', 'inicio'],
    abiertas:     ['Ver las solicitudes abiertas', 'solicitudes', { m: 'SOLIS', f: { estado: 'ABIERTAS', quien: '' } }],
    vencidas:     ['Ver las de entrega vencida', 'solicitudes', { m: 'SOLIS', f: { estado: 'VENCIDAS', quien: '' } }],
    enProceso:    ['Ver las que están en proceso', 'solicitudes', { m: 'SOLIS', f: { estado: 'EN PROCESO', quien: '' } }],
    realizadas:   ['Ver las realizadas', 'solicitudes', { m: 'SOLIS', f: { estado: 'REALIZADA', quien: '' } }],
    mias:         ['Ver las mías', 'solicitudes', { m: 'SOLIS', f: { estado: 'ABIERTAS', quien: 'MIAS' } }, true],
    sinAsignar:   ['Ver las sin asignar', 'solicitudes', { m: 'SOLIS', f: { estado: 'ABIERTAS', quien: 'SIN' } }, true],
    externas:     ['Ver las externas', 'solicitudes', { m: 'SOLIS', f: { estado: '', quien: 'EXTERNAS' } }, true],
    repartir:     ['Ir a REPARTIR', 'repartir'],
    nueva:        ['Registrar una solicitud', 'nueva'],
    registros:    ['Ir a MIS REGISTROS', 'informes'],
    comunicados:  ['Ir a COMUNICADOS', 'comunicados'],
    directorio:   ['Ir al DIRECTORIO', 'directorio'],
    solicitantes: ['Ir a SOLICITANTES EXTERNOS', 'solicitantes', { m: 'SOLICITANTES', f: { que: '' } }],
    solActivos:   ['Ver los solicitantes activos', 'solicitantes', { m: 'SOLICITANTES', f: { que: 'ACTIVO' } }]
  };
  var NOMBRES = { abiertas: 'SOLICITUDES', vencidas: 'SOLICITUDES', enProceso: 'SOLICITUDES', realizadas: 'SOLICITUDES',
    mias: 'SOLICITUDES', sinAsignar: 'SOLICITUDES', externas: 'SOLICITUDES', repartir: 'REPARTIR', nueva: 'NUEVA SOLICITUD',
    registros: 'MIS REGISTROS', comunicados: 'COMUNICADOS', directorio: 'el DIRECTORIO', solicitantes: 'SOLICITANTES EXTERNOS',
    solActivos: 'SOLICITANTES EXTERNOS' };

  function rutaActual() { return String(location.hash || '').replace(/^#\/?/, ''); }

  function destino(id) {
    var d = DESTINOS[id];
    if (!d) return null;
    return { etiqueta: d[0], ir: function () {
      if (d[2] && window[d[2].m] && window[d[2].m].filtrar) window[d[2].m].filtrar(d[2].f);
      var r = d[1];
      if (rutaActual() === r) { window.dispatchEvent(new HashChangeEvent('hashchange')); return; }
      location.hash = '#/' + r;
    } };
  }

  /** Lo cerrado se explica con el permiso que falta y se ofrece soporte. */
  function puerta(id) {
    var d = DESTINOS[id];
    if (!d || !d[1] || d[1] === 'inicio') return null;
    var perm = APP().permiso ? APP().permiso(d[1]) : d[1];
    if (!puede(perm)) {
      return { texto: 'Tu usuario no tiene permiso para **' + (NOMBRES[id] || id) + '**. Si lo necesitas, pídeselo al administrador.', accion: 'soporte' };
    }
    /* la pastilla de persona solo existe para quien ve todas */
    if (d[3] && bandeja() && !admin()) return { texto: SOLO_ADMIN, accion: '' };
    return null;
  }

  /* ---------- acciones que no son ir a una vista ---------- */

  function vistaTitulo() { try { return (APP().vistaActual && APP().vistaActual()) || ''; } catch (e) { return ''; } }

  function accion(a) {
    switch (a) {
      case 'guia': return { etiqueta: 'Descargar la guía rápida', icono: 'descargar', cierra: false, hacer: function () { if (K.piezas.guia) K.piezas.guia.descargar('COMUNICACIONES'); } };
      case 'soporte': return { etiqueta: 'Contarle a soporte', icono: 'salvavidas', hacer: function (p) {
        if (K.piezas.soporte) K.piezas.soporte.abrir({ vista: vistaTitulo(), texto: p ? 'Le pregunté al asistente: «' + p + '»\n' : '' });
      } };
      case 'foto': return { etiqueta: 'Cambiar mi foto', icono: 'camara', hacer: function () { if (APP().abrirFoto) APP().abrirFoto(); } };
      case 'clave': return { etiqueta: 'Actualizar contraseña', icono: 'llave', hacer: function () { K.piezas.sesion.cambiarClave(); } };
      case 'instalar': return { etiqueta: 'Instalar la app', icono: 'descargar', hacer: function () { if (K.piezas.instalar) K.piezas.instalar.abrir(); } };
      default: return null;
    }
  }

  /* ---------- los datos de las respuestas ---------- */

  function sinPermiso(q) { return 'Tu usuario no tiene ' + q + '. Si lo necesitas, pídeselo al administrador.'; }
  function abierta() {
    var p = rutaActual().split('/');
    if (p[0] !== 'solicitud' || !SO()) return null;
    try { return SO().buscar(decodeURIComponent(p[1] || '')); } catch (e) { return null; }
  }
  function carga() { try { return RE() && RE()._carga ? RE()._carga() : []; } catch (e) { return []; } }

  function textoPermisos() {
    var r = K.norm(yo().rol || '');
    if (r === 'DEV') return 'Tu usuario es **DEV**: entra a todo.';
    var rot = { ADMIN: 'ADMIN', COMUNICADOR: 'del equipo (COMUNICADOR)' }[r] || r || 'de Comunicaciones';
    var si = [], no = [];
    [['solicitudes', 'solicitudes'], ['crearSolicitud', 'registrar solicitudes'], ['repartir', 'repartir y editar'],
     ['solicitantes', 'solicitantes externos'], ['misInformes', 'mis registros'], ['comunicados', 'comunicados'],
     ['directorio', 'directorio'], ['soporte', 'soporte']]
      .forEach(function (p) { (puede(p[0]) ? si : no).push(p[1]); });
    return 'Tu usuario es **' + rot + '** de Comunicaciones. Puede: ' + (si.join(', ') || 'consultar') + '.' +
      (no.length ? ' No tiene: ' + no.join(', ') + '. Los permisos los da el administrador.' : '');
  }

  function dato(k) {
    var c, n, d, o, h;
    var conLista = { queMeToca: 1, abiertas: 1, proximas: 1, vencidas: 1, hoy: 1, sinAsignar: 1, cargaEquipo: 1, aQuien: 1, mesHechas: 1, mias: 1, externas: 1, masPiden: 1, falta: 1 };
    if (conLista[k]) {
      if (!puede('solicitudes')) return sinPermiso('acceso a SOLICITUDES');
      if (!bandeja()) return CARGANDO;
    }
    switch (k) {
      case 'queMeToca':
        var u = urgente();
        if (u) return u.texto;
        return 'Por ahora **nada urgente**: estás al día. ✓';
      case 'abiertas':
        n = SO().contar();
        c = n.PENDIENTE + n['EN PROCESO'];
        if (!c) return '**Ninguna**: todo al día. ✓';
        return 'Hay **' + plural(c, 'solicitud abierta', 'solicitudes abiertas') + '**' + (admin() ? '' : ' asignadas a ti') + ': ' +
          (SO().verPendientes() ? n.PENDIENTE + ' pendientes y ' : '') + n['EN PROCESO'] + ' en proceso' +
          (n.vencidas ? ', **' + n.vencidas + ' con la entrega vencida**' : '') + (n.semana ? '; ' + n.semana + ' se entregan esta semana' : '') + '.';
      case 'proximas':
        c = porEntrega(abiertas().filter(function (x) { return x.publicacion && x.publicacion >= hoyIso(); }));
        if (!c.length) return vencidas().length ? 'No hay entregas por venir; lo abierto ya tiene la fecha pasada.' : '¡Nada pendiente de entrega! ✓';
        return 'Lo que se entrega primero:\n' + lista(c, linea, 6);
      case 'vencidas':
        c = vencidas();
        if (!c.length) return 'Ninguna: todo lo abierto está a tiempo. ✓';
        return '**' + plural(c.length, 'solicitud', 'solicitudes') + '** con la entrega pasada y sin marcar realizada (en la lista salen en rojo):\n' + lista(c, linea, 6);
      case 'hoy':
        c = proximas(1);
        if (!c.length) return 'Nada se entrega hoy ni mañana.' + (vencidas().length ? ' Ojo: hay ' + plural(vencidas().length, 'vencida', 'vencidas') + '.' : ' ✓');
        return lista(c, linea, 8);
      case 'sinAsignar':
        if (!admin()) return SOLO_ADMIN;
        c = sinAsignar();
        if (!c.length) return '¡Todo repartido! ✓';
        return '**' + plural(c.length, 'solicitud', 'solicitudes') + ' sin asignar**:\n' + lista(c, linea, 6);
      case 'cargaEquipo':
        if (!admin()) return SOLO_ADMIN;
        c = carga();
        if (!c.length) return 'No hay personas para asignar.';
        return c.slice().sort(function (a, b) { return b.abiertas - a.abiertas; }).map(function (p) {
          return '· **' + nombre(p.nombre) + '**: ' + plural(p.abiertas, 'abierta', 'abiertas') + ', ' + p.hechas + ' hechas' + (p.proxima ? ', la próxima ' + U().relativo(p.proxima) : '');
        }).join('\n');
      case 'aQuien':
        if (!admin()) return 'Eso lo hace el **ADMIN** de Comunicaciones desde REPARTIR.';
        c = carga().slice().sort(function (a, b) { return a.abiertas - b.abiertas; });
        if (!c.length) return 'No hay personas para asignar.';
        return 'La que menos tiene abierto: **' + nombre(c[0].nombre) + '** (' + c[0].abiertas + ').\n' + c.map(function (p) { return '· ' + nombre(p.nombre) + ': ' + p.abiertas; }).join('\n');
      case 'mesHechas':
        h = hoyIso().slice(0, 7);
        c = todas().filter(function (x) { return x.estado === 'REALIZADA' && String(x.publicacion || x.fecha).slice(0, 7) === h && (!admin() || x.mia); });
        d = admin() ? todas().filter(function (x) { return x.estado === 'REALIZADA' && String(x.publicacion || x.fecha).slice(0, 7) === h; }).length : 0;
        return 'Este mes llevas **' + plural(c.length, 'solicitud realizada', 'solicitudes realizadas') + '**' +
          (admin() ? ' asignadas a ti; el equipo lleva **' + d + '**' : '') + '. El detalle, en MIS REGISTROS.';
      case 'mias':
        if (!admin()) return 'Todo lo que ves en SOLICITUDES ya es tuyo: ' + plural(abiertas().length, 'abierta', 'abiertas') + '.';
        c = abiertas().filter(function (x) { return x.mia; });
        return c.length ? 'Tienes **' + plural(c.length, 'solicitud abierta', 'solicitudes abiertas') + '** asignadas a ti. Te llevo a la lista.' : 'No tienes solicitudes abiertas asignadas a ti.';
      case 'externas':
        if (!admin()) return '';
        c = abiertas().filter(function (x) { return x.origen === 'EXTERNO'; });
        return c.length ? 'Ahora hay **' + plural(c.length, 'externa abierta', 'externas abiertas') + '**.' : 'Ahora no hay externas abiertas.';
      case 'masPiden':
        o = {};
        todas().forEach(function (x) { (x.requerimientos || []).forEach(function (r) { o[r] = (o[r] || 0) + 1; }); });
        c = Object.keys(o).sort(function (a, b) { return o[b] - o[a]; });
        return c.length ? 'Lo que más piden:\n' + c.slice(0, 8).map(function (r) { return '· **' + r + '**: ' + o[r]; }).join('\n') : 'Todavía no hay datos.';
      case 'falta':
        o = abierta();
        if (!o) return 'Abre una solicitud y te digo cuánto falta para su entrega.';
        if (!o.publicacion) return 'La **' + o.codigo + '** no tiene fecha de entrega.';
        return o._abierta ? 'La **' + o.codigo + '** se entrega el **' + K.fecha(o.publicacion) + '**: ' + U().relativo(o.publicacion) + '.' +
          (o.fechaEvento ? ' El evento es el ' + K.fecha(o.fechaEvento) + (o.horaInicio ? ' a las ' + o.horaInicio : '') + '.' : '')
          : 'La **' + o.codigo + '** ya está realizada (entrega del ' + K.fecha(o.publicacion) + ').';
      case 'periodo':
        if (!puede('misInformes')) return sinPermiso('MIS REGISTROS');
        if (!IF() || !bandeja()) return 'Abre **MIS REGISTROS** y vuelve a preguntarme.';
        c = IF()._filas(); n = IF()._cifras(c);
        if (!n.total) return IF()._textoRango() + ': no hay solicitudes.';
        return IF()._textoRango() + ': **' + n.total + '** solicitudes — ' + n.REALIZADA + ' realizadas y ' + n['EN PROCESO'] + ' en proceso' +
          (SO().verPendientes() ? ', ' + n.PENDIENTE + ' pendientes' : '') + '.';
      case 'comunicados':
        if (!puede('comunicados')) return sinPermiso('COMUNICADOS');
        d = CO() && CO()._datos();
        if (!d) return 'Abre **COMUNICADOS** y vuelve a preguntarme.';
        c = (d.lista || []).filter(function (x) { return x.mio; });
        return c.length ? 'Has publicado **' + c.length + '** (' + c.filter(function (x) { return x.estado === 'RETIRADO'; }).length + ' retirados) de ' + (d.lista || []).length + ' en total.' : 'Todavía no has publicado comunicados.';
      case 'dirIncompletos':
        if (!puede('directorio')) return sinPermiso('el DIRECTORIO');
        d = DI() && DI()._datos();
        if (!d) return 'Abre el **DIRECTORIO** y vuelve a preguntarme.';
        c = d.filter(function (x) { return !x.correo || (!x.whatsapp && !x.telefono) || !x.ubicacion; });
        return c.length ? lista(c, function (x) {
          return '· **' + x.lugar + '** — falta ' + [!x.correo ? 'correo' : '', (!x.whatsapp && !x.telefono) ? 'teléfono' : '', !x.ubicacion ? 'ubicación' : ''].filter(Boolean).join(', ');
        }, 10) + (DI()._editar() ? '' : '\nLas corrige el ADMIN de Comunicaciones.') : 'Todas tienen correo, teléfono y ubicación. ✓';
      case 'solNunca':
        if (!puede('solicitantes')) return sinPermiso('SOLICITANTES EXTERNOS');
        d = SX() && SX()._datos();
        if (!d) return 'Abre **SOLICITANTES EXTERNOS** y vuelve a preguntarme.';
        c = (d.lista || []).filter(function (s) { return s.estado === 'ACTIVO' && !s.ultimoIngreso; });
        return c.length ? 'Registrados que todavía no abren la web (quizá no les llegó el enlace):\n' + lista(c, function (s) { return '· **' + s.nombre + '** — ' + s.dependencia; }, 10) : 'Todos los activos ya entraron al menos una vez. ✓';
      case 'solQuienPide':
        if (!puede('solicitantes')) return sinPermiso('SOLICITANTES EXTERNOS');
        d = SX() && SX()._datos();
        if (!d) return 'Abre **SOLICITANTES EXTERNOS** y vuelve a preguntarme.';
        c = (d.lista || []).filter(function (s) { return s.solicitudes; }).sort(function (a, b) { return b.solicitudes - a.solicitudes; });
        return c.length ? lista(c, function (s) { return '· **' + s.nombre + '**: ' + s.solicitudes + (s.abiertas ? ' (' + s.abiertas + ' abiertas)' : ''); }, 8) : 'Todavía nadie ha pedido desde la web.';
      case 'permisos': return textoPermisos();
      case 'avisosTelefono':
        var e = K.piezas.avisos ? K.piezas.avisos.estado() : '';
        if (e === 'listo') return 'Este teléfono **ya recibe avisos** de Comunicaciones, aunque tengas la app cerrada.';
        if (e === 'ios-sin-instalar') return 'En iPhone los avisos solo llegan con la app **instalada** en la pantalla de inicio: menú de tu perfil → Instalar la app.';
        if (e === 'bloqueado') return 'Los avisos están **bloqueados** en este navegador: actívalos en los permisos del sitio (el candado junto a la dirección) y vuelve a abrir la app.';
        return 'Los avisos se activan solos al entrar: acepta el permiso de notificaciones cuando el teléfono lo pida.';
      case 'nombre': return nombre(String(yo().nombre || '').split(/\s+/)[0] || '');
      default: return '';
    }
  }

  function vista() {
    try { var cl = (K.piezas.insights.configuracion() || {}).clave; if (cl) return cl; } catch (e) {}
    return rutaActual().split('/')[0] || 'inicio';
  }

  var ADAPTADOR = {
    vista: vista,
    estado: function () { return 'ACTIVO'; },
    dato: dato, urgente: urgente, destino: destino, puerta: puerta, accion: accion
  };

  /* ══════════════ la pantalla de entrada ══════════════ */

  function campo(n) { return document.querySelector('.kit-sesion [name="' + n + '"]'); }
  function resaltar(el) {
    if (!el) return;
    el.classList.add('kit-as-resalta');
    try { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {}
    setTimeout(function () { el.classList.remove('kit-as-resalta'); }, 3600);
  }

  var ENTRADA = {
    vista: function () { return 'entrada'; },
    estado: function () { return ''; },
    dato: function () { return ''; },
    urgente: function () { return null; },
    destino: function () { return null; },
    puerta: function () { return null; },
    accion: function (a) {
      if (a === 'olvide') return { etiqueta: 'Mostrarme el botón', icono: 'llave', hacer: function () {
        var d = campo('documento');
        if (d && !String(d.value || '').trim()) { d.focus(); resaltar(d); }
        /* NO se toca: pedir la contraseña lo decide la persona */
        resaltar(document.querySelector('.kit-sesion__olvide'));
      } };
      if (a === 'documento') return { etiqueta: 'Ir a la entrada', icono: 'persona', hacer: function () {
        var d = campo('documento'), cl = campo('clave');
        var el = d && !String(d.value || '').trim() ? d : (cl || d);
        if (el) { el.focus(); resaltar(el); }
      } };
      if (a === 'instalar') return { etiqueta: 'Cómo instalarla', icono: 'descargar', hacer: function () { if (K.piezas.instalar) K.piezas.instalar.abrir(); } };
      return null;
    }
  };

  K.piezas.asistente.configurar({
    app: 'COMUNICACIONES',
    base: window.ASISTENTE_BASE || [],
    adaptador: ADAPTADOR
  });

  window.COMUNICACIONES_ASISTENTE = {
    adaptador: ADAPTADOR,
    entrada: ENTRADA,
    /* para las pruebas */
    _urgente: urgente, _dato: dato, _destinos: DESTINOS
  };
}());
