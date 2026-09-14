const ordersList =
    document.getElementById("orders-list");

const orderDetail =
    document.getElementById("order-detail");


// =========================================================
// FORMATEAR PRECIO
// =========================================================

function formatearPrecio(valor) {

    return new Intl.NumberFormat("es-CO", {
        maximumFractionDigits: 0
    }).format(valor);

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
// CLASE DEL ESTADO
// =========================================================

function obtenerClaseEstado(estado) {

    const estadoNormalizado =
        (estado || "").toLowerCase();

    if (
        estadoNormalizado === "entregado" ||
        estadoNormalizado === "completada" ||
        estadoNormalizado === "completado"
    ) {
        return "status-entregado";
    }

    if (
        estadoNormalizado === "pendiente" ||
        estadoNormalizado === "en proceso" ||
        estadoNormalizado === "procesando"
    ) {
        return "status-pendiente";
    }

    if (
        estadoNormalizado === "cancelado" ||
        estadoNormalizado === "cancelada"
    ) {
        return "status-cancelado";
    }

    return "status-default";
}


// =========================================================
// MOSTRAR PEDIDOS
// =========================================================

function mostrarPedidos(pedidos) {

    ordersList.innerHTML = "";

    if (!pedidos || pedidos.length === 0) {

        ordersList.innerHTML = `
            <div class="no-orders">

                <div class="no-orders-icon">
                    ◇
                </div>

                <h2>
                    No tienes pedidos todavía
                </h2>

                <p>
                    Cuando realices una compra,
                    aparecerá aquí tu historial de pedidos.
                </p>

            </div>
        `;

        return;
    }


    pedidos.forEach(pedido => {

        const tarjeta =
            document.createElement("div");

        tarjeta.classList.add("order-card");


        tarjeta.innerHTML = `

            <div class="order-icon">
                ◇
            </div>

            <div class="order-info">

                <div class="order-id">
                    Pedido #${pedido.id_compra}
                </div>

                <div class="order-meta">
                    ${formatearFecha(pedido.fecha_compra)}
                    ·
                    ${pedido.cantidad_productos || 0} productos
                </div>

            </div>

            <div class="order-price">
                $${formatearPrecio(pedido.total)}
            </div>

            <div class="order-status ${obtenerClaseEstado(pedido.estado)}">
                ${pedido.estado}
            </div>

            <div class="order-arrow">
                ›
            </div>
        `;


        tarjeta.addEventListener(
            "click",
            function() {

                document
                    .querySelectorAll(".order-card")
                    .forEach(card => {
                        card.classList.remove("selected");
                    });

                tarjeta.classList.add("selected");

                cargarDetallePedido(pedido.id_compra);
            }
        );


        ordersList.appendChild(tarjeta);

    });


    // Seleccionar automáticamente el primero

    if (pedidos.length > 0) {

        const primeraTarjeta =
            ordersList.querySelector(".order-card");

        primeraTarjeta.classList.add("selected");

        cargarDetallePedido(pedidos[0].id_compra);
    }
}


// =========================================================
// CARGAR DETALLE DEL PEDIDO
// =========================================================

function cargarDetallePedido(idCompra) {

    orderDetail.innerHTML = `

        <div class="no-orders">

            <div class="no-orders-icon">
                ...
            </div>

            <h2>
                Cargando pedido
            </h2>

            <p>
                Estamos consultando los detalles.
            </p>

        </div>

    `;


    fetch(`/api/compra/${idCompra}`)

        .then(response => {

            if (response.status === 401) {

                window.location.href = "/";

                return null;
            }

            if (!response.ok) {

                throw new Error(
                    "No se pudo cargar el detalle del pedido"
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
                    "No se pudo cargar el pedido"
                );
            }

            const pedido = data.compra;

            const productos = data.productos || [];

            mostrarDetalle(pedido, productos);

        })

        .catch(error => {

            console.error(
                "ERROR CARGANDO DETALLE:",
                error
            );

            orderDetail.innerHTML = `

                <div class="no-orders">

                    <div class="no-orders-icon">
                        !
                    </div>

                    <h2>
                        No se pudo cargar el pedido
                    </h2>

                    <p>
                        Intenta nuevamente más tarde.
                    </p>

                </div>

            `;
        });
}


// =========================================================
// MOSTRAR DETALLE
// =========================================================

function mostrarDetalle(pedido, productos) {

    orderDetail.innerHTML = `

        <h2 class="detail-title">
            Detalle del Pedido #${pedido.id_compra}
        </h2>

        <p class="detail-date">
            Realizado el ${formatearFecha(pedido.fecha_compra)}
        </p>

        <div class="detail-line"></div>

        <p class="products-title">
            PRODUCTOS
        </p>

        <div id="products-list"></div>

        <div class="detail-extra">

            <p>
                <strong>Canal:</strong>
                ${pedido.canal}
            </p>

            <p>
                <strong>Estado:</strong>
                ${pedido.estado}
            </p>

        </div>

        <div class="total-row">

            <span>
                Total
            </span>

            <span class="total-price">
                $${formatearPrecio(pedido.total)}
            </span>

        </div>

        <button
            class="return-button"
            type="button"
            onclick="solicitarDevolucion(${pedido.id_compra})">

            Solicitar Devolución

        </button>
    `;


    const productsList =
        document.getElementById("products-list");


    productos.forEach(producto => {

        const productoHTML =
            document.createElement("div");

        productoHTML.classList.add(
            "product-row"
        );


        productoHTML.innerHTML = `

            <span class="product-name">

                ${producto.nombre}

                <span class="product-quantity">
                    x${producto.cantidad}
                </span>

            </span>

            <span class="product-price">

                $${formatearPrecio(
                    producto.precio_unitario
                )}

            </span>
        `;


        productsList.appendChild(
            productoHTML
        );

    });

}


// =========================================================
// SOLICITAR DEVOLUCIÓN
// =========================================================

function solicitarDevolucion(idCompra) {

    window.location.href =
        `/solicitar-devolucion?id_compra=${idCompra}`;
}


// =========================================================
// CARGAR PEDIDOS DESDE FLASK
// =========================================================

function cargarPedidos() {

    fetch("/api/pedidos")

        .then(response => {

            if (response.status === 401) {

                window.location.href = "/";

                return null;
            }

            if (!response.ok) {

                throw new Error(
                    "No se pudieron cargar los pedidos"
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
                    "No se pudieron cargar los pedidos"
                );
            }

            // IMPORTANTE:
            // Flask devuelve { success, pedidos }
            // Por eso debemos enviar solamente data.pedidos

            const pedidos = data.pedidos || [];

            mostrarPedidos(pedidos);

        })

        .catch(error => {

            console.error(
                "ERROR CARGANDO PEDIDOS:",
                error
            );

            ordersList.innerHTML = `

                <div class="no-orders">

                    <div class="no-orders-icon">
                        !
                    </div>

                    <h2>
                        No se pudieron cargar los pedidos
                    </h2>

                    <p>
                        Intenta nuevamente más tarde.
                    </p>

                </div>
            `;
        });
}


// =========================================================
// INICIO
// =========================================================

cargarPedidos();