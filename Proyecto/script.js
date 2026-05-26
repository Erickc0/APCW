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



        if(password.value.trim().length < 6){

            mostrarError(password, 'La contraseña debe tener mínimo 6 caracteres');
            valido = false;

        }else{

            mostrarExito(password);
        }



        if(valido){

            alert('Inicio de sesión exitoso');

            window.location.href = 'menu_principal.html';
        }

    });

}




const usuarioForm = document.getElementById('usuarioForm');

if(usuarioForm){

    usuarioForm.addEventListener('submit', function(e){

        e.preventDefault();

        const nombre = document.getElementById('nombreUsuario');
        const usuario = document.getElementById('usuarioRegistro');
        const email = document.getElementById('email');
        const password = document.getElementById('passwordRegistro');

        let valido = true;



        const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/;

        if(!regexNombre.test(nombre.value.trim())){

            mostrarError(nombre, 'Solo se permiten letras');
            valido = false;

        }else{

            mostrarExito(nombre);
        }



        if(usuario.value.trim().length < 4){

            mostrarError(usuario, 'Mínimo 4 caracteres');
            valido = false;

        }else{

            mostrarExito(usuario);
        }



        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!regexEmail.test(email.value.trim())){

            mostrarError(email, 'Correo inválido');
            valido = false;

        }else{

            mostrarExito(email);
        }



        if(password.value.trim().length < 6){

            mostrarError(password, 'Mínimo 6 caracteres');
            valido = false;

        }else{

            mostrarExito(password);
        }



        if(valido){

            alert('Usuario registrado correctamente');

            usuarioForm.reset();
        }

    });

}




const activoForm = document.getElementById('activoForm');

if(activoForm){

    activoForm.addEventListener('submit', function(e){

        e.preventDefault();

        const codigo = document.getElementById('codigo');
        const nombre = document.getElementById('nombreActivo');
        const tipo = document.getElementById('tipo');
        const estado = document.getElementById('estado');
        const fecha = document.getElementById('fechaCompra');
        const descripcion = document.getElementById('descripcion');

        let valido = true;


        if(!validarCampo(codigo, 'Ingrese el código')){
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

            mostrarError(descripcion, 'La descripción debe tener mínimo 10 caracteres');
            valido = false;

        }else{

            mostrarExito(descripcion);
        }



        if(valido){

            alert('Activo registrado correctamente');

            activoForm.reset();
        }

    });

}


const mantenimientoForm = document.getElementById('mantenimientoForm');

if(mantenimientoForm){

    mantenimientoForm.addEventListener('submit', function(e){

        e.preventDefault();

        const activo = document.getElementById('activoMantenimiento');
        const tipo = document.getElementById('tipoMantenimiento');
        const fecha = document.getElementById('fechaMantenimiento');
        const descripcion = document.getElementById('descripcionMantenimiento');
        const estado = document.getElementById('estadoFinal');

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

            mostrarError(descripcion, 'Mínimo 10 caracteres');
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

            alert('Mantenimiento registrado');

            mantenimientoForm.reset();
        }

    });

}



const asignacionForm = document.getElementById('asignacionForm');

if(asignacionForm){

    asignacionForm.addEventListener('submit', function(e){

        e.preventDefault();

        const activo = document.getElementById('activoAsignacion');
        const usuario = document.getElementById('usuarioAsignacion');
        const fecha = document.getElementById('fechaAsignacion');

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

        if(valido){

            alert('Activo asignado correctamente');

            asignacionForm.reset();
        }

    });

}



const bajaForm = document.getElementById('bajaForm');

if(bajaForm){

    bajaForm.addEventListener('submit', function(e){

        e.preventDefault();

        const activo = document.getElementById('activoBaja');
        const codigo = document.getElementById('codigoBaja');
        const tipo = document.getElementById('tipoBaja');
        const descripcion = document.getElementById('descripcionBaja');

        let valido = true;


        if(activo.value === ''){

            mostrarError(activo, 'Seleccione un activo');
            valido = false;

        }else{

            mostrarExito(activo);
        }


        if(!validarCampo(codigo, 'Ingrese el código del activo')){
            valido = false;
        }


        if(tipo.value === ''){

            mostrarError(tipo, 'Seleccione un tipo');
            valido = false;

        }else{

            mostrarExito(tipo);
        }


        if(descripcion.value.trim().length < 10){

            mostrarError(
                descripcion,
                'La descripción debe tener mínimo 10 caracteres'
            );

            valido = false;

        }else{

            mostrarExito(descripcion);
        }


        if(valido){

            const confirmar = confirm(
                '¿Está seguro de dar de baja este activo?'
            );

            if(confirmar){

                alert('Activo dado de baja correctamente');

                bajaForm.reset();
            }

        }

    });

}