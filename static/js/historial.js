const ordersList = document.getElementById("orders-list");
const orderDetail = document.getElementById("order-detail");


// ==================================================
// FORMATEAR DINERO
// ==================================================

function formatearPrecio(valor) {

    return new Intl.NumberFormat("es-CO", {
        maximumFractionDigits: 0
    }).format(valor);

}



// ==================================================
// FORMATEAR FECHA
// ==================================================

function formatearFecha(fecha) {

    const fechaObjeto = new Date(fecha);

    return fechaObjeto.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

}



// ==================================================
// CLASE DEL ESTADO
// ==================================================

function obtenerClaseEstado(estado) {

    const estadoNormalizado = estado
        .toLowerCase()
        .trim();


    if (
        estadoNormalizado === "entregado" ||
        estadoNormalizado === "completada" ||
        estadoNormalizado === "completado"
    ) {

        return "status-entregado";

    }


    if (
        estadoNormalizado === "pendiente" ||
        estadoNormalizado === "pendiente de entrega"
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



// ==================================================
// MOSTRAR PEDIDOS
// ==================================================

function mostrarPedidos(pedidos) {

    ordersList.innerHTML = "";


    // ==============================================
    // NO HAY PEDIDOS
    // ==============================================

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



    // ==============================================
    // CREAR TARJETAS
    // ==============================================

    pedidos.forEach((pedido, index) => {

        const tarjeta = document.createElement("div");

        tarjeta.classList.add("order-card");


        const claseEstado = obtenerClaseEstado(
            pedido.estado
        );


        tarjeta.innerHTML = `

            <div class="order-icon">
                🛒
            </div>


            <div class="order-info">

                <div class="order-id">
                    Pedido #${pedido.id_compra}
                </div>


                <div class="order-meta">

                    ${formatearFecha(pedido.fecha_compra)}

                    ·

                    ${pedido.cantidad_productos} productos

                </div>

            </div>


            <div class="order-price">

                $${formatearPrecio(pedido.total)}

            </div>


            <div class="order-status ${claseEstado}">

                ${pedido.estado}

            </div>


            <div class="order-arrow">
                ›
            </div>

        `;



        // ==========================================
        // CLICK EN PEDIDO
        // ==========================================

        tarjeta.addEventListener("click", function () {

            document
                .querySelectorAll(".order-card")
                .forEach(card => {

                    card.classList.remove("selected");

                });


            tarjeta.classList.add("selected");


            mostrarDetalle(pedido);

        });



        ordersList.appendChild(tarjeta);


        // Seleccionar automáticamente
        // el primer pedido

        if (index === 0) {

            tarjeta.classList.add("selected");

            mostrarDetalle(pedido);

        }

    });

}



// ==================================================
// MOSTRAR DETALLE
// ==================================================

function mostrarDetalle(pedido) {

    const productos = pedido.productos || [];


    orderDetail.innerHTML = `

        <h2 class="detail-title">

            Detalle del Pedido #${pedido.id_compra}

        </h2>


        <p class="detail-date">

            Realizado el
            ${formatearFecha(pedido.fecha_compra)}

        </p>


        <div class="detail-line"></div>


        <p class="products-title">

            PRODUCTOS

        </p>


        <div id="products-list"></div>


        <div class="product-row">

            <span class="product-name">
                Canal
            </span>

            <span class="product-price">
                ${pedido.canal}
            </span>

        </div>


        <div class="product-row">

            <span class="product-name">
                Estado
            </span>

            <span class="product-price">
                ${pedido.estado}
            </span>

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
            data-id-compra="${pedido.id_compra}"
        >

            Solicitar Devolución

        </button>

    `;



    // ==============================================
    // MOSTRAR PRODUCTOS
    // ==============================================

    const productsList =
        document.getElementById("products-list");


    if (productos.length === 0) {

        productsList.innerHTML = `

            <div class="product-row">

                <span class="product-name">
                    No hay productos registrados
                </span>

            </div>

        `;

    } else {

        productos.forEach(producto => {

            const productoHTML =
                document.createElement("div");


            productoHTML.classList.add("product-row");


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


            productsList.appendChild(productoHTML);

        });

    }



    // ==============================================
    // BOTÓN DEVOLUCIÓN
    // ==============================================

    const returnButton =
        document.querySelector(".return-button");


    returnButton.addEventListener("click", function () {

        const idCompra =
            this.dataset.idCompra;


        solicitarDevolucion(idCompra);

    });

}



// ==================================================
// SOLICITAR DEVOLUCIÓN
// ==================================================

function solicitarDevolucion(idCompra) {
    

    /*
        Aquí posteriormente conectaremos
        la pantalla/proceso de devolución.

        El ID del pedido ya está disponible:
        idCompra
    */

}



// ==================================================
// CONSULTAR PEDIDOS EN FLASK
// ==================================================

function cargarPedidos() {

    fetch("/api/pedidos")

        .then(response => {

            if (response.status === 401) {

                window.location.href = "/";

                return;

            }


            if (!response.ok) {

                throw new Error(
                    "No se pudieron obtener los pedidos"
                );

            }


            return response.json();

        })


        .then(data => {

            if (!data) {
                return;
            }


            mostrarPedidos(data);

        })


        .catch(error => {

            console.error(
                "Error cargando pedidos:",
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



// ==================================================
// INICIAR
// ==================================================

cargarPedidos();