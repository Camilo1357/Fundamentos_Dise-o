const ordersList = document.getElementById("orders-list");
const orderDetail = document.getElementById("order-detail");


// ==================================================
// MOSTRAR PEDIDOS
// ==================================================

function mostrarPedidos(pedidos) {

    ordersList.innerHTML = "";


    // Si no hay pedidos
    if (pedidos.length === 0) {

        ordersList.innerHTML = `
            <div class="no-orders">

                <div class="no-orders-icon">◇</div>

                <h2>No tienes pedidos todavía</h2>

                <p>
                    Cuando realices una compra,
                    aparecerá aquí tu historial de pedidos.
                </p>

            </div>
        `;

        return;
    }


    // Mostrar pedidos
    pedidos.forEach(pedido => {

        const tarjeta = document.createElement("div");

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

                    ${pedido.fecha_compra}

                </div>

            </div>


            <div class="order-price">

                $${pedido.total}

            </div>


            <div class="order-status">

                ${pedido.estado}

            </div>


            <div class="order-arrow">
                ›
            </div>

        `;


        tarjeta.addEventListener("click", function () {

            mostrarDetalle(pedido);

        });


        ordersList.appendChild(tarjeta);

    });

}


// ==================================================
// MOSTRAR DETALLE
// ==================================================

function mostrarDetalle(pedido) {

    orderDetail.innerHTML = `

        <h2 class="detail-title">
            Detalle del Pedido #${pedido.id_compra}
        </h2>


        <p class="detail-date">
            Realizado el ${pedido.fecha_compra}
        </p>


        <div class="detail-line"></div>


        <p class="products-title">
            INFORMACIÓN DEL PEDIDO
        </p>


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
                $${pedido.total}
            </span>

        </div>


        <button
            class="return-button"
            onclick="solicitarDevolucion(${pedido.id_compra})"
        >
            Solicitar Devolución
        </button>

    `;

}


// ==================================================
// SOLICITAR DEVOLUCIÓN
// ==================================================

function solicitarDevolucion(idCompra) {

    console.log("Solicitar devolución de:", idCompra);

    // Aquí posteriormente conectaremos
    // la API de solicitudes de devolución.

}


// ==================================================
// CONSULTAR PEDIDOS EN EL BACKEND
// ==================================================

fetch("/api/pedidos")

    .then(response => {

        if (!response.ok) {

            throw new Error("No se pudieron obtener los pedidos");

        }

        return response.json();

    })

    .then(data => {

        mostrarPedidos(data);

    })

    .catch(error => {

        console.error("Error:", error);

        ordersList.innerHTML = `
            <div class="no-orders">

                <h2>
                    No se pudieron cargar los pedidos
                </h2>

                <p>
                    Intenta nuevamente más tarde.
                </p>

            </div>
        `;

    });