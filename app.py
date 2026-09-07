from flask import Flask, render_template

# Creamos la aplicación Flask
app = Flask(__name__)


# =========================================
# RUTA PRINCIPAL
# =========================================

# Cuando el usuario entre a:
# http://127.0.0.1:5000/


# =========================================
# INICIAR SERVIDOR
# =========================================

# Flask ejecutará esta función.
@app.route("/")
def inicio():
    return render_template("index.html")


@app.route("/admin")
def admin():
    return render_template("admin.html")


app.run(debug=True)

# debug=True hace que Flask se reinicie
# automáticamente cuando modificamos el código.
app.run(debug=True)