// =========================================
// ELEMENTOS DEL HTML
// =========================================

const ordersList = document.getElementById("orders-list");

const orderDetail = document.getElementById("order-detail");


// =========================================
// MOSTRAR PEDIDOS
// =========================================

function mostrarPedidos(pedidos) {

    // Limpiamos la lista
    ordersList.innerHTML = "";


    // =====================================
    // NO HAY PEDIDOS
    // =====================================

    if (pedidos.length === 0) {

        ordersList.innerHTML = `
            <div class="no-orders">

                <div class="no-orders-icon">
                    ◇
                </div>

                <h2>No tienes pedidos todavía</h2>

                <p>
                    Cuando realices una compra,
                    aparecerá aquí tu historial de pedidos.
                </p>

            </div>
        `;

        return;
    }


    // =====================================
    // HAY PEDIDOS
    // =====================================

    pedidos.forEach(pedido => {

        const tarjeta = document.createElement("div");

        tarjeta.classList.add("order-card");


        tarjeta.innerHTML = `

            <div class="order-icon">
                ◇
            </div>


            <div class="order-info">

                <div class="order-id">
                    ${pedido.id}
                </div>

                <div class="order-meta">
                    ${pedido.fecha} ·
                    ${pedido.productos} productos
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


        // Cuando se selecciona un pedido
        tarjeta.addEventListener("click", function() {

            mostrarDetalle(pedido);

        });


        ordersList.appendChild(tarjeta);

    });

}



// =========================================
// MOSTRAR DETALLE DEL PEDIDO
// =========================================

function mostrarDetalle(pedido) {

    orderDetail.innerHTML = `

        <h2 class="detail-title">
            Detalle del Pedido ${pedido.id}
        </h2>


        <p class="detail-date">
            Realizado el ${pedido.fecha}
        </p>


        <div class="detail-line"></div>


        <p class="products-title">
            PRODUCTOS
        </p>


        <div id="products-list"></div>


        <div class="total-row">

            <span>
                Total
            </span>

            <span class="total-price">
                $${pedido.total}
            </span>

        </div>


        <button class="return-button">
            Solicitar Devolución
        </button>

    `;


    // =====================================
    // LISTA DE PRODUCTOS
    // =====================================

    const productsList =
        document.getElementById("products-list");


    pedido.listaProductos.forEach(producto => {

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
                $${producto.precio}
            </span>

        `;


        productsList.appendChild(productoHTML);

    });

}