"use strict"
let arrow = document.querySelectorAll(".settings__input");
let amount = document.querySelector(".setings__amount-number");
let socket = new WebSocket("ws://localhost:8080");

let person;


function addPerson(object) {
    let table = document.querySelector(".table");
    let div = document.createElement("div");
    div.classList.toggle("table__person");

    div.innerHTML = ` 
    <p class="table__value">${object.name}</p>
    <p class="table__value">${object.type}</p>
    <p class="table__value">${object.time}</p>
    <p class="table__value">${object.actualTime}</p>`
    table.append(div);
    return true;
}

socket.onmessage = (e) => {
    let message = JSON.parse(e.data);
    if (message.type === "short") {
        amount.value = message.value;
    } else {
        amount.value = message[0].value;
        person = message[1].value;
        for (let i = 0; i < message[1].value.length; i++) {
            addPerson(person[i]);
        }
    }
}
amount.addEventListener("input", () => {
    if (amount.value === "") {
        amount.value = 0;
    }
    let value = { "type": "short", "message": amount.value };
    socket.send(JSON.stringify(value));
});






arrow[0].addEventListener("click", function() {
    if (amount.value !== "0") {
        let value = JSON.stringify({ "type": "short", "message": -1 })
        socket.send(value);
    }
});
arrow[1].addEventListener("click", function() {
    let value = JSON.stringify({ "type": "short", "message": 1 });
    socket.send(value);
})



function actualTime() {
    let table = document.querySelectorAll(".table__person");
    for (let i = 0; i < person.length; i++) {
        table.forEach(element => {
            if (element.children[0].innerText === person[i].name) {
                if (person[i].actualTime / 60 < 1) {
                    element.children[3].innerText = person[i].actualTime;
                    person[i].actualTime++;
                } else {
                    element.children[3].innerText = Math.floor(person[i].actualTime / 60) + " м";
                    person[i].actualTime++;
                }
            }
        });
    }
}

let seconds = setInterval(actualTime, 1000);