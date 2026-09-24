/* ============================================================
   COMUNICACIONES-FLANDES · SOLICITUDES
   Ecosistema Flandes · Fase 9

     #/solicitudes            la lista (pastillas de estado y de persona)
     #/solicitud/<codigo>     el detalle: estado, repartir, editar, al grupo
     #/nueva                  registrar una solicitud desde la app

   UN SOLO LLAMADO
     La lista entera llega con el arranque (el login trae 'inicio' y
     dentro 'bandeja'). Abrir la lista, filtrar, buscar, ver el detalle
     o armar MIS INFORMES no vuelve al servidor. Cada botón es una
     llamada y trae de vuelta la solicitud ya guardada, que reemplaza a
     la que había en el teléfono (sin pedir la lista otra vez).
     La única lectura extra: el detalle completo de una REALIZADA larga
     (viaja recortada en la lista) y el botón Refrescar.

   Qué puede cada quien (lo decide el CORE; aquí es cortesía)
     ADMIN ....... todas; reparte, edita, manda al grupo, crea.
     COMUNICADOR . las suyas; les cambia el estado; crea.
   ============================================================ */
(function () {
  'use strict';

  var K = window.KIT;
  var C = {};
  var FILTRO_K = 'solicitudes.filtro.v1';
  var B = null;          /* la bandeja: {lista, conteos, todas, yo, hoy} */
  var HORA = null;
  var CARGANDO = null;
  var F = null;
  var LLENOS = {};       /* codigo -> detalle completo ya traido */

  var ESTADOS = ['PENDIENTE', 'EN PROCESO', 'REALIZADA'];
  var TEXTO_ESTADO = { 'PENDIENTE': 'Pendiente', 'EN PROCESO': 'En proceso', 'REALIZADA': 'Realizada' };

  function O() { return window.OFICINA; }

  /* ══════════════ los datos ══════════════ */

  function preparar(x) {
    x._t = K.norm([x.codigo, x.evento, x.detalles, x.responsable, x.secretaria, x.cargo, x.lugar,
      (x.asignados || []).join(' '), (x.requerimientos || []).join(' ')].join(' '));
    x._abierta = x.estado !== 'REALIZADA';
    return x;
  }

  function recibir(b) {
    B = b || { lista: [], conteos: {} };
    B.lista = (B.lista || []).map(preparar);
    HORA = new Date();
    if (C.alCambiar) C.alCambiar(contar());
  }

  function cargar(fresco) {
    if (B && !fresco) return Promise.resolve(B);
    if (CARGANDO && !fresco) return CARGANDO;
    CARGANDO = O().leer('solicitudes', {}).then(function (d) { CARGANDO = null; LLENOS = {}; recibir(d); return B; },
      function (e) { CARGANDO = null; throw e; });
    return CARGANDO;
  }

  /** Lo que devolvio el servidor al guardar reemplaza a la de la lista. */
  function poner(s) {
    if (!B || !s) return;
    preparar(s);
    var i = -1;
    B.lista.forEach(function (x, k) { if (x.codigo === s.codigo) i = k; });
    if (i >= 0) {
      /* el COMUNICADOR solo ve las suyas: si ya no lo es, sale de su lista */
      if (!B.todas && !s.mia) B.lista.splice(i, 1);
      else B.lista[i] = s;
    } else if (B.todas || s.mia) B.lista.unshift(s);
    LLENOS[s.codigo] = s.corto ? null : s;
    if (C.alCambiar) C.alCambiar(contar());
  }

  function contar() {
    var n = { total: 0, PENDIENTE: 0, 'EN PROCESO': 0, REALIZADA: 0, sinAsignar: 0, mias: 0, vencidas: 0, semana: 0 };
    var hoy = hoyIso(), en7 = masDias(hoy, 7);
    ((B && B.lista) || []).forEach(function (x) {
      n.total++;
      if (n[x.estado] !== undefined) n[x.estado]++;
      if (x._abierta && !x.asignados.length) n.sinAsignar++;
      if (x._abierta && x.mia) n.mias++;
      if (x._abierta && x.publicacion && x.publicacion < hoy) n.vencidas++;
      if (x._abierta && x.publicacion && x.publicacion >= hoy && x.publicacion <= en7) n.semana++;
    });
    return n;
  }

  function buscar(codigo) {
    var l = (B && B.lista) || [];
    for (var i = 0; i < l.length; i++) if (l[i].codigo === codigo) return l[i];
    return null;
  }

  /* ══════════════ fechas ══════════════ */

  function hoyIso() { return (B && B.hoy) || O().isoDe(new Date()); }
  function aDate(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || '')); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }
  function masDias(iso, n) { var d = aDate(iso) || new Date(); d.setDate(d.getDate() + n); return O().isoDe(d); }
  function diasHasta(iso) {
    var d = aDate(iso), h = aDate(hoyIso());
    return d && h ? Math.round((d - h) / 864e5) : null;
  }
  /** "hoy", "mañana", "en 3 días", "hace 2 días" */
  function relativo(iso) {
    var n = diasHasta(iso);
    if (n === null) return '';
    if (n === 0) return 'hoy';
    if (n === 1) return 'mañana';
    if (n === -1) return 'ayer';
    return n > 0 ? 'en ' + n + ' días' : 'hace ' + (-n) + ' días';
  }
  function fechaCorta(iso) {
    var d = aDate(iso);
    if (!d) return '';
    var m = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return d.getDate() + ' ' + m[d.getMonth()] + (d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : '');
  }

  function tono(e) { return e === 'REALIZADA' ? 'ok' : (e === 'EN PROCESO' ? 'info' : 'aviso'); }
  function marcaEstado(e) {
    return '<span class="kit-pastilla ct-t__estado of-estado cm-estado cm-estado--' + tono(e) + '">' + K.esc(TEXTO_ESTADO[e] || e) + '</span>';
  }

  function pasos(estado) {
    var n = { 'PENDIENTE': 1, 'EN PROCESO': 2, 'REALIZADA': 3 }[estado] || 1;
    return '<ol class="tr-pasos" aria-label="En qué va">' +
      ['Recibida', 'En proceso', 'Realizada'].map(function (t, i) {
        var cl = i + 1 < n ? ' tr-paso--hecho' : (i + 1 === n ? ' tr-paso--actual' : '');
        return '<li class="tr-paso' + cl + '"' + (i + 1 === n ? ' aria-current="step"' : '') + '><i></i>' + t + '</li>';
      }).join('') + '</ol>';
  }

  function resumen(t, n) {
    var s = String(t || '').replace(/\s+/g, ' ').trim();
    return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s;
  }

  function caras(nombres, tam) {
    var z = K.nodo('<span class="cm-caras"></span>');
    (nombres || []).forEach(function (n) {
      if (K.piezas.personas) z.appendChild(K.piezas.personas.avatar(n, { tam: tam || 26, sinZoom: true }));
    });
    return z;
  }

  /* ══════════════ filtros ══════════════ */

  function leerFiltro() {
    var g = K.guardar.leer(FILTRO_K, null) || {};
    return { estado: g.estado !== undefined ? g.estado : 'ABIERTAS', quien: g.quien || '', busca: '' };
  }
  function guardarFiltro() { K.guardar.escribir(FILTRO_K, { estado: F.estado, quien: F.quien }); }

  /** Lo que se abre desde el inicio: {estado, quien}. */
  function filtrar(f) {
    if (!F) F = leerFiltro();
    f = f || {};
    if (f.estado !== undefined) F.estado = f.estado;
    if (f.quien !== undefined) F.quien = f.quien;
    F.busca = '';
    guardarFiltro();
  }

  function pasaEstado(x) {
    if (!F.estado) return true;
    if (F.estado === 'ABIERTAS') return x._abierta;
    if (F.estado === 'VENCIDAS') return x._abierta && x.publicacion && x.publicacion < hoyIso();
    return x.estado === F.estado;
  }
  function pasaQuien(x) {
    if (!F.quien) return true;
    if (F.quien === 'MIAS') return !!x.mia;
    if (F.quien === 'SIN') return !x.asignados.length;
    return x.asignados.some(function (a) { return K.norm(a) === F.quien; });
  }
  function pasaBusca(x) {
    var q = K.norm(F.busca || '');
    if (!q) return true;
    var p = q.split(' ').filter(Boolean);
    for (var i = 0; i < p.length; i++) if (x._t.indexOf(p[i]) < 0) return false;
    return true;
  }
  function filas() {
    var l = ((B && B.lista) || []).filter(function (x) { return pasaEstado(x) && pasaQuien(x) && pasaBusca(x); });
    /* las abiertas por la fecha de entrega (lo que vence primero, arriba); las demás, la más nueva primero */
    var abiertas = F.estado === 'ABIERTAS' || F.estado === 'PENDIENTE' || F.estado === 'EN PROCESO' || F.estado === 'VENCIDAS';
    return l.sort(function (a, b) {
      if (abiertas) return String(a.publicacion || '9999').localeCompare(String(b.publicacion || '9999')) || String(a.codigo).localeCompare(String(b.codigo));
      return String(b.fecha).localeCompare(String(a.fecha)) || String(b.codigo).localeCompare(String(a.codigo));
    });
  }

  /* ══════════════ LA LISTA ══════════════ */

  function vista() {
    if (!F) F = leerFiltro();
    var todas = !!(B && B.todas);
    var caja = K.nodo('<div class="kit-ancho vista ct of cm"></div>');
    C.app.appendChild(caja);
    O().cabecera(caja, 'megafono', 'SOLICITUDES',
      todas ? 'Todo lo que le piden a Comunicaciones: de los contratistas, de Supervisión y lo que registra el equipo. Toca una para verla, repartirla o cambiarle el estado.'
            : 'Las solicitudes que tienes asignadas. Toca una para verla y marcar en qué va.');
    var acc = K.nodo('<div class="cm-arriba"></div>');
    if (C.puede('crearSolicitud')) {
      var nueva = K.nodo('<button type="button" class="kit-btn kit-btn--marca">' + K.icono('mas', 16) + ' Nueva solicitud</button>');
      nueva.addEventListener('click', function () { C.irA('nueva'); });
      acc.appendChild(nueva);
    }
    caja.appendChild(acc);
    var b = O().barra({ placeholder: 'Código, evento, secretaría, quién la pide o la atiende', valor: F.busca,
      alBuscar: function (q) { F.busca = q; VER = 40; pintar(); }, alRefrescar: function () { return cargar(true).then(pintar); } });
    caja.appendChild(b.caja);
    var zE = K.nodo('<div></div>'), zQ = K.nodo('<div></div>');
    caja.appendChild(zE); caja.appendChild(zQ);
    var conteo = K.nodo('<p class="ct-conteo" aria-live="polite"></p>');
    caja.appendChild(conteo);
    var lista = K.nodo('<div class="kit-rejilla kit-rejilla--auto ct-lista cm-lista"></div>');
    caja.appendChild(lista);
    var mas = K.nodo('<button type="button" class="kit-btn kit-btn--plano ct-mas" hidden>Ver más</button>');
    caja.appendChild(mas);
    var VER = 40, pE, pQ;
    mas.addEventListener('click', function () { VER += 60; pintarLista(); });

    function pintarLista() {
      var f = filas();
      lista.innerHTML = '';
      mas.hidden = true;
      if (!f.length) {
        lista.appendChild(F.estado === 'ABIERTAS' && !F.busca && !F.quien
          ? K.nodo('<div class="kit-tarjeta ct-vacio op-aldia">' + K.icono('check', 30) + '<p><b>¡Al día!</b><br>No hay solicitudes abiertas.</p></div>')
          : O().vacio('No hay solicitudes con estos filtros.', function () { F.estado = ''; F.quien = ''; F.busca = ''; b.inp.value = ''; guardarFiltro(); pintar(); }));
        return;
      }
      f.slice(0, VER).forEach(function (x) { lista.appendChild(tarjeta(x)); });
      if (f.length > VER) { mas.hidden = false; mas.textContent = 'Ver ' + Math.min(60, f.length - VER) + ' más de ' + K.numero(f.length - VER); }
    }

    function pintar() {
      if (!B) return;
      var l = B.lista;
      var cE = { '': 0, ABIERTAS: 0, VENCIDAS: 0 };
      ESTADOS.forEach(function (e) { cE[e] = 0; });
      l.filter(function (x) { return pasaQuien(x) && pasaBusca(x); }).forEach(function (x) {
        cE['']++; cE[x.estado] = (cE[x.estado] || 0) + 1;
        if (x._abierta) cE.ABIERTAS++;
        if (x._abierta && x.publicacion && x.publicacion < hoyIso()) cE.VENCIDAS++;
      });
      pE.conteos(cE); O().marcar(zE, F.estado);
      if (pQ) {
        var cQ = { '': 0, MIAS: 0, SIN: 0 }, nombres = {};
        l.filter(function (x) { return pasaEstado(x) && pasaBusca(x); }).forEach(function (x) {
          cQ['']++;
          if (x.mia) cQ.MIAS++;
          if (!x.asignados.length) cQ.SIN++;
          x.asignados.forEach(function (a) { var k = K.norm(a); cQ[k] = (cQ[k] || 0) + 1; nombres[k] = a; });
        });
        var ops = [{ valor: '', texto: 'Todo el equipo' }, { valor: 'SIN', texto: 'Sin asignar', tono: 'aviso' }];
        if (cQ.MIAS) ops.splice(1, 0, { valor: 'MIAS', texto: 'Mías' });
        Object.keys(nombres).sort().forEach(function (k) { ops.push({ valor: k, texto: O().nombre(nombres[k]) }); });
        if (F.quien && cQ[F.quien] === undefined) F.quien = '';
        pQ.opciones(ops); pQ.conteos(cQ); O().marcar(zQ, F.quien);
      }
      var f = filas();
      conteo.innerHTML = '<b>' + K.numero(f.length) + '</b> ' + (f.length === 1 ? 'solicitud' : 'solicitudes') +
        (HORA ? '<span class="ct-sello">' + K.icono('reloj', 13) + ' Al día a las ' + K.esc(O().horaCorta(HORA)) + '</span>' : '');
      pintarLista();
    }

    K.piezas.esqueletos.mientras(lista, cargar(false), { forma: 'tarjetas', cuantos: 3, espera: 'Cargando las solicitudes' })
      .then(function () {
        pE = K.piezas.pastillas.montar(zE, { etiqueta: 'Estado', valor: F.estado,
          opciones: [{ valor: 'ABIERTAS', texto: 'Abiertas' }, { valor: 'PENDIENTE', texto: 'Pendientes', tono: 'aviso' },
                     { valor: 'EN PROCESO', texto: 'En proceso' }, { valor: 'VENCIDAS', texto: 'Entrega vencida', tono: 'malo' },
                     { valor: 'REALIZADA', texto: 'Realizadas', tono: 'ok' }, { valor: '', texto: 'Todas' }],
          alCambiar: function (v) { F.estado = v; guardarFiltro(); VER = 40; pintar(); } });
        if (B.todas) {
          pQ = K.piezas.pastillas.montar(zQ, { etiqueta: 'Quién', valor: F.quien, opciones: [{ valor: '', texto: 'Todo el equipo' }],
            alCambiar: function (v) { F.quien = v; guardarFiltro(); VER = 40; pintar(); } });
        } else { F.quien = ''; }
        pintar();
      })['catch'](function (e) { caja.appendChild(C.errorCaja(e)); });
    K.piezas.creditos.montar(caja);
  }

  function tarjeta(x) {
    var vence = x._abierta && x.publicacion ? diasHasta(x.publicacion) : null;
    var t = K.nodo('<button type="button" class="kit-tarjeta ct-t cm-sol cm-sol--' + tono(x.estado) + (vence !== null && vence < 0 ? ' cm-sol--vencida' : '') + '"></button>');
    var cab = K.nodo('<div class="ct-t__cab"></div>');
    cab.appendChild(K.nodo('<div class="ct-t__quien"><h3 class="ct-t__n">' + K.esc(x.evento || resumen(x.detalles, 70) || 'Sin título') + '</h3>' +
      '<p class="ct-t__doc">' + K.esc(x.codigo) + ' · ' + K.esc(O().nombre(x.responsable) || '—') + '</p></div>'));
    cab.insertAdjacentHTML('beforeend', marcaEstado(x.estado));
    t.appendChild(cab);
    if (x.secretaria) t.appendChild(K.nodo('<p class="cm-sol__sec">' + K.esc(O().titulo(x.secretaria)) + '</p>'));
    if (x.requerimientos.length) {
      t.appendChild(K.nodo('<div class="tr-chips tr-chips--quietas cm-chips">' + x.requerimientos.map(function (r) {
        return '<span class="kit-pastilla">' + K.esc(r) + '</span>'; }).join('') + '</div>'));
    }
    var pie = K.nodo('<div class="cm-sol__pie"></div>');
    var cuando = x.publicacion
      ? '<span class="cm-sol__entrega' + (vence !== null && vence < 0 ? ' cm-sol__entrega--tarde' : (vence !== null && vence <= 2 ? ' cm-sol__entrega--pronto' : '')) + '">' +
        K.icono('reloj', 13) + ' Entrega ' + K.esc(fechaCorta(x.publicacion)) + (x._abierta ? ' <small>(' + K.esc(relativo(x.publicacion)) + ')</small>' : '') + '</span>'
      : '<span class="cm-sol__entrega">' + K.icono('reloj', 13) + ' Sin fecha de entrega</span>';
    pie.insertAdjacentHTML('beforeend', cuando);
    if (x.asignados.length) pie.appendChild(caras(x.asignados, 26));
    else pie.insertAdjacentHTML('beforeend', '<span class="cm-sol__sin">' + K.icono('persona', 13) + ' Sin asignar</span>');
    t.appendChild(pie);
    t.addEventListener('click', function () { K.vibrar(6); C.irA('solicitud/' + encodeURIComponent(x.codigo)); });
    return t;
  }

  /* ══════════════ EL DETALLE ══════════════ */

  function detalle(sub) {
    var codigo = decodeURIComponent(String(sub || '').split('/')[0]);
    var caja = K.nodo('<div class="kit-ancho vista ct of cm cm-det"></div>');
    C.app.appendChild(caja);
    var p = cargar(false).then(function () {
      var x = buscar(codigo);
      if (!x) throw new Error('La solicitud ' + codigo + ' no está en tu lista.');
      if (!x.corto || LLENOS[codigo]) return LLENOS[codigo] || x;
      /* REALIZADA larga: el detalle completo, una sola vez */
      return O().leer('solicitud', { codigo: codigo }).then(function (lleno) { LLENOS[codigo] = preparar(lleno); return LLENOS[codigo]; });
    });
    K.piezas.esqueletos.mientras(caja, p, { forma: 'ficha', cuantos: 1, espera: 'Abriendo la solicitud' })
      .then(function (x) { pintarDetalle(caja, x); })
      ['catch'](function (e) { caja.appendChild(C.errorCaja(e, function () { C.irA('solicitudes'); })); });
  }

  function dato(t, v) {
    v = String(v || '').trim();
    return v ? '<div class="seg-dato"><dt>' + K.esc(t) + '</dt><dd>' + K.esc(v) + '</dd></div>' : '';
  }

  function pintarDetalle(caja, x) {
    caja.innerHTML = '';
    var admin = C.puede('repartir');
    var puedeEstado = admin || x.mia;

    var cab = K.nodo('<section class="kit-tarjeta cm-ficha"></section>');
    cab.appendChild(K.nodo('<div class="cm-ficha__cab"><div><p class="cm-ficha__cod">' + K.esc(x.codigo) + ' · recibida el ' + K.esc(K.fecha(x.fecha)) + '</p>' +
      '<h2 class="cm-ficha__t">' + K.esc(x.evento || resumen(x.detalles, 90) || 'Solicitud') + '</h2></div>' + marcaEstado(x.estado) + '</div>'));
    cab.insertAdjacentHTML('beforeend', pasos(x.estado));
    if (x.publicacion) {
      var n = x._abierta ? diasHasta(x.publicacion) : null;
      cab.appendChild(K.nodo('<p class="cm-ficha__entrega' + (n !== null && n < 0 ? ' cm-sol__entrega--tarde' : '') + '">' + K.icono('reloj', 15) +
        ' Entrega o publicación: <b>' + K.esc(K.fecha(x.publicacion)) + '</b>' + (x._abierta ? ' (' + K.esc(relativo(x.publicacion)) + ')' : '') + '</p>'));
    }
    if (x.requerimientos.length) cab.appendChild(K.nodo('<div class="tr-chips tr-chips--quietas">' + x.requerimientos.map(function (r) { return '<span class="kit-pastilla">' + K.esc(r) + '</span>'; }).join('') + '</div>'));
    caja.appendChild(cab);

    /* ── quién la atiende y en qué va ── */
    var zAt = K.nodo('<section class="kit-tarjeta cm-bloque"><h3 class="seg-sec__t">QUIÉN LA ATIENDE</h3></section>');
    var quien = K.nodo('<div class="cm-atiende"></div>');
    if (x.asignados.length) {
      x.asignados.forEach(function (a) {
        var f = K.nodo('<div class="cm-atiende__p"></div>');
        if (K.piezas.personas) f.appendChild(K.piezas.personas.avatar(a, { tam: 36 }));
        f.appendChild(K.nodo('<span>' + K.esc(O().nombre(a)) + '</span>'));
        quien.appendChild(f);
      });
    } else quien.appendChild(K.nodo('<p class="seg-nada">Todavía no está asignada.</p>'));
    zAt.appendChild(quien);
    if (puedeEstado) {
      var est = K.nodo('<div class="cm-estados" role="group" aria-label="Cambiar el estado"></div>');
      ESTADOS.forEach(function (e) {
        var bt = K.nodo('<button type="button" class="kit-btn ' + (e === x.estado ? 'kit-btn--marca' : 'kit-btn--plano') + '" aria-pressed="' + (e === x.estado) + '">' + K.esc(TEXTO_ESTADO[e]) + '</button>');
        bt.addEventListener('click', function () {
          if (e === x.estado) return;
          cambiarEstado(x, e, caja);
        });
        est.appendChild(bt);
      });
      zAt.appendChild(K.nodo('<p class="campo__ayuda">Cambia el estado con un toque' + (x.idContrato ? ': al contratista le llega un aviso cuando pasa a En proceso y a Realizada.' : '.') + '</p>'));
      zAt.appendChild(est);
    }
    if (admin) {
      var rep = K.nodo('<button type="button" class="kit-btn kit-btn--plano cm-ancho">' + K.icono('persona', 16) + ' ' + (x.asignados.length ? 'Cambiar a quién se asigna' : 'Repartir') + '</button>');
      rep.addEventListener('click', function () { repartir(x, function (s) { pintarDetalle(caja, s); }); });
      zAt.appendChild(rep);
    }
    caja.appendChild(zAt);

    /* ── los datos ── */
    var zD = K.nodo('<section class="kit-tarjeta cm-bloque"><h3 class="seg-sec__t">LO QUE PIDEN</h3></section>');
    zD.appendChild(K.nodo('<p class="tr-sol__det cm-detalle">' + O().conEnlaces(x.detalles || '—') + '</p>'));
    zD.appendChild(K.nodo('<dl class="seg-datos">' +
      dato('Evento', x.evento) +
      dato('Fecha del evento', [x.fechaEvento ? K.fecha(x.fechaEvento) : '', x.horaInicio && x.horaFin ? x.horaInicio + ' a ' + x.horaFin : x.horaInicio].filter(Boolean).join(' · ')) +
      dato('Lugar', x.lugar) + dato('Otros', x.otros) + '</dl>'));
    caja.appendChild(zD);

    var zS = K.nodo('<section class="kit-tarjeta cm-bloque"><h3 class="seg-sec__t">QUIÉN LA PIDE</h3></section>');
    var pide = K.nodo('<div class="cm-atiende__p cm-pide"></div>');
    if (K.piezas.personas) pide.appendChild(K.piezas.personas.avatar(x.responsable, { tam: 40 }));
    pide.appendChild(K.nodo('<div><b>' + K.esc(O().nombre(x.responsable) || '—') + '</b><small>' + K.esc([O().titulo(x.cargo), O().titulo(x.secretaria)].filter(Boolean).join(' · ')) + '</small></div>'));
    zS.appendChild(pide);
    var accS = K.nodo('<div class="ct-acc"></div>');
    if (/^\d{10}$/.test(String(x.contacto || ''))) {
      var w = K.nodo('<a class="kit-btn kit-btn--plano" target="_blank" rel="noopener">' + K.icono('whatsapp', 16) + ' WhatsApp</a>');
      w.href = 'https://wa.me/57' + x.contacto;
      var ll = K.nodo('<a class="kit-btn kit-btn--plano">' + K.icono('llamar', 16) + ' Llamar</a>');
      ll.href = 'tel:+57' + x.contacto;
      accS.appendChild(w); accS.appendChild(ll);
    }
    if (x.idContrato) zS.appendChild(K.nodo('<p class="campo__ayuda">' + K.icono('info', 13) + ' La pidió desde la app CONTRATISTA (contrato ' + K.esc(String(x.idContrato).split('-').pop()) + ').</p>'));
    zS.appendChild(accS);
    caja.appendChild(zS);

    /* ── acciones del ADMIN ── */
    var zA = K.nodo('<div class="cm-acciones"></div>');
    var cop = K.nodo('<button type="button" class="kit-btn kit-btn--plano">' + K.icono('copiar', 16) + ' Copiar los datos</button>');
    cop.addEventListener('click', function () { copiar(textoPlano(x)); });
    zA.appendChild(cop);
    if (admin) {
      var ed = K.nodo('<button type="button" class="kit-btn kit-btn--plano">' + K.icono('lapiz', 16) + ' Editar los datos</button>');
      ed.addEventListener('click', function () { editar(x, function (s) { pintarDetalle(caja, s); }); });
      var gr = K.nodo('<button type="button" class="kit-btn kit-btn--plano">' + K.icono('enviar', 16) + ' Enviar al grupo</button>');
      gr.addEventListener('click', function () { alGrupo(x, gr); });
      zA.appendChild(ed); zA.appendChild(gr);
    }
    caja.appendChild(zA);
    K.piezas.creditos.montar(caja);
  }

  function textoPlano(x) {
    return [x.codigo + ' · ' + (TEXTO_ESTADO[x.estado] || x.estado),
      x.evento ? 'Evento: ' + x.evento : '',
      x.fechaEvento ? 'Fecha del evento: ' + K.fecha(x.fechaEvento) + (x.horaInicio ? ' · ' + x.horaInicio + (x.horaFin ? ' a ' + x.horaFin : '') : '') : '',
      x.lugar ? 'Lugar: ' + x.lugar : '',
      'Detalles: ' + (x.detalles || '—'),
      'Requerimientos: ' + (x.requerimientos.join(', ') || '—'),
      x.otros ? 'Otros: ' + x.otros : '',
      x.publicacion ? 'Entrega o publicación: ' + K.fecha(x.publicacion) : '',
      'Solicita: ' + (x.responsable || '—') + (x.cargo ? ' · ' + x.cargo : '') + (x.secretaria ? ' · ' + x.secretaria : ''),
      x.contacto ? 'Contacto: ' + x.contacto : '',
      'Asignada a: ' + (x.asignados.join(', ') || 'sin asignar')].filter(Boolean).join('\n');
  }

  function copiar(t) {
    var ok = function () { K.aviso('Copiado.', 'ok', 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(ok, function () { K.aviso('No se pudo copiar.', 'malo', 3000); });
    } else {
      var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) {} document.body.removeChild(ta);
    }
  }

  /* ══════════════ las acciones (una llamada cada una) ══════════════ */

  function guardar(datos, textos) {
    return K.piezas.guardado.mientras(K.pedir('solicitudGuardar', datos, { ms: 60000 }), textos).then(function (r) {
      poner(r.solicitud);
      var malos = (r.avisos && r.avisos.whatsapp || []).filter(function (w) { return !w.ok; });
      if (malos.length) K.aviso('Guardado, pero el WhatsApp no le llegó a ' + malos.map(function (w) { return O().nombre(w.nombre); }).join(', ') + '.', 'aviso', 8000);
      return r.solicitud;
    });
  }

  function cambiarEstado(x, e, caja) {
    K.piezas.confirmar.abrir({ titulo: 'Marcar ' + x.codigo + ' como ' + TEXTO_ESTADO[e] + '?',
      texto: e === 'REALIZADA' && x.idContrato ? 'Al contratista le llega el aviso de que su solicitud quedó lista.' : 'Queda registrado de una vez.',
      si: 'Sí, ' + TEXTO_ESTADO[e].toLowerCase(), no: 'Cancelar' })
      .then(function (ok) {
        if (!ok) return;
        guardar({ codigo: x.codigo, estado: e }, { titulo: 'Guardando el estado', sub: x.codigo + ' → ' + TEXTO_ESTADO[e], pasos: ['Guardando…'], listo: { titulo: 'Estado guardado', paso: TEXTO_ESTADO[e] } })
          .then(function (s) { pintarDetalle(caja, s); }, function (er) { K.aviso((er && er.message) || 'No se pudo guardar.', 'malo', 7000); });
      });
  }

  /** Elegir a quién se asigna. Lo usa también REPARTIR. */
  function repartir(x, alGuardar) {
    var sel = x.asignados.map(function (a) { return K.norm(a); });
    var cuerpo = K.nodo('<div><p class="formulario__nota">Toca a las personas que la van a atender. A las <b>nuevas</b> les llega un WhatsApp con el código y la fecha de entrega.</p>' +
      '<div class="cm-equipo"></div><label class="cm-check"><input type="checkbox" checked> Avisar por WhatsApp a quien se agrega</label></div>');
    var eq = cuerpo.querySelector('.cm-equipo');
    (C.asignables() || []).forEach(function (n) {
      var b = K.nodo('<button type="button" class="cm-persona" aria-pressed="' + (sel.indexOf(K.norm(n)) >= 0) + '"></button>');
      if (K.piezas.personas) b.appendChild(K.piezas.personas.avatar(n, { tam: 34, sinZoom: true }));
      b.appendChild(K.nodo('<span>' + K.esc(O().nombre(n)) + '</span>'));
      b.insertAdjacentHTML('beforeend', '<i class="cm-persona__carga">' + K.esc(cargaDe(n)) + '</i>');
      b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); });
      b.__n = n;
      eq.appendChild(b);
    });
    var m = O().modal({
      titulo: 'Repartir ' + x.codigo, cuerpo: cuerpo,
      botones: [{ texto: 'Cancelar', al: function () { m.cerrar(); } }, { texto: 'Guardar', icono: 'check', marca: true, al: listo }]
    });
    function listo() {
      var elegidos = [].filter.call(eq.children, function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.__n; });
      m.botones[1].disabled = true;
      guardar({ codigo: x.codigo, asignados: elegidos, avisar: cuerpo.querySelector('input').checked },
        { titulo: 'Repartiendo ' + x.codigo, sub: elegidos.length ? elegidos.map(O().nombre).join(', ') : 'Sin asignar', pasos: ['Guardando…', 'Avisando por WhatsApp…'],
          listo: { titulo: 'Repartida', paso: elegidos.length ? 'Equipo avisado' : 'Guardada' } })
        .then(function (s) { m.cerrar(); if (alGuardar) alGuardar(s); }, function (er) { m.botones[1].disabled = false; K.aviso((er && er.message) || 'No se pudo repartir.', 'malo', 7000); });
    }
  }

  /** "3 abiertas" de una persona, para repartir parejo. */
  function cargaDe(n) {
    var k = K.norm(n), c = 0;
    ((B && B.lista) || []).forEach(function (x) { if (x._abierta && x.asignados.some(function (a) { return K.norm(a) === k; })) c++; });
    return c === 1 ? '1 abierta' : c + ' abiertas';
  }

  function alGrupo(x, boton) {
    boton.disabled = true;
    K.pedir('alGrupo', { codigo: x.codigo }, { ms: 45000 }).then(function (r) {
      K.aviso(r && r.ok ? 'Enviada al grupo de Comunicaciones.' : 'El grupo no recibió el mensaje (' + ((r && r.error) || 'sin detalle') + ').', r && r.ok ? 'ok' : 'aviso', 5000);
    }, function (e) { K.aviso((e && e.message) || 'No se pudo enviar.', 'malo', 6000); })
      .then(function () { boton.disabled = false; });
  }

  /* ══════════════ EL FORMULARIO (nueva y editar) ══════════════ */

  function campo(etiqueta, ayuda, control, obligatorio) {
    var c = K.nodo('<label class="campo"><span>' + K.esc(etiqueta) + (obligatorio ? ' <i class="tr-oblig" aria-hidden="true">*</i>' : '') + '</span></label>');
    c.appendChild(control);
    if (ayuda) c.appendChild(K.nodo('<p class="campo__ayuda">' + ayuda + '</p>'));
    return c;
  }

  /** "08:00 AM" -> "08:00" para el input de hora. */
  function hhmm(v) {
    var m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(String(v || '').trim());
    if (!m) return /^\d{2}:\d{2}$/.test(String(v || '')) ? v : '';
    var h = Number(m[1]) % 12 + (m[3].toUpperCase() === 'PM' ? 12 : 0);
    return ('0' + h).slice(-2) + ':' + m[2];
  }

  /** Arma el formulario. x = la solicitud a editar (o null para una nueva). Devuelve {nodo, datos(), falta()}. */
  function formulario(x, conQuien) {
    x = x || {};
    var f = K.nodo('<div class="formulario tr-form cm-form"></div>');
    var chips = K.nodo('<div class="tr-chips" role="group" aria-label="Qué piden"></div>');
    (C.requerimientos() || []).forEach(function (r) {
      var on = (x.requerimientos || []).some(function (q) { return K.norm(q) === K.norm(r); });
      var b = K.nodo('<button type="button" class="kit-pastilla tr-chip" aria-pressed="' + on + '">' + K.icono('check', 14) + K.esc(r) + '</button>');
      b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); });
      b.__r = r;
      chips.appendChild(b);
    });
    var cReq = K.nodo('<div class="campo"><span>¿Qué piden? <i class="tr-oblig" aria-hidden="true">*</i></span></div>');
    cReq.appendChild(chips);
    f.appendChild(cReq);
    var det = K.nodo('<textarea rows="5" maxlength="5000" placeholder="Objetivo, participantes, texto de la pieza, logística…"></textarea>');
    det.value = x.detalles || '';
    f.appendChild(campo('Detalles', 'Mínimo una frase completa.', det, true));
    var pub = K.nodo('<input type="date" data-kit-fecha data-titulo="Entrega o publicación" data-desde="2025">');
    pub.value = x.publicacion || '';
    f.appendChild(campo('Fecha de entrega o publicación', x.codigo ? '' : 'Desde el equipo no hay antelación mínima; solo no puede ser una fecha pasada.', pub, true));
    f.appendChild(K.nodo('<h3 class="grupo__t grupo__t--sub">Si es un evento</h3>'));
    var ev = K.nodo('<input type="text" maxlength="300" placeholder="Nombre del evento">'); ev.value = x.evento || '';
    f.appendChild(campo('Nombre del evento', '', ev, false));
    var fe = K.nodo('<input type="date" data-kit-fecha data-titulo="Fecha del evento" data-desde="2025">'); fe.value = x.fechaEvento || '';
    f.appendChild(campo('Fecha del evento', '', fe, false));
    var fila = K.nodo('<div class="campo-fila"></div>');
    var hi = K.nodo('<input type="time">'), hf = K.nodo('<input type="time">');
    hi.value = hhmm(x.horaInicio); hf.value = hhmm(x.horaFin);
    fila.appendChild(campo('Hora de inicio', '', hi, false));
    fila.appendChild(campo('Hora de terminación', '', hf, false));
    f.appendChild(fila);
    var lug = K.nodo('<input type="text" maxlength="300" placeholder="Lugar o punto de encuentro">'); lug.value = x.lugar || '';
    f.appendChild(campo('Lugar', '', lug, false));
    var otr = K.nodo('<textarea rows="2" maxlength="1000"></textarea>'); otr.value = x.otros || '';
    f.appendChild(campo('Otros', '', otr, false));
    f.appendChild(K.nodo('<h3 class="grupo__t grupo__t--sub">Quién la pide</h3>'));
    var res = K.nodo('<input type="text" maxlength="150" placeholder="Nombre de quien solicita">'); res.value = x.responsable || '';
    f.appendChild(campo('Responsable', '', res, true));
    var sec = K.nodo('<select><option value="">Escoge la secretaría</option></select>');
    var secs = (C.secretarias() || []).slice();
    if (x.secretaria && secs.map(K.norm).indexOf(K.norm(x.secretaria)) < 0) secs.push(x.secretaria);
    secs.forEach(function (s) { var o = document.createElement('option'); o.value = s; o.textContent = s; if (K.norm(s) === K.norm(x.secretaria)) o.selected = true; sec.appendChild(o); });
    f.appendChild(campo('Secretaría o dependencia', '', sec, true));
    var car = K.nodo('<input type="text" maxlength="150" placeholder="Cargo">'); car.value = x.cargo || '';
    f.appendChild(campo('Cargo', '', car, false));
    var tel = K.nodo('<input type="tel" inputmode="numeric" maxlength="10" placeholder="Celular de 10 dígitos">'); tel.value = x.contacto || '';
    tel.addEventListener('input', function () { tel.value = tel.value.replace(/\D/g, '').slice(0, 10); });
    f.appendChild(campo('Contacto', '', tel, false));

    var eq = null;
    if (conQuien) {
      f.appendChild(K.nodo('<h3 class="grupo__t grupo__t--sub">Quién la atiende</h3>'));
      eq = K.nodo('<div class="cm-equipo"></div>');
      (C.asignables() || []).forEach(function (n) {
        var b = K.nodo('<button type="button" class="cm-persona" aria-pressed="false"></button>');
        if (K.piezas.personas) b.appendChild(K.piezas.personas.avatar(n, { tam: 30, sinZoom: true }));
        b.appendChild(K.nodo('<span>' + K.esc(O().nombre(n)) + '</span>'));
        b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); });
        b.__n = n;
        eq.appendChild(b);
      });
      f.appendChild(campo('Asignar de una vez (opcional)', 'Si la dejas sin nadie, queda PENDIENTE para repartir.', eq, false));
    }
    if (K.piezas.fechas) setTimeout(function () { K.piezas.fechas.montar(f); }, 0);

    function datos() {
      return {
        requerimientos: [].filter.call(chips.children, function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.__r; }),
        detalles: det.value.trim(), publicacion: pub.value, evento: ev.value.trim(), fechaEvento: fe.value,
        horaInicio: hi.value, horaFin: hf.value, lugar: lug.value.trim(), otros: otr.value.trim(),
        responsable: res.value.trim(), secretaria: sec.value, cargo: car.value.trim(), contacto: tel.value.trim()
      };
    }
    function elegidos() {
      return eq ? [].filter.call(eq.children, function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.__n; }) : [];
    }
    /** Lo mismo que va a exigir el servidor, dicho antes de viajar. */
    function falta(d, nueva) {
      if (!d.requerimientos.length) return 'Escoge al menos un requerimiento.';
      if (d.detalles.length < 15) return 'Cuenta un poco más en los detalles (una frase completa).';
      if (!d.publicacion) return 'Escoge la fecha de entrega o publicación.';
      if (nueva && d.publicacion < O().isoDe(new Date())) return 'La fecha de entrega ya pasó.';
      if (d.horaInicio && d.horaFin && d.horaFin <= d.horaInicio) return 'La hora de terminación tiene que ser después de la de inicio.';
      if (!d.responsable) return 'Escribe quién la pide.';
      if (!d.secretaria) return 'Escoge la secretaría.';
      if (d.contacto && !/^\d{10}$/.test(d.contacto)) return 'El contacto debe ser un celular de 10 dígitos.';
      return '';
    }
    return { nodo: f, datos: datos, elegidos: elegidos, falta: falta };
  }

  function nueva() {
    var caja = K.nodo('<div class="kit-ancho vista ct of cm"></div>');
    C.app.appendChild(caja);
    O().cabecera(caja, 'mas', 'NUEVA SOLICITUD', 'Registra lo que le piden al equipo por otro medio (llamada, WhatsApp, en persona). Queda en la lista con su código.');
    var admin = C.puede('repartir');
    var fm = formulario(null, admin);
    var t = K.nodo('<section class="kit-tarjeta"></section>');
    t.appendChild(fm.nodo);
    var pie = K.nodo('<div class="campo-fila campo-fila--botones"></div>');
    var no = K.nodo('<button type="button" class="kit-btn kit-btn--plano">Cancelar</button>');
    var si = K.nodo('<button type="button" class="kit-btn kit-btn--marca">' + K.icono('enviar', 16) + ' Registrar</button>');
    no.addEventListener('click', function () { C.irA('solicitudes'); });
    si.addEventListener('click', function () {
      var d = fm.datos(), falta = fm.falta(d, true);
      if (falta) { K.aviso(falta, 'aviso', 5000); return; }
      var asig = fm.elegidos();
      K.piezas.confirmar.abrir({
        titulo: 'Registrar la solicitud',
        lista: [['Piden', d.requerimientos.join(', ')], ['Entrega', K.fecha(d.publicacion)], d.evento ? ['Evento', d.evento] : null,
                ['Solicita', d.responsable + ' · ' + d.secretaria], asig.length ? ['La atiende', asig.map(O().nombre).join(', ')] : ['Estado', 'Pendiente para repartir']].filter(Boolean),
        si: 'Registrar', no: 'Editar'
      }).then(function (ok) {
        if (!ok) return;
        si.disabled = true;
        var cuerpo = { campos: d };
        if (admin) cuerpo.asignados = asig;
        K.piezas.guardado.mientras(K.pedir('solicitudCrear', cuerpo, { ms: 60000 }), {
          titulo: 'Registrando la solicitud', sub: d.evento || resumen(d.detalles, 60), pasos: ['Guardando…'], listo: { titulo: 'Solicitud registrada', paso: 'Lista' }
        }).then(function (r) {
          if (r.solicitud) poner(r.solicitud);
          else return cargar(true).then(function () { C.irA('solicitud/' + encodeURIComponent(r.codigo)); });
          C.irA('solicitud/' + encodeURIComponent(r.codigo));
        }, function (e) { si.disabled = false; K.aviso((e && e.message) || 'No se pudo registrar.', 'malo', 7000); });
      });
    });
    pie.appendChild(no); pie.appendChild(si);
    t.appendChild(pie);
    caja.appendChild(t);
    K.piezas.creditos.montar(caja);
  }

  function editar(x, alGuardar) {
    var fm = formulario(x, false);
    var m = O().modal({
      titulo: 'Editar ' + x.codigo, cuerpo: fm.nodo, ancha: true,
      botones: [{ texto: 'Cancelar', al: function () { m.cerrar(); } }, { texto: 'Guardar', icono: 'check', marca: true, al: listo }]
    });
    function listo() {
      var d = fm.datos(), falta = fm.falta(d, false);
      if (falta) { K.aviso(falta, 'aviso', 5000); return; }
      m.botones[1].disabled = true;
      guardar({ codigo: x.codigo, campos: d }, { titulo: 'Guardando ' + x.codigo, sub: 'Los datos de la solicitud', pasos: ['Guardando…'], listo: { titulo: 'Datos guardados', paso: 'Listo' } })
        .then(function (s) { m.cerrar(); if (alGuardar) alGuardar(s); }, function (er) { m.botones[1].disabled = false; K.aviso((er && er.message) || 'No se pudo guardar.', 'malo', 7000); });
    }
  }

  window.SOLIS = {
    configurar: function (c) { C = c || {}; },
    vista: vista, detalle: detalle, nueva: nueva,
    recibir: recibir, cargar: cargar, contar: contar, filtrar: filtrar, poner: poner, repartir: repartir, buscar: buscar,
    olvidar: function () { B = null; CARGANDO = null; LLENOS = {}; K.guardar.borrar(FILTRO_K); F = null; },
    _datos: function () { return B; }, _filas: function () { if (!F) F = leerFiltro(); return filas(); }, _filtro: function () { return F; },
    _util: { relativo: relativo, diasHasta: diasHasta, fechaCorta: fechaCorta, hoyIso: hoyIso, TEXTO_ESTADO: TEXTO_ESTADO, cargaDe: cargaDe, textoPlano: textoPlano }
  };
}());
