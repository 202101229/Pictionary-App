const socket = io('http://localhost:5000');

function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value;

    if (message.trim() !== '') {
        socket.emit('message', message);
        messageInput.value = '';
    }
}

socket.on('message', (message) => {
    const chatWindow = document.getElementById('chat-window');
    const newMessage = document.createElement('div');
    newMessage.textContent = message;
    chatWindow.appendChild(newMessage);
});
