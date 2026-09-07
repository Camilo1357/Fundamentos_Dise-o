// =========================================
// ELEMENTOS DEL HTML
// =========================================

const formulario = document.getElementById("create-form");

const nombre = document.getElementById("nombre");

const email = document.getElementById("email");

const password = document.getElementById("password");

const resultado = document.getElementById("create-result");


// =========================================
// CREAR CUENTA
// =========================================

formulario.addEventListener("submit", function(event) {

    // Evita que el formulario recargue la página
    event.preventDefault();


    // Comprobamos los datos
    if (password.value.length < 8) {

        resultado.textContent = "La contraseña debe tener mínimo 8 caracteres";

        return;
    }


    // Por ahora solo mostramos los datos
    resultado.textContent =
        `Cuenta preparada para ${nombre.value} (${email.value})`;

});