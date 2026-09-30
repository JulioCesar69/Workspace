const CLAVE_STORAGE = 'diario-estudio-sesiones';

function obtenerSesiones() {
  const datos = localStorage.getItem(CLAVE_STORAGE);
  return datos ? JSON.parse(datos) : [];
}

function guardarSesiones(sesiones) {
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(sesiones));
}

function fechaLocalISO(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function calcularRacha(sesiones) {
  const diasConSesion = new Set(sesiones.map(s => s.fecha));
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  let racha = 0;
  let diaActual = new Date(hoy);

  if (!diasConSesion.has(fechaLocalISO(diaActual))) {
    diaActual.setDate(diaActual.getDate() - 1);
  }

  while (diasConSesion.has(fechaLocalISO(diaActual))) {
    racha++;
    diaActual.setDate(diaActual.getDate() - 1);
  }

  return racha;
}

function calcularMejorRacha(sesiones) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diasUnicos = [...new Set(sesiones.map(s => s.fecha))]
    .filter(fecha => {
      const [anio, mes, dia] = fecha.split('-').map(Number);
      const fechaLocal = new Date(anio, mes - 1, dia);
      return fechaLocal <= hoy;
    })
    .sort();

  if (diasUnicos.length === 0) return 0;

  let mejorRacha = 1;
  let rachaActual = 1;

  for (let i = 1; i < diasUnicos.length; i++) {
    const [a1, m1, d1] = diasUnicos[i - 1].split('-').map(Number);
    const [a2, m2, d2] = diasUnicos[i].split('-').map(Number);
    const fechaAnterior = new Date(a1, m1 - 1, d1);
    const fechaActual = new Date(a2, m2 - 1, d2);

    const diffDias = (fechaActual - fechaAnterior) / (1000 * 60 * 60 * 24);

    if (diffDias === 1) {
      rachaActual++;
      mejorRacha = Math.max(mejorRacha, rachaActual);
    } else {
      rachaActual = 1;
    }
  }

  return mejorRacha;
}

function formatearFecha(fechaISO) {
  const [anio, mes, dia] = fechaISO.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function renderizar() {
  const sesiones = obtenerSesiones();
  sesiones.sort((a, b) => b.fecha.localeCompare(a.fecha));

  const racha = calcularRacha(sesiones);
  document.getElementById('racha-numero').textContent = racha;

  const mejorRacha = calcularMejorRacha(sesiones);
  document.getElementById('mejor-racha').textContent = `Mejor racha: ${mejorRacha} días 🏆`;

  const lista = document.getElementById('lista-sesiones');
  const vacio = document.getElementById('sin-sesiones');

  lista.innerHTML = '';

  if (sesiones.length === 0) {
    vacio.style.display = 'block';
  } else {
    vacio.style.display = 'none';
    sesiones.forEach(s => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${s.tema}</span>
        <span class="fecha">${formatearFecha(s.fecha)}</span>
        <span class="minutos">${s.minutos} min</span>
      `;
      lista.appendChild(li);
    });
  }
}

function inicializar() {
  const inputFecha = document.getElementById('fecha');
  inputFecha.value = fechaLocalISO(new Date());

  document.getElementById('form-sesion').addEventListener('submit', (e) => {
    e.preventDefault();

    const fecha = inputFecha.value;
    const tema = document.getElementById('tema').value.trim();
    const minutos = parseInt(document.getElementById('minutos').value, 10);

    if (!fecha || !tema || !minutos || minutos <= 0) return;

    const sesiones = obtenerSesiones();
    sesiones.push({ fecha, tema, minutos });
    guardarSesiones(sesiones);

    document.getElementById('tema').value = '';
    document.getElementById('minutos').value = '';

    renderizar();
  });

  renderizar();
}

inicializar();
