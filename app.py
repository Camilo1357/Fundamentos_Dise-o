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

    # Verificar que haya una sesión iniciada
    if "user_id" not in session:
        return redirect(url_for("inicio"))

    # Verificar que el usuario sea cliente
    if session.get("tipo_usuario") != "cliente":
        return redirect(url_for("admin_view"))

    return render_template("historial.html")


@app.route("/admin")
def admin_view():

    # Verificar que haya una sesión iniciada
    if "user_id" not in session:
        return redirect(url_for("inicio"))

    # Verificar que el usuario sea administrador
    if session.get("tipo_usuario") != "admin":
        return redirect(url_for("cliente_view"))

    return render_template("admin.html")


# =========================
# INICIAR SESIÓN
# =========================

@app.route("/login", methods=["POST"])
def login():

    email = request.form.get("email")
    password = request.form.get("password")

    try:

        # ==========================================
        # 1. INICIAR SESIÓN EN SUPABASE
        # ==========================================

        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })


        # ==========================================
        # 2. OBTENER ID DEL USUARIO
        # ==========================================

        user_id = auth_response.user.id


        # ==========================================
        # 3. GUARDAR ID EN LA SESIÓN
        # ==========================================

        session["user_id"] = user_id


        # ==========================================
        # 4. VERIFICAR SI ES ADMINISTRADOR
        # ==========================================

        admin_check = (
            supabase
            .table("administrador")
            .select("id_admin")
            .eq("id_admin", user_id)
            .execute()
        )


        # ==========================================
        # 5. SI ES ADMINISTRADOR
        # ==========================================

        if admin_check.data and len(admin_check.data) > 0:

            session["tipo_usuario"] = "admin"

            return redirect(url_for("admin_view"))


        # ==========================================
        # 6. SI ES CLIENTE
        # ==========================================

        else:

            session["tipo_usuario"] = "cliente"

            return redirect(url_for("cliente_view"))


    except Exception as e:

        print("ERROR AL INICIAR SESIÓN:")
        print(e)

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

        # ==========================================
        # 1. CREAR USUARIO EN SUPABASE AUTH
        # ==========================================

        auth_response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })


        # ==========================================
        # 2. OBTENER ID DEL USUARIO
        # ==========================================

        user_id = auth_response.user.id


        # ==========================================
        # 3. CREAR REGISTRO DEL CLIENTE
        # ==========================================

        supabase.table("cliente").insert({

            "id_cliente": user_id,
            "nombre": nombre,
            "email": email

        }).execute()


        return redirect(url_for("inicio"))


    except Exception as e:

        print("ERROR AL CREAR CUENTA:")
        print(e)

        return redirect(url_for("crear_cuenta"))


# =========================
# CERRAR SESIÓN
# =========================

@app.route("/logout")
def logout():

    # Eliminar toda la información de sesión
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


    # ==========================================
    # 2. VERIFICAR QUE SEA CLIENTE
    # ==========================================

    if session.get("tipo_usuario") != "cliente":

        return jsonify({
            "error": "No tienes permiso para consultar los pedidos"
        }), 403


    # ==========================================
    # 3. OBTENER ID DEL USUARIO
    # ==========================================

    user_id = session["user_id"]


    try:

        # ==========================================
        # 4. OBTENER LAS COMPRAS DEL CLIENTE
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


        # ==========================================
        # 5. SI NO TIENE COMPRAS
        # ==========================================

        if not compras:

            return jsonify([])


        # ==========================================
        # 6. OBTENER ID DE LAS COMPRAS
        # ==========================================

        ids_compras = [

            compra["id_compra"]

            for compra in compras

        ]


        # ==========================================
        # 7. OBTENER DETALLE_COMPRA
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
        # 8. OBTENER ID DE LOS PRODUCTOS
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
        # 9. CREAR DICCIONARIO DE PRODUCTOS
        # ==========================================

        productos_por_id = {

            producto["id_producto"]: producto

            for producto in productos

        }


        # ==========================================
        # 10. AGRUPAR DETALLES POR COMPRA
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
        # 11. CONSTRUIR RESPUESTA FINAL
        # ==========================================

        resultado = []


        for compra in compras:

            id_compra = compra["id_compra"]


            productos_compra = detalles_por_compra.get(
                id_compra,
                []
            )


            # Cantidad total de unidades
            cantidad_productos = sum(

                producto["cantidad"]

                for producto in productos_compra

            )


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


                # Productos

                "productos":
                    productos_compra

            })


        # ==========================================
        # 12. DEVOLVER DATOS AL JAVASCRIPT
        # ==========================================

        return jsonify(resultado)


    except Exception as e:

        print("ERROR AL CONSULTAR PEDIDOS:")
        print(e)

        return jsonify({

            "error":
                "No se pudieron consultar los pedidos"

        }), 500


# =========================
# EJECUTAR SERVIDOR
# =========================

if __name__ == "__main__":

    app.run(debug=True)