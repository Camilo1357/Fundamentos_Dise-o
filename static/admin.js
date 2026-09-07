// ==================================================
// VARIABLES
// ==================================================

// Aquí guardaremos las solicitudes que lleguen
// desde el backend.
//
// IMPORTANTE:
// Por ahora está vacío porque NO queremos
// inventar datos en el frontend.
let solicitudes = [];


// Solicitud que actualmente está seleccionada
let solicitudSeleccionada = null;


// Estado físico seleccionado por el empleado
let estadoProducto = "Bueno";


// ==================================================
// ELEMENTOS DEL HTML
// ==================================================

// Lista donde aparecerán las solicitudes
const lista = document.getElementById("requests-list");

// Panel donde aparecerán los detalles
const detalle = document.getElementById("detail-content");

// Mensaje que aparece cuando no hay solicitudes
const mensajeVacio = document.getElementById("empty-message");


// ==================================================
// MOSTRAR SOLICITUDES
// ==================================================

function mostrarSolicitudes() {

    // Limpiamos la lista antes de volver a mostrarla.
    //
    // Esto es importante porque posteriormente
    // podremos actualizar la lista después de
    // aprobar o rechazar una devolución.
    lista.innerHTML = "";


    // Si no existen solicitudes pendientes...
    if (solicitudes.length === 0) {

        // Mostramos el mensaje de que no hay solicitudes
        mensajeVacio.classList.remove("hidden");

        return;
    }


    // Si existen solicitudes, ocultamos el mensaje
    mensajeVacio.classList.add("hidden");


    // Recorremos todas las solicitudes
    solicitudes.forEach(function (solicitud) {

        // Creamos una nueva fila HTML
        const fila = document.createElement("div");

        // Le asignamos la clase CSS de una fila
        fila.classList.add("request-row");


        // Si esta solicitud es la que actualmente
        // está seleccionada, la resaltamos.
        if (
            solicitudSeleccionada &&
            solicitud.id === solicitudSeleccionada.id
        ) {

            fila.classList.add("selected");
        }


        // Introducimos los datos de la solicitud
        // dentro de la fila.
        //
        // IMPORTANTE:
        // Estos valores NO están escritos aquí.
        // Vienen del objeto "solicitud".
        fila.innerHTML = `

            <span>#${solicitud.id}</span>

            <span>${solicitud.fecha}</span>

            <span>${solicitud.cliente}</span>

            <span>${solicitud.producto}</span>

            <span>${solicitud.motivo}</span>

        `;


        // Cuando el empleado haga click
        // sobre esta solicitud...
        fila.addEventListener("click", function () {

            seleccionarSolicitud(solicitud);

        });


        // Añadimos la fila a la lista
        lista.appendChild(fila);

    });

}


// ==================================================
// SELECCIONAR SOLICITUD
// ==================================================

function seleccionarSolicitud(solicitud) {

    // Guardamos cuál solicitud seleccionó
    // el empleado.
    solicitudSeleccionada = solicitud;


    // Cuando seleccionamos una nueva solicitud,
    // comenzamos nuevamente con el estado
    // "Bueno".
    estadoProducto = "Bueno";


    // Mostramos los datos de esa solicitud
    // en el panel derecho.
    mostrarDetalle();


    // Volvemos a dibujar la lista para que
    // la solicitud seleccionada aparezca resaltada.
    mostrarSolicitudes();

}


// ==================================================
// MOSTRAR DETALLE DE LA SOLICITUD
// ==================================================

function mostrarDetalle() {

    // Guardamos la solicitud seleccionada
    // en una variable más corta.
    const solicitud = solicitudSeleccionada;


    // Si no hay ninguna solicitud seleccionada,
    // no hacemos nada.
    if (!solicitud) {
        return;
    }


    // Construimos el contenido del panel derecho.
    //
    // Toda esta información viene de la solicitud
    // que recibimos desde el backend.

    detalle.innerHTML = `

        <div class="detail-grid">


            <!-- ==============================
                 ID DE LA SOLICITUD
                 ============================== -->

            <div class="detail-field">

                <label>
                    ID
                </label>

                <div class="detail-value">
                    ${solicitud.id}
                </div>

            </div>


            <!-- ==============================
                 FECHA
                 ============================== -->

            <div class="detail-field">

                <label>
                    Fecha de solicitud
                </label>

                <div class="detail-value">
                    ${solicitud.fecha}
                </div>

            </div>


            <!-- ==============================
                 CLIENTE
                 ============================== -->

            <div class="detail-field full">

                <label>
                    Cliente
                </label>

                <div class="detail-value">
                    ${solicitud.cliente}
                </div>

            </div>


            <!-- ==============================
                 PRODUCTO
                 ============================== -->

            <div class="detail-field">

                <label>
                    Producto
                </label>

                <div class="detail-value">
                    ${solicitud.producto}
                </div>

            </div>


            <!-- ==============================
                 CANTIDAD
                 ============================== -->

            <div class="detail-field">

                <label>
                    Cantidad
                </label>

                <div class="detail-value">
                    ${solicitud.cantidad}
                </div>

            </div>


            <!-- ==============================
                 MOTIVO
                 ============================== -->

            <div class="detail-field full">

                <label>
                    Motivo de devolución
                </label>

                <div class="detail-value">
                    ${solicitud.motivo}
                </div>

            </div>


            <!-- ==============================
                 CÓDIGO DE DEVOLUCIÓN
                 ============================== -->

            <div class="detail-field full">

                <label>
                    Código de devolución
                </label>

                <div class="detail-value">
                    ${solicitud.codigo}
                </div>

            </div>

        </div>


        <!-- ==================================================
             ESTADO FÍSICO DEL PRODUCTO
             ================================================== -->

        <p class="status-title">
            Estado del Producto
        </p>


        <div class="status-options">


            <!-- Producto en buen estado -->

            <div
                class="status-option selected"
                data-status="Bueno">

                Bueno

            </div>


            <!-- Producto con daños -->

            <div
                class="status-option"
                data-status="Con daños">

                Con daños

            </div>


            <!-- Producto incompleto -->

            <div
                class="status-option"
                data-status="Incompleto">

                Incompleto

            </div>


        </div>


        <!-- ==================================================
             BOTONES DE DECISIÓN
             ================================================== -->

        <div class="action-buttons">


            <!-- Rechazar -->

            <button
                class="action-button reject-button"
                id="reject-button">

                Rechazar Devolución

            </button>


            <!-- Aprobar -->

            <button
                class="action-button approve-button"
                id="approve-button">

                Aprobar Reembolso

            </button>


        </div>

    `;


    // ==================================================
    // SELECCIÓN DEL ESTADO DEL PRODUCTO
    // ==================================================

    // Buscamos las tres opciones:
    // Bueno
    // Con daños
    // Incompleto

    const opcionesEstado =
        document.querySelectorAll(".status-option");


    // Recorremos las opciones
    opcionesEstado.forEach(function (opcion) {


        // Detectamos cuando el empleado
        // hace click sobre una opción.

        opcion.addEventListener("click", function () {


            // Quitamos "selected" de todas
            // las opciones.

            opcionesEstado.forEach(function (elemento) {

                elemento.classList.remove("selected");

            });


            // Agregamos "selected" solamente
            // a la opción que el empleado seleccionó.

            opcion.classList.add("selected");


            // Guardamos el estado seleccionado.

            estadoProducto =
                opcion.dataset.status;

        });

    });


    // ==================================================
    // BOTÓN APROBAR
    // ==================================================

    document
        .getElementById("approve-button")
        .addEventListener("click", function () {


            // Enviamos "aprobada" a la función
            // que procesa la devolución.

            procesarSolicitud("aprobada");

        });


    // ==================================================
    // BOTÓN RECHAZAR
    // ==================================================

    document
        .getElementById("reject-button")
        .addEventListener("click", function () {


            // Enviamos "rechazada" a la función
            // que procesa la devolución.

            procesarSolicitud("rechazada");

        });

}


// ==================================================
// PROCESAR SOLICITUD
// ==================================================

function procesarSolicitud(resultado) {


    // Si no hay solicitud seleccionada,
    // no hacemos nada.

    if (!solicitudSeleccionada) {
        return;
    }


    // ==================================================
    // DATOS QUE POSTERIORMENTE ENVIAREMOS A FLASK
    // ==================================================

    // Por ahora solamente los mostramos
    // en la consola del navegador.
    //
    // Más adelante estos mismos datos viajarán
    // mediante fetch() hacia nuestro backend.

    console.log({

        id_solicitud: solicitudSeleccionada.id,

        estado_producto: estadoProducto,

        resultado: resultado

    });


    // ==================================================
    // ELIMINAR SOLICITUD DE LA LISTA
    // ==================================================

    // Por ahora eliminamos la solicitud
    // solamente del array de JavaScript.
    //
    // IMPORTANTE:
    // Esto todavía NO elimina nada de Supabase.
    //
    // Cuando conectemos el backend, primero
    // enviaremos la información a Flask.
    //
    // Si Flask confirma que la operación fue exitosa,
    // entonces actualizaremos la interfaz.

    solicitudes = solicitudes.filter(function (solicitud) {

        return solicitud.id !== solicitudSeleccionada.id;

    });


    // Quitamos la selección actual

    solicitudSeleccionada = null;


    // Actualizamos la lista

    mostrarSolicitudes();


    // Mostramos un mensaje en el panel derecho

    detalle.innerHTML = `

        <div class="no-selection">

            <div class="selection-icon">
                ✓
            </div>

            <p>
                Solicitud procesada correctamente.
            </p>

        </div>

    `;

}


// ==================================================
// CARGA INICIAL
// ==================================================

// Al abrir la página ejecutamos esta función.
//
// Actualmente no aparecerán solicitudes porque
// el array está vacío.
//
// En el siguiente paso esta parte será reemplazada
// por una petición fetch() al backend:
//
// GET /api/solicitudes

mostrarSolicitudes();