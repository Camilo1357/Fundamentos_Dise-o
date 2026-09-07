// =========================================
// OBTENER ELEMENTOS DEL HTML
// =========================================

// Buscamos el formulario de login
const formulario = document.getElementById("login-form");

// Buscamos el campo de correo
const email = document.getElementById("email");

// Buscamos el campo de contraseña
const password = document.getElementById("password");

// Buscamos el botón que muestra/oculta la contraseña
const showPassword = document.getElementById("show-password");

// Buscamos el lugar donde mostraremos mensajes
const resultado = document.getElementById("login-result");


// =========================================
// MOSTRAR / OCULTAR CONTRASEÑA
// =========================================

// Escuchamos cuando el usuario hace click
showPassword.addEventListener("click", function () {

    // Si actualmente es de tipo password...
    if (password.type === "password") {

        // Lo convertimos en texto para poder verlo
        password.type = "text";

        // Cambiamos el símbolo del botón
        showPassword.textContent = "◉";

    } else {

        // Volvemos a ocultar la contraseña
        password.type = "password";

        // Cambiamos nuevamente el símbolo
        showPassword.textContent = "○";
    }

});


// =========================================
// LOGIN
// =========================================

// Escuchamos cuando el formulario se envía
formulario.addEventListener("submit", function (event) {

    // Evitamos que el navegador recargue la página
    event.preventDefault();


    // Obtenemos los valores escritos por el usuario
    const correoIngresado = email.value;
    const contraseñaIngresada = password.value;


    // Por ahora NO estamos conectando Flask.
    // Simplemente simulamos un login.

    if (correoIngresado !== "" && contraseñaIngresada !== "") {

        resultado.textContent = "Datos ingresados correctamente.";

    } else {

        resultado.textContent = "Por favor completa todos los campos.";
    }

});