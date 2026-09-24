/* ============================================================
   COMUNICACIONES-FLANDES · MIS INFORMES
   Ecosistema Flandes · Fase 9

   Lo que ha atendido el equipo en un periodo, sin volver al servidor:
   sale de la misma lista que trajo el arranque. El COMUNICADOR ve lo
   suyo; el ADMIN (y el DEV) todo, y escoge persona.

   Periodo por fecha de ENTREGA (lo que se entregó en el mes) o de
   INGRESO (lo que llegó en el mes). Se descarga en PDF por bloques
   (cada solicitud es un bloque, agrupado por quien la atendió: el
   informe para leer) o en Excel (una fila por solicitud).

   "Mi hoja de informes" abre el enlace personal que la app vieja tenía
   en la hoja PRENSA (columna ENLACE), si la persona lo tiene.
   ============================================================ */
(function () {
  'use strict';

  var K = window.KIT;
  var C = {};
  var FILTRO_K = 'informes.filtro.v1';
  var F = null;

  function O() { return window.OFICINA; }
  function S() { return window.SOLIS; }

  function leerFiltro() {
    var g = K.guardar.leer(FILTRO_K, null) || {};
    var r = rango(g.atajo || 'mes');
    return { atajo: g.atajo || 'mes', base: g.base || 'entrega', estado: g.estado || '', desde: g.atajo === 'otro' ? g.desde : r.desde, hasta: g.atajo === 'otro' ? g.hasta : r.hasta, quien: '', busca: '' };
  }
  function guardarFiltro() { K.guardar.escribir(FILTRO_K, { atajo: F.atajo, base: F.base, estado: F.estado, desde: F.desde, hasta: F.hasta }); }
  function rango(atajo) {
    var hoy = new Date(); hoy.setHours(12, 0, 0, 0);
    var d = new Date(hoy), h = new Date(hoy);
    if (atajo === 'mes') { d.setDate(1); h = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 12); }
    else if (atajo === 'mesPasado') { d = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1, 12); h = new Date(hoy.getFullYear(), hoy.getMonth(), 0, 12); }
    else if (atajo === 'anio') { d = new Date(hoy.getFullYear(), 0, 1, 12); h = new Date(hoy.getFullYear(), 11, 31, 12); }
    else return { desde: '', hasta: '' };
    return { desde: O().isoDe(d), hasta: O().isoDe(h) };
  }

  function fechaDe(x) { return F.base === 'ingreso' ? x.fecha : (x.publicacion || x.fecha); }

  function todas() { var b = S()._datos(); return (b && b.lista) || []; }
  function esAdmin() { var b = S()._datos(); return !!(b && b.todas); }

  function pasa(x, sin) {
    sin = sin || {};
    var f = fechaDe(x);
    if (F.desde && (!f || f < F.desde)) return false;
    if (F.hasta && (!f || f > F.hasta)) return false;
    if (!sin.estado && F.estado && x.estado !== F.estado) return false;
    if (!sin.quien && F.quien) {
      if (F.quien === 'SIN') { if (x.asignados.length) return false; }
      else if (!x.asignados.some(function (a) { return K.norm(a) === F.quien; })) return false;
    }
    var q = K.norm(F.busca || '');
    if (q) { var p = q.split(' ').filter(Boolean); for (var i = 0; i < p.length; i++) if (x._t.indexOf(p[i]) < 0) return false; }
    return true;
  }
  function filas() {
    return todas().filter(function (x) { return pasa(x); }).sort(function (a, c) { return String(fechaDe(a)).localeCompare(String(fechaDe(c))) || String(a.codigo).localeCompare(String(c.codigo)); });
  }
  function textoRango() {
    if (!F.desde && !F.hasta) return 'Todas las fechas';
    return 'Del ' + (F.desde ? O().fecha(F.desde) : 'inicio') + ' al ' + (F.hasta ? O().fecha(F.hasta) : 'hoy');
  }

  /** Las cifras del periodo. */
  function cifras(f) {
    var n = { total: f.length, REALIZADA: 0, 'EN PROCESO': 0, PENDIENTE: 0, req: {} };
    f.forEach(function (x) {
      n[x.estado] = (n[x.estado] || 0) + 1;
      x.requerimientos.forEach(function (r) { n.req[r] = (n.req[r] || 0) + 1; });
    });
    return n;
  }

  function vista() {
    if (!F) F = leerFiltro();
    var caja = K.nodo('<div class="kit-ancho vista ct of rp rg tg cm"></div>');
    C.app.appendChild(caja);
    O().cabecera(caja, 'pdf', 'MIS INFORMES', esAdmin()
      ? 'Lo que atendió el equipo en el periodo: realizadas, en proceso y pendientes, por persona. Descárgalo en PDF o Excel.'
      : 'Lo que has atendido en el periodo. Descárgalo en PDF o Excel para tu informe de actividades.');
    var enl = C.enlaceInformes && C.enlaceInformes();
    if (enl) {
      var hj = K.nodo('<a class="kit-btn kit-btn--plano cm-hoja" target="_blank" rel="noopener">' + K.icono('hoja', 16) + ' Abrir mi hoja de informes</a>');
      hj.href = enl;
      caja.appendChild(hj);
    }
    var zR = K.nodo('<section class="kit-tarjeta rp-rango"></section>');
    var zB = K.nodo('<div></div>'), zAt = K.nodo('<div></div>');
    zR.appendChild(zB); zR.appendChild(zAt);
    var fechas = K.nodo('<div class="rp-fechas">' +
      '<label><span>Desde</span><input type="date" data-kit-fecha data-desde="2025" data-titulo="Desde"></label>' +
      '<label><span>Hasta</span><input type="date" data-kit-fecha data-desde="2025" data-titulo="Hasta"></label></div>');
    zR.appendChild(fechas);
    caja.appendChild(zR);
    var iD = fechas.querySelectorAll('input')[0], iH = fechas.querySelectorAll('input')[1];
    var b = O().barra({ placeholder: 'Evento, secretaría, requerimiento o código', valor: F.busca,
      alBuscar: function (q) { F.busca = q; VER = 50; pintar(); }, alRefrescar: function () { return S().cargar(true).then(pintar); } });
    caja.appendChild(b.caja);
    var zE = K.nodo('<div></div>'), zQ = K.nodo('<div hidden></div>');
    caja.appendChild(zE); caja.appendChild(zQ);
    var resumen = K.nodo('<section class="kit-tarjeta rp-resumen"></section>');
    caja.appendChild(resumen);
    var descargas = K.nodo('<div class="rp-bajar">' +
      '<button type="button" class="kit-btn kit-btn--marca" data-f="pdf">' + K.icono('pdf', 16) + ' Descargar PDF</button>' +
      '<button type="button" class="kit-btn kit-btn--plano" data-f="xlsx">' + K.icono('hoja', 16) + ' Descargar Excel</button></div>');
    caja.appendChild(descargas);
    var conteo = K.nodo('<p class="ct-conteo" aria-live="polite"></p>');
    caja.appendChild(conteo);
    var lista = K.nodo('<div class="rp-lista"></div>');
    caja.appendChild(lista);
    var mas = K.nodo('<button type="button" class="kit-btn kit-btn--plano ct-mas" hidden>Ver más</button>');
    caja.appendChild(mas);
    var VER = 50, pE, pQ, pAt;
    mas.addEventListener('click', function () { VER += 100; pintarLista(); });

    K.piezas.pastillas.montar(zB, { etiqueta: 'Fecha de', valor: F.base,
      opciones: [{ valor: 'entrega', texto: 'Entrega' }, { valor: 'ingreso', texto: 'Ingreso' }],
      alCambiar: function (v) { F.base = v || 'entrega'; guardarFiltro(); VER = 50; pintar(); } });
    pAt = K.piezas.pastillas.montar(zAt, { etiqueta: 'Periodo', valor: F.atajo,
      opciones: [{ valor: 'mes', texto: 'Este mes' }, { valor: 'mesPasado', texto: 'Mes pasado' }, { valor: 'anio', texto: 'Este año' }, { valor: 'todo', texto: 'Todo' }, { valor: 'otro', texto: 'Otro rango' }],
      alCambiar: function (v) { F.atajo = v; if (v !== 'otro') { var r = rango(v); F.desde = r.desde; F.hasta = r.hasta; ponerFechas(); } guardarFiltro(); VER = 50; pintar(); } });
    function ponerFechas() { iD.value = F.desde || ''; iH.value = F.hasta || ''; }
    if (K.piezas.fechas) K.piezas.fechas.montar(fechas);
    ponerFechas();
    [iD, iH].forEach(function (inp) {
      inp.addEventListener('change', function () {
        F.desde = iD.value || ''; F.hasta = iH.value || '';
        if (F.desde && F.hasta && F.desde > F.hasta) { var x = F.desde; F.desde = F.hasta; F.hasta = x; ponerFechas(); }
        F.atajo = 'otro'; pAt.poner('otro'); guardarFiltro(); VER = 50; pintar();
      });
    });

    function pintarResumen(f) {
      var n = cifras(f);
      resumen.innerHTML = '';
      resumen.appendChild(K.nodo('<p class="rp-resumen__rango">' + K.icono('reloj', 14) + ' ' + K.esc(textoRango()) + ' · por fecha de ' + (F.base === 'ingreso' ? 'ingreso' : 'entrega') +
        (esAdmin() ? '' : ' · ' + K.esc(O().nombre((C.yo() || {}).nombre))) + '</p>'));
      resumen.appendChild(K.nodo('<div class="ct-cifras">' +
        [['Solicitudes', n.total], ['Realizadas', n.REALIZADA], ['En proceso', n['EN PROCESO']], ['Pendientes', n.PENDIENTE]].map(function (c, i) {
          return '<div class="ct-cifra' + (i === 1 ? ' rp-cifra--ok' : '') + '"><b>' + K.numero(c[1] || 0) + '</b><span>' + K.esc(c[0]) + '</span></div>';
        }).join('') + '</div>'));
      var reqs = Object.keys(n.req).sort(function (a, c) { return n.req[c] - n.req[a]; });
      if (reqs.length) resumen.appendChild(K.nodo('<div class="tr-chips tr-chips--quietas cm-chips">' + reqs.map(function (r) {
        return '<span class="kit-pastilla">' + K.esc(r) + ' <b>' + n.req[r] + '</b></span>'; }).join('') + '</div>'));
    }

    function fila(x) {
      var r = K.nodo('<article class="rp-fila"></article>');
      var f = fechaDe(x);
      r.appendChild(K.nodo('<div class="rp-fila__f"><b>' + K.esc(O().fecha(f).slice(0, 5) || '—') + '</b><small>' + K.esc(String(f || '').slice(0, 4)) + '</small></div>'));
      var c = K.nodo('<div class="rp-fila__c"></div>');
      c.appendChild(K.nodo('<p class="rp-fila__n">' + K.esc(x.evento || String(x.detalles || '').slice(0, 80)) + '</p>'));
      c.appendChild(K.nodo('<p class="rp-fila__d">' + K.esc(x.codigo + ' · ' + (x.requerimientos.join(', ') || '—') + ' · ' + (O().titulo(x.secretaria) || '—')) + '</p>'));
      if (esAdmin()) c.appendChild(K.nodo('<p class="rp-fila__m">Atiende: ' + K.esc(x.asignados.map(O().nombre).join(', ') || 'sin asignar') + '</p>'));
      r.appendChild(c);
      r.appendChild(K.nodo('<div class="rg-der"><span class="kit-pastilla ct-t__estado of-estado ' + (x.estado === 'REALIZADA' ? 'of-estado--ok' : 'of-estado--abierto') + '">' + K.esc(S()._util.TEXTO_ESTADO[x.estado] || x.estado) + '</span></div>'));
      r.addEventListener('click', function () { C.irA('solicitud/' + encodeURIComponent(x.codigo)); });
      return r;
    }

    function pintarLista() {
      var f = filas();
      lista.innerHTML = '';
      mas.hidden = true;
      if (!f.length) {
        lista.appendChild(O().vacio('No hay solicitudes con estos filtros (' + textoRango().toLowerCase() + ').', function () {
          F.quien = ''; F.estado = ''; F.busca = ''; b.inp.value = ''; F.atajo = 'todo'; F.desde = ''; F.hasta = ''; pAt.poner('todo'); ponerFechas(); guardarFiltro(); pintar();
        }));
        return;
      }
      f.slice(0, VER).forEach(function (x) { lista.appendChild(fila(x)); });
      if (f.length > VER) { mas.hidden = false; mas.textContent = 'Ver ' + Math.min(100, f.length - VER) + ' más de ' + K.numero(f.length - VER); }
    }

    function pintar() {
      var bq = todas().filter(function (x) { return pasa(x, { estado: true }); });
      var cE = { '': bq.length };
      bq.forEach(function (x) { cE[x.estado] = (cE[x.estado] || 0) + 1; });
      pE.conteos(cE); O().marcar(zE, F.estado);
      if (esAdmin()) {
        zQ.hidden = false;
        var bQ = todas().filter(function (x) { return pasa(x, { quien: true }); });
        var cQ = { '': bQ.length, SIN: 0 }, nom = {};
        bQ.forEach(function (x) {
          if (!x.asignados.length) cQ.SIN++;
          x.asignados.forEach(function (a) { var k = K.norm(a); cQ[k] = (cQ[k] || 0) + 1; nom[k] = a; });
        });
        if (F.quien && cQ[F.quien] === undefined) F.quien = '';
        pQ.opciones([{ valor: '', texto: 'Todo el equipo' }].concat(Object.keys(nom).sort().map(function (k) { return { valor: k, texto: O().nombre(nom[k]) }; }))
          .concat([{ valor: 'SIN', texto: 'Sin asignar', tono: 'aviso' }]));
        pQ.conteos(cQ); O().marcar(zQ, F.quien);
      }
      var f = filas();
      pintarResumen(f);
      conteo.innerHTML = '<b>' + K.numero(f.length) + '</b> ' + (f.length === 1 ? 'solicitud' : 'solicitudes');
      descargas.querySelectorAll('button').forEach(function (x) { x.disabled = !f.length; });
      pintarLista();
    }

    descargas.querySelectorAll('button').forEach(function (x) { x.addEventListener('click', function () { bajar(x.getAttribute('data-f'), x); }); });

    K.piezas.esqueletos.mientras(lista, S().cargar(false), { forma: 'tarjetas', cuantos: 3, espera: 'Armando tus informes' })
      .then(function () {
        pE = K.piezas.pastillas.montar(zE, { etiqueta: 'Estado', valor: F.estado,
          opciones: [{ valor: '', texto: 'Todas' }, { valor: 'REALIZADA', texto: 'Realizadas', tono: 'ok' }, { valor: 'EN PROCESO', texto: 'En proceso' }, { valor: 'PENDIENTE', texto: 'Pendientes', tono: 'aviso' }],
          alCambiar: function (v) { F.estado = v; guardarFiltro(); VER = 50; pintar(); } });
        pQ = K.piezas.pastillas.montar(zQ, { etiqueta: 'Persona', valor: '', opciones: [{ valor: '', texto: 'Todo el equipo' }],
          alCambiar: function (v) { F.quien = v; VER = 50; pintar(); } });
        pintar();
      })['catch'](function (e) { caja.appendChild(C.errorCaja(e)); });
    K.piezas.creditos.montar(caja);
  }

  /* ══════════════ descargar ══════════════ */

  var PDF = [
    { campo: function (x) { return O().fecha(x.publicacion); }, titulo: 'Entrega' },
    { campo: function (x) { return O().fecha(x.fecha); }, titulo: 'Ingreso' },
    { campo: 'codigo', titulo: 'Código' },
    { campo: function (x) { return x.requerimientos.join(', '); }, titulo: 'Requerimientos' },
    { campo: function (x) { return O().titulo(x.secretaria); }, titulo: 'Secretaría' },
    { campo: function (x) { return O().nombre(x.responsable); }, titulo: 'Solicita' },
    { campo: function (x) { return x.asignados.map(O().nombre).join(', '); }, titulo: 'Atiende' },
    { campo: function (x) { return S()._util.TEXTO_ESTADO[x.estado] || x.estado; }, titulo: 'Estado' },
    { campo: function (x) { return String(x.detalles || '').slice(0, 400); }, titulo: 'Detalles' }
  ];
  var XLS = [
    { campo: 'codigo', titulo: 'Código' }, { campo: 'fecha', titulo: 'Fecha de ingreso', tipo: 'fecha' },
    { campo: 'publicacion', titulo: 'Fecha de entrega', tipo: 'fecha' }, { campo: 'estado', titulo: 'Estado' },
    { campo: 'evento', titulo: 'Evento' }, { campo: 'fechaEvento', titulo: 'Fecha del evento', tipo: 'fecha' },
    { campo: 'horaInicio', titulo: 'Hora de inicio' }, { campo: 'horaFin', titulo: 'Hora de terminación' },
    { campo: function (x) { return x.requerimientos.join(', '); }, titulo: 'Requerimientos' },
    { campo: 'detalles', titulo: 'Detalles' }, { campo: 'otros', titulo: 'Otros' }, { campo: 'lugar', titulo: 'Lugar' },
    { campo: 'responsable', titulo: 'Solicita' }, { campo: 'cargo', titulo: 'Cargo' }, { campo: 'secretaria', titulo: 'Secretaría' },
    { campo: 'contacto', titulo: 'Contacto' }, { campo: function (x) { return x.asignados.join(', '); }, titulo: 'Asignado a' }
  ];

  function informe(f) {
    var n = cifras(f);
    var t = ['Solicitudes a Comunicaciones', textoRango(), 'por fecha de ' + (F.base === 'ingreso' ? 'ingreso' : 'entrega'), K.numero(f.length) + (f.length === 1 ? ' solicitud' : ' solicitudes')];
    if (!esAdmin()) t.push(O().nombre((C.yo() || {}).nombre));
    else if (F.quien && F.quien !== 'SIN' && f[0]) t.push('atiende ' + O().nombre(f[0].asignados.filter(function (a) { return K.norm(a) === F.quien; })[0] || ''));
    if (F.busca) t.push('búsqueda: ' + F.busca);
    var op = {
      subtitulo: t.join(' · '),
      bloque: {
        titulo: function (x) { return x.codigo + ' · ' + (x.evento || String(x.detalles || '').slice(0, 60)); },
        sub: function (x) { return 'Entrega ' + (O().fecha(x.publicacion) || '—') + ' · ' + (O().titulo(x.secretaria) || '—'); },
        marca: function (x) { return S()._util.TEXTO_ESTADO[x.estado] || x.estado; },
        tono: function (x) { return x.estado === 'REALIZADA' ? 'ok' : (x.estado === 'PENDIENTE' ? 'aviso' : ''); },
        omitir: ['Código']
      },
      resumen: [{ etiqueta: 'Solicitudes', valor: K.numero(n.total) }, { etiqueta: 'Realizadas', valor: K.numero(n.REALIZADA) },
                { etiqueta: 'En proceso', valor: K.numero(n['EN PROCESO']) }, { etiqueta: 'Pendientes', valor: K.numero(n.PENDIENTE) }]
    };
    if (esAdmin() && !F.quien) op.grupo = function (x) { return 'Atiende: ' + (x.asignados.map(O().nombre).join(', ') || 'sin asignar'); };
    return op;
  }

  function bajar(formato, boton) {
    if (!K.piezas.exportar) { K.aviso('La descarga no está disponible en esta versión.', 'aviso'); return; }
    var f = filas();
    if (esAdmin() && !F.quien) f = f.slice().sort(function (a, c) { return String(a.asignados.join()).localeCompare(String(c.asignados.join()), 'es') || String(fechaDe(a)).localeCompare(String(fechaDe(c))); });
    if (!f.length) return;
    var nombre = ('Informe Comunicaciones ' + (F.desde ? O().fecha(F.desde).replace(/\//g, '-') : '') + (F.hasta && F.hasta !== F.desde ? ' a ' + O().fecha(F.hasta).replace(/\//g, '-') : '')).trim();
    boton.disabled = true; boton.classList.add('kit-ocupado');
    var p = formato === 'pdf' ? K.piezas.exportar.aPDF(nombre, PDF, f, informe(f)) : K.piezas.exportar.aExcel(nombre, XLS, f);
    Promise.resolve(p).then(function (r) {
      K.aviso(r === 'csv' ? 'No cargó Excel: se descargó en CSV (Excel lo abre).' : (r === 'impresion' ? 'Guárdalo como PDF desde la ventana de impresión.' : 'Descargado.'), 'ok', 3500);
    }, function (e) { K.aviso((e && e.message) || 'No se pudo descargar.', 'malo', 6000); })
      .then(function () { boton.disabled = false; boton.classList.remove('kit-ocupado'); });
  }

  window.INFORMES = {
    configurar: function (c) { C = c || {}; },
    vista: vista,
    olvidar: function () { K.guardar.borrar(FILTRO_K); F = null; },
    _filas: function () { if (!F) F = leerFiltro(); return filas(); }, _filtro: function () { return F; }, _cifras: cifras, _informe: informe, _textoRango: textoRango,
    PDF: PDF, XLS: XLS
  };
}());
