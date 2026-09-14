import os
import random
import string

from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from dotenv import load_dotenv

from database.supabase import supabase
from database.n8n import enviar_devolucion_n8n

load_dotenv()

app = Flask(__name__)

app.secret_key = os.getenv("SECRET_KEY","clave_secreta_mercadoviva_app")


def generar_codigo_devolucion():
    """
    Genera un código único para la devolución.
    Ejemplo: MV-A8K29P
    """
    caracteres = string.ascii_uppercase + string.digits

    codigo = "MV-" + "".join(
        random.choices(caracteres, k=6)
    )

    return codigo


def usuario_logueado():
    """
    Retorna el ID del usuario que inició sesión.
    Si no hay sesión, retorna None.
    """
    return session.get("user_id")


def es_admin():
    """
    Verifica si el usuario actual existe en la tabla administrador.
    """
    user_id = usuario_logueado()

    if not user_id:
        return False

    try:
        resultado = (
            supabase
            .table("administrador")
            .select("id_admin")
            .eq("id_admin", user_id)
            .limit(1)
            .execute()
        )

        return bool(resultado.data)

    except Exception as e:
        print("Error verificando administrador:", e)
        return False


# ============================================================
# PÁGINA PRINCIPAL
# ============================================================

@app.route("/")
def inicio():
    return render_template("inicio_sesion.html")


# ============================================================
# CREAR CUENTA
# ============================================================

@app.route("/crear_cuenta")
def crear_cuenta():
    return render_template("crear_cuenta.html")


# ============================================================
# REGISTRO
# ============================================================

@app.route("/registro", methods=["POST"])
def registro():

    try:

        # ----------------------------------------------------
        # RECIBIR DATOS
        # ----------------------------------------------------

        datos = request.get_json(silent=True)

        if datos is None:

            datos = request.form


        # ----------------------------------------------------
        # OBTENER DATOS
        # ----------------------------------------------------

        nombre = datos.get("nombre", "").strip()

        email = datos.get("email", "").strip()

        password = datos.get("password", "").strip()


        if not nombre or not email or not password:

            return jsonify({

                "success": False,

                "message":
                    "Todos los campos son obligatorios."

            }), 400


        if len(password) < 6:

            return jsonify({

                "success": False,

                "message":
                    "La contraseña debe tener mínimo 6 caracteres."

            }), 400


        # ----------------------------------------------------
        # CREAR USUARIO EN SUPABASE AUTH
        # ----------------------------------------------------

        respuesta_auth = supabase.auth.sign_up({

            "email": email,

            "password": password

        })


        # ----------------------------------------------------
        # VERIFICAR USUARIO
        # ----------------------------------------------------

        if not respuesta_auth.user:

            return jsonify({

                "success": False,

                "message":
                    "No fue posible crear el usuario."

            }), 400


        # ID generado por Supabase Auth

        user_id = respuesta_auth.user.id

        cliente = (
            supabase
            .table("cliente")
            .insert({
                "id_cliente": user_id,

                "nombre": nombre,

                "email": email
            })
            .execute()
        )


        # ----------------------------------------------------
        # VERIFICAR CLIENTE
        # ----------------------------------------------------

        if not cliente.data:

            return jsonify({

                "success": False,

                "message":
                    "El usuario fue creado, pero no se pudo registrar el cliente."

            }), 500


        return jsonify({

            "success": True,

            "message":
                "Cuenta creada correctamente."

        })


    except Exception as e:
        return jsonify({

            "success": False,

            "message":
                "Ocurrió un error al crear la cuenta."

        }), 500

# ============================================================
# LOGIN
# ============================================================

@app.route("/login", methods=["POST"])
def login():

    try:
        datos = request.get_json(silent=True)

        if datos is None:
            datos = request.form

        email = datos.get("email", "").strip()
        password = datos.get("password", "").strip()

        if not email or not password:
            return jsonify({
                "success": False,
                "message": "Correo y contraseña son obligatorios."
            }), 400

        # ----------------------------------------------------
        # AUTENTICACIÓN SUPABASE
        # ----------------------------------------------------

        respuesta = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        if not respuesta.user:

            return jsonify({
                "success": False,
                "message": "Correo o contraseña incorrectos."
            }), 401

        user_id = respuesta.user.id

        # ----------------------------------------------------
        # GUARDAR USUARIO EN SESIÓN
        # ----------------------------------------------------

        session["user_id"] = user_id

        # ----------------------------------------------------
        # VERIFICAR SI ES ADMINISTRADOR
        # ----------------------------------------------------

        try:

            admin = (
                supabase
                .table("administrador")
                .select("id_admin")
                .eq("id_admin", user_id)
                .limit(1)
                .execute()
            )

            if admin.data:

                session["tipo_usuario"] = "admin"

                return jsonify({
                    "success": True,
                    "redirect": "/admin"
                })

        except Exception as e:
            ...

        # ----------------------------------------------------
        # SI NO ES ADMIN, ES CLIENTE
        # ----------------------------------------------------

        session["tipo_usuario"] = "cliente"

        return jsonify({
            "success": True,
            "redirect": "/cliente"
        })

    except Exception as e:

        session.clear()

        return jsonify({
            "success": False,
            "message": "Correo o contraseña incorrectos."
        }), 401


# ============================================================
# CERRAR SESIÓN
# ============================================================

@app.route("/logout")
def logout():

    session.clear()

    try:
        supabase.auth.sign_out()
    except Exception:
        pass

    return redirect(url_for("inicio"))


# ============================================================
# PÁGINA DEL CLIENTE
# ============================================================

@app.route("/cliente")
def cliente():

    if not usuario_logueado():
        return redirect(url_for("inicio"))

    if session.get("tipo_usuario") != "cliente":
        return redirect(url_for("admin"))

    return render_template("historial.html")


# ============================================================
# PÁGINA DEL HISTORIAL
# ============================================================

@app.route("/historial")
def historial():

    if not usuario_logueado():
        return redirect(url_for("inicio"))

    if session.get("tipo_usuario") != "cliente":
        return redirect(url_for("admin"))

    return render_template("historial.html")


# ============================================================
# PÁGINA SOLICITUD DE DEVOLUCIÓN
# ============================================================

@app.route("/solicitar-devolucion")
def solicitar_devolucion():

    if not usuario_logueado():
        return redirect(url_for("inicio"))

    if session.get("tipo_usuario") != "cliente":
        return redirect(url_for("admin"))

    return render_template("solicitud_devolucion.html")


# ============================================================
# PÁGINA ADMINISTRADOR
# ============================================================

@app.route("/admin")
def admin():

    if not usuario_logueado():
        return redirect(url_for("inicio"))

    if session.get("tipo_usuario") != "admin":
        return redirect(url_for("cliente"))

    return render_template("admin.html")


# ============================================================
# API - OBTENER PEDIDOS DEL CLIENTE
# ============================================================

@app.route("/api/pedidos", methods=["GET"])
def obtener_pedidos():

    user_id = usuario_logueado()

    if not user_id:
        return jsonify({
            "success": False,
            "message": "No hay una sesión activa."
        }), 401

    try:

        respuesta = (
            supabase
            .table("compra")
            .select("*")
            .eq("id_cliente", user_id)
            .order("fecha_compra", desc=True)
            .execute()
        )

        pedidos = []

        for compra in respuesta.data or []:

            detalles_resultado = (
                supabase
                .table("detalle_compra")
                .select("cantidad")
                .eq("id_compra", compra["id_compra"])
                .execute()
            )

            detalles = detalles_resultado.data or []

            cantidad_productos = sum(
                int(detalle.get("cantidad", 0) or 0)
                for detalle in detalles
            )

            pedido = dict(compra)
            pedido["cantidad_productos"] = cantidad_productos

            pedidos.append(pedido)

        return jsonify({
            "success": True,
            "pedidos": pedidos
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "No se pudieron consultar las compras."
        }), 500


# ============================================================
# API - OBTENER UNA COMPRA COMPLETA
# ============================================================

@app.route("/api/compra/<int:id_compra>", methods=["GET"])
def obtener_compra(id_compra):

    user_id = usuario_logueado()

    if not user_id:
        return jsonify({
            "success": False,
            "message": "No hay una sesión activa."
        }), 401

    try:

        # ----------------------------------------------------
        # BUSCAR COMPRA
        # ----------------------------------------------------

        compra_resultado = (
            supabase
            .table("compra")
            .select("*")
            .eq("id_compra", id_compra)
            .eq("id_cliente", user_id)
            .limit(1)
            .execute()
        )

        if not compra_resultado.data:

            return jsonify({
                "success": False,
                "message": "La compra no existe o no pertenece al usuario."
            }), 404

        compra = compra_resultado.data[0]

        # ----------------------------------------------------
        # BUSCAR DETALLES
        # ----------------------------------------------------

        detalles_resultado = (
            supabase
            .table("detalle_compra")
            .select("*")
            .eq("id_compra", id_compra)
            .execute()
        )

        detalles = detalles_resultado.data or []

        # ----------------------------------------------------
        # BUSCAR PRODUCTOS
        # ----------------------------------------------------

        productos = []

        for detalle in detalles:

            producto_resultado = (
                supabase
                .table("producto")
                .select("*")
                .eq("id_producto", detalle["id_producto"])
                .limit(1)
                .execute()
            )

            producto = (
                producto_resultado.data[0]
                if producto_resultado.data
                else {}
            )

            productos.append({
                "id_detalle_compra": detalle["id_detalle_compra"],
                "id_producto": detalle["id_producto"],
                "nombre": producto.get("nombre", "Producto"),
                "cantidad": detalle.get("cantidad", 0),
                "precio_unitario": detalle.get("precio_unitario", 0)
            })

        return jsonify({
            "success": True,
            "compra": compra,
            "productos": productos
        })

    except Exception as e:

        print("ERROR OBTENIENDO COMPRA:")
        print(e)

        return jsonify({
            "success": False,
            "message": "No se pudo consultar la compra."
        }), 500


# ============================================================
# API - CREAR SOLICITUD DE DEVOLUCIÓN
# ============================================================

@app.route("/api/solicitud-devolucion", methods=["POST"])
def crear_solicitud_devolucion():

    user_id = usuario_logueado()

    if not user_id:
        return jsonify({
            "success": False,
            "message": "No hay una sesión activa."
        }), 401

    try:

        datos = request.get_json()

        id_compra = datos.get("id_compra")
        motivo = datos.get("motivo", "").strip()

        # ----------------------------------------------------
        # VALIDACIONES
        # ----------------------------------------------------

        if not id_compra:
            return jsonify({
                "success": False,
                "message": "No se especificó la compra."
            }), 400

        if not motivo:
            return jsonify({
                "success": False,
                "message": "Debes indicar el motivo de la devolución."
            }), 400

        if len(motivo) > 255:
            return jsonify({
                "success": False,
                "message": "El motivo no puede superar los 255 caracteres."
            }), 400

        # ----------------------------------------------------
        # VERIFICAR QUE LA COMPRA PERTENEZCA AL CLIENTE
        # ----------------------------------------------------

        compra_resultado = (
            supabase
            .table("compra")
            .select("*")
            .eq("id_compra", id_compra)
            .eq("id_cliente", user_id)
            .limit(1)
            .execute()
        )

        if not compra_resultado.data:

            return jsonify({
                "success": False,
                "message": "La compra no existe o no pertenece al usuario."
            }), 404

        compra = compra_resultado.data[0]

        # ----------------------------------------------------
        # OBTENER DETALLES DE LA COMPRA
        # ----------------------------------------------------

        detalles_resultado = (
            supabase
            .table("detalle_compra")
            .select("*")
            .eq("id_compra", id_compra)
            .execute()
        )

        detalles = detalles_resultado.data or []

        if not detalles:

            return jsonify({
                "success": False,
                "message": "La compra no tiene productos asociados."
            }), 400


        id_detalle_compra = detalles[0]["id_detalle_compra"]

        # ----------------------------------------------------
        # VERIFICAR SI YA EXISTE UNA SOLICITUD PARA LA COMPRA
        # ----------------------------------------------------

        solicitudes_existentes = (
            supabase
            .table("solicitud_devolucion")
            .select("id_solicitud, estado")
            .eq("id_cliente", user_id)
            .eq("id_detalle_compra", id_detalle_compra)
            .execute()
        )

        if solicitudes_existentes.data:

            for solicitud in solicitudes_existentes.data:

                estado = str(
                    solicitud.get("estado", "")
                ).lower()

                if estado in [
                    "pendiente",
                    "aprobada",
                    "completada"
                ]:

                    return jsonify({
                        "success": False,
                        "message": "Esta compra ya tiene una solicitud de devolución."
                    }), 400

        # ----------------------------------------------------
        # GENERAR CÓDIGO
        # ----------------------------------------------------

        codigo = generar_codigo_devolucion()

        # ----------------------------------------------------
        # CREAR SOLICITUD
        # ----------------------------------------------------

        solicitud = (
            supabase
            .table("solicitud_devolucion")
            .insert({
                "id_detalle_compra": id_detalle_compra,
                "id_cliente": user_id,
                "motivo": motivo,
                "estado": "pendiente",
                "codigo_devolucion": codigo
            })
            .execute()
        )

        if not solicitud.data:

            return jsonify({
                "success": False,
                "message": "No se pudo crear la solicitud."
            }), 500

        nueva_solicitud = solicitud.data[0]

        return jsonify({
            "success": True,
            "message": "Solicitud de devolución creada correctamente.",
            "codigo_devolucion": nueva_solicitud.get(
                "codigo_devolucion",
                codigo
            ),
            "id_solicitud": nueva_solicitud.get("id_solicitud")
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "Ocurrió un error al crear la solicitud."
        }), 500


# ============================================================
# API - OBTENER SOLICITUDES DE DEVOLUCIÓN
# ============================================================

@app.route("/api/solicitudes-devolucion", methods=["GET"])
def obtener_solicitudes_devolucion():

    if not usuario_logueado():
        return jsonify({
            "success": False,
            "message": "No hay una sesión activa."
        }), 401

    if not es_admin():
        return jsonify({
            "success": False,
            "message": "No tienes permisos de administrador."
        }), 403

    try:

        # ----------------------------------------------------
        # OBTENER SOLICITUDES
        # ----------------------------------------------------

        solicitudes_resultado = (
            supabase
            .table("solicitud_devolucion")
            .select("*")
            .order("id_solicitud", desc=True)
            .execute()
        )

        solicitudes = solicitudes_resultado.data or []

        resultado_final = []

        # ----------------------------------------------------
        # ARMAR INFORMACIÓN COMPLETA
        # ----------------------------------------------------

        for solicitud in solicitudes:

            id_detalle = solicitud.get("id_detalle_compra")

            if not id_detalle:
                continue

            # ------------------------------------------------
            # DETALLE
            # ------------------------------------------------

            detalle_resultado = (
                supabase
                .table("detalle_compra")
                .select("*")
                .eq("id_detalle_compra", id_detalle)
                .limit(1)
                .execute()
            )

            if not detalle_resultado.data:
                continue

            detalle = detalle_resultado.data[0]

            id_compra = detalle.get("id_compra")

            # ------------------------------------------------
            # COMPRA
            # ------------------------------------------------

            compra_resultado = (
                supabase
                .table("compra")
                .select("*")
                .eq("id_compra", id_compra)
                .limit(1)
                .execute()
            )

            compra = (
                compra_resultado.data[0]
                if compra_resultado.data
                else {}
            )

            # ------------------------------------------------
            # CLIENTE
            # ------------------------------------------------

            id_cliente = solicitud.get("id_cliente")

            cliente_resultado = (
                supabase
                .table("cliente")
                .select("id_cliente, nombre, email")
                .eq("id_cliente", id_cliente)
                .limit(1)
                .execute()
            )

            cliente = (
                cliente_resultado.data[0]
                if cliente_resultado.data
                else {}
            )

            # ------------------------------------------------
            # TODOS LOS PRODUCTOS DE LA COMPRA
            # ------------------------------------------------

            detalles_compra_resultado = (
                supabase
                .table("detalle_compra")
                .select("*")
                .eq("id_compra", id_compra)
                .execute()
            )

            detalles_compra = (
                detalles_compra_resultado.data or []
            )

            productos = []

            for detalle_producto in detalles_compra:

                producto_resultado = (
                    supabase
                    .table("producto")
                    .select("id_producto, nombre, precio")
                    .eq(
                        "id_producto",
                        detalle_producto.get("id_producto")
                    )
                    .limit(1)
                    .execute()
                )

                producto = (
                    producto_resultado.data[0]
                    if producto_resultado.data
                    else {}
                )

                productos.append({
                    "id_producto": detalle_producto.get(
                        "id_producto"
                    ),
                    "nombre": producto.get(
                        "nombre",
                        "Producto"
                    ),
                    "cantidad": detalle_producto.get(
                        "cantidad",
                        0
                    ),
                    "precio_unitario": detalle_producto.get(
                        "precio_unitario",
                        0
                    )
                })

            # ------------------------------------------------
            # INFORMACIÓN FINAL
            # ------------------------------------------------

            resultado_final.append({

                "id_solicitud": solicitud.get(
                    "id_solicitud"
                ),

                "id_detalle_compra": id_detalle,

                "id_cliente": id_cliente,

                "nombre_cliente": cliente.get(
                    "nombre",
                    "Cliente"
                ),

                "email_cliente": cliente.get(
                    "email",
                    ""
                ),

                "id_compra": id_compra,

                "fecha_compra": compra.get(
                    "fecha_compra"
                ),

                "canal": compra.get(
                    "canal"
                ),

                "total": compra.get(
                    "total",
                    0
                ),

                "motivo": solicitud.get(
                    "motivo"
                ),

                "estado": solicitud.get(
                    "estado"
                ),

                "codigo_devolucion": solicitud.get(
                    "codigo_devolucion"
                ),

                "fecha_solicitud": solicitud.get(
                    "fecha_solicitud"
                ),

                "productos": productos
            })

        return jsonify({
            "success": True,
            "solicitudes": resultado_final
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "message": "No se pudieron consultar las solicitudes."
        }), 500


# ============================================================
# API - RESOLVER SOLICITUD
# ============================================================

@app.route(
    "/api/solicitud-devolucion/<int:id_solicitud>/resolver",
    methods=["POST"]
)
def resolver_solicitud(id_solicitud):

    # --------------------------------------------------------
    # VERIFICAR SESIÓN
    # --------------------------------------------------------

    user_id = usuario_logueado()

    if not user_id:

        return jsonify({
            "success": False,
            "message": "No hay una sesión activa."
        }), 401

    # --------------------------------------------------------
    # VERIFICAR ADMIN
    # --------------------------------------------------------

    if not es_admin():

        return jsonify({
            "success": False,
            "message": "No tienes permisos de administrador."
        }), 403

    try:

        datos = request.get_json()

        resultado = datos.get(
            "resultado",
            ""
        ).strip().lower()

        observaciones = datos.get(
            "observaciones",
            ""
        ).strip()

        # ----------------------------------------------------
        # VALIDACIONES
        # ----------------------------------------------------

        if resultado not in [
            "aprobada",
            "rechazada"
        ]:

            return jsonify({
                "success": False,
                "message": "El resultado debe ser aprobada o rechazada."
            }), 400

        if not observaciones:

            if resultado == "aprobada":

                observaciones = (
                    "La devolución fue aprobada por el administrador."
                )

            else:

                observaciones = (
                    "La devolución fue rechazada por el administrador."
                )

        # ----------------------------------------------------
        # OBTENER ADMINISTRADOR Y TIENDA
        # ----------------------------------------------------

        admin_resultado = (
            supabase
            .table("administrador")
            .select("id_admin, id_tienda")
            .eq("id_admin", user_id)
            .limit(1)
            .execute()
        )

        if not admin_resultado.data:

            return jsonify({
                "success": False,
                "message": "No se encontró el administrador."
            }), 404

        administrador = admin_resultado.data[0]

        id_tienda = administrador.get("id_tienda")

        if not id_tienda:

            return jsonify({
                "success": False,
                "message": "El administrador no tiene una tienda asignada."
            }), 400

        # ----------------------------------------------------
        # OBTENER SOLICITUD
        # ----------------------------------------------------

        solicitud_resultado = (
            supabase
            .table("solicitud_devolucion")
            .select("*")
            .eq("id_solicitud", id_solicitud)
            .limit(1)
            .execute()
        )

        if not solicitud_resultado.data:

            return jsonify({
                "success": False,
                "message": "La solicitud no existe."
            }), 404

        solicitud = solicitud_resultado.data[0]

        estado_actual = str(
            solicitud.get("estado", "")
        ).lower()

        if estado_actual not in [
            "pendiente"
        ]:

            return jsonify({
                "success": False,
                "message": "Esta solicitud ya fue procesada."
            }), 400

        # ----------------------------------------------------
        # OBTENER DETALLE DE COMPRA
        # ----------------------------------------------------

        id_detalle_compra = solicitud.get(
            "id_detalle_compra"
        )

        if not id_detalle_compra:

            return jsonify({
                "success": False,
                "message": "La solicitud no tiene un detalle de compra asociado."
            }), 400

        detalle_resultado = (
            supabase
            .table("detalle_compra")
            .select("*")
            .eq(
                "id_detalle_compra",
                id_detalle_compra
            )
            .limit(1)
            .execute()
        )

        if not detalle_resultado.data:

            return jsonify({
                "success": False,
                "message": "No se encontró el detalle de la compra."
            }), 404

        detalle = detalle_resultado.data[0]

        id_compra = detalle.get("id_compra")

        # ----------------------------------------------------
        # OBTENER COMPRA
        # ----------------------------------------------------

        compra_resultado = (
            supabase
            .table("compra")
            .select("*")
            .eq("id_compra", id_compra)
            .limit(1)
            .execute()
        )

        if not compra_resultado.data:

            return jsonify({
                "success": False,
                "message": "No se encontró la compra."
            }), 404

        compra = compra_resultado.data[0]

        # ----------------------------------------------------
        # OBTENER CLIENTE
        # ----------------------------------------------------

        id_cliente = solicitud.get("id_cliente")

        cliente_resultado = (
            supabase
            .table("cliente")
            .select("id_cliente, nombre, email")
            .eq("id_cliente", id_cliente)
            .limit(1)
            .execute()
        )

        cliente = (
            cliente_resultado.data[0]
            if cliente_resultado.data
            else {}
        )

        # ----------------------------------------------------
        # DETERMINAR RESULTADO
        # ----------------------------------------------------

        if resultado == "aprobada":

            estado_producto = "bueno"

            monto_reembolsado = compra.get(
                "total",
                0
            )

            estado_solicitud = "aprobada"

        else:

            estado_producto = "incompleto"
            monto_reembolsado = 0
            estado_solicitud = "rechazada"

        # ----------------------------------------------------
        # ACTUALIZAR SOLICITUD
        # ----------------------------------------------------

        solicitud_actualizada = (
            supabase
            .table("solicitud_devolucion")
            .update({
                "estado": estado_solicitud,
                "id_admin_revisor": user_id
            })
            .eq(
                "id_solicitud",
                id_solicitud
            )
            .execute()
        )

        if not solicitud_actualizada.data:

            return jsonify({
                "success": False,
                "message": "No se pudo actualizar la solicitud."
            }), 500

        # ----------------------------------------------------
        # VERIFICAR QUE NO EXISTA DEVOLUCIÓN
        # ----------------------------------------------------

        devolucion_existente = (
            supabase
            .table("devolucion")
            .select("id_devolucion")
            .eq(
                "id_solicitud",
                id_solicitud
            )
            .limit(1)
            .execute()
        )

        if devolucion_existente.data:

            return jsonify({
                "success": False,
                "message": "Esta solicitud ya tiene una devolución registrada."
            }), 400

        # ----------------------------------------------------
        # CREAR DEVOLUCIÓN
        # ----------------------------------------------------

        devolucion_resultado = (
            supabase
            .table("devolucion")
            .insert({
                "id_solicitud": id_solicitud,
                "id_tienda": id_tienda,
                "estado_producto": estado_producto,
                "resultado": resultado,
                "monto_reembolsado": monto_reembolsado,
                "observaciones": observaciones
            })
            .execute()
        )

        if not devolucion_resultado.data:

            return jsonify({
                "success": False,
                "message": "La solicitud fue actualizada, pero no se pudo crear la devolución."
            }), 500

        devolucion = devolucion_resultado.data[0]


        datos_n8n = {

            # Datos de DEVOLUCION
            "id_devolucion": devolucion.get(
                "id_devolucion"
            ),

            "id_solicitud": id_solicitud,

            "id_tienda": id_tienda,

            "estado_producto": estado_producto,

            "resultado": resultado,

            "monto_reembolsado": monto_reembolsado,

            "observaciones": observaciones,

            # Datos adicionales para el correo
            "email_cliente": cliente.get(
                "email",
                ""
            ),

            "nombre_cliente": cliente.get(
                "nombre",
                "Cliente"
            ),

            "id_compra": id_compra
        }



        n8n_enviado = enviar_devolucion_n8n(datos_n8n)

        return jsonify({
            "success": True,

            "message": (
                "Devolución aprobada correctamente."
                if resultado == "aprobada"
                else
                "Devolución rechazada correctamente."
            ),

            "id_devolucion": devolucion.get(
                "id_devolucion"
            ),

            "n8n_enviado": n8n_enviado
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Ocurrió un error al procesar la devolución."
        }), 500

if __name__ == "__main__":

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )