import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

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

onValue(ref(db, "petdoor/registros"), (snapshot) => {
    const items = [];
    snapshot.forEach((hijo) => {
        const r = hijo.val();
        if (r && r.ts) items.push(r);
    });
    items.sort((a, b) => b.ts - a.ts); // más reciente primero

    // Contadores
    const entradas = items.filter((r) => r.tipo === "entrada").length;
    const salidas = items.filter((r) => r.tipo === "salida").length;
    document.getElementById("entradas").textContent = entradas;
    document.getElementById("salidas").textContent = salidas;

    // Actividad por hora
    const porHora = {};
    items.forEach((r) => {
        const h = new Date(r.ts).getHours();
        porHora[h] = (porHora[h] || 0) + 1;
    });
    const horas = Object.keys(porHora).map(Number).sort((a, b) => a - b);

    // Hora pico
    const pico = document.getElementById("horarioFrecuente");
    if (horas.length === 0) {
        pico.textContent = "--";
    } else {
        const mejor = horas.reduce((a, b) => (porHora[b] > porHora[a] ? b : a));
        pico.textContent = mejor + "hs";
    }

    // Gráfico
    const grafico = document.getElementById("grafico");
    const max = Math.max(1, ...Object.values(porHora));
    grafico.innerHTML = horas.map((h) => {
        const alto = Math.round((porHora[h] / max) * 100);
        return `<div class="bar" style="height:${alto}%;"><b style="color:#fff;display:block;text-align:center;padding-top:6px;">${porHora[h]}</b><span>${h}hs</span></div>`;
    }).join("");

    // Lista de últimos movimientos
    const lista = document.getElementById("listaMovimientos");
    if (items.length === 0) {
        lista.innerHTML = "<li>Sin movimientos todavía</li>";
        return;
    }
    lista.innerHTML = items.slice(0, 5).map((r) => {
        const f = new Date(r.ts);
        const hora = f.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
        const dia = f.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
        const tipo = r.tipo === "entrada" ? "Entrada" : "Salida";
        return `<li>${dia} ${hora} → ${tipo}</li>`;
    }).join("");
});