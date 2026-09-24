/* ============================================================
   COMUNICACIONES-FLANDES · DIRECTORIO INSTITUCIONAL
   Ecosistema Flandes · Fase 9

   El mismo directorio que ven CONTRATISTA y SUPERVISIÓN (hoja
   DIRECTORIO). Como en la app vieja de prensa, aquí además se AGREGA y
   se CORRIGE: solo el ADMIN (permiso 'directorioEditar'). Guardar es una
   llamada y devuelve la lista ya al día, sin pedirla otra vez.
   Lo que se guarda aquí lo ven de una vez las otras apps.
   ============================================================ */
(function () {
  'use strict';

  var K = window.KIT;
  var C = {};
  var DIR = null, EDITAR = false, CARGANDO = null;

  function O() { return window.OFICINA; }

  function cargar(fresco) {
    if (DIR && !fresco) return Promise.resolve(DIR);
    if (CARGANDO && !fresco) return CARGANDO;
    CARGANDO = O().leer('directorio').then(function (r) { CARGANDO = null; DIR = (r && r.lista) || []; EDITAR = !!(r && r.editar); return DIR; },
      function (e) { CARGANDO = null; throw e; });
    return CARGANDO;
  }

  function vista() {
    var c = K.nodo('<div class="kit-ancho vista ct of ins cm"></div>');
    C.app.appendChild(c);
    var p = cargar(false);
    K.piezas.esqueletos.mientras(c, p, { forma: 'filas', cuantos: 6, espera: 'Trayendo el directorio' })
      .then(function () { pintar(c); })
      ['catch'](function (e) { c.appendChild(C.errorCaja(e, function () { DIR = null; C.app.innerHTML = ''; vista(); })); });
  }

  function pintar(c) {
    c.innerHTML = '';
    O().cabecera(c, 'ubicacion', 'DIRECTORIO INSTITUCIONAL',
      'Las dependencias de la Alcaldía: dónde quedan, su correo y sus líneas. Toca para escribir, llamar o llegar.' +
      (EDITAR ? ' Tú puedes <b>agregar</b> y <b>corregir</b>: lo ven de una vez las demás apps.' : ''));
    if (EDITAR) {
      var nueva = K.nodo('<div class="cm-arriba"><button type="button" class="kit-btn kit-btn--marca">' + K.icono('mas', 16) + ' Agregar dependencia</button></div>');
      nueva.querySelector('button').addEventListener('click', function () { editar(null, function () { pintar(c); }); });
      c.appendChild(nueva);
    }
    var b = O().barra({ placeholder: 'Buscar dependencia, dirección o correo', alBuscar: function (q) { filtrar(q); },
      alRefrescar: function () { return cargar(true).then(function () { filtrar(b.inp.value); }); } });
    c.appendChild(b.caja);
    var cuenta = K.nodo('<p class="ct-conteo" aria-live="polite"></p>');
    c.appendChild(cuenta);
    var lista = K.nodo('<div class="ins-dir" role="list"></div>');
    c.appendChild(lista);
    function filtrar(q) {
      var n = K.norm(q || '');
      var vivos = DIR.filter(function (d) { return !n || K.norm(d.lugar + ' ' + d.direccion + ' ' + d.correo).indexOf(n) >= 0; });
      lista.innerHTML = '';
      vivos.forEach(function (d) { lista.appendChild(contacto(d, function () { pintar(c); })); });
      cuenta.innerHTML = '<b>' + vivos.length + '</b> ' + (vivos.length === 1 ? 'dependencia' : 'dependencias');
      if (!vivos.length) lista.appendChild(O().vacio('Nada coincide con "' + q + '".'));
    }
    filtrar('');
    K.piezas.creditos.montar(c);
  }

  function contacto(d, repintar) {
    var t = K.nodo('<article role="listitem" class="kit-tarjeta ins-contacto">' +
      '<h3 class="ins-contacto__t">' + K.esc(d.lugar) + '</h3>' +
      '<p class="ins-contacto__dir">' + K.icono('ubicacion', 15) + ' ' + K.esc(d.direccion || 'Sin dirección registrada') + '</p>' +
      (d.correo ? '<p class="ins-contacto__dato">' + K.icono('sobre', 15) + ' ' + K.esc(d.correo) + '</p>' : '') +
      (d.correoMalo ? '<p class="ins-contacto__malo">' + K.icono('aviso', 15) + ' El correo registrado (' + K.esc(d.correoMalo) + ') no es válido.</p>' : '') +
      '<div class="ins-contacto__acciones"></div></article>');
    var z = t.querySelector('.ins-contacto__acciones');
    function boton(icono, texto, href, externo) {
      z.appendChild(K.nodo('<a class="ins-accion" href="' + K.esc(href) + '"' + (externo ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' +
        K.icono(icono, 18) + '<span>' + K.esc(texto) + '</span></a>'));
    }
    if (d.ubicacion) boton('ubicacion', 'Cómo llegar', d.ubicacion, true);
    if (d.correo) boton('sobre', 'Correo', 'mailto:' + d.correo, false);
    if (d.whatsapp) boton('whatsapp', 'WhatsApp', 'https://wa.me/57' + d.whatsapp, true);
    if (d.telefono) boton('llamar', 'Llamar', 'tel:' + (d.telefono.length === 10 ? '+57' : '') + d.telefono, false);
    if (EDITAR) {
      var ed = K.nodo('<button type="button" class="ins-accion cm-corregir">' + K.icono('lapiz', 18) + '<span>Corregir</span></button>');
      ed.addEventListener('click', function () { editar(d, repintar); });
      z.appendChild(ed);
    }
    return t;
  }

  function editar(d, alGuardar) {
    d = d || {};
    var f = K.nodo('<div class="formulario cm-form"></div>');
    function campo(et, attrs, val, ayuda) {
      var l = K.nodo('<label class="campo"><span>' + K.esc(et) + '</span><input ' + attrs + '></label>');
      l.querySelector('input').value = val || '';
      if (ayuda) l.appendChild(K.nodo('<p class="campo__ayuda">' + ayuda + '</p>'));
      f.appendChild(l);
      return l.querySelector('input');
    }
    var iL = campo('Dependencia *', 'type="text" maxlength="200" placeholder="Ej: SECRETARÍA DE SALUD"', d.lugar);
    var iD = campo('Dirección', 'type="text" maxlength="300"', d.direccion);
    var iU = campo('Ubicación (enlace de Google Maps)', 'type="url" maxlength="500" placeholder="https://maps.app.goo.gl/…"', d.ubicacion);
    var iC = campo('Correo', 'type="email" maxlength="200"', d.correo || d.correoMalo);
    var iW = campo('WhatsApp', 'type="tel" inputmode="numeric" maxlength="10" placeholder="Celular de 10 dígitos"', d.whatsapp);
    var iT = campo('Teléfono', 'type="tel" inputmode="numeric" maxlength="12"', d.telefono, 'Fijo o celular, solo números.');
    [iW, iT].forEach(function (i) { i.addEventListener('input', function () { i.value = i.value.replace(/\D/g, ''); }); });
    var m = O().modal({
      titulo: d.id ? 'Corregir dependencia' : 'Agregar dependencia', cuerpo: f,
      botones: [{ texto: 'Cancelar', al: function () { m.cerrar(); } }, { texto: 'Guardar', icono: 'check', marca: true, al: guardar }]
    });
    function guardar() {
      var datos = { id: d.id || '', lugar: iL.value.trim(), direccion: iD.value.trim(), ubicacion: iU.value.trim(), correo: iC.value.trim(), whatsapp: iW.value.trim(), telefono: iT.value.trim() };
      if (!datos.lugar) { K.aviso('Escribe el nombre de la dependencia.', 'aviso', 3500); return; }
      if (datos.ubicacion && !/^https?:\/\//i.test(datos.ubicacion)) { K.aviso('La ubicación debe ser un enlace (https://…).', 'aviso', 4000); return; }
      if (datos.correo && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(datos.correo)) { K.aviso('El correo no es válido.', 'aviso', 3500); return; }
      if (datos.whatsapp && !/^\d{10}$/.test(datos.whatsapp)) { K.aviso('El WhatsApp debe tener 10 dígitos.', 'aviso', 3500); return; }
      m.botones[1].disabled = true;
      K.piezas.guardado.mientras(K.pedir('directorioGuardar', datos, { ms: 45000 }), {
        titulo: d.id ? 'Corrigiendo' : 'Agregando', sub: datos.lugar.toUpperCase(), pasos: ['Guardando en el directorio…'], listo: { titulo: 'Directorio al día', paso: 'Listo' }
      }).then(function (r) {
        DIR = (r && r.lista) || DIR;
        m.cerrar();
        if (alGuardar) alGuardar();
      }, function (e) { m.botones[1].disabled = false; K.aviso((e && e.message) || 'No se pudo guardar.', 'malo', 7000); });
    }
  }

  window.DIRECTORIO = {
    configurar: function (c) { C = c || {}; },
    vista: vista, cargar: cargar,
    olvidar: function () { DIR = null; EDITAR = false; CARGANDO = null; },
    _datos: function () { return DIR; }, _editar: function () { return EDITAR; }
  };
}());
