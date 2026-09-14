// =========================================================
// ELEMENTOS
// =========================================================

const solicitudesContainer =
    document.getElementById("solicitudes-list");


// =========================================================
// FORMATEAR PRECIO
// =========================================================

function formatearPrecio(valor) {

    return new Intl.NumberFormat(
        "es-CO",
        {
            maximumFractionDigits: 0
        }
    ).format(valor);
}


// =========================================================
// FORMATEAR FECHA
// =========================================================

function formatearFecha(fecha) {

    return new Date(fecha).toLocaleDateString(
        "es-CO",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// =========================================================
// ESTADO
// =========================================================

function obtenerClaseEstado(estado) {

    const estadoNormalizado =
        estado.toLowerCase();


    if (estadoNormalizado === "pendiente") {

        return "estado-pendiente";
    }


    if (estadoNormalizado === "aprobada") {

        return "estado-aprobada";
    }


    if (estadoNormalizado === "rechazada") {

        return "estado-rechazada";
    }


    return "estado-default";
}


// =========================================================
// MOSTRAR PRODUCTOS
// =========================================================

function generarProductosHTML(productos) {

    if (!productos || productos.length === 0) {

        return `
            <p class="sin-productos">
                No se encontraron productos.
            </p>
        `;
    }


    let html = "";


    productos.forEach(producto => {

        html += `

            <div class="producto-row">

                <div class="producto-info">

                    <span class="producto-nombre">
                        ${producto.nombre}
                    </span>

                    <span class="producto-cantidad">
                        Cantidad: ${producto.cantidad}
                    </span>

                </div>


                <span class="producto-precio">
                    $${formatearPrecio(
                        producto.precio_unitario
                    )}
                </span>

            </div>

        `;

    });


    return html;
}


// =========================================================
// MOSTRAR SOLICITUDES
// =========================================================

function mostrarSolicitudes(solicitudes) {

    solicitudesContainer.innerHTML = "";


    if (solicitudes.length === 0) {

        solicitudesContainer.innerHTML = `

            <div class="no-solicitudes">

                <div class="no-solicitudes-icon">
                    ◇
                </div>

                <h2>
                    No hay solicitudes de devolución
                </h2>

                <p>
                    Cuando un cliente solicite una devolución,
                    aparecerá aquí.
                </p>

            </div>

        `;

        return;
    }


    solicitudes.forEach(solicitud => {

        const tarjeta =
            document.createElement("div");


        tarjeta.classList.add(
            "solicitud-card"
        );


        const esPendiente =
            solicitud.estado.toLowerCase() ===
            "pendiente";


        tarjeta.innerHTML = `

            <!-- CABECERA -->

            <div class="solicitud-header">

                <div>

                    <span class="solicitud-label">
                        SOLICITUD
                    </span>

                    <h3>
                        #${solicitud.id_solicitud}
                    </h3>

                </div>


                <span
                    class="solicitud-estado ${obtenerClaseEstado(
                        solicitud.estado
                    )}">

                    ${solicitud.estado}

                </span>

            </div>


            <div class="solicitud-line"></div>


            <!-- INFORMACIÓN GENERAL -->

            <div class="solicitud-info">


                <div class="info-item">

                    <span class="info-label">
                        CLIENTE
                    </span>

                    <span class="info-value">
                        ${solicitud.nombre_cliente}
                    </span>

                </div>


                <div class="info-item">

                    <span class="info-label">
                        COMPRA
                    </span>

                    <span class="info-value">
                        #${solicitud.id_compra}
                    </span>

                </div>


                <div class="info-item">

                    <span class="info-label">
                        FECHA
                    </span>

                    <span class="info-value">
                        ${formatearFecha(
                            solicitud.fecha_solicitud
                        )}
                    </span>

                </div>


                <div class="info-item">

                    <span class="info-label">
                        TOTAL
                    </span>

                    <span class="info-value">
                        $${formatearPrecio(
                            solicitud.total
                        )}
                    </span>

                </div>

            </div>


            <!-- PRODUCTOS -->

            <div class="productos-section">

                <span class="info-label">
                    PRODUCTOS DE LA COMPRA
                </span>


                <div class="productos-list">

                    ${generarProductosHTML(
                        solicitud.productos
                    )}

                </div>

            </div>


            <!-- MOTIVO -->

            <div class="solicitud-motivo">

                <span class="info-label">
                    MOTIVO DE LA DEVOLUCIÓN
                </span>


                <p>
                    ${solicitud.motivo}
                </p>

            </div>


            <!-- CÓDIGO / CANAL -->

            <div class="solicitud-code">


                <div>

                    <span class="info-label">
                        CÓDIGO
                    </span>

                    <span class="codigo">
                        ${solicitud.codigo_devolucion}
                    </span>

                </div>


                <div>

                    <span class="info-label">
                        CANAL
                    </span>

                    <span class="canal">
                        ${solicitud.canal}
                    </span>

                </div>


            </div>


            ${
                esPendiente

                ?

                `

                <!-- DECISIÓN -->

                <div class="decision-area">


                    <label
                        for="observacion-${solicitud.id_solicitud}">

                        Observaciones

                    </label>


                    <textarea
                        id="observacion-${solicitud.id_solicitud}"
                        placeholder="Escribe una observación para la decisión..."
                        maxlength="255"></textarea>


                    <div class="decision-buttons">


                        <button
                            type="button"
                            class="reject-button"
                            onclick="resolverSolicitud(
                                ${solicitud.id_solicitud},
                                'rechazada'
                            )">

                            Rechazar

                        </button>


                        <button
                            type="button"
                            class="approve-button"
                            onclick="resolverSolicitud(
                                ${solicitud.id_solicitud},
                                'aprobada'
                            )">

                            Aceptar

                        </button>


                    </div>

                </div>

                `

                :

                `

                <div class="processed-message">

                    Esta solicitud ya fue procesada.

                </div>

                `
            }

        `;


        solicitudesContainer.appendChild(
            tarjeta
        );

    });
}


// =========================================================
// ACEPTAR / RECHAZAR
// =========================================================

function resolverSolicitud(
    idSolicitud,
    resultado
) {

    const textarea =
        document.getElementById(
            `observacion-${idSolicitud}`
        );


    let observaciones = "";


    if (textarea) {

        observaciones =
            textarea.value.trim();
    }


    const mensaje =
        resultado === "aprobada"

        ? "¿Deseas aceptar esta devolución?"

        : "¿Deseas rechazar esta devolución?";


    if (!confirm(mensaje)) {

        return;
    }


    fetch(
        `/api/solicitud-devolucion/${idSolicitud}/resolver`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({

                resultado:
                    resultado,

                observaciones:
                    observaciones

            })
        }
    )


    .then(async response => {

        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "No se pudo procesar la solicitud"
            );
        }


        return data;

    })


    .then(data => {

        alert(
            resultado === "aprobada"

            ? "La devolución fue aceptada correctamente."

            : "La devolución fue rechazada correctamente."
        );


        cargarSolicitudes();

    })


    .catch(error => {

        console.error(error);


        alert(
            error.message
        );

    });
}


// =========================================================
// CARGAR SOLICITUDES
// =========================================================

function cargarSolicitudes() {

    fetch(
        "/api/solicitudes-devolucion"
    )


    .then(response => {

        if (response.status === 401) {

            window.location.href = "/";

            return;
        }


        if (response.status === 403) {

            throw new Error(
                "No tienes permiso para consultar las solicitudes"
            );
        }


        if (!response.ok) {

            throw new Error(
                "No se pudieron cargar las solicitudes"
            );
        }


        return response.json();

    })


    .then(data => {

        if (data && data.success) {

            const solicitudes =
                data.solicitudes || [];

            mostrarSolicitudes(
                solicitudes
            );

        } else {

            throw new Error(
                data.message ||
                "No se pudieron cargar las solicitudes"
            );
        }

    })


    .catch(error => {

        console.error(error);


        solicitudesContainer.innerHTML = `

            <div class="no-solicitudes">

                <div class="no-solicitudes-icon">
                    !
                </div>

                <h2>
                    No se pudieron cargar las solicitudes
                </h2>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    });
}


// =========================================================
// INICIO
// =========================================================

cargarSolicitudes();