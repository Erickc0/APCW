function mostrarError(input, mensaje){

    const grupo = input.parentElement;
    const error = grupo.querySelector('.error');

    error.textContent = mensaje;

    input.classList.add('input-error');
    input.classList.remove('input-success');
}

function mostrarExito(input){

    const grupo = input.parentElement;
    const error = grupo.querySelector('.error');

    error.textContent = '';

    input.classList.remove('input-error');
    input.classList.add('input-success');
}

function validarCampo(input, mensaje){

    if(input.value.trim() === ''){

        mostrarError(input, mensaje);
        return false;
    }

    mostrarExito(input);
    return true;
}

const STORAGE_KEYS = {
    usuarios: 'usuariosRegistrados',
    activos: 'activosRegistrados',
    asignaciones: 'asignacionesRegistradas',
    mantenimientos: 'mantenimientosRegistrados',
    bajas: 'bajasRegistradas',
    actividad: 'actividadReciente'
};

const SESSION_KEY = 'sesionActiva';

function obtenerArrayStorage(clave){

    try{

        const valor = localStorage.getItem(clave);
        const parseado = JSON.parse(valor);
        return Array.isArray(parseado) ? parseado : [];

    }catch(error){

        return [];
    }
}

function guardarArrayStorage(clave, data){

    localStorage.setItem(clave, JSON.stringify(data));
}

function obtenerSesionActiva(){

    try{

        const sesion = JSON.parse(sessionStorage.getItem(SESSION_KEY));
        return sesion && sesion.usuario ? sesion : null;

    }catch(error){

        return null;
    }
}

function guardarSesionActiva(usuario){

    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        id: usuario.id,
        nombre: usuario.nombre || usuario.usuario,
        usuario: usuario.usuario,
        fechaInicio: new Date().toISOString()
    }));
}

function cerrarSesionActiva(){

    sessionStorage.clear();
}

function validarAccesoPagina(){

    const esMenuPrincipal = window.location.pathname.toLowerCase().includes('menu_principal.html');
    const esLogin = window.location.pathname.toLowerCase().includes('index.html') ||
        window.location.pathname.endsWith('/');
    const sesion = obtenerSesionActiva();

    if(esMenuPrincipal && !sesion){

        window.location.href = 'index.html';
        return false;
    }

    if(esLogin && sesion){

        window.location.href = 'menu_principal.html';
        return false;
    }

    return true;
}

validarAccesoPagina();

function mostrarNotificacion(mensaje, tipo){

    const toastContainer = document.getElementById('toastContainer');

    if(!toastContainer){
        return;
    }

    const toast = document.createElement('div');
    toast.className = 'toast ' + (tipo || 'info');
    toast.textContent = mensaje;
    toastContainer.appendChild(toast);

    setTimeout(function(){

        toast.remove();

    }, 2600);
}

function mostrarConfirmacionPersonalizada(mensaje, onConfirm){

    const confirmModal = document.getElementById('confirmModal');
    const confirmModalMessage = document.getElementById('confirmModalMessage');
    const confirmModalAccept = document.getElementById('confirmModalAccept');
    const confirmModalCancel = document.getElementById('confirmModalCancel');

    if(!confirmModal || !confirmModalMessage || !confirmModalAccept || !confirmModalCancel){

        return;
    }

    confirmModalMessage.textContent = mensaje;
    confirmModal.style.display = 'flex';

    function cerrarModal(){

        confirmModal.style.display = 'none';
        confirmModalAccept.removeEventListener('click', aceptar);
        confirmModalCancel.removeEventListener('click', cancelar);
    }

    function aceptar(){

        cerrarModal();

        if(onConfirm){
            onConfirm();
        }
    }

    function cancelar(){

        cerrarModal();
        mostrarNotificacion('OperaciÃ³n cancelada', 'info');
    }

    confirmModalAccept.addEventListener('click', aceptar);
    confirmModalCancel.addEventListener('click', cancelar);
}

function obtenerActividadReciente(){

    return obtenerArrayStorage(STORAGE_KEYS.actividad);
}

function registrarActividad(mensaje){

    const actividad = obtenerActividadReciente();

    actividad.unshift({
        id: Date.now().toString(),
        mensaje: mensaje,
        fecha: new Date().toISOString()
    });

    guardarArrayStorage(STORAGE_KEYS.actividad, actividad.slice(0, 10));
    actualizarDashboard();
    actualizarReportes();
}

function actualizarDashboard(){

    const kpiUsuarios = document.getElementById('kpiUsuarios');
    const kpiActivos = document.getElementById('kpiActivos');
    const kpiDisponibles = document.getElementById('kpiDisponibles');
    const kpiAsignados = document.getElementById('kpiAsignados');
    const kpiEnMantenimiento = document.getElementById('kpiEnMantenimiento');
    const kpiBajas = document.getElementById('kpiBajas');
    const recentActivityList = document.getElementById('recentActivityList');
    const fechaActual = document.getElementById('fechaActual');
    const usuarioConectado = document.getElementById('usuarioConectado');
    const activos = obtenerActivosRegistrados();
    const sesion = obtenerSesionActiva();

    const disponibles = activos.filter(function(item){

        return item.estado === 'Disponible';

    }).length;
    const asignados = activos.filter(function(item){

        return item.estado === 'Asignado';

    }).length;
    const enMantenimiento = activos.filter(function(item){

        return item.estado === 'En mantenimiento' || item.estado === 'En reparaciÃ³n';

    }).length;
    const dadosBaja = activos.filter(function(item){

        return item.estado === 'Dado de baja';

    }).length;

    if(fechaActual){

        const hoy = new Date();
        fechaActual.textContent = 'Fecha: ' + hoy.toLocaleDateString('es-ES');
    }

    if(usuarioConectado && sesion){

        usuarioConectado.textContent = 'Usuario: ' + sesion.nombre;
    }

    if(kpiUsuarios){
        kpiUsuarios.textContent = obtenerUsuariosRegistrados().length.toString();
    }

    if(kpiActivos){
        kpiActivos.textContent = activos.length.toString();
    }

    if(kpiDisponibles){
        kpiDisponibles.textContent = disponibles.toString();
    }

    if(kpiAsignados){
        kpiAsignados.textContent = asignados.toString();
    }

    if(kpiEnMantenimiento){
        kpiEnMantenimiento.textContent = enMantenimiento.toString();
    }

    if(kpiBajas){
        kpiBajas.textContent = dadosBaja.toString();
    }

    if(recentActivityList){

        const actividad = obtenerActividadReciente();
        recentActivityList.innerHTML = '';

        if(actividad.length === 0){

            const item = document.createElement('li');
            item.textContent = 'Sin actividad registrada.';
            recentActivityList.appendChild(item);

        }else{

            actividad.slice(0, 10).forEach(function(registro){

                const item = document.createElement('li');
                const fecha = new Date(registro.fecha);
                item.textContent = '[' + fecha.toLocaleDateString('es-ES') + ' ' + fecha.toLocaleTimeString('es-ES') + '] ' + registro.mensaje;
                recentActivityList.appendChild(item);

            });
        }
    }

    renderizarResultadosGlobales();
}

function renderizarResumenTabla(tablaId, conteos, etiquetaVacia){

    const tabla = document.getElementById(tablaId);

    if(!tabla){
        return;
    }

    tabla.innerHTML = '';
    const claves = Object.keys(conteos);

    if(claves.length === 0){

        const fila = document.createElement('tr');
        const celda = document.createElement('td');
        celda.colSpan = 2;
        celda.className = 'empty-table';
        celda.textContent = etiquetaVacia;
        fila.appendChild(celda);
        tabla.appendChild(fila);
        return;
    }

    claves.forEach(function(clave){

        const fila = document.createElement('tr');
        fila.appendChild(crearCeldaTabla(clave));
        fila.appendChild(crearCeldaTabla(String(conteos[clave])));
        tabla.appendChild(fila);

    });
}

function actualizarReportes(){

    const totalUsuarios = document.getElementById('reporteTotalUsuarios');
    const totalActivos = document.getElementById('reporteTotalActivos');
    const totalAsignaciones = document.getElementById('reporteTotalAsignaciones');
    const totalMantenimientos = document.getElementById('reporteTotalMantenimientos');
    const totalBajas = document.getElementById('reporteTotalBajas');

    const usuarios = obtenerUsuariosRegistrados();
    const activos = obtenerActivosRegistrados();
    const asignaciones = obtenerAsignacionesRegistradas();
    const mantenimientos = obtenerMantenimientosRegistrados();
    const bajas = obtenerBajasRegistradas();

    if(totalUsuarios){
        totalUsuarios.textContent = String(usuarios.length);
    }

    if(totalActivos){
        totalActivos.textContent = String(activos.length);
    }

    if(totalAsignaciones){
        totalAsignaciones.textContent = String(asignaciones.length);
    }

    if(totalMantenimientos){
        totalMantenimientos.textContent = String(mantenimientos.length);
    }

    if(totalBajas){
        totalBajas.textContent = String(bajas.length);
    }

    const conteoEstados = {};
    const conteoTipos = {};

    activos.forEach(function(item){

        conteoEstados[item.estado] = (conteoEstados[item.estado] || 0) + 1;
        conteoTipos[item.tipo] = (conteoTipos[item.tipo] || 0) + 1;
    });

    renderizarResumenTabla('reporteActivosEstadoTabla', conteoEstados, 'Sin datos de estados');
    renderizarResumenTabla('reporteActivosTipoTabla', conteoTipos, 'Sin datos de tipos');
}

function renderizarResultadosGlobales(){

    const buscarGlobal = document.getElementById('buscarGlobal');
    const globalSearchPanel = document.getElementById('globalSearchPanel');

    if(!buscarGlobal || !globalSearchPanel){
        return;
    }

    const busqueda = buscarGlobal.value.trim().toLowerCase();

    if(busqueda === ''){

        globalSearchPanel.style.display = 'none';
        return;
    }

    globalSearchPanel.style.display = 'block';

    function llenarListaResultados(idLista, registros, plantillaTexto, modulo){

        const lista = document.getElementById(idLista);

        if(!lista){
            return;
        }

        lista.innerHTML = '';

        if(registros.length === 0){

            const item = document.createElement('li');
            item.textContent = 'Sin resultados';
            lista.appendChild(item);
            return;
        }

        registros.slice(0, 6).forEach(function(registro){

            const item = document.createElement('li');
            item.textContent = plantillaTexto(registro);
            item.className = 'global-result-item';
            item.tabIndex = 0;
            item.addEventListener('click', function(){

                navegarDesdeBusquedaGlobal(modulo, registro.id);
            });
            item.addEventListener('keydown', function(e){

                if(e.key === 'Enter'){
                    navegarDesdeBusquedaGlobal(modulo, registro.id);
                }
            });
            lista.appendChild(item);

        });
    }

    const usuarios = obtenerUsuariosRegistrados().filter(function(item){

        return item.nombre.toLowerCase().includes(busqueda) ||
            item.usuario.toLowerCase().includes(busqueda) ||
            item.email.toLowerCase().includes(busqueda);
    });

    const activos = obtenerActivosRegistrados().filter(function(item){

        return item.codigo.toLowerCase().includes(busqueda) ||
            item.nombre.toLowerCase().includes(busqueda) ||
            item.tipo.toLowerCase().includes(busqueda) ||
            item.estado.toLowerCase().includes(busqueda);
    });

    const asignaciones = obtenerAsignacionesRegistradas().filter(function(item){

        return obtenerTextoActivo(item.activoId).toLowerCase().includes(busqueda) ||
            obtenerTextoUsuario(item.usuarioId).toLowerCase().includes(busqueda) ||
            item.fecha.toLowerCase().includes(busqueda);
    });

    const mantenimientos = obtenerMantenimientosRegistrados().filter(function(item){

        return obtenerTextoActivo(item.activoId).toLowerCase().includes(busqueda) ||
            item.tipo.toLowerCase().includes(busqueda) ||
            item.descripcion.toLowerCase().includes(busqueda) ||
            item.estado.toLowerCase().includes(busqueda);
    });

    const bajas = obtenerBajasRegistradas().filter(function(item){

        return item.codigo.toLowerCase().includes(busqueda) ||
            item.tipo.toLowerCase().includes(busqueda) ||
            item.descripcion.toLowerCase().includes(busqueda) ||
            obtenerTextoActivo(item.activoId).toLowerCase().includes(busqueda);
    });

    llenarListaResultados('resultadosGlobalUsuarios', usuarios, function(item){

        return item.nombre + ' (' + item.usuario + ')';
    }, 'usuarios');

    llenarListaResultados('resultadosGlobalActivos', activos, function(item){

        return item.codigo + ' - ' + item.nombre + ' [' + item.estado + ']';
    }, 'activos');

    llenarListaResultados('resultadosGlobalAsignaciones', asignaciones, function(item){

        return obtenerTextoActivo(item.activoId) + ' -> ' + obtenerTextoUsuario(item.usuarioId);
    }, 'asignacion');

    llenarListaResultados('resultadosGlobalMantenimientos', mantenimientos, function(item){

        return obtenerTextoActivo(item.activoId) + ' (' + item.tipo + ')';
    }, 'mantenimiento');

    llenarListaResultados('resultadosGlobalBajas', bajas, function(item){

        return item.codigo + ' - ' + item.descripcion;
    }, 'baja');
}

function limpiarFiltrosAntesDeResaltar(modulo){

    const camposPorModulo = {
        usuarios: ['buscarUsuario'],
        activos: ['buscarActivo', 'filtroEstadoActivo', 'filtroTipoActivo', 'filtroFechaActivo'],
        asignacion: ['buscarAsignacion'],
        mantenimiento: ['buscarMantenimiento'],
        baja: ['buscarBaja']
    };

    (camposPorModulo[modulo] || []).forEach(function(idCampo){

        const campo = document.getElementById(idCampo);

        if(campo){
            campo.value = '';
            campo.dispatchEvent(new Event('input'));
            campo.dispatchEvent(new Event('change'));
        }
    });
}

function resaltarFilaModulo(modulo, registroId){

    const tablasPorModulo = {
        usuarios: 'usuariosTabla',
        activos: 'activosTabla',
        asignacion: 'asignacionesTabla',
        mantenimiento: 'mantenimientosTabla',
        baja: 'bajasTabla'
    };
    const tabla = document.getElementById(tablasPorModulo[modulo]);

    if(!tabla){
        return;
    }

    const fila = tabla.querySelector('tr[data-registro-id="' + registroId + '"]');

    if(!fila){
        return;
    }

    fila.classList.add('fila-resaltada');
    fila.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });

    setTimeout(function(){

        fila.classList.remove('fila-resaltada');
    }, 3200);
}

function navegarDesdeBusquedaGlobal(modulo, registroId){

    if(window.mostrarSeccionDashboard){
        window.mostrarSeccionDashboard(modulo);
    }

    limpiarFiltrosAntesDeResaltar(modulo);

    setTimeout(function(){

        resaltarFilaModulo(modulo, registroId);
    }, 80);
}

function obtenerUsuariosRegistrados(){

    return obtenerArrayStorage(STORAGE_KEYS.usuarios);
}

function obtenerActivosRegistrados(){

    return obtenerArrayStorage(STORAGE_KEYS.activos);
}

function obtenerAsignacionesRegistradas(){

    return obtenerArrayStorage(STORAGE_KEYS.asignaciones);
}

function obtenerMantenimientosRegistrados(){

    return obtenerArrayStorage(STORAGE_KEYS.mantenimientos);
}

function obtenerBajasRegistradas(){

    return obtenerArrayStorage(STORAGE_KEYS.bajas);
}

function llenarSelect(select, items, textoOpcion){

    if(!select){
        return;
    }

    const valorActual = select.value;

    select.innerHTML = '';

    const opcionInicial = document.createElement('option');
    opcionInicial.value = '';
    opcionInicial.textContent = 'Seleccione';
    select.appendChild(opcionInicial);

    items.forEach(function(item){

        const opcion = document.createElement('option');
        opcion.value = item.id;
        opcion.textContent = textoOpcion(item);
        select.appendChild(opcion);

    });

    select.value = items.some(function(item){

        return item.id === valorActual;

    }) ? valorActual : '';
}

function actualizarSelectUsuarios(){

    const usuarios = obtenerUsuariosRegistrados();
    const usuarioAsignacion = document.getElementById('usuarioAsignacion');

    llenarSelect(usuarioAsignacion, usuarios, function(usuario){

        return usuario.nombre + ' (' + usuario.usuario + ')';

    });
}

function actualizarSelectActivos(){

    const activos = obtenerActivosRegistrados();
    const activosDisponibles = activos.filter(function(activo){

        return activo.estado === 'Disponible';

    });
    const activosParaMantenimiento = activos.filter(function(activo){

        return activo.estado !== 'Dado de baja';

    });
    const activosParaBaja = activos;
    const activoMantenimiento = document.getElementById('activoMantenimiento');
    const activoAsignacion = document.getElementById('activoAsignacion');
    const activoBaja = document.getElementById('activoBaja');

    llenarSelect(activoMantenimiento, activosParaMantenimiento, function(activo){

        return activo.codigo + ' - ' + activo.nombre;

    });

    llenarSelect(activoAsignacion, activosDisponibles, function(activo){

        return activo.codigo + ' - ' + activo.nombre;

    });

    llenarSelect(activoBaja, activosParaBaja, function(activo){

        return activo.codigo + ' - ' + activo.nombre;

    });
}

function agregarOpcionActivoSiFalta(select, activoId){

    if(!select || !activoId || select.querySelector('option[value="' + activoId + '"]')){
        return;
    }

    const activo = obtenerActivosRegistrados().find(function(item){

        return item.id === activoId;
    });

    if(!activo){
        return;
    }

    const opcion = document.createElement('option');
    opcion.value = activo.id;
    opcion.textContent = activo.codigo + ' - ' + activo.nombre;
    select.appendChild(opcion);
}

function actualizarSelectoresRelacionados(){

    actualizarSelectUsuarios();
    actualizarSelectActivos();
}




const loginForm = document.getElementById('loginForm');

if(loginForm){

    loginForm.addEventListener('submit', function(e){

        e.preventDefault();

        const usuario = document.getElementById('usuario');
        const password = document.getElementById('password');

        let valido = true;

        if(!validarCampo(usuario, 'Ingrese el usuario')){
            valido = false;
        }

        if(!validarCampo(password, 'Ingrese la contraseña')){
            valido = false;
        }

        if(valido){

            const usuarios = obtenerUsuariosRegistrados();
            const usuarioIngresado = usuario.value.trim();
            const passwordIngresado = password.value.trim();
            let usuarioAutenticado = usuarios.find(function(item){

                return item.usuario === usuarioIngresado && item.password === passwordIngresado;
            });

            if(!usuarioAutenticado && usuarios.length === 0 &&
                usuarioIngresado === 'admin' && passwordIngresado === 'admin123'){

                usuarioAutenticado = {
                    id: 'admin-prueba',
                    nombre: 'Admin',
                    usuario: 'admin'
                };
            }

            if(!usuarioAutenticado){

                mostrarError(usuario, 'Usuario o contraseña incorrectos');
                mostrarError(password, 'Usuario o contraseña incorrectos');
                mostrarNotificacion('Usuario o contraseña incorrectos', 'error');
                return;
            }

            guardarSesionActiva(usuarioAutenticado);
            mostrarNotificacion('Inicio de sesión exitoso', 'success');
            registrarActividad('Inicio de sesión exitoso: ' + usuarioAutenticado.usuario);

            setTimeout(function(){

                window.location.href = 'menu_principal.html';

            }, 500);
        }

    });

}



const usuarioForm = document.getElementById('usuarioForm');

if(usuarioForm){

    const nombre = document.getElementById('nombreUsuario');
    const usuario = document.getElementById('usuarioRegistro');
    const email = document.getElementById('email');
    const password = document.getElementById('passwordRegistro');
    const buscarUsuario = document.getElementById('buscarUsuario');
    const usuariosTabla = document.getElementById('usuariosTabla');
    const guardarUsuarioBtn = document.getElementById('guardarUsuarioBtn');
    const cancelarEdicionUsuario = document.getElementById('cancelarEdicionUsuario');
    let usuarios = obtenerUsuariosRegistrados();
    let usuarioEditandoId = null;

    function guardarUsuarios(){

        guardarArrayStorage(STORAGE_KEYS.usuarios, usuarios);
    }

    function limpiarFormularioUsuario(){

        usuarioForm.reset();
        usuarioEditandoId = null;
        guardarUsuarioBtn.textContent = 'Guardar Usuario';
        cancelarEdicionUsuario.style.display = 'none';

        [nombre, usuario, email, password].forEach(function(input){

            input.classList.remove('input-error');
            input.classList.remove('input-success');
            input.parentElement.querySelector('.error').textContent = '';

        });
    }

    function renderizarUsuarios(){

        const busqueda = buscarUsuario.value.trim().toLowerCase();

        const usuariosFiltrados = usuarios.filter(function(item){

            return item.nombre.toLowerCase().includes(busqueda) ||
                item.usuario.toLowerCase().includes(busqueda) ||
                item.email.toLowerCase().includes(busqueda);

        });

        usuariosTabla.innerHTML = '';

        if(usuariosFiltrados.length === 0){

            const filaVacia = document.createElement('tr');
            const celdaVacia = document.createElement('td');

            celdaVacia.colSpan = 4;
            celdaVacia.className = 'empty-table';
            celdaVacia.textContent = 'No hay usuarios registrados';

            filaVacia.appendChild(celdaVacia);
            usuariosTabla.appendChild(filaVacia);
            return;
        }

        usuariosFiltrados.forEach(function(item){

            const fila = document.createElement('tr');
            fila.dataset.registroId = item.id;
            const acciones = document.createElement('td');
            const editarBtn = document.createElement('button');
            const eliminarBtn = document.createElement('button');

            editarBtn.type = 'button';
            editarBtn.textContent = 'Editar';
            editarBtn.className = 'btn-table';
            editarBtn.addEventListener('click', function(){

                usuarioEditandoId = item.id;
                nombre.value = item.nombre;
                usuario.value = item.usuario;
                email.value = item.email;
                password.value = item.password;
                guardarUsuarioBtn.textContent = 'Actualizar Usuario';
                cancelarEdicionUsuario.style.display = 'inline-block';
            });

            eliminarBtn.type = 'button';
            eliminarBtn.textContent = 'Eliminar';
            eliminarBtn.className = 'btn-table btn-danger';
            eliminarBtn.addEventListener('click', function(){

                mostrarConfirmacionPersonalizada('Â¿EstÃ¡ seguro de eliminar este usuario?', function(){

                    const asignaciones = obtenerAsignacionesRegistradas();
                    const asignacionesRestantes = asignaciones.filter(function(asignacion){

                        return asignacion.usuarioId !== item.id;
                    });
                    const activosLiberados = asignaciones
                        .filter(function(asignacion){

                            return asignacion.usuarioId === item.id;
                        })
                        .map(function(asignacion){

                            return asignacion.activoId;
                        });

                    const asignacionesEliminadas = asignaciones.length - asignacionesRestantes.length;

                    if(asignacionesEliminadas > 0){

                        guardarArrayStorage(STORAGE_KEYS.asignaciones, asignacionesRestantes);

                        activosLiberados.forEach(function(activoId){

                            reconciliarEstadoActivo(activoId);
                        });
                    }

                    usuarios = usuarios.filter(function(usuarioGuardado){

                        return usuarioGuardado.id !== item.id;

                    });

                    guardarUsuarios();
                    renderizarUsuarios();
                    actualizarSelectoresRelacionados();
                    if(window.refrescarModuloAsignaciones){
                        window.refrescarModuloAsignaciones();
                    }
                    actualizarDashboard();

                    registrarActividad(
                        'Usuario eliminado: ' + item.nombre +
                        (asignacionesEliminadas > 0 ? ' (asignaciones eliminadas: ' + asignacionesEliminadas + ')' : '')
                    );
                    mostrarNotificacion('Usuario eliminado correctamente', 'info');

                    if(usuarioEditandoId === item.id){

                        limpiarFormularioUsuario();
                    }
                });
            });

            acciones.appendChild(editarBtn);
            acciones.appendChild(eliminarBtn);

            fila.appendChild(crearCeldaTabla(item.nombre));
            fila.appendChild(crearCeldaTabla(item.usuario));
            fila.appendChild(crearCeldaTabla(item.email));
            fila.appendChild(acciones);

            usuariosTabla.appendChild(fila);

        });
    }

    function validarUsuario(){

        let valido = true;

        const regexNombre = /^[A-Za-zÃÃ‰ÃÃ“ÃšÃ¡Ã©Ã­Ã³ÃºÃ±Ã‘ ]+$/;

        if(!regexNombre.test(nombre.value.trim())){

            mostrarError(nombre, 'Solo se permiten letras');
            valido = false;

        }else{

            mostrarExito(nombre);
        }

        if(usuario.value.trim().length < 4){

            mostrarError(usuario, 'MÃ­nimo 4 caracteres');
            valido = false;

        }else if(usuarios.some(function(item){

            return item.usuario.toLowerCase() === usuario.value.trim().toLowerCase() &&
                item.id !== usuarioEditandoId;

        })){

            mostrarError(usuario, 'El usuario ya existe');
            valido = false;

        }else{

            mostrarExito(usuario);
        }

        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!regexEmail.test(email.value.trim())){

            mostrarError(email, 'Correo invÃ¡lido');
            valido = false;

        }else if(usuarios.some(function(item){

            return item.email.toLowerCase() === email.value.trim().toLowerCase() &&
                item.id !== usuarioEditandoId;

        })){

            mostrarError(email, 'El correo ya existe');
            valido = false;

        }else{

            mostrarExito(email);
        }

        if(password.value.trim().length < 6){

            mostrarError(password, 'MÃ­nimo 6 caracteres');
            valido = false;

        }else{

            mostrarExito(password);
        }

        return valido;
    }

    usuarioForm.addEventListener('submit', function(e){

        e.preventDefault();

        const formularioValido = validarUsuario();

        if(formularioValido){

            const datosUsuario = {
                id: usuarioEditandoId || Date.now().toString(),
                nombre: nombre.value.trim(),
                usuario: usuario.value.trim(),
                email: email.value.trim(),
                password: password.value.trim()
            };

            if(usuarioEditandoId){

                usuarios = usuarios.map(function(item){

                    return item.id === usuarioEditandoId ? datosUsuario : item;

                });

                mostrarNotificacion('Usuario actualizado correctamente', 'success');
                registrarActividad('Usuario actualizado: ' + datosUsuario.nombre);

            }else{

                usuarios.push(datosUsuario);
                mostrarNotificacion('Usuario registrado correctamente', 'success');
                registrarActividad('Usuario registrado: ' + datosUsuario.nombre);
            }

            guardarUsuarios();
            limpiarFormularioUsuario();
            renderizarUsuarios();
            actualizarSelectUsuarios();
            actualizarDashboard();
        }

        if(!formularioValido){
            mostrarNotificacion('Revisa los datos del usuario', 'error');
        }

    });

    buscarUsuario.addEventListener('input', renderizarUsuarios);
    cancelarEdicionUsuario.addEventListener('click', limpiarFormularioUsuario);

    limpiarFormularioUsuario();
    renderizarUsuarios();
    actualizarSelectUsuarios();

}




const activoForm = document.getElementById('activoForm');

if(activoForm){

    const codigo = document.getElementById('codigo');
    const nombre = document.getElementById('nombreActivo');
    const tipo = document.getElementById('tipo');
    const estado = document.getElementById('estado');
    const fecha = document.getElementById('fechaCompra');
    const descripcion = document.getElementById('descripcion');
    const buscarActivo = document.getElementById('buscarActivo');
    const filtroEstadoActivo = document.getElementById('filtroEstadoActivo');
    const filtroTipoActivo = document.getElementById('filtroTipoActivo');
    const filtroFechaActivo = document.getElementById('filtroFechaActivo');
    const limpiarFiltrosActivos = document.getElementById('limpiarFiltrosActivos');
    const activosTabla = document.getElementById('activosTabla');
    const guardarActivoBtn = document.getElementById('guardarActivoBtn');
    const cancelarEdicionActivo = document.getElementById('cancelarEdicionActivo');
    let activos = obtenerActivosRegistrados();
    let activoEditandoId = null;

    function guardarActivos(){

        guardarArrayStorage(STORAGE_KEYS.activos, activos);
    }

    function limpiarFormularioActivo(){

        activoForm.reset();
        activoEditandoId = null;
        guardarActivoBtn.textContent = 'Guardar Activo';
        cancelarEdicionActivo.style.display = 'none';

        [codigo, nombre, tipo, estado, fecha, descripcion].forEach(function(input){

            input.classList.remove('input-error');
            input.classList.remove('input-success');
            input.parentElement.querySelector('.error').textContent = '';

        });
    }

    function renderizarActivos(){

        const busqueda = buscarActivo.value.trim().toLowerCase();
        const filtroEstado = filtroEstadoActivo ? filtroEstadoActivo.value : '';
        const filtroTipo = filtroTipoActivo ? filtroTipoActivo.value : '';
        const filtroFecha = filtroFechaActivo ? filtroFechaActivo.value : '';

        const activosFiltrados = activos.filter(function(item){

            const cumpleBusqueda = item.codigo.toLowerCase().includes(busqueda) ||
                item.nombre.toLowerCase().includes(busqueda) ||
                item.tipo.toLowerCase().includes(busqueda) ||
                item.estado.toLowerCase().includes(busqueda) ||
                item.fecha.toLowerCase().includes(busqueda) ||
                item.descripcion.toLowerCase().includes(busqueda);

            const cumpleEstado = filtroEstado === '' || item.estado === filtroEstado;
            const cumpleTipo = filtroTipo === '' || item.tipo === filtroTipo;
            const cumpleFecha = filtroFecha === '' || item.fecha === filtroFecha;

            return cumpleBusqueda && cumpleEstado && cumpleTipo && cumpleFecha;

        });

        activosTabla.innerHTML = '';

        if(activosFiltrados.length === 0){

            const filaVacia = document.createElement('tr');
            const celdaVacia = document.createElement('td');

            celdaVacia.colSpan = 6;
            celdaVacia.className = 'empty-table';
            celdaVacia.textContent = 'No hay activos registrados';

            filaVacia.appendChild(celdaVacia);
            activosTabla.appendChild(filaVacia);
            return;
        }

        activosFiltrados.forEach(function(item){

            const fila = document.createElement('tr');
            fila.dataset.registroId = item.id;
            const acciones = document.createElement('td');
            const editarBtn = document.createElement('button');
            const eliminarBtn = document.createElement('button');

            editarBtn.type = 'button';
            editarBtn.textContent = 'Editar';
            editarBtn.className = 'btn-table';
            editarBtn.addEventListener('click', function(){

                activoEditandoId = item.id;
                codigo.value = item.codigo;
                nombre.value = item.nombre;
                tipo.value = item.tipo;
                estado.value = item.estado;
                fecha.value = item.fecha;
                descripcion.value = item.descripcion;
                guardarActivoBtn.textContent = 'Actualizar Activo';
                cancelarEdicionActivo.style.display = 'inline-block';
            });

            eliminarBtn.type = 'button';
            eliminarBtn.textContent = 'Eliminar';
            eliminarBtn.className = 'btn-table btn-danger';
            eliminarBtn.addEventListener('click', function(){

                mostrarConfirmacionPersonalizada('Â¿EstÃ¡ seguro de eliminar este activo?', function(){

                    const asignaciones = obtenerAsignacionesRegistradas();
                    const mantenimientos = obtenerMantenimientosRegistrados();
                    const bajas = obtenerBajasRegistradas();

                    const asignacionesRestantes = asignaciones.filter(function(asignacion){

                        return asignacion.activoId !== item.id;
                    });

                    const mantenimientosRestantes = mantenimientos.filter(function(mantenimiento){

                        return mantenimiento.activoId !== item.id;
                    });

                    const bajasRestantes = bajas.filter(function(baja){

                        return baja.activoId !== item.id;
                    });

                    guardarArrayStorage(STORAGE_KEYS.asignaciones, asignacionesRestantes);
                    guardarArrayStorage(STORAGE_KEYS.mantenimientos, mantenimientosRestantes);
                    guardarArrayStorage(STORAGE_KEYS.bajas, bajasRestantes);

                    activos = activos.filter(function(activoGuardado){

                        return activoGuardado.id !== item.id;

                    });

                    guardarActivos();
                    renderizarActivos();
                    actualizarSelectoresRelacionados();
                    if(window.refrescarModuloAsignaciones){
                        window.refrescarModuloAsignaciones();
                    }
                    if(window.refrescarModuloMantenimientos){
                        window.refrescarModuloMantenimientos();
                    }
                    if(window.refrescarModuloBajas){
                        window.refrescarModuloBajas();
                    }
                    actualizarDashboard();

                    registrarActividad('Activo eliminado: ' + item.codigo + ' - ' + item.nombre);
                    mostrarNotificacion('Activo eliminado correctamente', 'info');

                    if(activoEditandoId === item.id){

                        limpiarFormularioActivo();
                    }
                });
            });

            acciones.appendChild(editarBtn);
            acciones.appendChild(eliminarBtn);

            fila.appendChild(crearCeldaTabla(item.codigo));
            fila.appendChild(crearCeldaTabla(item.nombre));
            fila.appendChild(crearCeldaTabla(item.tipo));
            fila.appendChild(crearCeldaTabla(item.estado));
            fila.appendChild(crearCeldaTabla(item.fecha));
            fila.appendChild(acciones);

            activosTabla.appendChild(fila);

        });
    }

    function validarActivo(){

        let valido = true;

        if(!validarCampo(codigo, 'Ingrese el cÃ³digo')){
            valido = false;
        }else if(activos.some(function(item){

            return item.codigo.toLowerCase() === codigo.value.trim().toLowerCase() &&
                item.id !== activoEditandoId;

        })){

            mostrarError(codigo, 'El cÃ³digo ya existe');
            valido = false;
        }

        if(!validarCampo(nombre, 'Ingrese el nombre del activo')){
            valido = false;
        }

        if(tipo.value === ''){

            mostrarError(tipo, 'Seleccione un tipo');
            valido = false;

        }else{

            mostrarExito(tipo);
        }

        if(estado.value === ''){

            mostrarError(estado, 'Seleccione un estado');
            valido = false;

        }else{

            mostrarExito(estado);
        }

        if(fecha.value === ''){

            mostrarError(fecha, 'Seleccione una fecha');
            valido = false;

        }else{

            mostrarExito(fecha);
        }

        if(descripcion.value.trim().length < 10){

            mostrarError(descripcion, 'La descripciÃ³n debe tener mÃ­nimo 10 caracteres');
            valido = false;

        }else{

            mostrarExito(descripcion);
        }

        return valido;
    }

    activoForm.addEventListener('submit', function(e){

        e.preventDefault();

        const formularioValido = validarActivo();

        if(formularioValido){

            const datosActivo = {
                id: activoEditandoId || Date.now().toString(),
                codigo: codigo.value.trim(),
                nombre: nombre.value.trim(),
                tipo: tipo.value,
                estado: estado.value,
                fecha: fecha.value,
                descripcion: descripcion.value.trim()
            };

            if(activoEditandoId){

                activos = activos.map(function(item){

                    return item.id === activoEditandoId ? datosActivo : item;

                });

                mostrarNotificacion('Activo actualizado correctamente', 'success');
                registrarActividad('Activo actualizado: ' + datosActivo.codigo + ' - ' + datosActivo.nombre);

            }else{

                activos.push(datosActivo);
                mostrarNotificacion('Activo registrado correctamente', 'success');
                registrarActividad('Activo registrado: ' + datosActivo.codigo + ' - ' + datosActivo.nombre);
            }

            guardarActivos();
            reconciliarEstadoActivo(datosActivo.id);
            activos = obtenerActivosRegistrados();
            limpiarFormularioActivo();
            renderizarActivos();
            actualizarSelectActivos();
            actualizarDashboard();
        }

        if(!formularioValido){
            mostrarNotificacion('Revisa los datos del activo', 'error');
        }

    });

    buscarActivo.addEventListener('input', renderizarActivos);
    if(filtroEstadoActivo){
        filtroEstadoActivo.addEventListener('change', renderizarActivos);
    }
    if(filtroTipoActivo){
        filtroTipoActivo.addEventListener('change', renderizarActivos);
    }
    if(filtroFechaActivo){
        filtroFechaActivo.addEventListener('change', renderizarActivos);
    }
    if(limpiarFiltrosActivos){

        limpiarFiltrosActivos.addEventListener('click', function(){

            if(filtroEstadoActivo){
                filtroEstadoActivo.value = '';
            }

            if(filtroTipoActivo){
                filtroTipoActivo.value = '';
            }

            if(filtroFechaActivo){
                filtroFechaActivo.value = '';
            }

            renderizarActivos();
        });
    }
    cancelarEdicionActivo.addEventListener('click', limpiarFormularioActivo);

    window.refrescarModuloActivos = function(){

        activos = obtenerActivosRegistrados();
        renderizarActivos();
        actualizarSelectActivos();
        actualizarDashboard();
    };

    limpiarFormularioActivo();
    renderizarActivos();
    actualizarSelectActivos();

}


function crearCeldaTabla(texto){

    const celda = document.createElement('td');
    celda.textContent = texto;
    return celda;
}

function crearBotonTabla(texto, className, onClick){

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.textContent = texto;
    boton.className = className;
    boton.addEventListener('click', onClick);
    return boton;
}

function mantenimientoActivoParaActivo(activoId){

    return obtenerMantenimientosRegistrados().some(function(item){

        return item.activoId === activoId && item.estado !== 'Activo';
    });
}

function obtenerEstadoRealActivo(activoId){

    const tieneBaja = obtenerBajasRegistradas().some(function(item){

        return item.activoId === activoId;
    });

    if(tieneBaja){
        return 'Dado de baja';
    }

    if(mantenimientoActivoParaActivo(activoId)){
        return 'En mantenimiento';
    }

    const tieneAsignacion = obtenerAsignacionesRegistradas().some(function(item){

        return item.activoId === activoId;
    });

    if(tieneAsignacion){
        return 'Asignado';
    }

    return 'Disponible';
}

function reconciliarEstadoActivo(activoId){

    const activos = obtenerActivosRegistrados().map(function(item){

        if(item.id === activoId){

            return Object.assign({}, item, {
                estado: obtenerEstadoRealActivo(activoId)
            });
        }

        return item;

    });

    guardarArrayStorage(STORAGE_KEYS.activos, activos);

    if(window.refrescarModuloActivos){

        window.refrescarModuloActivos();

    }else{

        actualizarSelectoresRelacionados();
        actualizarDashboard();
    }
}

function actualizarEstadoActivo(activoId){

    reconciliarEstadoActivo(activoId);
}

function reconciliarEstadosActivos(){

    const activos = obtenerActivosRegistrados().map(function(item){

        return Object.assign({}, item, {
            estado: obtenerEstadoRealActivo(item.id)
        });
    });

    guardarArrayStorage(STORAGE_KEYS.activos, activos);

    if(window.refrescarModuloActivos){
        window.refrescarModuloActivos();
    }else{
        actualizarSelectoresRelacionados();
        actualizarDashboard();
    }
}

function obtenerTextoActivo(activoId){

    const activoEncontrado = obtenerActivosRegistrados().find(function(item){

        return item.id === activoId;

    });

    return activoEncontrado ? activoEncontrado.codigo + ' - ' + activoEncontrado.nombre : 'Activo eliminado';
}

function obtenerTextoUsuario(usuarioId){

    const usuarioEncontrado = obtenerUsuariosRegistrados().find(function(item){

        return item.id === usuarioId;

    });

    return usuarioEncontrado ? usuarioEncontrado.nombre + ' (' + usuarioEncontrado.usuario + ')' : 'Usuario eliminado';
}

const mantenimientoForm = document.getElementById('mantenimientoForm');

if(mantenimientoForm){

    const activo = document.getElementById('activoMantenimiento');
    const tipo = document.getElementById('tipoMantenimiento');
    const fecha = document.getElementById('fechaMantenimiento');
    const descripcion = document.getElementById('descripcionMantenimiento');
    const estado = document.getElementById('estadoFinal');
    const buscarMantenimiento = document.getElementById('buscarMantenimiento');
    const mantenimientosTabla = document.getElementById('mantenimientosTabla');
    const guardarMantenimientoBtn = document.getElementById('guardarMantenimientoBtn');
    const cancelarEdicionMantenimiento = document.getElementById('cancelarEdicionMantenimiento');

    let mantenimientos = obtenerMantenimientosRegistrados();
    let mantenimientoEditandoId = null;

    function guardarMantenimientos(){

        guardarArrayStorage(STORAGE_KEYS.mantenimientos, mantenimientos);
    }

    function limpiarFormularioMantenimiento(){

        mantenimientoForm.reset();
        mantenimientoEditandoId = null;
        guardarMantenimientoBtn.textContent = 'Guardar';
        cancelarEdicionMantenimiento.style.display = 'none';
    }

    function renderizarMantenimientos(){

        const busqueda = buscarMantenimiento.value.trim().toLowerCase();
        mantenimientos = obtenerMantenimientosRegistrados();

        const lista = mantenimientos.filter(function(item){

            return obtenerTextoActivo(item.activoId).toLowerCase().includes(busqueda) ||
                item.tipo.toLowerCase().includes(busqueda) ||
                item.estado.toLowerCase().includes(busqueda) ||
                item.descripcion.toLowerCase().includes(busqueda);

        });

        mantenimientosTabla.innerHTML = '';

        if(lista.length === 0){

            const filaVacia = document.createElement('tr');
            const celdaVacia = document.createElement('td');

            celdaVacia.colSpan = 6;
            celdaVacia.className = 'empty-table';
            celdaVacia.textContent = 'No hay mantenimientos registrados';
            filaVacia.appendChild(celdaVacia);
            mantenimientosTabla.appendChild(filaVacia);
            return;
        }

        lista.forEach(function(item){

            const fila = document.createElement('tr');
            fila.dataset.registroId = item.id;
            const acciones = document.createElement('td');

            const editarBtn = crearBotonTabla('Editar', 'btn-table', function(){

                mantenimientoEditandoId = item.id;
                activo.value = item.activoId;
                tipo.value = item.tipo;
                fecha.value = item.fecha;
                descripcion.value = item.descripcion;
                estado.value = item.estado;
                guardarMantenimientoBtn.textContent = 'Actualizar';
                cancelarEdicionMantenimiento.style.display = 'inline-block';
            });

            const eliminarBtn = crearBotonTabla('Eliminar', 'btn-table btn-danger', function(){

                mostrarConfirmacionPersonalizada('Â¿EstÃ¡ seguro de eliminar este mantenimiento?', function(){

                    mantenimientos = mantenimientos.filter(function(mantenimientoGuardado){

                        return mantenimientoGuardado.id !== item.id;

                    });

                    guardarMantenimientos();
                    reconciliarEstadoActivo(item.activoId);
                    renderizarMantenimientos();
                    actualizarDashboard();
                    registrarActividad('Mantenimiento eliminado de: ' + obtenerTextoActivo(item.activoId));
                    mostrarNotificacion('Mantenimiento eliminado correctamente', 'info');

                    if(mantenimientoEditandoId === item.id){
                        limpiarFormularioMantenimiento();
                    }
                });
            });

            acciones.appendChild(editarBtn);
            acciones.appendChild(eliminarBtn);

            fila.appendChild(crearCeldaTabla(obtenerTextoActivo(item.activoId)));
            fila.appendChild(crearCeldaTabla(item.tipo));
            fila.appendChild(crearCeldaTabla(item.fecha));
            fila.appendChild(crearCeldaTabla(item.estado));
            fila.appendChild(crearCeldaTabla(item.descripcion));
            fila.appendChild(acciones);
            mantenimientosTabla.appendChild(fila);

        });
    }

    mantenimientoForm.addEventListener('submit', function(e){

        e.preventDefault();

        let valido = true;

        if(activo.value === ''){

            mostrarError(activo, 'Seleccione un activo');
            valido = false;

        }else{

            mostrarExito(activo);
        }

        if(tipo.value === ''){

            mostrarError(tipo, 'Seleccione un tipo');
            valido = false;

        }else{

            mostrarExito(tipo);
        }

        if(fecha.value === ''){

            mostrarError(fecha, 'Seleccione una fecha');
            valido = false;

        }else{

            mostrarExito(fecha);
        }

        if(descripcion.value.trim().length < 10){

            mostrarError(descripcion, 'MÃ­nimo 10 caracteres');
            valido = false;

        }else{

            mostrarExito(descripcion);
        }

        if(estado.value === ''){

            mostrarError(estado, 'Seleccione un estado');
            valido = false;

        }else{

            mostrarExito(estado);
        }

        if(valido){

            const mantenimientoAnterior = mantenimientos.find(function(item){

                return item.id === mantenimientoEditandoId;
            });

            const datosMantenimiento = {
                id: mantenimientoEditandoId || Date.now().toString(),
                activoId: activo.value,
                tipo: tipo.value,
                fecha: fecha.value,
                descripcion: descripcion.value.trim(),
                estado: estado.value
            };

            if(mantenimientoEditandoId){

                mantenimientos = mantenimientos.map(function(item){

                    return item.id === mantenimientoEditandoId ? datosMantenimiento : item;

                });

                registrarActividad('Mantenimiento actualizado de: ' + obtenerTextoActivo(datosMantenimiento.activoId));
                mostrarNotificacion('Mantenimiento actualizado correctamente', 'success');

            }else{

                mantenimientos.push(datosMantenimiento);
                registrarActividad('Mantenimiento registrado para: ' + obtenerTextoActivo(datosMantenimiento.activoId));
                mostrarNotificacion('Mantenimiento registrado', 'success');
            }

            guardarMantenimientos();
            if(mantenimientoAnterior && mantenimientoAnterior.activoId !== datosMantenimiento.activoId){
                reconciliarEstadoActivo(mantenimientoAnterior.activoId);
            }
            reconciliarEstadoActivo(datosMantenimiento.activoId);
            renderizarMantenimientos();
            actualizarDashboard();
            limpiarFormularioMantenimiento();
        }

        if(!valido){
            mostrarNotificacion('Revisa los datos del mantenimiento', 'error');
        }

    });

    buscarMantenimiento.addEventListener('input', renderizarMantenimientos);
    cancelarEdicionMantenimiento.addEventListener('click', limpiarFormularioMantenimiento);

    window.refrescarModuloMantenimientos = function(){

        mantenimientos = obtenerMantenimientosRegistrados();
        renderizarMantenimientos();
        actualizarDashboard();
    };

    limpiarFormularioMantenimiento();
    renderizarMantenimientos();
}



const asignacionForm = document.getElementById('asignacionForm');

if(asignacionForm){

    const activo = document.getElementById('activoAsignacion');
    const usuario = document.getElementById('usuarioAsignacion');
    const fecha = document.getElementById('fechaAsignacion');
    const buscarAsignacion = document.getElementById('buscarAsignacion');
    const asignacionesTabla = document.getElementById('asignacionesTabla');
    const guardarAsignacionBtn = document.getElementById('guardarAsignacionBtn');
    const cancelarEdicionAsignacion = document.getElementById('cancelarEdicionAsignacion');

    let asignaciones = obtenerAsignacionesRegistradas();
    let asignacionEditandoId = null;

    function guardarAsignaciones(){

        guardarArrayStorage(STORAGE_KEYS.asignaciones, asignaciones);
    }

    function limpiarFormularioAsignacion(){

        asignacionForm.reset();
        asignacionEditandoId = null;
        guardarAsignacionBtn.textContent = 'Asignar';
        cancelarEdicionAsignacion.style.display = 'none';
    }

    function renderizarAsignaciones(){

        asignaciones = obtenerAsignacionesRegistradas();
        const busqueda = buscarAsignacion.value.trim().toLowerCase();

        const lista = asignaciones.filter(function(item){

            return obtenerTextoActivo(item.activoId).toLowerCase().includes(busqueda) ||
                obtenerTextoUsuario(item.usuarioId).toLowerCase().includes(busqueda) ||
                item.fecha.toLowerCase().includes(busqueda);
        });

        asignacionesTabla.innerHTML = '';

        if(lista.length === 0){

            const filaVacia = document.createElement('tr');
            const celdaVacia = document.createElement('td');

            celdaVacia.colSpan = 4;
            celdaVacia.className = 'empty-table';
            celdaVacia.textContent = 'No hay asignaciones registradas';

            filaVacia.appendChild(celdaVacia);
            asignacionesTabla.appendChild(filaVacia);
            return;
        }

        lista.forEach(function(item){

            const fila = document.createElement('tr');
            fila.dataset.registroId = item.id;
            const acciones = document.createElement('td');

            const editarBtn = crearBotonTabla('Editar', 'btn-table', function(){

                asignacionEditandoId = item.id;
                agregarOpcionActivoSiFalta(activo, item.activoId);
                activo.value = item.activoId;
                usuario.value = item.usuarioId;
                fecha.value = item.fecha;
                guardarAsignacionBtn.textContent = 'Actualizar';
                cancelarEdicionAsignacion.style.display = 'inline-block';
            });

            const eliminarBtn = crearBotonTabla('Eliminar', 'btn-table btn-danger', function(){

                mostrarConfirmacionPersonalizada('Â¿EstÃ¡ seguro de eliminar esta asignaciÃ³n?', function(){

                    asignaciones = asignaciones.filter(function(asignacionGuardada){

                        return asignacionGuardada.id !== item.id;

                    });

                    guardarAsignaciones();
                    reconciliarEstadoActivo(item.activoId);
                    renderizarAsignaciones();
                    actualizarSelectActivos();
                    actualizarDashboard();
                    registrarActividad('AsignaciÃ³n eliminada de: ' + obtenerTextoActivo(item.activoId));
                    mostrarNotificacion('AsignaciÃ³n eliminada correctamente', 'info');

                    if(asignacionEditandoId === item.id){
                        limpiarFormularioAsignacion();
                    }
                });
            });

            acciones.appendChild(editarBtn);
            acciones.appendChild(eliminarBtn);

            fila.appendChild(crearCeldaTabla(obtenerTextoActivo(item.activoId)));
            fila.appendChild(crearCeldaTabla(obtenerTextoUsuario(item.usuarioId)));
            fila.appendChild(crearCeldaTabla(item.fecha));
            fila.appendChild(acciones);

            asignacionesTabla.appendChild(fila);

        });
    }

    asignacionForm.addEventListener('submit', function(e){

        e.preventDefault();

        let valido = true;

        if(activo.value === ''){

            mostrarError(activo, 'Seleccione un activo');
            valido = false;

        }else{

            mostrarExito(activo);
        }

        if(usuario.value === ''){

            mostrarError(usuario, 'Seleccione un usuario');
            valido = false;

        }else{

            mostrarExito(usuario);
        }

        if(fecha.value === ''){

            mostrarError(fecha, 'Seleccione una fecha');
            valido = false;

        }else{

            mostrarExito(fecha);
        }

        if(activo.value !== ''){

            const activoSeleccionado = obtenerActivosRegistrados().find(function(item){

                return item.id === activo.value;

            });

            const yaAsignado = asignaciones.some(function(item){

                return item.activoId === activo.value && item.id !== asignacionEditandoId;

            });
            const asignacionActual = asignaciones.find(function(item){

                return item.id === asignacionEditandoId;
            });
            const esActivoActualEnEdicion = asignacionActual && asignacionActual.activoId === activo.value;

            if(!activoSeleccionado){

                mostrarError(activo, 'Seleccione un activo vÃ¡lido');
                valido = false;

            }else if(activoSeleccionado.estado === 'Dado de baja'){

                mostrarError(activo, 'No se puede asignar un activo dado de baja');
                valido = false;

            }else if(activoSeleccionado.estado !== 'Disponible' && !esActivoActualEnEdicion){

                mostrarError(activo, 'Solo se pueden asignar activos disponibles');
                valido = false;

            }else if(yaAsignado){

                mostrarError(activo, 'Este activo ya estÃ¡ asignado');
                valido = false;
            }
        }

        if(valido){

            const datosAsignacion = {
                id: asignacionEditandoId || Date.now().toString(),
                activoId: activo.value,
                usuarioId: usuario.value,
                fecha: fecha.value
            };

            const asignacionAnterior = asignaciones.find(function(item){

                return item.id === asignacionEditandoId;

            });

            if(asignacionEditandoId){

                asignaciones = asignaciones.map(function(item){

                    return item.id === asignacionEditandoId ? datosAsignacion : item;

                });

                registrarActividad('AsignaciÃ³n actualizada para: ' + obtenerTextoActivo(datosAsignacion.activoId));
                mostrarNotificacion('AsignaciÃ³n actualizada correctamente', 'success');

            }else{

                asignaciones.push(datosAsignacion);
                registrarActividad('AsignaciÃ³n registrada para: ' + obtenerTextoActivo(datosAsignacion.activoId));
                mostrarNotificacion('Activo asignado correctamente', 'success');
            }

            guardarAsignaciones();
            if(asignacionAnterior && asignacionAnterior.activoId !== datosAsignacion.activoId){
                reconciliarEstadoActivo(asignacionAnterior.activoId);
            }
            reconciliarEstadoActivo(datosAsignacion.activoId);
            renderizarAsignaciones();
            actualizarSelectActivos();
            actualizarDashboard();
            limpiarFormularioAsignacion();
        }

        if(!valido){
            mostrarNotificacion('Revisa los datos de la asignaciÃ³n', 'error');
        }

    });

    buscarAsignacion.addEventListener('input', renderizarAsignaciones);
    cancelarEdicionAsignacion.addEventListener('click', limpiarFormularioAsignacion);

    window.refrescarModuloAsignaciones = function(){

        asignaciones = obtenerAsignacionesRegistradas();
        renderizarAsignaciones();
        actualizarSelectActivos();
        actualizarDashboard();
    };

    limpiarFormularioAsignacion();
    renderizarAsignaciones();
    actualizarSelectoresRelacionados();

}



const bajaForm = document.getElementById('bajaForm');

if(bajaForm){

    const activoBaja = document.getElementById('activoBaja');
    const codigoBaja = document.getElementById('codigoBaja');
    const tipoBaja = document.getElementById('tipoBaja');
    const descripcionBaja = document.getElementById('descripcionBaja');
    const buscarBaja = document.getElementById('buscarBaja');
    const bajasTabla = document.getElementById('bajasTabla');
    const guardarBajaBtn = document.getElementById('guardarBajaBtn');
    const cancelarEdicionBaja = document.getElementById('cancelarEdicionBaja');

    let bajas = obtenerBajasRegistradas();
    let bajaEditandoId = null;

    function guardarBajas(){

        guardarArrayStorage(STORAGE_KEYS.bajas, bajas);
    }

    function limpiarFormularioBaja(){

        bajaForm.reset();
        codigoBaja.value = '';
        tipoBaja.value = '';
        bajaEditandoId = null;
        guardarBajaBtn.textContent = 'Dar de Baja';
        cancelarEdicionBaja.style.display = 'none';
    }

    function renderizarBajas(){

        bajas = obtenerBajasRegistradas();
        const busqueda = buscarBaja.value.trim().toLowerCase();

        const lista = bajas.filter(function(item){

            return obtenerTextoActivo(item.activoId).toLowerCase().includes(busqueda) ||
                item.codigo.toLowerCase().includes(busqueda) ||
                item.tipo.toLowerCase().includes(busqueda) ||
                item.descripcion.toLowerCase().includes(busqueda) ||
                item.fecha.toLowerCase().includes(busqueda);

        });

        bajasTabla.innerHTML = '';

        if(lista.length === 0){

            const filaVacia = document.createElement('tr');
            const celdaVacia = document.createElement('td');

            celdaVacia.colSpan = 6;
            celdaVacia.className = 'empty-table';
            celdaVacia.textContent = 'No hay bajas registradas';
            filaVacia.appendChild(celdaVacia);
            bajasTabla.appendChild(filaVacia);
            return;
        }

        lista.forEach(function(item){

            const fila = document.createElement('tr');
            fila.dataset.registroId = item.id;
            const acciones = document.createElement('td');

            const editarBtn = crearBotonTabla('Editar', 'btn-table', function(){

                bajaEditandoId = item.id;
                activoBaja.value = item.activoId;
                codigoBaja.value = item.codigo;
                tipoBaja.value = item.tipo;
                descripcionBaja.value = item.descripcion;
                guardarBajaBtn.textContent = 'Actualizar Baja';
                cancelarEdicionBaja.style.display = 'inline-block';
            });

            const eliminarBtn = crearBotonTabla('Eliminar', 'btn-table btn-danger', function(){

                mostrarConfirmacionPersonalizada('Â¿EstÃ¡ seguro de eliminar esta baja?', function(){

                    bajas = bajas.filter(function(bajaGuardada){

                        return bajaGuardada.id !== item.id;

                    });

                    guardarBajas();
                    reconciliarEstadoActivo(item.activoId);
                    renderizarBajas();
                    actualizarSelectoresRelacionados();
                    actualizarDashboard();
                    registrarActividad('Baja eliminada de: ' + item.codigo);
                    mostrarNotificacion('Baja eliminada correctamente', 'info');

                    if(bajaEditandoId === item.id){
                        limpiarFormularioBaja();
                    }
                });
            });

            acciones.appendChild(editarBtn);
            acciones.appendChild(eliminarBtn);

            fila.appendChild(crearCeldaTabla(obtenerTextoActivo(item.activoId)));
            fila.appendChild(crearCeldaTabla(item.codigo));
            fila.appendChild(crearCeldaTabla(item.tipo));
            fila.appendChild(crearCeldaTabla(item.descripcion));
            fila.appendChild(crearCeldaTabla(item.fecha));
            fila.appendChild(acciones);
            bajasTabla.appendChild(fila);

        });
    }

    activoBaja.addEventListener('change', function(){

        const activoSeleccionado = obtenerActivosRegistrados().find(function(activo){

            return activo.id === activoBaja.value;

        });

        if(activoSeleccionado){

            codigoBaja.value = activoSeleccionado.codigo;
            tipoBaja.value = activoSeleccionado.tipo;

        }else{

            codigoBaja.value = '';
            tipoBaja.value = '';
        }

    });

    bajaForm.addEventListener('submit', function(e){

        e.preventDefault();

        let valido = true;

        if(activoBaja.value === ''){

            mostrarError(activoBaja, 'Seleccione un activo');
            valido = false;

        }else{

            mostrarExito(activoBaja);
        }

        if(!validarCampo(codigoBaja, 'Ingrese el cÃ³digo del activo')){
            valido = false;
        }

        if(tipoBaja.value === ''){

            mostrarError(tipoBaja, 'Seleccione un tipo');
            valido = false;

        }else{

            mostrarExito(tipoBaja);
        }

        if(descripcionBaja.value.trim().length < 10){

            mostrarError(
                descripcionBaja,
                'La descripciÃ³n debe tener mÃ­nimo 10 caracteres'
            );

            valido = false;

        }else{

            mostrarExito(descripcionBaja);
        }

        const activoSeleccionado = obtenerActivosRegistrados().find(function(activo){

            return activo.id === activoBaja.value;

        });

        const bajaExistente = bajas.find(function(item){

            return item.activoId === activoBaja.value && item.id !== bajaEditandoId;
        });

        const esMismoActivoEnEdicion = bajaEditandoId && bajas.some(function(item){

            return item.id === bajaEditandoId && item.activoId === activoBaja.value;
        });

        if(valido && (
            !activoSeleccionado ||
            (((activoSeleccionado.estado === 'Dado de baja') || bajaExistente) && !esMismoActivoEnEdicion)
        )){

            mostrarError(activoBaja, 'Este activo ya fue dado de baja');
            valido = false;
        }

        if(valido){

            mostrarConfirmacionPersonalizada('Â¿EstÃ¡ seguro de dar de baja este activo?', function(){

                const bajaAnterior = bajas.find(function(item){

                    return item.id === bajaEditandoId;
                });

                const datosBaja = {
                    id: bajaEditandoId || Date.now().toString(),
                    activoId: activoBaja.value,
                    codigo: codigoBaja.value.trim(),
                    tipo: tipoBaja.value,
                    descripcion: descripcionBaja.value.trim(),
                    fecha: new Date().toISOString().slice(0, 10),
                    estadoAnterior: activoSeleccionado ? activoSeleccionado.estado : 'Disponible'
                };

                if(bajaEditandoId){

                    bajas = bajas.map(function(item){

                        return item.id === bajaEditandoId ? datosBaja : item;

                    });

                    mostrarNotificacion('Baja actualizada correctamente', 'success');
                    registrarActividad('Baja actualizada de: ' + datosBaja.codigo);

                }else{

                    bajas.push(datosBaja);
                    mostrarNotificacion('Activo dado de baja correctamente', 'success');
                    registrarActividad('Activo dado de baja: ' + datosBaja.codigo);
                }

                guardarBajas();
                if(bajaAnterior && bajaAnterior.activoId !== datosBaja.activoId){

                    reconciliarEstadoActivo(bajaAnterior.activoId);
                }

                const asignaciones = obtenerAsignacionesRegistradas().filter(function(asignacion){

                    return asignacion.activoId !== datosBaja.activoId;
                });

                guardarArrayStorage(STORAGE_KEYS.asignaciones, asignaciones);
                reconciliarEstadoActivo(datosBaja.activoId);
                if(window.refrescarModuloAsignaciones){
                    window.refrescarModuloAsignaciones();
                }

                renderizarBajas();
                actualizarSelectoresRelacionados();
                actualizarDashboard();
                limpiarFormularioBaja();
            });

        }

        if(!valido){
            mostrarNotificacion('Revisa los datos de la baja', 'error');
        }

    });

    buscarBaja.addEventListener('input', renderizarBajas);
    cancelarEdicionBaja.addEventListener('click', limpiarFormularioBaja);

    window.refrescarModuloBajas = function(){

        bajas = obtenerBajasRegistradas();
        renderizarBajas();
        actualizarDashboard();
    };

    limpiarFormularioBaja();
    renderizarBajas();
}

const dashboardSections = document.querySelectorAll('.content .card');
const dashboardLinks = document.querySelectorAll('.sidebar a, .dashboard-card a');

if(dashboardSections.length > 0){

    function mostrarSeccion(id){

        dashboardSections.forEach(function(section){

            if(section.id === 'globalSearchPanel'){
                return;
            }

            section.style.display = section.id === id ? 'block' : 'none';

        });

    }

    window.mostrarSeccionDashboard = mostrarSeccion;

    dashboardLinks.forEach(function(link){

        link.addEventListener('click', function(e){

            const destino = link.getAttribute('href');

            if(destino && destino.startsWith('#')){

                e.preventDefault();

                mostrarSeccion(destino.substring(1));
            }

        });

    });

    mostrarSeccion('menu');
}

const cerrarSesionBtn = document.getElementById('cerrarSesionBtn');

if(cerrarSesionBtn){

    cerrarSesionBtn.addEventListener('click', function(){

        mostrarConfirmacionPersonalizada('¿Está seguro de cerrar sesión?', function(){

            registrarActividad('Cierre de sesión');
            cerrarSesionActiva();
            window.location.href = 'index.html';
        });
    });
}

reconciliarEstadosActivos();
actualizarSelectoresRelacionados();
actualizarDashboard();
actualizarReportes();

const buscarGlobal = document.getElementById('buscarGlobal');

if(buscarGlobal){

    buscarGlobal.addEventListener('input', renderizarResultadosGlobales);
}
