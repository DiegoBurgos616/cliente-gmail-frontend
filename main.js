const API_BASE = "https://28e42ee87b66.ngrok-free.app";

// ================================
// Config login local
// ================================
const VALID_USER = "admin";
const VALID_PASS = "1234";

let currentLabel = "INBOX";
let currentQuery = "";

// ================================
// Tabs bandeja
// ================================
function highlightTabs() {
  const inboxBtn = document.getElementById("tab-inbox");
  const sentBtn = document.getElementById("tab-sent");
  if (!inboxBtn || !sentBtn) return;

  if (currentLabel === "INBOX") {
    inboxBtn.classList.add("tab-active");
    sentBtn.classList.remove("tab-active");
  } else {
    inboxBtn.classList.remove("tab-active");
    sentBtn.classList.add("tab-active");
  }
}

// ================================
// Login / Logout local
// ================================
function handleLogin(event) {
  event.preventDefault();

  const userEl = document.getElementById("login-user");
  const passEl = document.getElementById("login-pass");
  const errorEl = document.getElementById("login-error");

  const user = userEl.value.trim();
  const pass = passEl.value.trim();

  if (user === VALID_USER && pass === VALID_PASS) {
    localStorage.setItem("loggedIn", "true");
    errorEl.textContent = "";
    updateUIByAuth();
  } else {
    errorEl.textContent = "Usuario o contraseña incorrectos.";
  }
}

function logout() {
  // Redirigimos al backend para limpiar sesión
  window.location.href = API_BASE + "/logout";
}

// ================================
// Búsqueda en Gmail
// ================================
function handleSearch() {
  const input = document.getElementById("search-input");
  currentQuery = input.value.trim();
  loadMessages();
}

// ================================
// Cargar lista de mensajes
// ================================
async function loadMessages() {
  try {
    const listEl = document.getElementById("messages");
    if (!listEl) return;

    listEl.innerHTML = "";
    const loading = document.createElement("div");
    loading.style.fontSize = "12px";
    loading.style.color = "#9ca3af";
    loading.textContent = "Cargando mensajes...";
    listEl.appendChild(loading);

    const params = new URLSearchParams();
    params.set("label", currentLabel);
    if (currentQuery) {
      params.set("q", currentQuery);
    }

    const res = await fetch(API_BASE + `/gmail/messages?${params.toString()}`);
    if (!res.ok) throw new Error("Error al obtener mensajes");

    const data = await res.json();

    listEl.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      const empty = document.createElement("div");
      empty.style.fontSize = "12px";
      empty.style.color = "#9ca3af";
      empty.textContent = "No hay mensajes para mostrar.";
      listEl.appendChild(empty);
      return;
    }

    data.forEach((msg) => {
      const li = document.createElement("li");
      li.className = "message-item";
      li.onclick = () => loadMessage(msg.id);

      const fromEl = document.createElement("div");
      fromEl.className = "msg-from";
      fromEl.textContent = msg.from || "(Sin remitente)";

      const subjectEl = document.createElement("div");
      subjectEl.className = "msg-subject";
      subjectEl.textContent = msg.subject || "(Sin asunto)";

      const snippetEl = document.createElement("div");
      snippetEl.className = "msg-snippet";
      snippetEl.textContent = msg.snippet || "";

      const dateEl = document.createElement("div");
      dateEl.className = "msg-date";
      dateEl.textContent = msg.date || "";

      li.appendChild(fromEl);
      li.appendChild(subjectEl);
      li.appendChild(snippetEl);
      li.appendChild(dateEl);

      listEl.appendChild(li);
    });
  } catch (err) {
    console.error("Error cargando mensajes:", err);
    alert("Error cargando mensajes. Revisa la consola.");
  }
}

// ================================
// Cargar contenido de un mensaje
// ================================
async function loadMessage(id) {
  try {
    const res = await fetch(API_BASE + `/gmail/messages/${id}`);
    const data = await res.json();

    const subjectEl = document.getElementById("detail-subject");
    const metaEl = document.getElementById("detail-meta");
    const bodyEl = document.getElementById("detail-body");

    if (!subjectEl || !metaEl || !bodyEl) return;

    const from = data.from || "(Sin remitente)";
    const subject = data.subject || "(Sin asunto)";
    const date = data.date || "";

    subjectEl.textContent = subject;
    metaEl.textContent = `${from} · ${date}`;

    if (data.bodyHtml) {
      bodyEl.innerHTML = data.bodyHtml;
    } else {
      bodyEl.textContent = data.body || "(Sin contenido)";
    }
  } catch (err) {
    console.error("Error cargando mensaje:", err);
    alert("Error cargando el mensaje. Revisa la consola.");
  }
}

// ================================
// Cambiar bandeja
// ================================
function setMailbox(label) {
  currentLabel = label;
  currentQuery = "";
  const input = document.getElementById("search-input");
  if (input) input.value = "";
  highlightTabs();
  loadMessages();
}

// ================================
// Enviar correo
// ================================
async function sendEmail(event) {
  event.preventDefault();

  const toEl = document.getElementById("to");
  const subjectEl = document.getElementById("subject");
  const messageEl = document.getElementById("message");
  const statusEl = document.getElementById("send-status");

  const to = toEl.value.trim();
  const subject = subjectEl.value.trim();
  const message = messageEl.value.trim();

  if (!to || !message) {
    alert("Destinatario y mensaje son obligatorios.");
    return;
  }

  statusEl.textContent = "Enviando correo...";

  try {
    const res = await fetch(API_BASE + "/gmail/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, message }),
    });

    if (!res.ok) throw new Error("Error al enviar correo");

    statusEl.textContent = "Correo enviado correctamente.";
    toEl.value = "";
    subjectEl.value = "";
    messageEl.value = "";
  } catch (err) {
    console.error("Error enviando correo:", err);
    statusEl.textContent = "Error al enviar correo.";
  }
}

// ================================
// IA: Mejorar correo
// ================================
async function improveWithAI() {
  const subjectEl = document.getElementById("subject");
  const messageEl = document.getElementById("message");
  const statusEl = document.getElementById("ai-status");

  const subject = subjectEl.value.trim();
  const message = messageEl.value.trim();

  if (!message) {
    alert("Escribe un mensaje para que la IA lo mejore.");
    return;
  }

  statusEl.textContent = "Llamando a la IA...";

  try {
    const res = await fetch(API_BASE + "/ai/format-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });

    if (!res.ok) throw new Error("Error al formatear con IA");

    const data = await res.json();
    subjectEl.value = data.subject || subject;
    messageEl.value = data.body || message;
    statusEl.textContent = "Mensaje mejorado.";
  } catch (err) {
    console.error("Error formateando con IA:", err);
    statusEl.textContent = "Error al mejorar el mensaje con IA.";
  }
}

// ================================
// Contactos
// ================================
async function loadContacts() {
  try {
    console.log(">>> Llamando loadContacts()");
    const res = await fetch(API_BASE + "/contacts");
    console.log("Respuesta /contacts status:", res.status);

    if (!res.ok) throw new Error("Error al cargar contactos");
    const data = await res.json();
    console.log("Datos recibidos de /contacts:", data);

    const list = document.getElementById("contacts-list");
    console.log("Elemento contacts-list:", list);

    if (!list) {
      console.error("No se encontró el elemento #contacts-list en el DOM");
      return;
    }

    list.innerHTML = "";

    if (!data.length) {
      const empty = document.createElement("div");
      empty.style.fontSize = "12px";
      empty.style.color = "#9ca3af";
      empty.textContent = "Aún no hay contactos guardados.";
      list.appendChild(empty);
      return;
    }

    data.forEach((c) => {
      const item = document.createElement("div");
      item.className = "contact-item";

      const nameEl = document.createElement("div");
      nameEl.className = "contact-name";
      nameEl.textContent = c.name;

      const emailEl = document.createElement("div");
      emailEl.className = "contact-email";
      emailEl.textContent = c.email;

      const tagEl = document.createElement("div");
      tagEl.className = "contact-tag";
      tagEl.textContent = c.tag || "";

      const actionsEl = document.createElement("div");
      actionsEl.className = "contact-actions";

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn-secondary";
      deleteBtn.textContent = "Eliminar";
      deleteBtn.onclick = () => deleteContact(c.id);

      actionsEl.appendChild(deleteBtn);

      item.appendChild(nameEl);
      item.appendChild(emailEl);
      item.appendChild(tagEl);
      item.appendChild(actionsEl);

      list.appendChild(item);
    });
  } catch (err) {
    console.error("Error cargando contactos:", err);
    alert("Error cargando contactos. Revisa la consola.");
  }
}

async function addContact(event) {
  event.preventDefault();

  const nameEl = document.getElementById("contact-name");
  const emailEl = document.getElementById("contact-email");
  const tagEl = document.getElementById("contact-tag");

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const tag = tagEl.value.trim();

  if (!name || !email) {
    alert("Nombre y correo son obligatorios.");
    return;
  }

  try {
    const res = await fetch(API_BASE + "/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, tag }),
    });

    if (!res.ok) throw new Error("Error al agregar contacto");

    nameEl.value = "";
    emailEl.value = "";
    tagEl.value = "";

    await loadContacts();
  } catch (err) {
    console.error("Error agregando contacto:", err);
    alert("Error agregando contacto. Revisa la consola.");
  }
}

async function deleteContact(id) {
  if (!confirm("¿Eliminar este contacto?")) return;

  try {
    const res = await fetch(API_BASE + `/contacts/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Error al eliminar contacto");
    await loadContacts();
  } catch (err) {
    console.error("Error eliminando contacto:", err);
    alert("Error eliminando contacto. Revisa la consola.");
  }
}

// ================================
// Eventos (Calendar)
// ================================
async function loadEvents() {
  try {
    const list = document.getElementById("events-list");
    if (!list) return;

    list.innerHTML = "";
    const loading = document.createElement("div");
    loading.style.fontSize = "12px";
    loading.style.color = "#9ca3af";
    loading.textContent = "Cargando reuniones...";
    list.appendChild(loading);

    const res = await fetch(API_BASE + "/events");
    if (!res.ok) throw new Error("Error al cargar reuniones");

    const data = await res.json();

    list.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      const empty = document.createElement("div");
      empty.style.fontSize = "12px";
      empty.style.color = "#9ca3af";
      empty.textContent = "No hay reuniones programadas.";
      list.appendChild(empty);
      return;
    }

    data.forEach((ev) => {
      const item = document.createElement("div");
      item.className = "event-item";

      const dateStr = ev.date || "";
      const timeStr = ev.time || "";
      const participants = ev.participants || "";
      const notes = ev.notes || "";

      const metaText = timeStr ? `${dateStr} · ${timeStr}` : dateStr;

      item.innerHTML = `
        <div class="event-row-top">
          <div class="event-title">${ev.title}</div>
          <button type="button"
            class="btn-secondary"
            style="padding:4px 8px; font-size:10px;"
            onclick="deleteEvent('${ev.id}')">
            Eliminar
          </button>
        </div>
        <div class="event-meta-row">
          <div class="event-meta">${metaText}</div>
          <div class="event-participants">${participants}</div>
        </div>
        <div class="event-notes">${notes}</div>
      `;

      list.appendChild(item);
    });
  } catch (err) {
    console.error("Error cargando reuniones:", err);
    alert("Error cargando reuniones. Revisa la consola.");
  }
}

async function addEvent(event) {
  event.preventDefault();

  const titleEl = document.getElementById("event-title");
  const dateEl = document.getElementById("event-date");
  const timeEl = document.getElementById("event-time");
  const participantsEl = document.getElementById("event-participants");
  const notesEl = document.getElementById("event-notes");

  const title = titleEl.value.trim();
  const date = dateEl.value.trim();
  const time = timeEl.value.trim();
  const participants = participantsEl.value.trim();
  const notes = notesEl.value.trim();

  if (!title || !date || !time) {
    alert("Título, fecha y hora son obligatorios.");
    return;
  }

  try {
    const res = await fetch(API_BASE + "/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, date, time, participants, notes }),
    });

    if (!res.ok) throw new Error("Error al crear reunión");

    titleEl.value = "";
    dateEl.value = "";
    timeEl.value = "";
    participantsEl.value = "";
    notesEl.value = "";

    await loadEvents();
  } catch (err) {
    console.error("Error creando reunión:", err);
    alert("Error creando reunión. Revisa la consola.");
  }
}

async function deleteEvent(id) {
  if (!confirm("¿Eliminar esta reunión?")) return;

  try {
    const res = await fetch(API_BASE + `/events/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Error al eliminar reunión");
    await loadEvents();
  } catch (err) {
    console.error("Error eliminando reunión:", err);
    alert("Error eliminando reunión. Revisa la consola.");
  }
}

// ================================
// Mostrar / ocultar secciones
// ================================
function updateUIByAuth() {
  const loggedIn = localStorage.getItem("loggedIn") === "true";

  const loginSection = document.getElementById("login");
  const appSection = document.getElementById("app");

  if (!loginSection || !appSection) return;

  if (loggedIn) {
    loginSection.style.display = "none";
    appSection.style.display = "flex";
    highlightTabs();
    loadMessages();
    loadContacts();
    loadEvents();
  } else {
    loginSection.style.display = "flex";
    appSection.style.display = "none";
  }
}

// ================================
// Init
// ================================
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  const composeForm = document.getElementById("compose-form");
  if (composeForm) {
    composeForm.addEventListener("submit", sendEmail);
  }

  const addContactForm = document.getElementById("add-contact-form");
  if (addContactForm) {
    addContactForm.addEventListener("submit", addContact);
  }

  const addEventForm = document.getElementById("event-form");
  if (addEventForm) {
    addEventForm.addEventListener("submit", addEvent);
  }

  updateUIByAuth();
});
