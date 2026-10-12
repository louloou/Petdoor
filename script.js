import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

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

// Mostrar el estado de la puerta en vivo
onValue(estadoRef, (snapshot) => {
    const valor = snapshot.val();
    console.log("Dato recibido:", valor);
    document.getElementById("estado").innerText =
        valor ? valor.toUpperCase() : "SIN DATOS";
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