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

const movimientosRef = ref(db, "Puerta/Movimientos");

onValue(movimientosRef, (snapshot) => {

    const movimientos = snapshot.val();

    let entradas = 0;
    let salidas = 0;

    const lista = document.getElementById("listaMovimientos");
    lista.innerHTML = "";

    movimientos.forEach((mov) => {

        if (!mov) return;

        if (mov.Tipo === "Entrada") entradas++;
        if (mov.Tipo === "Salida") salidas++;

        const li = document.createElement("li");

        const hora = mov.Hora || mov["Hora "];

        li.textContent = `${hora} → ${mov.Tipo}`;

        lista.appendChild(li);
    });

    document.getElementById("entradas").textContent = entradas;
    document.getElementById("salidas").textContent = salidas;

    document.getElementById("promedio").textContent =
        Math.round((entradas + salidas) / 7);

});