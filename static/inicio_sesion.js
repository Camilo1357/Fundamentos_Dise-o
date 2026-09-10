console.log("INICIO_SESION.JS CARGADO");


const formulario = document.getElementById("login-form");

const resultado = document.getElementById("login-result");

const password = document.getElementById("password");

const botonPassword = document.getElementById("show-password");


// ==========================================
// MOSTRAR / OCULTAR CONTRASEÑA
// ==========================================

botonPassword.addEventListener("click", function () {

    if (password.type === "password") {

        password.type = "text";

        botonPassword.textContent= "◎"

    } else {

        password.type = "password";

        botonPassword.textContent = "◉"

    }

});


// ==========================================
// LOGIN
// ==========================================

formulario.addEventListener("submit", function (event) {

    event.preventDefault();


    const datos = new FormData(formulario);


    resultado.textContent = "";


    fetch("/login", {

        method: "POST",

        body: datos

    })

    .then(async response => {


        // LOGIN CORRECTO
        if (response.redirected) {

            window.location.href = response.url;

            return;
        }


        // LOGIN INCORRECTO
        if (response.status === 401) {

            const data = await response.json();

            resultado.textContent = data.error;

            return;
        }


        // OTRO ERROR
        if (!response.ok) {

            throw new Error(
                "Error al iniciar sesión"
            );
        }

    })
});