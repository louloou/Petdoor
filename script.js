function cambiarNombre(){

    const input = document.getElementById("petNameInput");

    const petName = document.getElementById("petName");

    if(input.value.trim() !== ""){

        petName.innerText = input.value;

    }

}

