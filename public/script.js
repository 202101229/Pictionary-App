// script.js

function openForm(action) {
    const modal = document.getElementById("myModal");
    const formTitle = document.getElementById("formTitle");
    const roomForm = document.getElementById("roomForm");
    const roomNameInput = document.getElementById("roomName");

    if (action === 'create') {
        formTitle.innerText = "Create Room";
        roomNameInput.value = ""; // Clear the input field
    } else if (action === 'join') {
        formTitle.innerText = "Join Room";
        roomNameInput.value = ""; // Clear the input field
    }

    modal.style.display = "block";
}

function closeForm() {
    const modal = document.getElementById("myModal");
    modal.style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
    const roomForm = document.getElementById("roomForm");

    roomForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const roomNameInput = document.getElementById("roomName");
        const roomName = roomNameInput.value.trim();

        if (roomName !== "") {
            // You can handle form submission here, e.g., redirect to the chat room with the selected room name
            console.log(`Joining or creating room: ${roomName}`);
            closeForm();
        }
    });
});
