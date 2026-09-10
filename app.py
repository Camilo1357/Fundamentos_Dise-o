from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from database.supabase import supabase

app = Flask(__name__)

app.secret_key = "clave_secreta_mercadoviva_app"


# =========================
# PÁGINAS
# =========================

@app.route("/")
def inicio():
    return render_template("inicio_sesion.html")


@app.route("/crear_cuenta")
def crear_cuenta():
    return render_template("crear_cuenta.html")


@app.route("/cliente")
def cliente_view():
    return render_template("historial.html")


@app.route("/admin")
def admin_view():
    return render_template("admin.html")


@app.route("/historial")
def historial():
    if "user_id" not in session:
        return redirect(url_for("inicio"))

    return render_template("historial.html")


# =========================
# INICIAR SESIÓN
# =========================

@app.route("/login", methods=["POST"])
def login():

    email = request.form.get("email")
    password = request.form.get("password")

    try:

        # Iniciar sesión en Supabase
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        # Obtener ID del usuario
        user_id = auth_response.user.id

        # Guardar usuario en la sesión
        session["user_id"] = user_id

        # Verificar si es administrador
        admin_check = (
            supabase
            .table("administrador")
            .select("id_admin")
            .eq("id_admin", user_id)
            .execute()
        )

        # Si es administrador
        if admin_check.data and len(admin_check.data) > 0:

            return redirect(url_for("admin_view"))

        # Si es cliente
        else:

            return redirect(url_for("cliente_view"))

    except Exception as e:
        
        return jsonify({
            "error": "No has creado una cuenta"
        }), 401


# =========================
# CREAR CUENTA
# =========================

@app.route("/registro", methods=["POST"])
def register():

    nombre = request.form.get("nombre")
    email = request.form.get("email")
    password = request.form.get("password")

    try:

        # Crear usuario en Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })

        user_id = auth_response.user.id
        # Crear registro del cliente
        supabase.table("cliente").insert({
            "id_cliente": user_id,
            "nombre": nombre,
            "email": email
        }).execute()
        return redirect(url_for("inicio"))

    except Exception as e:
        return redirect(url_for("crear_cuenta"))


# =========================
# CERRAR SESIÓN
# =========================

@app.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("inicio"))

# =========================
# API - HISTORIAL DE PEDIDOS
# =========================

@app.route("/api/pedidos", methods=["GET"])
def api_pedidos():

    # ==========================================
    # 1. VERIFICAR SESIÓN
    # ==========================================

    if "user_id" not in session:

        return jsonify({
            "error": "No has iniciado sesión"
        }), 401


    # ID del usuario que inició sesión
    user_id = session["user_id"]


    try:

        # ==========================================
        # 2. OBTENER LAS COMPRAS DEL CLIENTE
        # ==========================================

        compras_response = (
            supabase
            .table("compra")
            .select("*")
            .eq("id_cliente", user_id)
            .order("fecha_compra", desc=True)
            .execute()
        )


        compras = compras_response.data or []


        # Si no tiene compras
        if not compras:

            return jsonify([])


        # ==========================================
        # 3. OBTENER LOS ID DE LAS COMPRAS
        # ==========================================

        ids_compras = [
            compra["id_compra"]
            for compra in compras
        ]


        # ==========================================
        # 4. OBTENER DETALLE_COMPRA
        # ==========================================

        detalles_response = (
            supabase
            .table("detalle_compra")
            .select("*")
            .in_("id_compra", ids_compras)
            .execute()
        )


        detalles = detalles_response.data or []


        # ==========================================
        # 5. OBTENER LOS ID DE LOS PRODUCTOS
        # ==========================================

        ids_productos = list({
            detalle["id_producto"]
            for detalle in detalles
            if detalle.get("id_producto") is not None
        })


        productos = []


        if ids_productos:

            productos_response = (
                supabase
                .table("producto")
                .select("id_producto, nombre")
                .in_("id_producto", ids_productos)
                .execute()
            )


            productos = productos_response.data or []


        # ==========================================
        # 6. CREAR DICCIONARIO DE PRODUCTOS
        # ==========================================

        productos_por_id = {

            producto["id_producto"]: producto

            for producto in productos

        }


        # ==========================================
        # 7. AGRUPAR DETALLES POR COMPRA
        # ==========================================

        detalles_por_compra = {}


        for detalle in detalles:

            id_compra = detalle["id_compra"]


            if id_compra not in detalles_por_compra:

                detalles_por_compra[id_compra] = []


            producto = productos_por_id.get(
                detalle["id_producto"]
            )


            detalles_por_compra[id_compra].append({

                "id_detalle_compra":
                    detalle["id_detalle_compra"],

                "id_producto":
                    detalle["id_producto"],

                "nombre":
                    producto["nombre"]
                    if producto
                    else "Producto",

                "cantidad":
                    detalle["cantidad"],

                "precio_unitario":
                    detalle["precio_unitario"]

            })


        # ==========================================
        # 8. CONSTRUIR RESPUESTA FINAL
        # ==========================================

        resultado = []


        for compra in compras:

            id_compra = compra["id_compra"]
            productos_compra = detalles_por_compra.get(id_compra,[])

            # Cantidad total de unidades
            cantidad_productos = sum(producto["cantidad"] for producto in productos_compra)

            resultado.append({

                # Información de compra
                "id_compra":
                    compra["id_compra"],

                "id_cliente":
                    compra["id_cliente"],

                "fecha_compra":
                    compra["fecha_compra"],

                "canal":
                    compra["canal"],

                "total":
                    compra["total"],

                "estado":
                    compra["estado"],


                # Cantidad de productos
                "cantidad_productos":
                    cantidad_productos,


                # Productos de esa compra
                "productos":
                    productos_compra

            })


        # ==========================================
        # 9. DEVOLVER TODO AL JAVASCRIPT
        # ==========================================

        return jsonify(resultado)


    except Exception as e:

        return jsonify({
            "error":
                "No se pudieron consultar los pedidos"
        }), 500


# =========================
# EJECUTAR SERVIDOR
# =========================

if __name__ == "__main__":
    app.run(debug=True)

