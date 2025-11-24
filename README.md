---

## 🟩 README – FRONTEND (HTML + CSS + JS)

```md
# GoMail – Frontend

## Descripción
Este proyecto es el **frontend** de GoMail: una interfaz web sencilla para que estudiantes puedan:

- Iniciar sesión (login de prueba).
- Ver la bandeja de entrada y enviados de Gmail (a través del backend).
- Buscar correos por texto.
- Leer el contenido completo de cada correo.
- Ver y gestionar contactos locales.
- Ver eventos próximos de Google Calendar.
- Escribir y enviar correos usando el backend.

Todo está hecho con:
- **HTML5**
- **CSS3**
- **JavaScript Vanilla** (sin frameworks)


---

## 📌 Project Setup (Frontend)

### 1️⃣ Clonar el repositorio

Abre una terminal y ve a la carpeta donde quieres guardar el proyecto:

```sh
cd /ruta/donde/quieras/guardar
Clona el repositorio del frontend:

sh

git clone https://github.com/DiegoBurgos616/cliente-gmail-frontend.git
cd cliente-gmail-frontend
Dentro de esta carpeta encontrarás principalmente:

index.html

styles.css

main.js

2️⃣ Requisitos previos
Antes de abrir el frontend, asegúrate de que el backend esté corriendo en:

txt

http://localhost:3000
(Es decir, que ya ejecutaste node server.js en el proyecto del backend.)

3️⃣ Servir el frontend en local
El frontend son archivos estáticos, pero es mejor servirlos con un servidor simple en vez de abrir index.html directo con doble clic (para evitar problemas de CORS o rutas).

Opción A – Usando npx serve (rápida)
Desde la carpeta del frontend:

sh

npx serve . -l 5500
Esto levantará un servidor estático en:

txt

http://localhost:5500
Opción B – VS Code + Live Server
Abre la carpeta cliente-gmail-frontend en Visual Studio Code.

Instala la extensión Live Server.

Clic derecho en index.html → "Open with Live Server".

Configura Live Server para que use el puerto 5500 (o cambia FRONTEND_URL en el backend si usas otro puerto).

4️⃣ Configuración básica en el frontend
En main.js hay una constante que indica la URL del backend:

js

const API_BASE = "http://localhost:3000";
Si cambias el puerto o dominio del backend, actualiza esta constante.

El login es de prueba (no está conectado a una base de datos de usuarios).
Suele tener algo como:

js

const VALID_USER = "admin";
const VALID_PASS = "1234";
Puedes cambiar estas credenciales dentro de main.js si lo necesitas.

5️⃣ Flujo de uso (Frontend)
Levanta el backend (node server.js en la carpeta del backend).

Levanta el frontend (por ejemplo con npx serve . -l 5500).

En tu navegador ve a:

txt

http://localhost:5500
Inicia sesión con el usuario y contraseña configurados en main.js (por defecto, por ejemplo):

txt

Usuario: admin
Contraseña: 1234
Una vez dentro de la app:

Se cargan los correos llamando a GET /gmail/messages del backend.

Al hacer clic en un correo, se pide el detalle con GET /gmail/messages/:id.

Puedes buscar correos usando la barra de búsqueda.

En la sección de contactos se usan los endpoints /contacts del backend.

En la sección de eventos se consulta GET /events.

Para enviar un correo:

Usa el formulario de redacción en la interfaz.

Al enviar, el frontend hace un POST a /gmail/send del backend.
