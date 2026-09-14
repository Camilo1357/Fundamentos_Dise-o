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

        botonPassword.textContent = "◎";

    } else {

        password.type = "password";

        botonPassword.textContent = "◉";

    }

});


// ==========================================
// LOGIN
// ==========================================

formulario.addEventListener("submit", async function (event) {

    event.preventDefault();

    const datos = new FormData(formulario);

    resultado.textContent = "";

    try {

        const response = await fetch("/login", {

            method: "POST",

            body: datos

        });

        const data = await response.json();


        // ==========================================
        // LOGIN CORRECTO
        // ==========================================

        if (response.ok && data.success) {

            window.location.href = data.redirect;

            return;

        }


        // ==========================================
        // LOGIN INCORRECTO
        // ==========================================

        if (response.status === 401) {

            resultado.textContent =
                data.message || "Correo o contraseña incorrectos.";

            return;

        }


        // ==========================================
        // OTRO ERROR
        // ==========================================

        resultado.textContent =
            data.message || "Ocurrió un error al iniciar sesión.";

    } catch (error) {

        console.error("ERROR EN LOGIN:", error);

        resultado.textContent =
            "No se pudo conectar con el servidor.";

    }

});