/* ============================================================
   COMUNICACIONES-FLANDES · REPARTIR (solo ADMIN)
   Ecosistema Flandes · Fase 9

   La vista del que reparte. Arriba, la carga del equipo (cuántas tiene
   abiertas cada uno y la entrega más próxima), para repartir parejo.
   Debajo, lo que está por repartir: las abiertas sin nadie, por fecha de
   entrega. Con "Ver también las ya asignadas" se reasigna lo demás.

   Cada tarjeta se reparte ahí mismo: se tocan las caras y "Asignar".
   Una llamada ('solicitudGuardar' con asignados): la solicitud pasa a
   EN PROCESO si estaba PENDIENTE, a los nuevos les llega un WhatsApp
   (el mensaje de la app vieja) y la lista se actualiza sin otro viaje.
   Todo sale de la bandeja que ya trajo el arranque.
   ============================================================ */
(function () {
  'use strict';

  var K = window.KIT;
  var C = {};
  var TODAS = false;

  function O() { return window.OFICINA; }
  function S() { return window.SOLIS; }

  function abiertas() {
    var b = S()._datos();
    return ((b && b.lista) || []).filter(function (x) { return x._abierta && (TODAS || !x.asignados.length); })
      .sort(function (a, c) { return String(a.publicacion || '9999').localeCompare(String(c.publicacion || '9999')) || String(a.codigo).localeCompare(String(c.codigo)); });
  }

  /** [{nombre, abiertas, proxima}] de cada persona que se puede asignar. */
  function carga() {
    var b = S()._datos(), l = (b && b.lista) || [];
    return (C.asignables() || []).map(function (n) {
      var k = K.norm(n), mias = l.filter(function (x) { return x._abierta && x.asignados.some(function (a) { return K.norm(a) === k; }); });
      var prox = mias.map(function (x) { return x.publicacion; }).filter(Boolean).sort()[0] || '';
      var hechas = l.filter(function (x) { return x.estado === 'REALIZADA' && x.asignados.some(function (a) { return K.norm(a) === k; }); }).length;
      return { nombre: n, abiertas: mias.length, proxima: prox, hechas: hechas };
    });
  }

  function vista() {
    var caja = K.nodo('<div class="kit-ancho vista ct of cm"></div>');
    C.app.appendChild(caja);
    O().cabecera(caja, 'persona', 'REPARTIR',
      'Lo que está por repartir, de la entrega más próxima a la más lejana. Toca a quién y <b>Asignar</b>: le llega un WhatsApp con el código y la fecha.');
    var zC = K.nodo('<section class="kit-tarjeta cm-carga"><h3 class="seg-sec__t">CARGA DEL EQUIPO</h3><div class="cm-carga__l"></div></section>');
    caja.appendChild(zC);
    var ver = K.nodo('<label class="cm-check"><input type="checkbox"> Ver también las ya asignadas (para reasignar)</label>');
    ver.querySelector('input').checked = TODAS;
    caja.appendChild(ver);
    var conteo = K.nodo('<p class="ct-conteo" aria-live="polite"></p>');
    caja.appendChild(conteo);
    var lista = K.nodo('<div class="kit-rejilla kit-rejilla--auto ct-lista cm-lista"></div>');
    caja.appendChild(lista);

    function pintar() {
      var cl = zC.querySelector('.cm-carga__l');
      cl.innerHTML = '';
      carga().forEach(function (p) {
        var f = K.nodo('<div class="cm-carga__p"></div>');
        if (K.piezas.personas) f.appendChild(K.piezas.personas.avatar(p.nombre, { tam: 38 }));
        f.appendChild(K.nodo('<div><b>' + K.esc(O().nombre(p.nombre)) + '</b><small>' + p.abiertas + (p.abiertas === 1 ? ' abierta' : ' abiertas') +
          (p.proxima ? ' · próxima ' + K.esc(S()._util.fechaCorta(p.proxima)) : '') + ' · ' + p.hechas + (p.hechas === 1 ? ' hecha' : ' hechas') + '</small></div>'));
        cl.appendChild(f);
      });
      var f2 = abiertas();
      conteo.innerHTML = '<b>' + K.numero(f2.length) + '</b> ' + (TODAS ? (f2.length === 1 ? 'abierta' : 'abiertas') : (f2.length === 1 ? 'por repartir' : 'por repartir'));
      lista.innerHTML = '';
      if (!f2.length) {
        lista.appendChild(K.nodo('<div class="kit-tarjeta ct-vacio op-aldia">' + K.icono('check', 30) + '<p><b>¡Todo repartido!</b><br>No hay solicitudes abiertas sin asignar.</p></div>'));
        return;
      }
      f2.forEach(function (x) { lista.appendChild(tarjeta(x, pintar)); });
    }

    ver.querySelector('input').addEventListener('change', function (e) { TODAS = e.target.checked; pintar(); });
    K.piezas.esqueletos.mientras(lista, S().cargar(false), { forma: 'tarjetas', cuantos: 2, espera: 'Cargando lo que falta por repartir' })
      .then(pintar)['catch'](function (e) { caja.appendChild(C.errorCaja(e)); });
    K.piezas.creditos.montar(caja);
  }

  function tarjeta(x, repintar) {
    var U = S()._util;
    var n = x.publicacion ? U.diasHasta(x.publicacion) : null;
    var t = K.nodo('<article class="kit-tarjeta ct-t cm-rep' + (n !== null && n < 0 ? ' cm-sol--vencida' : '') + '"></article>');
    var cab = K.nodo('<div class="ct-t__cab"><div class="ct-t__quien"><h3 class="ct-t__n"></h3><p class="ct-t__doc"></p></div></div>');
    cab.querySelector('h3').textContent = x.evento || String(x.detalles || '').slice(0, 70) || 'Solicitud';
    cab.querySelector('p').textContent = x.codigo + ' · ' + O().nombre(x.responsable) + (x.secretaria ? ' · ' + O().titulo(x.secretaria) : '');
    t.appendChild(cab);
    t.appendChild(K.nodo('<p class="cm-sol__entrega' + (n !== null && n < 0 ? ' cm-sol__entrega--tarde' : (n !== null && n <= 2 ? ' cm-sol__entrega--pronto' : '')) + '">' + K.icono('reloj', 13) +
      (x.publicacion ? ' Entrega ' + K.esc(U.fechaCorta(x.publicacion)) + ' <small>(' + K.esc(U.relativo(x.publicacion)) + ')</small>' : ' Sin fecha de entrega') + '</p>'));
    if (x.requerimientos.length) t.appendChild(K.nodo('<div class="tr-chips tr-chips--quietas cm-chips">' + x.requerimientos.map(function (r) { return '<span class="kit-pastilla">' + K.esc(r) + '</span>'; }).join('') + '</div>'));
    var eq = K.nodo('<div class="cm-equipo cm-equipo--mini" role="group" aria-label="A quién"></div>');
    var ya = x.asignados.map(function (a) { return K.norm(a); });
    (C.asignables() || []).forEach(function (nm) {
      var b = K.nodo('<button type="button" class="cm-persona" aria-pressed="' + (ya.indexOf(K.norm(nm)) >= 0) + '"></button>');
      if (K.piezas.personas) b.appendChild(K.piezas.personas.avatar(nm, { tam: 28, sinZoom: true }));
      b.appendChild(K.nodo('<span>' + K.esc(O().nombre(nm).split(' ')[0]) + '</span>'));
      b.title = O().nombre(nm) + ' · ' + U.cargaDe(nm);
      b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); });
      b.__n = nm;
      eq.appendChild(b);
    });
    t.appendChild(eq);
    var acc = K.nodo('<div class="ct-acc"></div>');
    var ver = K.nodo('<button type="button" class="kit-btn kit-btn--plano">' + K.icono('abrir-pestana', 16) + ' Ver</button>');
    ver.addEventListener('click', function () { C.irA('solicitud/' + encodeURIComponent(x.codigo)); });
    var asig = K.nodo('<button type="button" class="kit-btn kit-btn--marca">' + K.icono('check', 16) + ' Asignar</button>');
    asig.addEventListener('click', function () {
      var el = [].filter.call(eq.children, function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.__n; });
      if (!el.length && !x.asignados.length) { K.aviso('Toca al menos a una persona.', 'aviso', 3000); return; }
      asig.disabled = true;
      K.piezas.guardado.mientras(K.pedir('solicitudGuardar', { codigo: x.codigo, asignados: el, avisar: true }, { ms: 60000 }), {
        titulo: 'Repartiendo ' + x.codigo, sub: el.map(O().nombre).join(', ') || 'Sin asignar', pasos: ['Guardando…', 'Avisando por WhatsApp…'],
        listo: { titulo: 'Repartida', paso: 'Equipo avisado' }
      }).then(function (r) {
        S().poner(r.solicitud);
        var malos = (r.avisos && r.avisos.whatsapp || []).filter(function (w) { return !w.ok; });
        if (malos.length) K.aviso('Repartida, pero el WhatsApp no le llegó a ' + malos.map(function (w) { return O().nombre(w.nombre); }).join(', ') + '.', 'aviso', 8000);
        repintar();
      }, function (e) { asig.disabled = false; K.aviso((e && e.message) || 'No se pudo repartir.', 'malo', 7000); });
    });
    acc.appendChild(ver); acc.appendChild(asig);
    t.appendChild(acc);
    return t;
  }

  window.REPARTIR = {
    configurar: function (c) { C = c || {}; },
    vista: vista,
    olvidar: function () { TODAS = false; },
    _carga: carga, _abiertas: abiertas
  };
}());
