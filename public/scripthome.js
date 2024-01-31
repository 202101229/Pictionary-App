document.getElementById('create-room').addEventListener('click', function () {
    const username = document.getElementById('username').value;
    const roomId = document.getElementById('room-id').value;
    // Create room logic here
    console.log(`Creating room for user ${username} with ID ${roomId}`);
});

document.getElementById('join-room').addEventListener('click', function () {
    const joinUsername = document.getElementById('join-username').value;
    const joinRoomId = document.getElementById('join-room-id').value;
    console.log(`User ${joinUsername} joined room with ID ${joinRoomId}`);
});