from flask import Flask, render_template, request, redirect, url_for, session
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

        print("================================")
        print("ERROR AL INICIAR SESIÓN")
        print(e)
        print("================================")

        return redirect(url_for("inicio"))


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

        print("================================")
        print("ERROR EN EL REGISTRO")
        print(e)
        print("================================")

        return redirect(url_for("crear_cuenta"))


# =========================
# CERRAR SESIÓN
# =========================

@app.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("inicio"))


# =========================
# EJECUTAR SERVIDOR
# =========================

if __name__ == "__main__":
    app.run(debug=True)