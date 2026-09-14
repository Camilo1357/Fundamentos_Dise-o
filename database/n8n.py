import os
import requests
from dotenv import load_dotenv


load_dotenv()


N8N_WEBHOOK_URL = os.getenv(
    "N8N_WEBHOOK_URL"
)


def enviar_devolucion_n8n(datos):

    if not N8N_WEBHOOK_URL:

        print(
            "N8N_WEBHOOK_URL no está configurada."
        )

        return False


    try:

        response = requests.post(

            N8N_WEBHOOK_URL,

            json=datos,

            timeout=10

        )


        if response.ok:

            print(
                "Datos enviados correctamente a n8n."
            )

            return True


        print(
            "n8n respondió con error:"
        )

        print(
            response.status_code
        )

        print(
            response.text
        )

        return False


    except Exception as e:

        print(
            "ERROR AL CONECTAR CON N8N:"
        )

        print(e)

        return False