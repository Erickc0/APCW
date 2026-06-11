const form = document.getElementById("formEstudiante");
const tabla = document.getElementById("tablaEstudiantes");

let estudiantes =
JSON.parse(localStorage.getItem("estudiantes")) || [];

mostrarEstudiantes();

form.addEventListener("submit", function(e){

    e.preventDefault();

    if(validarFormulario()){

        const estudiante = {
            cedula: document.getElementById("cedula").value,
            apellidos: document.getElementById("apellidos").value,
            nombres: document.getElementById("nombres").value,
            direccion: document.getElementById("direccion").value,
            telefono: document.getElementById("telefono").value,
            correo: document.getElementById("correo").value,
            facultad: document.getElementById("facultad").value,
            nivel: document.getElementById("nivel").value,
            paralelo: document.getElementById("paralelo").value
        };

        estudiantes.push(estudiante);

        localStorage.setItem(
            "estudiantes",
            JSON.stringify(estudiantes)
        );

        mostrarEstudiantes();

        form.reset();

        alert("Estudiante registrado correctamente");
    }
});

function validarFormulario(){

    let valido = true;

    const cedula = document.getElementById("cedula");
    const apellidos = document.getElementById("apellidos");
    const nombres = document.getElementById("nombres");
    const direccion = document.getElementById("direccion");
    const telefono = document.getElementById("telefono");
    const correo = document.getElementById("correo");
    const facultad = document.getElementById("facultad");
    const nivel = document.getElementById("nivel");
    const paralelo = document.getElementById("paralelo");

    const regCedula = /^\d{10}$/;
    const regTexto = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,40}$/;
    const regDireccion = /^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s#\-\.]{5,100}$/;
    const regTelefono = /^\d{10}$/;
    const regCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regParalelo = /^[A-Z]{1}$/;

    limpiarErrores();

    if(!regCedula.test(cedula.value)){
        mostrarError(cedula,"Ingrese 10 dígitos");
        valido = false;
    }

    if(!regTexto.test(apellidos.value)){
        mostrarError(apellidos,"Apellidos inválidos");
        valido = false;
    }

    if(!regTexto.test(nombres.value)){
        mostrarError(nombres,"Nombres inválidos");
        valido = false;
    }

    if(!regDireccion.test(direccion.value)){
        mostrarError(direccion,"Dirección inválida");
        valido = false;
    }

    if(!regTelefono.test(telefono.value)){
        mostrarError(telefono,"Teléfono inválido");
        valido = false;
    }

    if(!regCorreo.test(correo.value)){
        mostrarError(correo,"Correo inválido");
        valido = false;
    }

    if(facultad.value === ""){
        mostrarError(facultad,"Seleccione facultad");
        valido = false;
    }

    if(nivel.value === ""){
        mostrarError(nivel,"Seleccione nivel");
        valido = false;
    }

    if(!regParalelo.test(paralelo.value.toUpperCase())){
        mostrarError(paralelo,"Paralelo A-Z");
        valido = false;
    }

    return valido;
}

function mostrarError(input,mensaje){
    input.nextElementSibling.textContent = mensaje;
}

function limpiarErrores(){
    document.querySelectorAll("small").forEach(
        e => e.textContent=""
    );
}

function mostrarEstudiantes(){

    tabla.innerHTML = "";

    estudiantes.forEach((est,index)=>{

        tabla.innerHTML += `
            <tr>
                <td>${est.cedula}</td>
                <td>${est.apellidos}</td>
                <td>${est.nombres}</td>
                <td>${est.direccion}</td>
                <td>${est.telefono}</td>
                <td>${est.correo}</td>
                <td>${est.facultad}</td>
                <td>${est.nivel}</td>
                <td>${est.paralelo}</td>
                <td>
                    <button class="eliminar"
                    onclick="eliminarEstudiante(${index})">
                    Eliminar
                    </button>
                </td>
            </tr>
        `;
    });
}

function eliminarEstudiante(index){

    if(confirm("¿Desea eliminar este registro?")){

        estudiantes.splice(index,1);

        localStorage.setItem(
            "estudiantes",
            JSON.stringify(estudiantes)
        );

        mostrarEstudiantes();
    }
}
document
.getElementById("btnExportar")
.addEventListener("click", exportarJSON);

function exportarJSON() {

    const estudiantes =
        JSON.parse(localStorage.getItem("estudiantes")) || [];

    if (estudiantes.length === 0) {
        alert("No hay estudiantes registrados.");
        return;
    }

    const json = JSON.stringify(estudiantes, null, 4);

    const blob = new Blob([json], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "estudiantes.json";
    a.click();

    URL.revokeObjectURL(url);
}