import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, onValue, set, query, limitToLast } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCHwm1Y4mwXdxyBFrNaBvghzelBdajLra4",
  authDomain: "petdoor-79b2b.firebaseapp.com",
  databaseURL: "https://petdoor-79b2b-default-rtdb.firebaseio.com",
  projectId: "petdoor-79b2b",
  storageBucket: "petdoor-79b2b.firebasestorage.app",
  messagingSenderId: "763215466826",
  appId: "1:763215466826:web:c94ca712d4a1005acdb1b3",
  measurementId: "G-JR4MFGG6HH"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const estadoRef = ref(db, "petdoor/estado");
const comandoRef = ref(db, "petdoor/comando");

// Horas afuera a partir de las cuales salta la alerta
const LIMITE_AFUERA_HORAS = 3;

// Mostrar el estado de la puerta en vivo
onValue(estadoRef, (snapshot) => {
    const valor = snapshot.val();
    console.log("Dato recibido:", valor);
    const el = document.getElementById("estado");
    el.innerText = valor ? valor.toUpperCase() : "SIN DATOS";
    el.classList.toggle("abierta", valor === "abierta");
});

// Botones
window.abrirPuerta = function () {
    console.log("Botón ABRIR tocado");
    set(comandoRef, "abrir")
        .then(() => console.log("comando = abrir guardado"))
        .catch((e) => console.error("Error al escribir:", e));
};

window.cerrarPuerta = function () {
    console.log("Botón CERRAR tocado");
    set(comandoRef, "cerrar")
        .then(() => console.log("comando = cerrar guardado"))
        .catch((e) => console.error("Error al escribir:", e));
};

// Nombre de la mascota (se guarda en el navegador)
window.cambiarNombre = function () {
    const input = document.getElementById("petNameInput");
    const nombre = input.value.trim();
    if (nombre !== "") {
        document.getElementById("petName").innerText = nombre;
        localStorage.setItem("petName", nombre);
        input.value = "";
    }
};

const nombreGuardado = localStorage.getItem("petName");
if (nombreGuardado) {
    document.getElementById("petName").innerText = nombreGuardado;
}

// Foto de la mascota (se achica y se guarda en el navegador)
function mostrarFoto(dataUrl) {
    const img = document.getElementById("petFoto");
    const marco = document.querySelector(".pet-photo");
    img.src = dataUrl;
    marco.classList.add("con-foto");
}

const fotoGuardada = localStorage.getItem("petFoto");
if (fotoGuardada) {
    mostrarFoto(fotoGuardada);
}

document.getElementById("fotoInput").addEventListener("change", (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = () => {
        const imagen = new Image();
        imagen.onload = () => {
            const tam = 240;
            const canvas = document.createElement("canvas");
            canvas.width = tam;
            canvas.height = tam;
            const ctx = canvas.getContext("2d");

            // recorte cuadrado centrado
            const lado = Math.min(imagen.width, imagen.height);
            const sx = (imagen.width - lado) / 2;
            const sy = (imagen.height - lado) / 2;
            ctx.drawImage(imagen, sx, sy, lado, lado, 0, 0, tam, tam);

            const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            try {
                localStorage.setItem("petFoto", dataUrl);
            } catch (err) {
                console.error("No se pudo guardar la foto:", err);
            }
            mostrarFoto(dataUrl);
        };
        imagen.src = lector.result;
    };
    lector.readAsDataURL(archivo);
});

// Tiempo que lleva afuera (se actualiza solo cada 30 s)
let horaSalida = null;

function textoTiempo(ms) {
    const min = Math.floor(ms / 60000);
    if (min < 1) return "hace menos de 1 minuto";
    if (min < 60) return "hace " + min + " min";
    const horas = Math.floor(min / 60);
    const resto = min % 60;
    return "hace " + horas + " h " + resto + " min";
}

function actualizarTiempoAfuera() {
    const el = document.getElementById("tiempoAfuera");
    const caja = document.getElementById("cajaUbicacion");
    if (!el) return;

    if (horaSalida === null) {
        el.innerText = "";
        if (caja) caja.classList.remove("alerta");
        return;
    }

    const transcurrido = Date.now() - horaSalida;
    const pasoElLimite = transcurrido > LIMITE_AFUERA_HORAS * 3600000;

    el.innerText = (pasoElLimite ? "⚠️ " : "") + "Salió " + textoTiempo(transcurrido);
    if (caja) caja.classList.toggle("alerta", pasoElLimite);
}

setInterval(actualizarTiempoAfuera, 30000);

// Últimos movimientos (los 5 más recientes) y ubicación de la mascota
const registrosRef = query(ref(db, "petdoor/registros"), limitToLast(5));

onValue(registrosRef, (snapshot) => {
    const lista = document.getElementById("listaMovimientos");
    if (!lista) return;
    const items = [];

    snapshot.forEach((hijo) => {
        items.push(hijo.val());
    });

    items.sort((a, b) => b.ts - a.ts); // más reciente primero

    // Mascota adentro / afuera según el último registro
    const ubicacion = document.getElementById("ubicacion");
    if (ubicacion) {
        if (items.length === 0) {
            ubicacion.innerText = "--";
            horaSalida = null;
        } else if (items[0].tipo === "entrada") {
            ubicacion.innerText = "ADENTRO";
            horaSalida = null;
        } else {
            ubicacion.innerText = "AFUERA";
            horaSalida = items[0].ts;
        }
        actualizarTiempoAfuera();
    }

    if (items.length === 0) {
        lista.innerHTML = "<li>Sin movimientos todavía</li>";
        return;
    }

    lista.innerHTML = items.map((r) => {
        const fecha = new Date(r.ts);
        const hora = fecha.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
        const dia = fecha.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
        const tipo = r.tipo === "entrada" ? "Entrada" : "Salida";
        return `<li>${dia} ${hora} → ${tipo}</li>`;
    }).join("");
});

// App instalable: registrar el service worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
        .catch((e) => console.error("Service worker:", e));
}