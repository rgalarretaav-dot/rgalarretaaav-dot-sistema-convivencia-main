// 1. CONEXIÓN A SUPABASE
const SUPABASE_URL = 'https://ktgvejpzzpmxlijbgacd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_wfrqOZ9O58WSjnOg6AgI2A_jzBWb2J3';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let listaIncidentesGlobal = []; 

// 2. CONEXIÓN A EMAILJS
const EMAILJS_PUBLIC_KEY = '-dcSznoDv_arwo8bp'; 
const EMAILJS_SERVICE_ID = 'service_qvtomfs';
const EMAILJS_TEMPLATE_ID = 'template_8qzs2qp';
emailjs.init(EMAILJS_PUBLIC_KEY);

// --- SISTEMA DE NOTIFICACIONES (TOAST) ---
function mostrarToast(mensaje, tipo = 'success') {
    const toast = document.getElementById('toast');
    if(!toast) return;
    toast.innerText = mensaje;
    toast.className = `toast show ${tipo === 'error' ? 'error' : ''}`;
    setTimeout(() => { toast.classList.remove('show'); }, 3000);
}

// --- FORMATEAR FECHA ---
function formatearFecha(fechaString) {
    if (!fechaString) return '-';
    const [year, month, day] = fechaString.split('-');
    return `${day}/${month}/${year}`;
}

// ==========================================
// LOGIN Y REGISTRO
// ==========================================
async function iniciarSesion() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!email || !password) return alert("Completa los campos");
    const btn = document.querySelector('button');
    const textoOriginal = btn.innerText;
    btn.innerText = "Verificando..."; btn.disabled = true;
    try {
        const { data, error } = await supabaseClient.from('usuarios').select('*').eq('email', email).eq('password', password).single();
        if (error || !data) throw new Error("Correo o contraseña incorrectos");
        localStorage.setItem('usuarioLogueado', JSON.stringify(data));
        iniciarAnimacionEpica(data.nombre);
    } catch (error) {
        alert("❌ " + error.message); btn.innerText = textoOriginal; btn.disabled = false;
    }
}

function iniciarAnimacionEpica(nombre) {
    const overlay = document.getElementById('epic-loader');
    const matrixContainer = document.getElementById('matrix-rain');
    const hackerText = document.getElementById('hacker-text');
    const heroText = document.getElementById('epic-text');
    if(overlay) overlay.classList.add('active');
    if (matrixContainer) {
        const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
        for (let i = 0; i < 60; i++) {
            const char = document.createElement('div');
            char.classList.add('matrix-char');
            char.innerText = caracteres[Math.floor(Math.random() * caracteres.length)];
            char.style.left = `${Math.random() * 100}vw`;
            char.style.animationDuration = `${Math.random() * 1 + 0.5}s`;
            char.style.animationDelay = `${Math.random() * 1.5}s`;
            matrixContainer.appendChild(char);
        }
    }
    setTimeout(() => { if (hackerText) { hackerText.innerText = "¡IDENTIDAD VERIFICADA!"; hackerText.style.color = "#e23636"; hackerText.style.textShadow = "0 0 10px #e23636"; } }, 1200);
    setTimeout(() => { if (hackerText) hackerText.style.display = 'none'; if (matrixContainer) matrixContainer.style.display = 'none'; if (heroText) { heroText.innerHTML = `¡ACCESO<br>CONCEDIDO,<br>${nombre.split(' ')[0]}!`; heroText.style.display = 'block'; } }, 2200);
    setTimeout(() => { window.location.href = "reportes.html"; }, 3800);
}

async function registrarUsuario() {
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const rolElement = document.getElementById('rol');
    const rol = rolElement.options[rolElement.selectedIndex].value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (!nombre || !email || !rol || !password || !confirmPassword) return alert("Completa los campos");
    if (password !== confirmPassword) return alert("❌ Las contraseñas no coinciden.");
    const btn = document.querySelector('button');
    const textoOriginal = btn.innerText;
    btn.innerText = "Registrando..."; btn.disabled = true;
    try {
        const { error } = await supabaseClient.from('usuarios').insert([{ nombre, email, rol, password }]);
        if (error) throw error;
        iniciarAnimacionJarvis();
    } catch (error) { alert("❌ Error: " + error.message); btn.innerText = textoOriginal; btn.disabled = false; }
}

function iniciarAnimacionJarvis() {
    const overlay = document.getElementById('jarvis-loader');
    const text = document.getElementById('jarvis-text');
    if(overlay) overlay.classList.add('active');
    setTimeout(() => { if(text) text.innerText = "CREANDO PERFIL..."; }, 1000);
    setTimeout(() => { if(text) text.innerText = "ENCRIPTANDO DATOS..."; }, 2000);
    setTimeout(() => { if(text) { text.innerText = "¡REGISTRO EXITOSO!"; text.style.color = "#22c55e"; text.style.textShadow = "0 0 20px #22c55e"; } }, 3000);
    setTimeout(() => { window.location.href = "index.html"; }, 4000);
}

async function solicitarAdmin(event) {
    if(event) event.preventDefault();
    const CLAVE_MAESTRA = "JOSEOLAYA2026"; 
    const passIngresada = prompt("🔒 Ingresa la clave maestra del colegio para crear al Administrador:");
    if (passIngresada !== CLAVE_MAESTRA) return alert("❌ Clave maestra incorrecta. Acción denegada.");
    
    try {
        const { data, error } = await supabaseClient.from('usuarios').select('id').eq('rol', 'Administrador');
        if (error) throw error;
        
        if (data.length >= 3) {
            return alert("⚠️ Límite alcanzado: Ya existen 3 Administradores en el sistema. Por seguridad, no se puede crear otro.");
        }
        
        alert(`✅ Acceso concedido. Creando Administrador N° ${data.length + 1} de 3.`);
        window.location.href = "registro.html?admin=true";
    } catch (error) { alert("❌ Error de conexión: " + error.message); }
}

// ==========================================
// PANEL PRINCIPAL Y TABLA
// ==========================================
function cargarDatosUsuario() {
    const userStr = localStorage.getItem('usuarioLogueado');
    if (!userStr) return window.location.href = "index.html";
    const user = JSON.parse(userStr);
    if (document.getElementById('nombreUsuario')) document.getElementById('nombreUsuario').innerText = user.nombre;
    if (document.getElementById('rolUsuario')) document.getElementById('rolUsuario').innerText = user.rol;
    const btnAdmin = document.getElementById('btn-admin');
    if (btnAdmin && user.rol === 'Administrador') btnAdmin.style.display = 'block';
}

function cerrarSesion() { localStorage.removeItem('usuarioLogueado'); window.location.href = "index.html"; }

function abrirModal() { document.getElementById('modalIncidente').style.display = 'flex'; }
function cerrarModal() { 
    document.getElementById('modalIncidente').style.display = 'none'; 
    document.getElementById('nombreEstudiante').value = '';
    document.getElementById('gradoEstudiante').value = '';
    document.getElementById('seccionEstudiante').value = '';
    document.getElementById('correoApoderado').value = '';
    document.getElementById('numeroIncidente').value = '';
    document.getElementById('fechaIncidente').value = '';
    document.getElementById('personaReporta').value = '';
    document.getElementById('descripcionIncidente').value = '';
}

// --- AUTOCOMPLETAR DATOS ---
function autocompletarCorreo() {
    const nombreInput = document.getElementById('nombreEstudiante').value.trim().toLowerCase();
    const gradoInput = document.getElementById('gradoEstudiante'); 
    const seccionInput = document.getElementById('seccionEstudiante');
    const correoInput = document.getElementById('correoApoderado');
    const numeroInput = document.getElementById('numeroIncidente');

    if (!nombreInput) return;

    const coincidencias = listaIncidentesGlobal.filter(rep => {
        return rep.estudiante && rep.estudiante.trim().toLowerCase() === nombreInput;
    });

    if (coincidencias.length > 0) {
        coincidencias.sort((a, b) => b.id - a.id);
        const alumnoExistente = coincidencias[0]; 

        if (!gradoInput.value && alumnoExistente.grado) gradoInput.value = alumnoExistente.grado;
        if (!seccionInput.value && alumnoExistente.seccion) seccionInput.value = alumnoExistente.seccion;
        if (alumnoExistente.correo_apoderado && !correoInput.value) correoInput.value = alumnoExistente.correo_apoderado;

        let maxNumero = 0;
        coincidencias.forEach(rep => {
            const num = parseInt(rep.numero_incidente);
            if (!isNaN(num) && num > maxNumero) maxNumero = num;
        });
        
        const currentNum = parseInt(numeroInput.value);
        if (isNaN(currentNum) || currentNum <= maxNumero) {
            numeroInput.value = maxNumero + 1;
        }
        
        mostrarToast("📧 Datos del alumno autocompletados");
    } else {
        if (!numeroInput.value) numeroInput.value = 1;
    }
}

let resolverPromesaConfirmacion = null;
function mostrarConfirmacionCorreo() {
    return new Promise((resolve) => {
        document.getElementById('modalConfirmarCorreo').style.display = 'flex';
        resolverPromesaConfirmacion = resolve;
    });
}

function resolverConfirmacion(decision) {
    document.getElementById('modalConfirmarCorreo').style.display = 'none';
    if (resolverPromesaConfirmacion) {
        resolverPromesaConfirmacion(decision);
        resolverPromesaConfirmacion = null;
    }
}

async function guardarIncidente() {
    const estudiante = document.getElementById('nombreEstudiante').value;
    const grado = document.getElementById('gradoEstudiante').value;
    const seccion = document.getElementById('seccionEstudiante').value;
    const correoApoderado = document.getElementById('correoApoderado').value;
    const numero = document.getElementById('numeroIncidente').value;
    const tipo = document.getElementById('tipoFalta').value;
    const fecha = document.getElementById('fechaIncidente').value;
    const persona = document.getElementById('personaReporta').value;
    const descripcion = document.getElementById('descripcionIncidente').value;
    
    if (!estudiante || !grado || !seccion || !correoApoderado || !numero || !fecha || !persona || !descripcion) {
        return mostrarToast("Completa todos los campos", "error");
    }

    let estadoInicial = (tipo === 'GRAVE' || tipo === 'MUY GRAVE') ? 'OBSERVADO' : 'FINALIZADO';

    try {
        const { error } = await supabaseClient.from('incidentes').insert([{ 
            estudiante, grado, seccion, numero_incidente: numero, tipo_falta: tipo, fecha, persona_reporta: persona, descripcion, correo_apoderado: correoApoderado, estado: estadoInicial
        }]);
        if (error) throw error;
        
        mostrarToast("✅ Incidente guardado");

        if (tipo === 'MUY GRAVE') {
            enviarCorreoNotificacion(estudiante, correoApoderado, tipo, fecha, descripcion, persona);
        } else if (tipo === 'GRAVE') {
            cerrarModal(); 
            const deseaEnviar = await mostrarConfirmacionCorreo();
            if (deseaEnviar) {
                enviarCorreoNotificacion(estudiante, correoApoderado, tipo, fecha, descripcion, persona);
            } else {
                mostrarToast("🚫 Correo no enviado (Falta perdonada).", "error");
            }
            cargarTablaIncidentes(); 
            return; 
        }

        cerrarModal();
        cargarTablaIncidentes(); 
    } catch (error) {
        mostrarToast("❌ Error: " + error.message, "error");
    }
}

function enviarCorreoNotificacion(estudiante, correo, tipo, fecha, descripcion, persona) {
    mostrarToast("✉️ Enviando correo...");
    const parametros = {
        estudiante: estudiante, tipo_falta: tipo, fecha: formatearFecha(fecha),
        descripcion: descripcion, persona_reporta: persona, to_email: correo
    };
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, parametros)
        .then(function() { mostrarToast("✅ Correo enviado al apoderado"); }, 
              function(error) { mostrarToast("❌ Error al enviar el correo", "error"); });
}

async function cargarTablaIncidentes() {
    const tbody = document.getElementById('cuerpoTabla');
    if (!tbody) return; 
    try {
        const { data, error } = await supabaseClient.from('incidentes').select('*').order('id', { ascending: false });
        if (error) throw error;
        listaIncidentesGlobal = data; 
        dibujarTablaAgrupada(data);
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: red;">Error al cargar datos.</td></tr>`;
    }
}

function dibujarTablaAgrupada(datos) {
    const tbody = document.getElementById('cuerpoTabla');
    let totalLeves = 0, totalGraves = 0, totalMuyGraves = 0;

    if (datos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">No hay reportes registrados.</td></tr>`;
        document.getElementById('stat-total').innerText = "0";
        document.getElementById('stat-verde').innerText = "0";
        document.getElementById('stat-amarillo').innerText = "0";
        document.getElementById('stat-rojo').innerText = "0";
        return;
    }

    const estudiantes = {};
    datos.forEach(rep => {
        const llaveUnica = rep.estudiante.trim() + "|" + (rep.grado || '') + "|" + (rep.seccion || '');
        
        if (rep.tipo_falta === 'LEVE') totalLeves++;
        else if (rep.tipo_falta === 'GRAVE') totalGraves++;
        else if (rep.tipo_falta === 'MUY GRAVE') totalMuyGraves++;

        if (!estudiantes[llaveUnica]) {
            estudiantes[llaveUnica] = { 
                nombreReal: rep.estudiante.trim(), 
                grado: rep.grado || '-',
                seccion: rep.seccion || '-',
                total: 0, 
                leves: 0,
                graves: 0,
                muyGraves: 0,
                estado: 'FINALIZADO'
            };
        }
        
        if (rep.estado === 'OBSERVADO') estudiantes[llaveUnica].estado = 'OBSERVADO';

        estudiantes[llaveUnica].total++;
        if (rep.tipo_falta === 'LEVE') estudiantes[llaveUnica].leves++;
        else if (rep.tipo_falta === 'GRAVE') estudiantes[llaveUnica].graves++;
        else if (rep.tipo_falta === 'MUY GRAVE') estudiantes[llaveUnica].muyGraves++;
    });

    const userStr = localStorage.getItem('usuarioLogueado');
    const usuarioActual = JSON.parse(userStr);
    const tienePermiso = usuarioActual.rol === 'Administrador' || usuarioActual.puede_borrar === true;

    tbody.innerHTML = "";
    Object.values(estudiantes).forEach(est => {
        let colorFondo = "", colorBorde = "", textoEstado = "";
        
        if (est.muyGraves > 0) {
            colorFondo = "rgba(239, 68, 68, 0.05)"; colorBorde = "#ef4444"; textoEstado = "🔴 Muy Grave";
        } else if (est.graves > 0 || est.leves >= 3) {
            colorFondo = "rgba(245, 158, 11, 0.05)"; colorBorde = "#f59e0b"; textoEstado = "🟡 Grave";
        } else {
            colorFondo = "rgba(34, 197, 94, 0.05)"; colorBorde = "#22c55e"; textoEstado = "🟢 Leve";
        }

        let textoEstadoGlobal = "";
        if (est.estado === 'OBSERVADO') {
            textoEstadoGlobal = `<span style="background:#f59e0b; color:white; padding:4px 8px; border-radius:12px; font-weight:bold; font-size:0.85rem;">⏳ OBSERVADO</span>`;
        } else {
            textoEstadoGlobal = `<span style="background:#22c55e; color:white; padding:4px 8px; border-radius:12px; font-weight:bold; font-size:0.85rem;">✅ FINALIZADO</span>`;
        }

        let botones = `
            <div style="display: flex; gap: 5px; justify-content: center;">
                <button onclick="verHistorial('${est.nombreReal}', '${est.grado}', '${est.seccion}')" style="background:#3b82f6; color:white; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; font-weight:bold;" title="Ver Historial">👁️</button>
        `;
        
        if (tienePermiso) {
            if (est.estado === 'OBSERVADO') {
                botones += `<button onclick="finalizarIncidentes('${est.nombreReal}', '${est.grado}', '${est.seccion}')" style="background:#22c55e; color:white; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; font-weight:bold;" title="Dar por Finalizado">✅</button>`;
            }

            botones += `
                <button onclick="abrirModalEditarAlumno('${est.nombreReal}', '${est.grado}', '${est.seccion}')" style="background:#f59e0b; color:white; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; font-weight:bold;" title="Editar Alumno">✏️</button>
                <button onclick="eliminarEstudiante('${est.nombreReal}', '${est.grado}', '${est.seccion}')" style="background:#ef4444; color:white; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; font-weight:bold;" title="Eliminar Alumno">🗑️</button>
            `;
        }
        botones += `</div>`;

        tbody.innerHTML += `
            <tr style="border-left: 6px solid ${colorBorde}; background: ${colorFondo};">
                <td style="font-weight:bold; font-size:1rem;">${est.nombreReal}</td>
                <td style="font-weight:bold; color: #64748b;">${est.grado}</td>
                <td style="font-weight:bold; color: #64748b;">${est.seccion}</td>
                <td><span style="background:#1e3a8a; color:white; padding:4px 8px; border-radius:12px; font-size:0.85rem; font-weight:bold;">${est.total} Falta(s)</span></td>
                <td><span style="font-weight:bold; color:${colorBorde};">${textoEstado}</span></td>
                <td>${textoEstadoGlobal}</td>
                <td>${botones}</td>
            </tr>`;
    });

    document.getElementById('stat-total').innerText = datos.length; 
    document.getElementById('stat-verde').innerText = totalLeves;
    document.getElementById('stat-amarillo').innerText = totalGraves;
    document.getElementById('stat-rojo').innerText = totalMuyGraves;
}

function filtrarTabla() {
    const texto = document.getElementById('buscador').value.toLowerCase();
    const filtrados = listaIncidentesGlobal.filter(rep => 
        rep.estudiante.toLowerCase().includes(texto) || 
        (rep.grado && rep.grado.toLowerCase().includes(texto)) ||
        (rep.seccion && rep.seccion.toLowerCase().includes(texto))
    );
    dibujarTablaAgrupada(filtrados);
}

// --- FUNCIÓN PARA FINALIZAR INCIDENTES ---
async function finalizarIncidentes(nombre, grado, seccion) {
    if (!confirm(`⚠️ ¿Estás seguro de dar por FINALIZADOS todos los incidentes de "${nombre}"?`)) return;

    try {
        const { error } = await supabaseClient
            .from('incidentes')
            .update({ estado: 'FINALIZADO' })
            .match({ estudiante: nombre, grado: grado === '-' ? null : grado, seccion: seccion === '-' ? null : seccion });

        if (error) throw error;

        mostrarToast("✅ Incidentes marcados como FINALIZADOS.");
        cargarTablaIncidentes(); 
    } catch (error) { mostrarToast("❌ Error: " + error.message, "error"); }
}

// ==========================================
// EDITAR ALUMNO COMPLETO
// ==========================================
function abrirModalEditarAlumno(nombre, grado, seccion) {
    const incidentesAlumno = listaIncidentesGlobal.filter(rep => 
        rep.estudiante.trim() === nombre && 
        (rep.grado || '-') === grado &&
        (rep.seccion || '-') === seccion
    );
    if (incidentesAlumno.length === 0) return;

    const primerIncidente = incidentesAlumno[0];
    
    document.getElementById('editIdIncidente').value = primerIncidente.id;
    document.getElementById('editNombreEstudiante').value = primerIncidente.estudiante;
    document.getElementById('editGradoEstudiante').value = primerIncidente.grado || '';
    document.getElementById('editSeccionEstudiante').value = primerIncidente.seccion || '';
    document.getElementById('editCorreoApoderado').value = primerIncidente.correo_apoderado || '';
    document.getElementById('editNumeroIncidente').value = primerIncidente.numero_incidente;
    document.getElementById('editTipoFalta').value = primerIncidente.tipo_falta;
    document.getElementById('editFechaIncidente').value = primerIncidente.fecha;
    document.getElementById('editPersonaReporta').value = primerIncidente.persona_reporta;
    document.getElementById('editDescripcionIncidente').value = primerIncidente.descripcion;

    window.datosViejosEdicion = { nombre, grado, seccion };
    document.getElementById('modalEditarIncidente').style.display = 'flex';
}

function cerrarModalEditarIncidente() {
    document.getElementById('modalEditarIncidente').style.display = 'none';
}

async function guardarEdicionIncidente() {
    const nuevoNombre = document.getElementById('editNombreEstudiante').value;
    const nuevoGrado = document.getElementById('editGradoEstudiante').value;
    const nuevaSeccion = document.getElementById('editSeccionEstudiante').value;
    const nuevoCorreo = document.getElementById('editCorreoApoderado').value;
    const nuevoNumero = document.getElementById('editNumeroIncidente').value;
    const nuevoTipo = document.getElementById('editTipoFalta').value;
    const nuevaFecha = document.getElementById('editFechaIncidente').value;
    const nuevaPersona = document.getElementById('editPersonaReporta').value;
    const nuevaDescripcion = document.getElementById('editDescripcionIncidente').value;

    if (!nuevoNombre || !nuevoGrado || !nuevaSeccion || !nuevoCorreo || !nuevoNumero || !nuevaFecha || !nuevaPersona || !nuevaDescripcion) {
        return mostrarToast("Completa todos los campos", "error");
    }

    try {
        const { error } = await supabaseClient
            .from('incidentes')
            .update({ 
                estudiante: nuevoNombre, grado: nuevoGrado, seccion: nuevaSeccion, correo_apoderado: nuevoCorreo,
                numero_incidente: nuevoNumero, tipo_falta: nuevoTipo, fecha: nuevaFecha, persona_reporta: nuevaPersona, descripcion: nuevaDescripcion
            })
            .match({ 
                estudiante: window.datosViejosEdicion.nombre, 
                grado: window.datosViejosEdicion.grado === '-' ? null : window.datosViejosEdicion.grado, 
                seccion: window.datosViejosEdicion.seccion === '-' ? null : window.datosViejosEdicion.seccion 
            });
        if (error) throw error;
        mostrarToast("✅ Datos actualizados correctamente");
        cerrarModalEditarIncidente();
        cargarTablaIncidentes(); 
    } catch (error) {
        mostrarToast("❌ Error al editar: " + error.message, "error");
    }
}

async function eliminarEstudiante(nombre, grado, seccion) {
    if (!confirm(`⚠️ ¿Estás seguro de que deseas eliminar TODOS los incidentes de "${nombre}"?`)) return;
    try {
        const { error } = await supabaseClient.from('incidentes').delete().match({ estudiante: nombre, grado: grado === '-' ? null : grado, seccion: seccion === '-' ? null : seccion });
        if (error) throw error;
        mostrarToast("🗑️ Alumno eliminado del sistema.");
        cargarTablaIncidentes(); 
    } catch (error) { mostrarToast("❌ Error al eliminar: " + error.message, "error"); }
}

// ==========================================
// HISTORIAL
// ==========================================
async function verHistorial(nombreEstudiante, gradoEstudiante, seccionEstudiante) {
    const modal = document.getElementById('modalHistorial');
    const tbody = document.getElementById('cuerpoHistorial');
    const titulo = document.getElementById('tituloHistorial');
    titulo.innerText = `📋 Historial de: ${nombreEstudiante} (${gradoEstudiante} - ${seccionEstudiante})`;
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px;">Verificando permisos...</td></tr>`;

    const userStr = localStorage.getItem('usuarioLogueado');
    const usuarioActual = JSON.parse(userStr);
    let tienePermisoBorrar = usuarioActual.rol === 'Administrador';

    if (!tienePermisoBorrar) {
        try {
            const { data: dbUser, error } = await supabaseClient.from('usuarios').select('puede_borrar').eq('id', usuarioActual.id).single();
            if (!error && dbUser) tienePermisoBorrar = dbUser.puede_borrar === true;
        } catch (error) { console.error(error); }
    }

    tbody.innerHTML = "";
    const incidentesAlumno = listaIncidentesGlobal.filter(rep => rep.estudiante.trim() === nombreEstudiante && (rep.grado || '-') === gradoEstudiante && (rep.seccion || '-') === seccionEstudiante);
    incidentesAlumno.sort((a, b) => a.id - b.id);

    incidentesAlumno.forEach(rep => {
        let colorFalta = rep.tipo_falta === 'LEVE' ? '#22c55e' : (rep.tipo_falta === 'GRAVE' ? '#f59e0b' : '#ef4444');
        
        let textEstado = rep.estado === 'OBSERVADO' ? '⏳ OBSERVADO' : '✅ FINALIZADO';
        let bgEstado = rep.estado === 'OBSERVADO' ? '#f59e0b' : '#22c55e';
        
        tbody.innerHTML += `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 12px; font-weight:bold;">${rep.numero_incidente}</td>
                <td style="padding: 12px;"><span style="background:${colorFalta}20; color:${colorFalta}; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:0.8rem;">${rep.tipo_falta}</span></td>
                <td style="padding: 12px;">${formatearFecha(rep.fecha)}</td>
                <td style="padding: 12px;">${rep.persona_reporta}</td>
                <td style="padding: 12px; font-size:0.85rem; color:#64748b;">${rep.descripcion}</td>
                <td style="padding: 12px;"><span style="background:${bgEstado}; color:white; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:0.8rem;">${textEstado}</span></td>
                <td style="padding: 12px; text-align:center;">
                    ${tienePermisoBorrar ? `<button onclick="eliminarIncidente(${rep.id})" style="background:#ef4444; color:white; border:none; padding:8px 10px; border-radius:6px; cursor:pointer;" title="Eliminar este incidente">🗑️</button>` : `<span style="color:#cbd5e1; font-size: 0.8rem;">Sin permiso</span>`}
                </td>
            </tr>`;
    });
    modal.style.display = 'flex';
}

function cerrarModalHistorial() { document.getElementById('modalHistorial').style.display = 'none'; }

async function eliminarIncidente(id) {
    if (!confirm("¿Seguro que quieres borrar este incidente en específico?")) return;
    try {
        const { error } = await supabaseClient.from('incidentes').delete().eq('id', id);
        if (error) throw error;
        mostrarToast("🗑️ Incidente eliminado.");
        cerrarModalHistorial();
        cargarTablaIncidentes();
    } catch (error) { mostrarToast("❌ Error al eliminar: " + error.message, "error"); }
}

// ==========================================
// ADMINISTRACIÓN DE USUARIOS
// ==========================================
function abrirModalAdmin() { document.getElementById('modalAdmin').style.display = 'flex'; cargarUsuariosAdmin(); }
function cerrarModalAdmin() { document.getElementById('modalAdmin').style.display = 'none'; }

async function cargarUsuariosAdmin() {
    const tbody = document.getElementById('cuerpoAdmin');
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px;">Cargando usuarios...</td></tr>`;
    try {
        const { data, error } = await supabaseClient.from('usuarios').select('*').order('nombre');
        if (error) throw error;
        tbody.innerHTML = "";
        data.forEach(user => {
            if (user.rol === 'Administrador') return; 
            const estaActivo = user.puede_borrar ? 'checked' : '';
            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 12px; font-weight: bold; color: #333;">${user.nombre}</td>
                    <td style="padding: 12px; color: #64748b;">${user.rol}</td>
                    <td style="padding: 12px; text-align: center;">
                        <label class="switch"><input type="checkbox" ${estaActivo} onchange="cambiarPermiso(${user.id}, this.checked)"><span class="slider"></span></label>
                    </td>
                    <td style="padding: 12px; text-align: center;">
                        <button onclick="eliminarUsuario(${user.id}, '${user.nombre}')" style="background:#ef4444; color:white; border:none; padding:6px 10px; border-radius:6px; cursor:pointer;">🗑️</button>
                    </td>
                </tr>`;
        });
    } catch (error) { tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: red;">Error al cargar usuarios</td></tr>`; }
}

async function cambiarPermiso(idUsuario, permitirBorrar) {
    try {
        const { error } = await supabaseClient.from('usuarios').update({ puede_borrar: permitirBorrar }).eq('id', idUsuario);
        if (error) throw error;
        mostrarToast("✅ Permisos actualizados");
    } catch (error) { mostrarToast("❌ Error al actualizar permisos", "error"); }
}

async function eliminarUsuario(idUsuario, nombreUsuario) {
    if (!confirm(`⚠️ ¿Estás seguro de que deseas eliminar a "${nombreUsuario}"?`)) return;
    try {
        const { error } = await supabaseClient.from('usuarios').delete().eq('id', idUsuario);
        if (error) throw error;
        mostrarToast("🗑️ Usuario eliminado.");
        cargarUsuariosAdmin();
    } catch (error) { mostrarToast("❌ Error: " + error.message, "error"); }
}

// ==========================================
// EXPORTAR A EXCEL
// ==========================================
function exportarExcel() {
    if (listaIncidentesGlobal.length === 0) return mostrarToast("No hay datos para exportar", "error");

    const estudiantes = {};
    let maxIncidentes = 0; // Variable para contar cuántos incidentes tiene el alumno con más faltas

    listaIncidentesGlobal.forEach(rep => {
        const nombre = rep.estudiante.trim();
        const grado = rep.grado || 'Sin grado';
        const seccion = rep.seccion || 'Sin sección';
        const key = nombre + "|" + grado + "|" + seccion;
        
        if (!estudiantes[key]) {
            estudiantes[key] = { 
                nombre: nombre, 
                grado: grado, 
                seccion: seccion, 
                incidentes: [], 
                leves: 0, 
                graves: 0, 
                muyGraves: 0,
                estado: 'FINALIZADO'
            };
        }
        
        if (rep.estado === 'OBSERVADO') estudiantes[key].estado = 'OBSERVADO';

        estudiantes[key].incidentes.push(rep);
        
        // Actualizamos cuál es el máximo de incidentes
        if (estudiantes[key].incidentes.length > maxIncidentes) {
            maxIncidentes = estudiantes[key].incidentes.length;
        }
        
        if (rep.tipo_falta === 'LEVE') estudiantes[key].leves++;
        else if (rep.tipo_falta === 'GRAVE') estudiantes[key].graves++;
        else if (rep.tipo_falta === 'MUY GRAVE') estudiantes[key].muyGraves++;
    });

    if (maxIncidentes === 0) maxIncidentes = 1; // Por seguridad

    const datosExcel = [];
    
    // Creamos los títulos dinámicamente
    let cabecera = ["APELLIDOS Y NOMBRES DEL ESTUDIANTE", "GRADO", "SECCIÓN", "ESTADO DE MATRÍCULA"];
    let subCabecera = ["", "", "", ""];
    
    // Agregamos solo las columnas de incidentes necesarias
    for (let i = 1; i <= maxIncidentes; i++) {
        cabecera.push(`INCIDENTE ${i}`, "FECHA", "TIPIFICACIÓN DE LA FALTA", "PERSONA QUE REPORTA");
        subCabecera.push("", "", "LEVE", ""); // El "LEVE" se alinea perfectamente
    }
    
    cabecera.push("REPORTE FINAL", "CORREO DEL APODERADO");
    subCabecera.push("", "");

    datosExcel.push(cabecera);
    datosExcel.push(subCabecera);

    Object.values(estudiantes).forEach(est => {
        est.incidentes.sort((a, b) => parseInt(a.numero_incidente) - parseInt(b.numero_incidente));
        
        let reporteFinal = "";
        if (est.muyGraves > 0) {
            reporteFinal = "🔴 Remisión a coordinación";
        } else if (est.graves > 0 || est.leves >= 3) {
            reporteFinal = "🟡 Llamado de atención";
        } else {
            reporteFinal = "🟢 Seguimiento";
        }

        let correo = "";
        est.incidentes.forEach(i => { if(i.correo_apoderado && !correo) correo = i.correo_apoderado; });

        // Creamos la fila del alumno
        let fila = [est.nombre, est.grado, est.seccion, est.estado];
        
        for (let i = 0; i < maxIncidentes; i++) {
            const inc = est.incidentes[i] || null;
            fila.push(
                inc ? inc.numero_incidente : "",
                inc ? formatearFecha(inc.fecha) : "",
                inc ? inc.tipo_falta : "",
                inc ? inc.persona_reporta : ""
            );
        }
        
        fila.push(reporteFinal, correo);
        datosExcel.push(fila);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(datosExcel);
    
    // Ajustamos los anchos de las columnas dinámicamente
    let cols = [{ wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 20 }];
    for (let i = 0; i < maxIncidentes; i++) {
        cols.push({ wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 20 });
    }
    cols.push({ wch: 25 }, { wch: 30 });
    worksheet['!cols'] = cols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hoja1");
    XLSX.writeFile(workbook, "REPORTE DE INCIDENTES.xlsx");
    mostrarToast("📥 Excel descargado sin espacios vacíos");
}