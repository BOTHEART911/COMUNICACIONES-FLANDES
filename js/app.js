/* ============================================================
   COMUNICACIONES-FLANDES · APP
   Ecosistema Flandes · Fase 9 (antes la app PRENSA)

   La misma cara de las otras apps: franja con cielo, tu foto, los
   accesos por bloques y abajo el resumen de lo que queda por hacer (se
   toca y abre la lista ya filtrada).

   Roles (hoja USUARIOS, app COMUNICACIONES) y lo que ve cada uno lo
   decide PERMISOS en CONFIG:
     · ADMIN ....... todas las solicitudes, REPARTIR, editar, mandar al
                     grupo, y corregir el DIRECTORIO
     · COMUNICADOR . las solicitudes que tiene asignadas (cambia el estado)
     · DEV ......... todo
   Vistas:
     · SOLICITUDES, detalle y NUEVA (solicitudes.js) · REPARTIR (repartir.js)
     · MIS INFORMES (informes.js) · COMUNICADOS (comunicados.js)
     · DIRECTORIO (directorio.js) · SOPORTE (tarjeta y menú del perfil)

   UN SOLO LLAMADO por pantalla o acción:
     · Entrar: el login trae el arranque ('inicio') en el mismo viaje, y
       dentro viene la lista entera de solicitudes. SOLICITUDES, REPARTIR
       y MIS INFORMES no vuelven a pedirla.
     · Comunicados y directorio se piden en segundo plano apenas pinta el
       inicio: cuando la persona los abre ya están en el teléfono.
     · Cada botón: una llamada.

   Reglas de siempre
     · Todo dato de la hoja pasa por K.esc antes de entrar al HTML.
     · La app no conoce ninguna URL: todo sale de marca.js.
     · Qué ve cada quien lo decide el CORE: esconder un botón es cortesía,
       no protección.
   ============================================================ */
(function () {
  'use strict';

  var K = window.KIT;
  var M = window.MARCA || {};
  var app = K.id('app');

  var YO = null;          /* quién entró */
  var ARRANQUE = null;    /* lo que trajo 'inicio' */

  var MODULOS = ['SOLIS', 'REPARTIR', 'INFORMES', 'COMUS', 'DIRECTORIO'];

  /* ══════════════ el arranque, en UNA sola llamada ══════════════ */

  function leer(accion, datos, veces) {
    return K.pedir(accion, datos || {}, { ms: 60000 })['catch'](function (e) {
      var red = e && (e.codigo === 'RESPUESTA_NO_JSON' || e.codigo === 'SIN_RED' || e.codigo === 'TIEMPO');
      if (red && (veces || 0) < 1) return leer(accion, datos, (veces || 0) + 1);
      throw e;
    });
  }

  /* el login trae el arranque (pre.arranque) en el mismo viaje */
  function arranque(conEsqueleto, pre) {
    var yaVino = pre && pre.arranque ? pre.arranque : null;
    var quitar = (!yaVino && conEsqueleto && K.piezas.esqueletos && app)
      ? K.piezas.esqueletos.poner(app, { forma: 'ficha', cuantos: 1, sitio: 'reemplaza', espera: 'Cargando Comunicaciones' })
      : function () {};

    return (yaVino ? Promise.resolve(yaVino) : leer('inicio')).then(function (d) {
      ARRANQUE = d;
      YO = d.yo || YO;
      if (d.personas && K.piezas.personas) K.piezas.personas.cargar(d.personas);
      if (d.push && K.piezas.avisos && K.piezas.avisos.configurar) K.piezas.avisos.configurar(d.push);
      if (d.config && K.piezas.creditos && K.piezas.creditos.configurar) K.piezas.creditos.configurar(d.config);
      if (d.bandeja && window.SOLIS) window.SOLIS.recibir(d.bandeja);
      quitar();
      return d;
    }, function (e) {
      quitar();
      throw e;
    });
  }

  K.listo(function () {
    registrarSW();
    if (K.piezas.instalar) K.piezas.instalar.vigilar();
    if (K.piezas.version) K.piezas.version.vigilar();

    var puerta = K.piezas.bienvenida
      ? K.piezas.bienvenida.abrir({
          titulo: 'Comunicaciones',
          sub: M.MUNICIPIO || 'Alcaldía de Flandes',
          imagen: M.APP_ICON || 'img/icono-512.png'
        })
      : Promise.resolve('saltada');

    puerta.then(function () {
      K.piezas.sesion.entrar({
        titulo: 'COMUNICACIONES',
        sub: 'Ingresa con tu documento y contraseña',
        imagen: M.APP_ICON || 'img/icono-512.png',
        arranqueEnLogin: true,
        comprobar: function (login) { return arranque(true, login).then(function (d) { return d.yo; }); },
        alEntrar: arrancar
      });
    });
  });

  function registrarSW() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('sw.js')['catch'](function () {});
  }

  function arrancar(yo) {
    YO = yo || {};
    montarBanner();

    if (K.piezas.avisos) {
      K.piezas.avisos.autoActivar();
      K.piezas.avisos.alLlegar(function (a) {
        K.aviso(a.titulo ? (a.titulo + ': ' + a.cuerpo) : a.cuerpo, 'info', 6000);
      });
    }

    if (window.AYUDA) {
      window.AYUDA.configurar(function () {
        return { yo: YO, arranque: ARRANQUE, vista: vistaActual() };
      });
    }

    var c = { app: app, puede: puede, irA: irA, errorCaja: errorCaja,
              esDev: function () { return K.norm((YO && YO.rol) || '') === 'DEV'; },
              yo: function () { return YO || {}; },
              config: function () { return (ARRANQUE && ARRANQUE.config) || {}; },
              asignables: function () { return (ARRANQUE && ARRANQUE.asignables) || []; },
              requerimientos: function () { return (ARRANQUE && ARRANQUE.requerimientos) || []; },
              secretarias: function () { return (ARRANQUE && ARRANQUE.secretarias) || []; },
              enlaceInformes: function () { return (ARRANQUE && ARRANQUE.enlaceInformes) || ''; },
              /* los números del inicio siguen a la lista sin otro viaje */
              alCambiar: function () {} };
    MODULOS.forEach(function (m) { if (window[m]) window[m].configurar(c); });

    K.cuando('kit:foto', function (r) {
      YO.imagen = r.url || '';
      K.piezas.banner.perfil({ foto: r.foto || '' });
      var cara = document.querySelector('.saludo .kit-perfil-cara');
      if (cara && K.piezas.perfil) cara.parentNode.replaceChild(caraPerfil(), cara);
    });

    window.addEventListener('hashchange', enrutar);
    enrutar();
  }

  /* ══════════════ permisos ══════════════ */
  function puede(vista) {
    var r = K.norm((YO && YO.rol) || '');
    if (r === 'DEV') return true;
    var v = (YO && YO.vistas) || [];
    for (var i = 0; i < v.length; i++) if (K.norm(v[i]) === K.norm(vista)) return true;
    return false;
  }

  function miFoto(ancho) {
    return K.miniDrive ? K.miniDrive(YO.imagen || '', ancho || 200) : (YO.imagen || '');
  }

  function abrirFoto() {
    if (!K.piezas.perfil) return;
    K.piezas.perfil.abrir({ nombre: YO.nombre || '', foto: miFoto(512) });
  }

  function caraPerfil() {
    return K.piezas.perfil.cara(YO.nombre || '', miFoto(200), {
      tam: 66, fotoActual: function () { return miFoto(512); }
    });
  }

  function soporte() { if (K.piezas.soporte) K.piezas.soporte.abrir({ vista: vistaActual() }); }

  function montarBanner() {
    var menu = [{ texto: 'Foto de perfil', al: abrirFoto }];
    if (puede('misInformes')) menu.push({ texto: 'Mis informes', al: function () { irA('informes'); } });
    menu.push({ texto: 'Actualizar contraseña', al: function () { K.piezas.sesion.cambiarClave(); } });
    menu.push({ texto: 'Instalar la app', al: function () { K.piezas.instalar.abrir(); } });
    /* soporte en TODAS las apps: hoja SOPORTE + grupo de desarrollo */
    menu.push({ texto: 'Soporte', al: soporte });
    menu.push({ texto: 'Cerrar sesión', al: salir, peligro: true });
    K.piezas.banner.montar({
      titulo: 'Comunicaciones',
      nombre: YO.nombre || '',
      rol: rolLegible(YO.rol),
      foto: miFoto(200),
      menu: menu
    });
    if (K.piezas.cielo) K.piezas.cielo.soloFondo(document.querySelector('.kit-banner'));
  }

  function rolLegible(r) {
    var n = K.norm(r || '');
    if (n === 'ADMIN') return 'ADMIN · Comunicaciones';
    if (n === 'COMUNICADOR') return 'Equipo de Comunicaciones';
    if (n === 'DEV') return 'DEV · Desarrollo';
    return r || 'Comunicaciones';
  }

  function salir() {
    if (K.piezas.avisos) K.piezas.avisos.olvidar();
    if (K.piezas.insights) K.piezas.insights.quitar();
    MODULOS.forEach(function (m) { if (window[m] && window[m].olvidar) window[m].olvidar(); });
    if (window.OFICINA && window.OFICINA.olvidarDocs) window.OFICINA.olvidarDocs();
    ARRANQUE = null;
    K.piezas.sesion.salir();
    location.hash = '';
  }

  /* ══════════════ vistas ══════════════ */

  var VISTAS = {
    inicio: vistaInicio,
    solicitudes: function () { window.SOLIS.vista(); },
    solicitud: function (sub) { window.SOLIS.detalle(sub); },
    nueva: function () { window.SOLIS.nueva(); },
    repartir: function () { window.REPARTIR.vista(); },
    informes: function () { window.INFORMES.vista(); },
    comunicados: function () { window.COMUS.vista(); },
    directorio: function () { window.DIRECTORIO.vista(); }
  };

  var titulos = {
    inicio: 'Comunicaciones',
    solicitudes: 'SOLICITUDES',
    solicitud: 'SOLICITUD',
    nueva: 'NUEVA SOLICITUD',
    repartir: 'REPARTIR',
    informes: 'MIS INFORMES',
    comunicados: 'COMUNICADOS',
    directorio: 'DIRECTORIO'
  };

  var PERMISO = { solicitudes: 'solicitudes', solicitud: 'solicitudes', nueva: 'crearSolicitud', repartir: 'repartir',
                  informes: 'misInformes', comunicados: 'comunicados', directorio: 'directorio' };

  function irA(v) { location.hash = '#/' + v; }

  function vistaActual() {
    var v = String(location.hash || '').replace(/^#\/?/, '').split('/')[0] || 'inicio';
    return titulos[v] || v;
  }

  var ANTERIOR = 'inicio';
  function enrutar() {
    var partes = String(location.hash || '').replace(/^#\/?/, '').split('/');
    var v = partes[0] || 'inicio';
    if (!VISTAS[v]) v = 'inicio';
    if (v !== 'inicio' && !puede(PERMISO[v] || v)) v = 'inicio';

    K.piezas.banner.vista(titulos[v]);
    var resto = partes.slice(1).join('/');
    var volver = ANTERIOR;
    K.piezas.banner.atras(v === 'inicio' ? null : function () {
      if (v === 'solicitud') irA(volver === 'repartir' || volver === 'informes' ? volver : 'solicitudes');
      else if (v === 'nueva') irA('solicitudes');
      else irA('inicio');
    });
    if (v !== 'solicitud') ANTERIOR = v;

    app.innerHTML = '';
    if (window.AYUDA) window.AYUDA.montar(v);
    window.scrollTo(0, 0);
    VISTAS[v](resto);
  }

  /* ---------- inicio ---------- */

  var PRECARGADO = false;
  /** Lo que no se ve de entrada va en segundo plano (regla del UN SOLO LLAMADO). */
  function precargar() {
    if (PRECARGADO) return;
    PRECARGADO = true;
    setTimeout(function () {
      if (puede('comunicados') && window.COMUS && window.COMUS.cargar) window.COMUS.cargar(false)['catch'](function () {});
      /* solo trae los datos; la vista se pinta cuando la abran */
      if (puede('directorio') && window.DIRECTORIO) window.DIRECTORIO.cargar(false)['catch'](function () {});
    }, 1500);
  }

  function vistaInicio() {
    var caja = K.nodo('<div class="kit-ancho vista"></div>');
    var saludo = K.nodo(
      '<section class="saludo">' +
      '  <div class="saludo__txt">' +
      '    <p class="saludo__hola">' + K.esc(saludoDelDia()) + ',</p>' +
      '    <h2 class="saludo__nombre">' + K.esc(nombreCorto(YO.nombre)) + '</h2>' +
      '    <p class="saludo__doc">' + K.esc(rolLegible(YO.rol)) + ' · ' + K.esc(fechaHumana(new Date())) + '</p>' +
      '  </div>' +
      '</section>'
    );
    if (K.piezas.perfil && K.piezas.personas) saludo.appendChild(caraPerfil());
    if (K.piezas.cielo) K.piezas.cielo.poner(saludo, { burbujas: 3 });
    caja.appendChild(saludo);

    function bloque(titulo, tarjetas) {
      var s = K.nodo('<section class="bloque" aria-label="' + K.esc(titulo) + '">' +
        '<h3 class="bloque__t">' + K.esc(titulo) + '</h3></section>');
      var r = K.nodo('<div class="kit-rejilla kit-rejilla--auto accesos"></div>');
      tarjetas.forEach(function (t) { r.appendChild(t); });
      s.appendChild(r);
      caja.appendChild(s);
      return s;
    }

    var admin = puede('repartir');
    var acc = {};
    var tS = [];
    if (puede('solicitudes')) tS.push(acc.solicitudes = acceso('SOLICITUDES', admin
      ? 'Todo lo que le piden a Comunicaciones: evento, piezas, fotos, video y publicaciones'
      : 'Lo que tienes asignado: ábrelo y marca en qué va',
      'img/tramites_y_solicitudes.webp', function () { if (window.SOLIS) window.SOLIS.filtrar({ estado: 'ABIERTAS', quien: admin ? '' : '' }); irA('solicitudes'); }));
    if (admin) tS.push(acc.repartir = accesoIcono('REPARTIR', 'Asigna lo que llegó y mira la carga de cada persona del equipo', 'persona',
      function () { irA('repartir'); }));
    if (puede('crearSolicitud')) tS.push(accesoIcono('NUEVA SOLICITUD', 'Registra lo que te pidieron por llamada, WhatsApp o en persona', 'mas',
      function () { irA('nueva'); }));
    if (tS.length) bloque('SOLICITUDES', tS);

    var tE = [];
    if (puede('misInformes')) tE.push(acceso('MIS INFORMES', 'Lo atendido por periodo, en PDF por bloques o en Excel',
      'img/pdf.webp', function () { irA('informes'); }));
    if (puede('comunicados')) tE.push(acceso('COMUNICADOS', 'Publica avisos con documentos: llegan como notificación a los contratistas',
      'img/chat.webp', function () { irA('comunicados'); }));
    if (puede('directorio')) tE.push(acceso('DIRECTORIO', admin ? 'Las dependencias de la Alcaldía: agrega y corrige' : 'Dónde queda cada dependencia, sus correos y teléfonos',
      'img/ubicacion.webp', function () { irA('directorio'); }));
    if (puede('soporte')) tE.push(acceso('SOPORTE', 'Cuéntanos qué falla, con hasta 3 capturas', 'img/comunicaciones.webp', soporte));
    if (tE.length) bloque('EQUIPO', tE);

    var destino = K.nodo('<section class="resumen"></section>');
    if (acc.solicitudes) {
      var sRes = K.nodo('<section class="bloque" aria-label="Resumen"><h3 class="bloque__t">RESUMEN DE COMUNICACIONES</h3></section>');
      sRes.appendChild(destino);
      caja.appendChild(sRes);
    }

    app.appendChild(caja);
    K.piezas.creditos.montar(caja);

    if (acc.solicitudes && window.SOLIS) {
      K.piezas.esqueletos.mientras(destino, window.SOLIS.cargar(false), { forma: 'ficha', cuantos: 1, espera: 'Cargando las solicitudes' })
        .then(function () {
          var n = window.SOLIS.contar();
          burbujas(acc, n, admin);
          pintarResumen(destino, n, acc, admin);
          precargar();
        })
        ['catch'](function (e) { destino.appendChild(errorCaja(e)); });
    } else precargar();
  }

  function burbujas(acc, n, admin) {
    burbuja(acc.solicitudes, admin ? n.PENDIENTE + n['EN PROCESO'] : n.mias, 'abiertas', admin ? 'Al día: no hay solicitudes abiertas' : 'Al día: no tienes solicitudes abiertas');
    burbuja(acc.repartir, n.sinAsignar, 'sin asignar', 'Todo repartido');
  }

  function burbuja(acc, n, que, vacio) {
    if (!acc) return;
    var bb = acc.querySelector('.acceso__burbuja');
    if (bb) bb.parentNode.removeChild(bb);
    var p = acc.querySelector('.acceso__p');
    if (!acc.__texto && p) acc.__texto = p.textContent;
    if (n) { acc.insertAdjacentHTML('beforeend', '<b class="acceso__burbuja rv-burbuja" aria-label="' + n + ' ' + que + '">' + (n > 99 ? '99+' : n) + '</b>'); if (p) p.textContent = acc.__texto; }
    else if (p) p.textContent = vacio;
  }

  function abrir(f) {
    if (window.SOLIS) window.SOLIS.filtrar(f);
    irA('solicitudes');
  }

  function pintarResumen(destino, n, acc, admin) {
    destino.innerHTML = '';
    var caja = K.nodo('<div class="kit-tarjeta resumen__caja ct-resumen"></div>');
    var ref = K.nodo('<button type="button" class="kit-btn kit-btn--plano ct-recargar ct-recargar--mini" aria-label="Refrescar las cifras">' +
      K.icono('recargar', 16) + '<span>Refrescar</span></button>');
    ref.addEventListener('click', function () {
      ref.disabled = true; ref.classList.add('kit-ocupado');
      window.SOLIS.cargar(true).then(function () {
        var m = window.SOLIS.contar();
        pintarResumen(destino, m, acc, admin);
        burbujas(acc, m, admin);
        K.aviso('Cifras al día.', 'ok', 2000);
      }, function (e) { K.aviso((e && e.message) || 'No se pudo refrescar.', 'malo', 5000); ref.disabled = false; ref.classList.remove('kit-ocupado'); });
    });
    caja.appendChild(ref);
    var cifras = K.nodo('<div class="ct-cifras sp-cifras"></div>');
    var lista = [
      [{ estado: 'PENDIENTE', quien: '' }, n.PENDIENTE, 'Pendientes'],
      [{ estado: 'EN PROCESO', quien: '' }, n['EN PROCESO'], 'En proceso'],
      [{ estado: 'VENCIDAS', quien: '' }, n.vencidas, 'Entrega vencida']
    ];
    if (admin) lista.push([{ estado: 'ABIERTAS', quien: 'SIN' }, n.sinAsignar, 'Sin asignar']);
    lista.push([{ estado: 'REALIZADA', quien: '' }, n.REALIZADA, 'Realizadas']);
    lista.forEach(function (c) {
      var b = K.nodo('<button type="button" class="ct-cifra"><b>' + K.numero(c[1] || 0) + '</b><span>' + K.esc(c[2]) + '</span></button>');
      b.addEventListener('click', function () { K.vibrar(6); abrir(c[0]); });
      cifras.appendChild(b);
    });
    caja.appendChild(cifras);
    var abiertas = n.PENDIENTE + n['EN PROCESO'];
    caja.appendChild(K.nodo('<p class="ct-resumen__t sp-total">' + (abiertas
      ? K.numero(abiertas) + (abiertas === 1 ? ' solicitud abierta' : ' solicitudes abiertas') + (n.semana ? ' · ' + K.numero(n.semana) + ' se entregan esta semana' : '')
      : 'Todo al día: ninguna solicitud abierta') + '</p>'));
    destino.appendChild(caja);
    proximas(destino);
  }

  /** Las próximas entregas (máximo 5), para que nada se pase. */
  function proximas(destino) {
    var b = window.SOLIS._datos(), U = window.SOLIS._util;
    var hoy = U.hoyIso();
    var l = ((b && b.lista) || []).filter(function (x) { return x._abierta && x.publicacion; })
      .sort(function (a, c) { return String(a.publicacion).localeCompare(String(c.publicacion)); }).slice(0, 5);
    if (!l.length) return;
    var s = K.nodo('<div class="kit-tarjeta cm-prox"><h4 class="cm-prox__t">' + K.icono('reloj', 15) + ' Próximas entregas</h4></div>');
    l.forEach(function (x) {
      var tarde = x.publicacion < hoy;
      var f = K.nodo('<button type="button" class="cm-prox__f' + (tarde ? ' cm-prox__f--tarde' : '') + '">' +
        '<b>' + K.esc(U.fechaCorta(x.publicacion)) + '</b><span>' + K.esc(x.evento || String(x.detalles || '').slice(0, 60)) + '</span>' +
        '<small>' + K.esc(tarde ? 'vencida ' + U.relativo(x.publicacion) : U.relativo(x.publicacion)) + (x.asignados.length ? ' · ' + K.esc(x.asignados.map(function (a) { return a.split(' ')[0]; }).join(', ')) : ' · sin asignar') + '</small></button>');
      f.addEventListener('click', function () { irA('solicitud/' + encodeURIComponent(x.codigo)); });
      s.appendChild(f);
    });
    destino.appendChild(s);
  }

  function acceso(titulo, texto, medio, al) {
    var b = K.nodo(
      '<button type="button" class="kit-tarjeta acceso">' +
      '  <img class="acceso__img" src="' + K.esc(K.medio(medio)) + '" alt="" loading="lazy">' +
      '  <span class="acceso__txt">' +
      '    <span class="acceso__t">' + K.esc(titulo) + '</span>' +
      '    <span class="acceso__p">' + K.esc(texto) + '</span>' +
      '  </span>' +
      '</button>'
    );
    b.addEventListener('click', function () { K.vibrar(8); al(); });
    return b;
  }

  /** Sin imagen en ALCALDIA-MEDIOS para la acción: el icono del kit, del mismo tamaño. */
  function accesoIcono(titulo, texto, icono, al) {
    var b = K.nodo(
      '<button type="button" class="kit-tarjeta acceso">' +
      '  <span class="acceso__img acceso__img--icono" aria-hidden="true">' + K.icono(icono, 40) + '</span>' +
      '  <span class="acceso__txt">' +
      '    <span class="acceso__t">' + K.esc(titulo) + '</span>' +
      '    <span class="acceso__p">' + K.esc(texto) + '</span>' +
      '  </span>' +
      '</button>'
    );
    b.addEventListener('click', function () { K.vibrar(8); al(); });
    return b;
  }

  /* ══════════════ auxiliares ══════════════ */

  function saludoDelDia() {
    var h = new Date().getHours();
    return h < 12 ? 'Buenos días' : (h < 19 ? 'Buenas tardes' : 'Buenas noches');
  }

  function fechaHumana(d) {
    var dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    var meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
                 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return dias[d.getDay()] + ' ' + d.getDate() + ' de ' + meses[d.getMonth()];
  }

  function nombreCorto(n) {
    var p = String(n || '').trim().split(/\s+/);
    if (!p[0]) return '';
    return p.length > 1 ? (p[0] + ' ' + p[1]) : p[0];
  }

  function errorCaja(e, alReintentar) {
    var msg = (e && e.message) ? e.message : 'No se pudo cargar.';
    var c = K.nodo(
      '<section class="kit-tarjeta error">' +
      '  <p class="error__t">' + K.esc(msg) + '</p>' +
      '  <button type="button" class="kit-btn kit-btn--plano">Reintentar</button>' +
      '</section>'
    );
    c.querySelector('button').addEventListener('click', function () {
      if (alReintentar) alReintentar(); else enrutar();
    });
    return c;
  }
}());
