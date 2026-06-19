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

const estadoRef = ref(db, "Puerta/Estado");

onValue(estadoRef, (snapshot) => {
    document.getElementById("estado").innerText = snapshot.val();
});

window.cambiarNombre = function() {

    const input = document.getElementById("petNameInput");
    const petName = document.getElementById("petName");

    if(input.value.trim() !== ""){
        petName.innerText = input.value;
    }
}

onValue(estadoRef, (snapshot) => {
    console.log("Dato recibido:", snapshot.val());

    document.getElementById("estado").innerText = snapshot.val();
});

