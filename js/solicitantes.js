/* ============================================================
   COMUNICACIONES-FLANDES · SOLICITANTES EXTERNOS
   Ajuste previo a la Fase 11 · 25/09/2026

   Personas que le piden apoyo a Comunicaciones y no son contratistas ni
   supervisores. Aquí el ADMIN (y DEV) las da de alta con nombre,
   dependencia, cargo y WhatsApp, y les manda el ENLACE de la web
   SOLICITUD-PRENSA-FLANDES directo a su chat de WhatsApp.

   El enlace lleva un código firmado (no el número): al abrirlo la persona
   entra de una vez con sus datos cargados. Si le cambian el WhatsApp, el
   enlace viejo deja de servir y hay que mandarle el nuevo.

   UN SOLO LLAMADO: abrir la vista es 'solicitantes'; guardar y
   activar/inactivar devuelven la lista ya al día.
   ============================================================ */
(function () {
  'use strict';

  var K = window.KIT;
  var C = {};
  var D = null, CARGANDO = null, FILTRO = 'ACTIVO', BUSCA = '';

  function O() { return window.OFICINA; }

  function cargar(fresco) {
    if (D && !fresco) return Promise.resolve(D);
    if (CARGANDO && !fresco) return CARGANDO;
    CARGANDO = O().leer('solicitantes').then(function (r) { CARGANDO = null; D = r; return D; },
      function (e) { CARGANDO = null; throw e; });
    return CARGANDO;
  }

  /** wa.me con el mensaje ya escrito: abre el chat de ESA persona en la app de WhatsApp. */
  function enlaceWa(tel, texto) {
    return 'https://wa.me/57' + String(tel || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(texto || '');
  }

  function mensajeDe(s) {
    return String((D && D.plantilla) || '')
      .replace(/\{nombre\}/g, s.nombre || '').replace(/\{enlace\}/g, s.enlace || '')
      .replace(/\{antelacion\}/g, String((D && D.antelacion) || 3)).replace(/\{quien\}/g, (D && D.quien) || 'Comunicaciones')
      .replace(/\{dependencia\}/g, s.dependencia || '').replace(/\{cargo\}/g, s.cargo || '');
  }

  /** Abre el WhatsApp de la persona con el enlace. En el celular abre la app nativa. */
  function enviarWa(s, msg) {
    K.vibrar(8);
    window.open(enlaceWa(s.whatsapp, msg || mensajeDe(s)), '_blank', 'noopener');
  }

  function compartirOtro(s, msg) {
    if (K.piezas.compartir) K.piezas.compartir.texto({ titulo: 'Solicitud a Comunicaciones', texto: msg || mensajeDe(s) });
    else window.open(enlaceWa(s.whatsapp, msg || mensajeDe(s)), '_blank', 'noopener');
  }

  function vista() {
    var c = K.nodo('<div class="kit-ancho vista ct of cm sx"></div>');
    C.app.appendChild(c);
    K.piezas.esqueletos.mientras(c, cargar(false), { forma: 'filas', cuantos: 5, espera: 'Trayendo los solicitantes' })
      .then(function () { pintar(c); })
      ['catch'](function (e) { c.appendChild(C.errorCaja(e, function () { D = null; C.app.innerHTML = ''; vista(); })); });
  }

  function pintar(c) {
    c.innerHTML = '';
    O().cabecera(c, 'persona', 'SOLICITANTES EXTERNOS',
      'Personas que no son contratistas ni supervisores y le piden apoyo a Comunicaciones. ' +
      'Regístralas y mándales el enlace por WhatsApp: entran a la web con su número, piden con <b>' + K.esc(String(D.antelacion)) +
      ' días de antelación</b> y ven en qué va cada solicitud.');
    var arriba = K.nodo('<div class="cm-arriba"><button type="button" class="kit-btn kit-btn--marca">' + K.icono('mas', 16) + ' Nuevo solicitante</button></div>');
    arriba.querySelector('button').addEventListener('click', function () { editar(null, function () { pintar(c); }); });
    c.appendChild(arriba);

    var b = O().barra({ placeholder: 'Buscar por nombre, dependencia, cargo o número', valor: BUSCA,
      alBuscar: function (q) { BUSCA = q; lista(); },
      alRefrescar: function () { return cargar(true).then(function () { pintar(c); }); } });
    c.appendChild(b.caja);
    var fil = K.nodo('<div></div>');
    c.appendChild(fil);
    var cuenta = K.nodo('<p class="ct-conteo" aria-live="polite"></p>');
    c.appendChild(cuenta);
    var zona = K.nodo('<div class="kit-rejilla kit-rejilla--auto sx-lista" role="list"></div>');
    c.appendChild(zona);

    var conteos = { '': D.lista.length, ACTIVO: 0, INACTIVO: 0 };
    D.lista.forEach(function (s) { conteos[s.estado] = (conteos[s.estado] || 0) + 1; });
    if (FILTRO && !conteos[FILTRO]) FILTRO = '';
    var pp = K.piezas.pastillas.montar(fil, {
      opciones: [{ valor: 'ACTIVO', texto: 'Activos', tono: 'ok' }, { valor: 'INACTIVO', texto: 'Inactivos', tono: 'aviso' }, { valor: '', texto: 'Todos' }],
      valor: FILTRO, alCambiar: function (v) { FILTRO = v || ''; lista(); }
    });
    if (pp && pp.conteos) pp.conteos(conteos);

    function lista() {
      var n = K.norm(BUSCA || '');
      var l = D.lista.filter(function (s) {
        if (FILTRO && s.estado !== FILTRO) return false;
        return !n || K.norm([s.nombre, s.dependencia, s.cargo, s.whatsapp, s.id].join(' ')).indexOf(n) >= 0;
      });
      zona.innerHTML = '';
      cuenta.innerHTML = '<b>' + l.length + '</b> ' + (l.length === 1 ? 'solicitante' : 'solicitantes');
      if (!D.lista.length) {
        zona.appendChild(O().vacio('Todavía no hay solicitantes externos. Registra el primero con "Nuevo solicitante".'));
        return;
      }
      if (!l.length) { zona.appendChild(O().vacio('Nada coincide con la búsqueda.', function () { BUSCA = ''; FILTRO = ''; pintar(c); })); return; }
      l.forEach(function (s) { zona.appendChild(tarjeta(s, function () { pintar(c); })); });
    }
    lista();
    K.piezas.creditos.montar(c);
  }

  function tarjeta(s, repintar) {
    var activo = s.estado === 'ACTIVO';
    var t = K.nodo('<article role="listitem" class="kit-tarjeta sx-t' + (activo ? '' : ' sx-t--off') + '"></article>');
    var cab = K.nodo('<div class="sx-t__cab"></div>');
    if (K.piezas.personas) cab.appendChild(K.piezas.personas.avatar(s.nombre, { tam: 44, sinZoom: true }));
    cab.appendChild(K.nodo('<div class="sx-t__quien"><h3 class="sx-t__n">' + K.esc(O().nombre(s.nombre)) + '</h3>' +
      '<p class="sx-t__dep">' + K.esc(O().titulo(s.cargo)) + ' · ' + K.esc(O().titulo(s.dependencia)) + '</p></div>'));
    cab.insertAdjacentHTML('beforeend', '<span class="kit-pastilla sx-t__estado sx-t__estado--' + (activo ? 'ok' : 'off') + '">' + (activo ? 'Activo' : 'Inactivo') + '</span>');
    t.appendChild(cab);
    t.appendChild(K.nodo('<dl class="sx-t__datos">' +
      '<div><dt>' + K.icono('whatsapp', 13) + ' WhatsApp</dt><dd>' + K.esc(s.whatsapp.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1 $2 $3')) + '</dd></div>' +
      '<div><dt>' + K.icono('megafono', 13) + ' Solicitudes</dt><dd>' + K.numero(s.solicitudes) + (s.abiertas ? ' <small>(' + s.abiertas + ' abiertas)</small>' : '') + '</dd></div>' +
      '<div><dt>' + K.icono('reloj', 13) + ' Último ingreso</dt><dd>' + K.esc(s.ultimoIngreso || 'Nunca ha entrado') + '</dd></div>' +
      '</dl>'));
    t.appendChild(K.nodo('<p class="sx-t__pie">' + K.esc(s.id) + (s.creado ? ' · registrado el ' + K.esc(s.creado) : '') + (s.creadoPor ? ' por ' + K.esc(O().nombre(s.creadoPor)) : '') + '</p>'));

    var acc = K.nodo('<div class="sx-t__acc"></div>');
    if (activo) {
      var wa = K.nodo('<button type="button" class="kit-btn kit-btn--marca sx-wa">' + K.icono('whatsapp', 16) + ' Enviar enlace por WhatsApp</button>');
      wa.addEventListener('click', function () { enviarWa(s); });
      acc.appendChild(wa);
      var otro = K.nodo('<button type="button" class="kit-btn kit-btn--plano" title="Compartir por otro medio">' + K.icono('compartir', 16) + '<span class="kit-oculto">Compartir por otro medio</span></button>');
      otro.addEventListener('click', function () { compartirOtro(s); });
      acc.appendChild(otro);
    }
    var ed = K.nodo('<button type="button" class="kit-btn kit-btn--plano">' + K.icono('lapiz', 16) + ' Corregir</button>');
    ed.addEventListener('click', function () { editar(s, repintar); });
    acc.appendChild(ed);
    var es = K.nodo('<button type="button" class="kit-btn kit-btn--plano' + (activo ? ' kit-btn--malo' : '') + '">' +
      K.icono(activo ? 'prohibido' : 'check', 16) + ' ' + (activo ? 'Inactivar' : 'Activar') + '</button>');
    es.addEventListener('click', function () { cambiarEstado(s, activo ? 'INACTIVO' : 'ACTIVO', repintar); });
    acc.appendChild(es);
    t.appendChild(acc);
    return t;
  }

  function cambiarEstado(s, estado, repintar) {
    K.piezas.confirmar.abrir({
      titulo: (estado === 'INACTIVO' ? 'Inactivar a ' : 'Activar a ') + O().nombre(s.nombre) + '?',
      texto: estado === 'INACTIVO'
        ? 'Ya no podrá entrar a la web ni hacer solicitudes. Lo que ya pidió sigue en la lista de Comunicaciones.'
        : 'Vuelve a entrar con su número y con el mismo enlace de antes.',
      si: estado === 'INACTIVO' ? 'Sí, inactivar' : 'Sí, activar', no: 'Cancelar'
    }).then(function (ok) {
      if (!ok) return;
      K.piezas.guardado.mientras(K.pedir('solicitanteEstado', { id: s.id, estado: estado }, { ms: 45000 }), {
        titulo: estado === 'INACTIVO' ? 'Inactivando' : 'Activando', sub: O().nombre(s.nombre), pasos: ['Guardando…'],
        listo: { titulo: estado === 'INACTIVO' ? 'Inactivo' : 'Activo', paso: 'Listo' }
      }).then(function (r) {
        D.lista = r.lista || D.lista;
        if (repintar) repintar();
      }, function (e) { K.aviso((e && e.message) || 'No se pudo guardar.', 'malo', 7000); });
    });
  }

  function editar(s, alGuardar) {
    s = s || {};
    var f = K.nodo('<div class="formulario cm-form"></div>');
    function campo(et, html, val, ayuda) {
      var l = K.nodo('<label class="campo"><span>' + K.esc(et) + ' <i class="tr-oblig" aria-hidden="true">*</i></span>' + html + '</label>');
      var i = l.querySelector('input');
      i.value = val || '';
      if (ayuda) l.appendChild(K.nodo('<p class="campo__ayuda">' + ayuda + '</p>'));
      f.appendChild(l);
      return i;
    }
    var iN = campo('Nombre completo', '<input type="text" maxlength="150" autocomplete="off" placeholder="Nombre y apellidos">', s.nombre);
    var lista = 'sx-deps-' + Date.now();
    var iD = campo('Dependencia', '<input type="text" maxlength="200" autocomplete="off" list="' + lista + '" placeholder="Escribe o escoge de la lista">', s.dependencia,
      'Las del directorio y las secretarías aparecen al escribir; si no está, escríbela.');
    var dl = document.createElement('datalist');
    dl.id = lista;
    (D.dependencias || []).forEach(function (x) { var o = document.createElement('option'); o.value = x; dl.appendChild(o); });
    f.appendChild(dl);
    var iC = campo('Cargo', '<input type="text" maxlength="150" autocomplete="off" placeholder="Ej: SECRETARIO DE DESPACHO">', s.cargo);
    var iW = campo('WhatsApp', '<input type="tel" inputmode="numeric" maxlength="10" autocomplete="off" placeholder="Celular de 10 dígitos">', s.whatsapp,
      'Con este número entra a la web. ' + (s.id ? '<b>Si lo cambias, el enlace que ya tiene deja de servir</b> y hay que mandarle el nuevo.' : 'Debe ser su WhatsApp.'));
    iW.addEventListener('input', function () { iW.value = iW.value.replace(/\D/g, '').slice(0, 10); });

    var m = O().modal({
      titulo: s.id ? 'Corregir solicitante' : 'Nuevo solicitante', cuerpo: f,
      botones: [{ texto: 'Cancelar', al: function () { m.cerrar(); } }, { texto: 'Guardar', icono: 'check', marca: true, al: guardar }]
    });
    setTimeout(function () { try { iN.focus(); } catch (e) {} }, 200);

    function guardar() {
      var datos = { id: s.id || '', nombre: iN.value.trim(), dependencia: iD.value.trim(), cargo: iC.value.trim(), whatsapp: iW.value.trim() };
      var falta = !datos.nombre || datos.nombre.split(/\s+/).length < 2 ? 'Escribe el nombre completo (nombre y apellido).'
        : !datos.dependencia ? 'Escribe la dependencia.'
        : !datos.cargo ? 'Escribe el cargo.'
        : !/^3\d{9}$/.test(datos.whatsapp) ? 'El WhatsApp debe ser un celular de 10 dígitos que empiece por 3.' : '';
      if (falta) { K.aviso(falta, 'aviso', 4000); return; }
      m.botones[1].disabled = true;
      K.piezas.guardado.mientras(K.pedir('solicitanteGuardar', datos, { ms: 45000 }), {
        titulo: s.id ? 'Corrigiendo' : 'Registrando', sub: datos.nombre.toUpperCase(), pasos: ['Guardando el solicitante…'],
        listo: { titulo: s.id ? 'Solicitante al día' : 'Solicitante registrado', paso: 'Listo' }
      }).then(function (r) {
        D.lista = r.lista || D.lista;
        m.cerrar();
        if (alGuardar) alGuardar();
        var cambioTel = s.id && s.whatsapp !== r.solicitante.whatsapp;
        if (!s.id || cambioTel) setTimeout(function () { ofrecerEnvio(r.solicitante, r.mensaje, cambioTel); }, 900);
      }, function (e) { m.botones[1].disabled = false; K.aviso((e && e.message) || 'No se pudo guardar.', 'malo', 7000); });
    }
  }

  /** Recién registrado (o con número nuevo): el botón para mandarle el enlace. */
  function ofrecerEnvio(s, msg, cambioTel) {
    var cuerpo = K.nodo('<div class="sx-envio"><p>' + (cambioTel
      ? 'Le cambiaste el número a <b>' + K.esc(O().nombre(s.nombre)) + '</b>: el enlace anterior ya no sirve. Mándale el nuevo.'
      : '<b>' + K.esc(O().nombre(s.nombre)) + '</b> ya puede hacer solicitudes. Mándale el enlace a su WhatsApp:') + '</p>' +
      '<pre class="sx-envio__msg"></pre></div>');
    cuerpo.querySelector('pre').textContent = msg;
    var m = O().modal({
      titulo: 'Enviar el enlace', cuerpo: cuerpo,
      botones: [{ texto: 'Después', al: function () { m.cerrar(); } },
                { texto: 'Enviar por WhatsApp', icono: 'whatsapp', marca: true, al: function () { enviarWa(s, msg); m.cerrar(); } }]
    });
  }

  window.SOLICITANTES = {
    configurar: function (c) { C = c || {}; },
    vista: vista, cargar: cargar,
    olvidar: function () { D = null; CARGANDO = null; FILTRO = 'ACTIVO'; BUSCA = ''; },
    _datos: function () { return D; }, _enlaceWa: enlaceWa, _mensaje: mensajeDe
  };
}());
