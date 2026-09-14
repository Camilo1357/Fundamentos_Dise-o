// =========================================================
// OBTENER ID DE LA COMPRA
// =========================================================

const parametros =
    new URLSearchParams(
        window.location.search
    );

const idCompra =
    parametros.get("id_compra");


// =========================================================
// ELEMENTOS HTML
// =========================================================

const nombreCompra =
    document.getElementById("order-name");

const detallesCompra =
    document.getElementById("order-details");

const formulario =
    document.getElementById("return-form");

const motivo =
    document.getElementById("motivo");

const resultado =
    document.getElementById("return-result");

const boton =
    document.getElementById("submit-return");


// =========================================================
// VERIFICAR SI EXISTE ID DE COMPRA
// =========================================================

if (!idCompra) {

    nombreCompra.textContent =
        "Compra no encontrada";

    detallesCompra.textContent =
        "No se pudo identificar la compra.";

    boton.disabled = true;
}


// =========================================================
// CONSULTAR COMPRA
// =========================================================

if (idCompra) {

    fetch(`/api/compra/${idCompra}`)

        .then(response => {

            if (response.status === 401) {

                window.location.href = "/";
                return null;
            }

            if (!response.ok) {

                throw new Error(
                    "No se pudo consultar la compra"
                );
            }

            return response.json();
        })

        .then(data => {

            if (!data) {
                return;
            }

            if (!data.success) {

                throw new Error(
                    data.message ||
                    "No se pudo consultar la compra"
                );
            }


            // =================================================
            // LA INFORMACIÓN VIENE DENTRO DE data.compra
            // =================================================

            const compra =
                data.compra;

            const productos =
                data.productos || [];


            // =================================================
            // ID DE LA COMPRA
            // =================================================

            nombreCompra.textContent =
                `Pedido #${compra.id_compra}`;


            // =================================================
            // CALCULAR CANTIDAD DE PRODUCTOS
            // =================================================

            const cantidadProductos =
                productos.reduce(
                    (total, producto) => {

                        return total +
                            Number(
                                producto.cantidad || 0
                            );

                    },
                    0
                );


            // =================================================
            // MOSTRAR DETALLES
            // =================================================

            detallesCompra.textContent =
                `${cantidadProductos} productos · $${formatearPrecio(compra.total)}`;

        })

        .catch(error => {

            console.error(
                "ERROR CONSULTANDO COMPRA:",
                error
            );

            nombreCompra.textContent =
                "No se pudo cargar la compra";

            detallesCompra.textContent =
                "Intenta nuevamente.";

            boton.disabled = true;
        });
}


// =========================================================
// FORMATEAR PRECIO
// =========================================================

function formatearPrecio(valor) {

    return new Intl.NumberFormat(
        "es-CO",
        {
            maximumFractionDigits: 0
        }
    ).format(
        Number(valor) || 0
    );
}


// =========================================================
// ENVIAR SOLICITUD
// =========================================================

formulario.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        resultado.textContent = "";


        // ---------------------------------------------
        // Validar motivo
        // ---------------------------------------------

        if (motivo.value.trim() === "") {

            resultado.textContent =
                "Debes escribir el motivo de la devolución.";

            resultado.style.color =
                "#dc2929";

            return;
        }


        // ---------------------------------------------
        // Deshabilitar botón
        // ---------------------------------------------

        boton.disabled = true;

        boton.textContent =
            "Enviando...";


        // ---------------------------------------------
        // Enviar a Flask
        // ---------------------------------------------

        fetch(
            "/api/solicitud-devolucion",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    id_compra:
                        idCompra,

                    motivo:
                        motivo.value.trim()
                })
            }
        )

        .then(async response => {

            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "No se pudo crear la solicitud"
                );
            }

            return data;
        })

        .then(data => {

            resultado.textContent =
                `Solicitud creada correctamente. Código: ${data.codigo_devolucion}`;

            resultado.style.color =
                "#195544";

            motivo.value = "";

            boton.textContent =
                "Solicitud creada";
        })

        .catch(error => {

            console.error(
                "ERROR CREANDO DEVOLUCIÓN:",
                error
            );

            resultado.textContent =
                error.message;

            resultado.style.color =
                "#dc2929";

            boton.disabled = false;

            boton.textContent =
                "Solicitar devolución";
        });

    }
);