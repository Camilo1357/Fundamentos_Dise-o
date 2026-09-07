# Mercado VIVA — MVP de Devolución de Compra Digital

## 1. Descripción del proyecto

Este proyecto consiste en el diseño de un Producto Mínimo Viable (MVP) para mejorar el proceso de devolución de compras digitales realizadas en Mercado VIVA.

Mercado VIVA es una cadena de supermercados que cuenta con tiendas físicas y canales digitales. Actualmente, las devoluciones de compras digitales realizadas en tienda requieren procesos manuales y generan reprocesos.

El MVP busca simplificar este proceso conectando al cliente, la tienda y los sistemas de Mercado VIVA, permitiendo validar previamente la devolución y facilitar su gestión en la tienda.

---

# 2. Proceso seleccionado

## Devolución de una compra digital

El equipo seleccionó el proceso de devolución de una compra digital porque permite abordar un problema concreto de la operación actual y desarrollar un proceso funcional de principio a fin.

El MVP se concentra exclusivamente en este proceso y no busca solucionar toda la transformación digital de Mercado VIVA.

---

# 3. Definición del MVP

## Problema seleccionado

Actualmente, las devoluciones de compras digitales en las tiendas físicas requieren procesos manuales y generan reprocesos.

Esto puede provocar:

- Mayor tiempo de atención al cliente.
- Repetición de información.
- Mayor carga de trabajo para los empleados.
- Dificultades para consultar y actualizar el estado de la devolución.

## Usuarios involucrados

### Cliente

Persona que realizó una compra mediante la aplicación o página web y desea devolverla en una tienda física.

### Empleado de tienda

Persona encargada de recibir el producto, consultar la solicitud y completar o rechazar la devolución según el estado del producto.

## Objetivo

Permitir que el cliente solicite y valide previamente la devolución de una compra digital, de manera que al llegar a la tienda el empleado pueda consultar la solicitud, verificar físicamente el producto y completar el proceso.

## Alcance

El MVP permitirá:

1. Consultar las compras digitales del cliente.
2. Seleccionar una compra para devolución.
3. Solicitar una devolución.
4. Validar si la compra cumple las condiciones.
5. Generar un código de devolución.
6. Consultar la solicitud desde la tienda.
7. Verificar el estado físico del producto.
8. Registrar el resultado de la revisión.
9. Completar o rechazar la devolución.
10. Consultar el estado final de la devolución.

El alcance se limita a la devolución de compras digitales en tienda y prioriza que el proceso pueda ejecutarse completamente.

---

# 4. Historias de usuario

## HU1 — Solicitar devolución

**Como** cliente,  
**quiero** seleccionar una compra digital y solicitar su devolución,  
**para** iniciar el proceso antes de dirigirme a la tienda.

### Criterios de aceptación

- El sistema debe mostrar las compras disponibles para devolución.
- El cliente debe poder seleccionar una compra.
- El sistema debe permitir iniciar la solicitud.

---

## HU2 — Validar devolución

**Como** cliente,  
**quiero** que el sistema valide si mi compra cumple las condiciones de devolución,  
**para** saber si puedo realizarla en una tienda.

### Criterios de aceptación

- El sistema debe verificar las condiciones establecidas.
- Si la compra cumple las condiciones, la solicitud queda aprobada.
- Si no cumple, el sistema debe mostrar el motivo del rechazo.

---

## HU3 — Consultar devolución en tienda

**Como** empleado de tienda,  
**quiero** consultar la solicitud mediante un código de devolución,  
**para** verificar que la devolución fue autorizada.

### Criterios de aceptación

- El empleado debe poder ingresar el código.
- El sistema debe buscar la solicitud.
- Si el código es válido, debe mostrar la información de la devolución.
- Si el código no es válido, debe mostrar un mensaje de error.

---

## HU4 — Registrar estado del producto

**Como** empleado de tienda,  
**quiero** registrar el estado físico del producto,  
**para** determinar si la devolución puede completarse.

### Criterios de aceptación

- El empleado debe indicar el estado del producto.
- Si el producto cumple las condiciones, se permite completar la devolución.
- Si no cumple, la devolución debe quedar rechazada.

---

## HU5 — Consultar estado de devolución

**Como** cliente,  
**quiero** consultar el estado de mi devolución,  
**para** saber si fue completada, rechazada o está pendiente.

### Criterios de aceptación

- El cliente debe poder consultar la devolución.
- El sistema debe mostrar el estado actual.
- El estado debe actualizarse cuando el empleado complete el proceso.

---

# 5. Diseño preliminar

## 5.1 Pasos principales del proceso

1. El cliente inicia sesión.
2. Consulta sus compras digitales.
3. Selecciona la compra que desea devolver.
4. El sistema valida si cumple las condiciones de devolución.
5. Si cumple, se genera una solicitud de devolución y un código.
6. El cliente lleva el producto y el código a una tienda.
7. El empleado consulta la solicitud.
8. El empleado verifica físicamente el producto.
9. El empleado registra el resultado de la revisión.
10. Si el producto cumple las condiciones, se completa la devolución.
11. El sistema actualiza el estado de la devolución.
12. El cliente puede consultar el resultado.

---

## 5.2 Información que ingresa

### Cliente

- Identificación o inicio de sesión.
- Compra seleccionada.
- Producto a devolver.
- Motivo de devolución.

### Empleado

- Código de devolución.
- Estado físico del producto.
- Resultado de la revisión.

---

## 5.3 Información que se consulta

- Datos de la compra.
- Productos de la compra.
- Fecha de compra.
- Estado de la devolución.
- Estado de la solicitud.
- Información necesaria para validar la devolución.

---

## 5.4 Información que se modifica

- Estado de la solicitud.
- Estado de la devolución.
- Resultado de la revisión del producto.
- Información relacionada con el inventario cuando corresponda.

---

## 5.5 Flujo de información

El sistema seguirá un flujo de comunicación entre el frontend, backend y base de datos:

**Frontend → Backend → Base de datos**

El frontend permite que el cliente y el empleado ingresen y consulten información.

El backend recibe las solicitudes mediante una API, aplica las reglas de negocio y realiza las operaciones correspondientes.

La base de datos almacena información relacionada con:

- Usuarios.
- Compras.
- Productos.
- Solicitudes de devolución.
- Estados de devolución.

Finalmente, el backend devuelve la información al frontend para que sea presentada al usuario.

---

# 6. Validaciones y manejo de errores

El sistema debe contemplar diferentes situaciones que puedan impedir la realización de una devolución.

### Validaciones

- Verificar que la compra exista.
- Verificar que la compra cumpla las condiciones de devolución.
- Verificar que el código de devolución sea válido.
- Verificar que la solicitud no haya sido procesada anteriormente.
- Verificar que el producto cumpla las condiciones establecidas.
- Verificar que los campos obligatorios estén diligenciados.

### Posibles errores

- Compra inexistente.
- Compra que no cumple las condiciones de devolución.
- Código de devolución inválido.
- Solicitud ya procesada.
- Producto que no cumple las condiciones.
- Campos obligatorios vacíos.
- Error de conexión con el servidor.
- Error de conexión con la base de datos.

---

# 7. Pruebas y calidad

El MVP contará con pruebas que permitan verificar tanto el funcionamiento normal como el comportamiento ante situaciones excepcionales.

## Prueba 1 — Flujo exitoso

### Situación

Un cliente selecciona una compra válida y solicita su devolución.

### Proceso

1. El cliente selecciona la compra.
2. El sistema valida que puede devolverse.
3. Se genera el código de devolución.
4. El empleado ingresa el código.
5. El producto se encuentra en condiciones adecuadas.
6. El empleado confirma la devolución.
7. El sistema actualiza el estado.

### Resultado esperado

La devolución queda registrada como **completada** y el cliente puede consultar su nuevo estado.

---

## Prueba 2 — Caso excepcional

### Situación

El cliente intenta devolver una compra que no cumple las condiciones establecidas.

### Proceso

1. El cliente selecciona la compra.
2. Solicita la devolución.
3. El sistema realiza la validación.
4. La compra no cumple las condiciones.

### Resultado esperado

El sistema rechaza la solicitud, muestra el motivo del rechazo y no genera una devolución aprobada.

---

# 8. Criterio de funcionamiento del MVP

El MVP se considerará funcional cuando permita ejecutar el proceso completo de devolución y manejar correctamente las situaciones de error definidas.

La prioridad será garantizar que el proceso seleccionado pueda ejecutarse de principio a fin en lugar de desarrollar múltiples funcionalidades incompletas.

---

# 9. Despliegue y operación

El despliegue se realizará de forma gradual para evitar afectar la operación normal de las tiendas.

## Etapa 1 — Prueba piloto

Implementar inicialmente el MVP en una tienda para evaluar su funcionamiento en un entorno real.

## Etapa 2 — Evaluación

Se analizarán:

- Errores encontrados.
- Tiempo promedio de devolución.
- Cantidad de devoluciones completadas.
- Problemas reportados por clientes.
- Problemas reportados por empleados.

## Etapa 3 — Ampliación

Después de realizar los ajustes necesarios, el sistema se implementará progresivamente en las demás tiendas.

---

# 10. Métrica de éxito

La métrica principal será:

> **Reducir el tiempo promedio necesario para completar una devolución digital en tienda de aproximadamente 15 minutos a un máximo de 5 minutos.**

Esta métrica permitirá determinar si el MVP realmente mejora el proceso de devolución.

---

# 11. Soporte y capacitación

Para facilitar la adopción del sistema, los empleados contarán con un instructivo corto que explique:

- Cómo buscar una devolución.
- Cómo verificar el producto.
- Cómo completar el proceso.
- Cómo actuar ante un error.

El objetivo es que los empleados puedan utilizar el sistema sin requerir una capacitación extensa.

---

# 12. Mantenimiento y mejora

## Riesgo posterior al lanzamiento

Un posible riesgo es que durante periodos de alta demanda aumente considerablemente la cantidad de devoluciones.

Esto podría provocar que el sistema o los empleados no tengan suficiente capacidad para atender todas las solicitudes, generando nuevamente acumulación de trabajo y procesos manuales.

## Recopilación de retroalimentación

Se recopilará información mediante una encuesta corta al cliente y al empleado después de cada devolución.

También se revisarán periódicamente:

- Tiempo promedio de devolución.
- Porcentaje de devoluciones rechazadas.
- Cantidad de errores.
- Cantidad de procesos realizados manualmente.

Con esta información se identificarán los principales problemas y se decidirá qué mejoras deben desarrollarse en las siguientes versiones del sistema.

---

# 13. Resumen del MVP

El proyecto propone una solución enfocada exclusivamente en la **devolución de compras digitales en tienda**.

El proceso permitirá:

**Cliente solicita devolución → Sistema valida → Se genera código → Empleado consulta → Se verifica producto → Se completa o rechaza devolución → Cliente consulta estado.**

El MVP busca reducir el trabajo manual, disminuir el tiempo de atención y mejorar la experiencia del cliente sin modificar completamente la operación de Mercado VIVA.





Installar extensiones "pip install supabase"
Installar "pip install supabase python-dotenv fastapi uvicorn"
