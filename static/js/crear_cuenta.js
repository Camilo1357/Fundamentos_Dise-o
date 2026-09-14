// =========================================================
// ELEMENTOS
// =========================================================

const password = document.getElementById("password");
const botonPassword = document.getElementById("show-password");

const formulario = document.getElementById("create-form");
const resultado = document.getElementById("create-result");


// =========================================================
// MOSTRAR / OCULTAR CONTRASEÑA
// =========================================================

botonPassword.addEventListener("click", function () {

    if (password.type === "password") {

        password.type = "text";
        botonPassword.textContent = "◎";

    } else {

        password.type = "password";
        botonPassword.textContent = "◉";

    }

});


// =========================================================
// CREAR CUENTA
// =========================================================

formulario.addEventListener("submit", async function (event) {

    // Evita que el formulario haga un POST tradicional
    event.preventDefault();


    // ---------------------------------------------------------
    // OBTENER DATOS
    // ---------------------------------------------------------

    const nombre =
        document.getElementById("nombre").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const passwordValor =
        document.getElementById("password").value.trim();


    // Limpiar mensaje anterior
    resultado.textContent = "";


    // ---------------------------------------------------------
    // VALIDACIÓN
    // ---------------------------------------------------------

    if (!nombre || !email || !passwordValor) {

        resultado.textContent =
            "Todos los campos son obligatorios.";

        return;
    }


    if (passwordValor.length < 6) {

        resultado.textContent =
            "La contraseña debe tener mínimo 6 caracteres.";

        return;
    }


    // ---------------------------------------------------------
    // DATOS QUE SE ENVÍAN A FLASK
    // ---------------------------------------------------------

    const datos = {

        nombre: nombre,

        email: email,

        password: passwordValor

    };


    try {

        // -----------------------------------------------------
        // ENVIAR A FLASK
        // -----------------------------------------------------

        const response = await fetch("/registro", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify(datos)

        });


        // -----------------------------------------------------
        // LEER RESPUESTA
        // -----------------------------------------------------

        const texto = await response.text();

        console.log("STATUS:", response.status);

        console.log(
            "RESPUESTA DEL SERVIDOR:",
            texto
        );


        // -----------------------------------------------------
        // INTENTAR CONVERTIR LA RESPUESTA A JSON
        // -----------------------------------------------------

        let data;

        try {

            data = JSON.parse(texto);

        } catch (error) {

            console.error(
                "La respuesta del servidor no es JSON:",
                texto
            );

            resultado.textContent =
                "El servidor devolvió un error inesperado.";

            return;
        }


        // -----------------------------------------------------
        // CUENTA CREADA
        // -----------------------------------------------------

        if (response.ok && data.success) {

            resultado.textContent =
                data.message ||
                "Cuenta creada correctamente.";

            formulario.reset();

            return;
        }


        // -----------------------------------------------------
        // ERROR DEVUELTO POR FLASK
        // -----------------------------------------------------

        resultado.textContent =
            data.message ||
            "No se pudo crear la cuenta.";

    }


    catch (error) {

        console.error(
            "ERROR EN REGISTRO:",
            error
        );

        resultado.textContent =
            "No se pudo conectar con el servidor.";

    }

});