/* ============================================================
   COMUNICACIONES-FLANDES · AYUDA POR VISTA (Insights)
   Ecosistema Flandes · Fase 9

   El mismo patrón de las otras apps: cada vista tiene una GUÍA que habla
   de lo que hay en pantalla y PREGUNTAS RÁPIDAS con la respuesta
   calculada en el teléfono. Nada viaja al servidor ni pasa por una IA:
   los números salen de la lista que ya llegó con el arranque.
   ============================================================ */
(function () {
  'use strict';

  var K = window.KIT;
  var CTX = function () { return {}; };

  function ctx() { try { return CTX() || {}; } catch (e) { return {}; } }
  function nombre(s) {
    var t = K.piezas.personas ? K.piezas.personas.nombrePropio(s) : String(s || '');
    return t.replace(/ (De|Del|La|Las|Los|Y|E|En) /g, function (m) { return m.toLowerCase(); });
  }
  function primerNombre(s) { return nombre(String(s || '').trim().split(/\s+/)[0] || ''); }
  function hola() { var y = ctx().yo || {}; return y.nombre ? primerNombre(y.nombre) + ', ' : ''; }
  function S() { return window.SOLIS || null; }
  function lista() { var b = S() && S()._datos(); return (b && b.lista) || []; }
  function abiertas() { return lista().filter(function (x) { return x._abierta; }); }
  function U() { return S()._util; }
  function admin() { var b = S() && S()._datos(); return !!(b && b.todas); }
  function listaCorta(filas, fmt, max) {
    max = max || 8;
    var t = filas.slice(0, max).map(fmt).join('\n');
    if (filas.length > max) t += '\n… y ' + (filas.length - max) + ' más.';
    return t;
  }
  function linea(x) {
    return '· **' + x.codigo + '** — ' + (x.evento || String(x.detalles || '').slice(0, 50)) +
      (x.publicacion ? ', entrega ' + U().fechaCorta(x.publicacion) + ' (' + U().relativo(x.publicacion) + ')' : '');
  }
  function porEntrega(l) { return l.slice().sort(function (a, b) { return String(a.publicacion || '9999').localeCompare(String(b.publicacion || '9999')); }); }

  var PREGUNTA_VENCE = { texto: '¿Qué se entrega primero?', responde: function () {
    var l = porEntrega(abiertas().filter(function (x) { return x.publicacion; }));
    return l.length ? listaCorta(l, linea, 6) : '¡Nada pendiente de entrega!';
  } };
  var PREGUNTA_VENCIDAS = { texto: '¿Hay entregas vencidas?', responde: function () {
    var hoy = U().hoyIso();
    var l = porEntrega(abiertas().filter(function (x) { return x.publicacion && x.publicacion < hoy; }));
    return l.length ? '**' + l.length + '** con la fecha de entrega pasada y sin marcar realizada:\n' + listaCorta(l, linea, 6)
      : 'Ninguna: todo lo abierto está a tiempo. ✓';
  } };

  var GUIAS = {

    inicio: function () {
      var n = S() && S()._datos() ? S().contar() : null;
      var t = hola() + 'este es el inicio de Comunicaciones. ';
      if (n) {
        var ab = n.PENDIENTE + n['EN PROCESO'];
        t += ab ? 'Hay **' + ab + (admin() ? ' solicitudes abiertas' : ' solicitudes tuyas abiertas') + '**' : 'No hay solicitudes abiertas';
        if (admin() && n.sinAsignar) t += ', **' + n.sinAsignar + '** sin repartir';
        if (n.vencidas) t += ' y **' + n.vencidas + '** con la entrega vencida';
        t += '. ';
      }
      t += 'Toca una cifra del resumen y la lista se abre ya filtrada.';
      return {
        guia: t,
        botones: [PREGUNTA_VENCE, PREGUNTA_VENCIDAS,
          { texto: admin() ? '¿Cómo va la carga del equipo?' : '¿Cuántas he hecho este mes?', responde: function () {
              if (!admin()) {
                var mes = U().hoyIso().slice(0, 7);
                var h = lista().filter(function (x) { return x.estado === 'REALIZADA' && String(x.publicacion || x.fecha).slice(0, 7) === mes; });
                return 'Este mes llevas **' + h.length + '** ' + (h.length === 1 ? 'solicitud realizada' : 'solicitudes realizadas') + '.';
              }
              var c = window.REPARTIR ? window.REPARTIR._carga() : [];
              return c.length ? c.map(function (p) { return '· **' + nombre(p.nombre) + '**: ' + p.abiertas + ' abiertas, ' + p.hechas + ' hechas'; }).join('\n') : 'No hay personas para asignar.';
            } }]
      };
    },

    solicitudes: function () {
      return {
        guia: (admin() ? 'Todas las solicitudes a Comunicaciones. ' : 'Tus solicitudes. ') +
              'Las abiertas salen por **fecha de entrega**: la que vence primero, arriba. En rojo, las que ya pasaron. ' +
              'Filtra por estado' + (admin() ? ' o por persona' : '') + ', busca por código, evento o secretaría, y toca una para abrirla.',
        botones: [
          { texto: '¿Qué estoy viendo?', responde: function () {
              var f = S()._filas();
              return 'Estás viendo **' + f.length + '** ' + (f.length === 1 ? 'solicitud' : 'solicitudes') + '. ' +
                (f.length ? 'La primera: ' + linea(f[0]).replace(/^· /, '') : '');
            } },
          PREGUNTA_VENCIDAS,
          { texto: '¿Qué es lo que más piden?', responde: function () {
              var c = {};
              lista().forEach(function (x) { x.requerimientos.forEach(function (r) { c[r] = (c[r] || 0) + 1; }); });
              var k = Object.keys(c).sort(function (a, b) { return c[b] - c[a]; });
              return k.length ? k.map(function (r) { return '· **' + r + '**: ' + c[r]; }).join('\n') : 'Todavía no hay datos.';
            } }
        ]
      };
    },

    solicitud: function () {
      return {
        guia: 'Una solicitud completa: qué piden, para cuándo, quién la pide y quién la atiende. ' +
              'Cambia el **estado** con un toque (Pendiente → En proceso → Realizada)' +
              (admin() ? '; **Repartir** avisa por WhatsApp a quien agregues, **Editar** corrige los datos y **Enviar al grupo** manda el resumen al grupo de Comunicaciones.' : '.') +
              ' Si la pidió un contratista, le llega un aviso cuando pasa a En proceso y a Realizada.',
        botones: [
          { texto: '¿Cuánto falta para la entrega?', responde: function () {
              var cod = decodeURIComponent(String(location.hash).split('/')[2] || '');
              var x = S().buscar(cod);
              if (!x) return 'Abre una solicitud.';
              if (!x.publicacion) return 'No tiene fecha de entrega.';
              return x._abierta ? 'La entrega es el **' + K.fecha(x.publicacion) + '**: ' + U().relativo(x.publicacion) + '.' : 'Ya está realizada (entrega del ' + K.fecha(x.publicacion) + ').';
            } },
          { texto: '¿Cómo la paso a otra persona?', responde: function () {
              return admin() ? 'Toca **Cambiar a quién se asigna**, marca a la persona nueva y guarda. Solo a las personas que agregues les llega el WhatsApp.'
                : 'Eso lo hace el administrador de Comunicaciones desde REPARTIR.';
            } }
        ]
      };
    },

    nueva: function () {
      return {
        guia: 'Registra una solicitud que llegó por otro medio. Lo obligatorio: **qué piden**, los **detalles**, la **fecha de entrega** (no puede ser pasada), **quién la pide** y su **secretaría**. ' +
              (admin() ? 'Si escoges a alguien del equipo, queda EN PROCESO de una vez; si no, PENDIENTE para repartir.' : 'Queda PENDIENTE para que el administrador la reparta.'),
        botones: [
          { texto: '¿Por qué no hay antelación mínima?', responde: function () {
              return 'Los contratistas piden con **3 días** de antelación desde su app. Aquí la registra el propio equipo, así que solo se exige que la fecha no haya pasado.';
            } }
        ]
      };
    },

    repartir: function () {
      return {
        guia: 'Arriba, la **carga del equipo**: cuántas tiene abiertas cada persona y su próxima entrega. Debajo, lo que está **sin asignar**, de la entrega más próxima a la más lejana. ' +
              'Toca las caras y **Asignar**: la solicitud pasa a En proceso y a cada persona le llega un WhatsApp.',
        botones: [
          { texto: '¿A quién le asigno?', responde: function () {
              var c = window.REPARTIR ? window.REPARTIR._carga().slice().sort(function (a, b) { return a.abiertas - b.abiertas; }) : [];
              return c.length ? 'La que menos tiene abierto: **' + nombre(c[0].nombre) + '** (' + c[0].abiertas + ').\n' + c.map(function (p) { return '· ' + nombre(p.nombre) + ': ' + p.abiertas; }).join('\n') : 'No hay personas para asignar.';
            } },
          { texto: '¿Cuántas faltan por repartir?', responde: function () {
              var l = abiertas().filter(function (x) { return !x.asignados.length; });
              return l.length ? '**' + l.length + '** sin asignar:\n' + listaCorta(porEntrega(l), linea, 6) : '¡Todo repartido! ✓';
            } }
        ]
      };
    },

    informes: function () {
      return {
        guia: 'Lo atendido en el periodo que escojas, por fecha de **entrega** o de **ingreso**. ' +
              (admin() ? 'Escoge la persona o déjalo en todo el equipo: el PDF sale agrupado por quien atendió. ' : '') +
              'El **PDF** es para leer (un bloque por solicitud); el **Excel**, una fila por solicitud con todos los datos.',
        botones: [
          { texto: '¿Qué estoy viendo?', responde: function () {
              var I = window.INFORMES; if (!I) return '';
              var f = I._filas(), n = I._cifras(f);
              return I._textoRango() + ': **' + n.total + '** solicitudes — ' + n.REALIZADA + ' realizadas, ' + n['EN PROCESO'] + ' en proceso y ' + n.PENDIENTE + ' pendientes.';
            } },
          { texto: '¿Qué requerimiento pidieron más?', responde: function () {
              var I = window.INFORMES; if (!I) return '';
              var n = I._cifras(I._filas());
              var k = Object.keys(n.req).sort(function (a, b) { return n.req[b] - n.req[a]; });
              return k.length ? k.map(function (r) { return '· **' + r + '**: ' + n.req[r]; }).join('\n') : 'No hay solicitudes en el periodo.';
            } }
        ]
      };
    },

    comunicados: function () {
      return {
        guia: 'Los comunicados de la Alcaldía. Publica uno con texto y documentos (PDF, imágenes, Word, Excel): les llega como notificación a los contratistas. Puedes **retirar** los tuyos.',
        botones: [
          { texto: '¿Cuántos he publicado?', responde: function () {
              var d = window.COMUS && window.COMUS._datos();
              var l = (d && d.lista) || [];
              var mios = l.filter(function (x) { return x.mio; });
              return mios.length ? 'Has publicado **' + mios.length + '** (' + mios.filter(function (x) { return x.estado === 'RETIRADO'; }).length + ' retirados).' : 'Todavía no has publicado comunicados.';
            } }
        ]
      };
    },

    directorio: function () {
      var ed = window.DIRECTORIO && window.DIRECTORIO._editar();
      return {
        guia: 'Las dependencias de la Alcaldía con su dirección, correo, WhatsApp y teléfono. ' + (ed ? 'Puedes **agregar** una nueva y **corregir** las que están: el cambio lo ven de una vez las demás apps.' : 'Toca para escribir, llamar o ver cómo llegar.'),
        botones: [
          { texto: '¿Cuáles tienen datos incompletos?', responde: function () {
              var l = (window.DIRECTORIO && window.DIRECTORIO._datos()) || [];
              var m = l.filter(function (d) { return !d.correo || (!d.whatsapp && !d.telefono) || !d.ubicacion; });
              return m.length ? listaCorta(m, function (d) {
                return '· **' + d.lugar + '** — falta ' + [!d.correo ? 'correo' : '', (!d.whatsapp && !d.telefono) ? 'teléfono' : '', !d.ubicacion ? 'ubicación' : ''].filter(Boolean).join(', ');
              }, 10) : 'Todas tienen correo, teléfono y ubicación. ✓';
            } }
        ]
      };
    }
  };

  var TITULOS = { inicio: 'Tu inicio', solicitudes: 'Solicitudes', solicitud: 'La solicitud', nueva: 'Nueva solicitud', repartir: 'Repartir',
                  informes: 'Mis informes', comunicados: 'Comunicados', directorio: 'Directorio' };

  function montar(vista, extra) {
    if (!K.piezas.insights) return;
    var g = GUIAS[vista];
    if (!g) return;
    var base = g();
    K.piezas.insights.montar({
      vista: (extra && extra.vista) || TITULOS[vista] || vista,
      guia: function () { return g().guia; },
      botones: base.botones || [],
      alto: !!base.alto
    });
  }

  window.AYUDA = {
    configurar: function (fn) { if (typeof fn === 'function') CTX = fn; },
    montar: montar,
    tiene: function (v) { return !!GUIAS[v]; },
    _guias: GUIAS
  };
}());
