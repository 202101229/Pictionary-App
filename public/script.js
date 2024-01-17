const socket = io();

let isDrawer = false;

function getCookie(name) {
	let matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

var cookieValue = getCookie('useinfo');

const decodedcookie = JSON.parse(cookieValue.substring(2));

console.log(decodedcookie);

var username  = decodedcookie.username;
var id = decodedcookie.id;

console.log(username);

function createRoom() {
    socket.emit('createRoom', username);
}

function joinRoom(room) {
    console.log("joiningroom");
    socket.emit('joinRoom', {room, username});
}

socket.on('updateRooms', (rooms) => {
    console.log("yes");
    const roomList = document.getElementsByClassName('available-rooms')[0];
    roomList.innerHTML = '';
    rooms.forEach((room) => {
        const divs = document.createElement('div');
        divs.innerHTML = ` <li> ${room}</li>`;
        divs.setAttribute("class", "rooms-div");
        divs.setAttribute("room" , `$room`);
        divs.setAttribute("onclick" , 'joinRoom(this.room)');
        roomList.appendChild(divs);
    });
});

socket.on('chatHistory', (chatHistory) => {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    chatHistory.forEach((message) => {
        displayMessage(`${message.user}: ${message.message}`);
    });
});

socket.on('drawingHistory', (drawingHistory) => {
    const canvas = document.getElementById('drawingCanvas');
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawingHistory.forEach((point) => {
        context.fillStyle = '#000';
        context.beginPath();
        context.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        context.fill();
    });
});

socket.on('turnChange', (data) => {
    isDrawer = data.turn === socket.id;
    updateTurnStatus();
});

function updateTurnStatus() {
    const turnStatus = document.getElementById('turn-status');
    if (isDrawer) {
        turnStatus.innerText = 'Your Turn to Draw';
        enableDrawing();
    } else {
        turnStatus.innerText = 'Guess the Drawing';
        disableDrawing();
    }
}

function disableDrawing() {
    // Implement logic to disable drawing functionalities
}

function enableDrawing() {
    // Implement logic to enable drawing functionalities
}

function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value;
    chatInput.value = '';
    socket.emit('chatMessage', { user: socket.id, message, room: getCurrentRoom() });
}


function displayMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const p = document.createElement('p');
    p.innerText = message;
    chatMessages.appendChild(p);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

socket.on('chatMessage', (data) => {
    console.log("joo");
    displayMessage(`${data.user}: ${data.message}`);
});

function submitGuess() {
  const guessInput = document.getElementById('guessInput');
  const guess = guessInput.value.trim();
  if (guess !== '') {
    socket.emit('guess', { guess, room: getCurrentRoom() });
    guessInput.value = '';
  }
}


function clearCanvas() {
  socket.emit('clearCanvas', getCurrentRoom());
}

const canvas = document.getElementById('drawingCanvas');
const context = canvas.getContext('2d');
let isDrawing = false;

canvas.addEventListener('mousedown', (event) => {
  if (isDrawer) {
    isDrawing = true;
    draw(event);
  }
});

canvas.addEventListener('mousemove', (event) => {
  if (isDrawer && isDrawing) {
    draw(event);
  }
});

canvas.addEventListener('mouseup', () => {
  if (isDrawer) {
    isDrawing = false;
  }
});

function draw(event) {
  const x = event.clientX - canvas.getBoundingClientRect().left;
  const y = event.clientY - canvas.getBoundingClientRect().top;

  context.fillStyle = '#000';
  context.beginPath();
  context.arc(x, y, 5, 0, 2 * Math.PI);
  context.fill();

  socket.emit('draw', { x, y, room: getCurrentRoom() });
}


// const canvas = document.getElementById('drawingCanvas');
// const context = canvas.getContext('2d');
// let isDrawing = false;

// canvas.addEventListener('mousedown', (event) => {
//   isDrawing = true;
//   draw(event);
// });

// canvas.addEventListener('mousemove', (event) => {
//   if (isDrawing) {
//     draw(event);
//   }
// });

// canvas.addEventListener('mouseup', () => {
//   isDrawing = false;
// });

// function draw(event) {
//   const x = event.clientX - canvas.getBoundingClientRect().left;
//   const y = event.clientY - canvas.getBoundingClientRect().top;

//   context.fillStyle = '#000';
//   context.beginPath();
//   context.arc(x, y, 5, 0, 2 * Math.PI);
//   context.fill();

//   socket.emit('draw', { x, y, room: getCurrentRoom() });
// }

socket.on('draw', (data) => {
  context.fillStyle = '#000';
  context.beginPath();
  context.arc(data.x, data.y, 5, 0, 2 * Math.PI);
  context.fill();
});

socket.on('clearCanvas', () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
});

socket.on('guess', (data) => {
  displayMessage(`${data.user} guessed: ${data.guess}`);
});
function getCurrentRoom() {
  const path = window.location.pathname;
  const roomName = path.substring(path.lastIndexOf('/') + 1);
  return roomName;
}
