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

var username = decodedcookie.username;
var id = decodedcookie.id;

console.log(username);

function createRoom() {
  socket.emit('createRoom', username);
}

var roomjoined;

function joinRoom(room) {
  console.log("joiningroom to " + room);
  socket.emit('joinRoom', { room, username });
  roomjoined = room;
}

socket.on('updateRooms', (rooms) => {
  console.log("yes");
  const roomList = document.getElementsByClassName('available-rooms')[0];
  roomList.innerHTML = '';
  rooms.forEach((room) => {
    const divs = document.createElement('div');
    divs.innerHTML = ` <li> ${room}</li>`;
    divs.setAttribute("class", "rooms-div");
    divs.setAttribute("onclick", `joinRoom('${room}')`);
    roomList.appendChild(divs);
  });
});

socket.on('chatHistory', (chatHistory) => {
  console.log("this is a char history");
  console.log(chatHistory);
  const chatMessages = document.getElementsByClassName('chats')[0];
  chatMessages.innerHTML = '';
  chatHistory.forEach((message) => {
    displayMessage(`${message.user}: ${message.message}`, message.id);
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
}

function enableDrawing() {
}

function sendMessage() {
  const chatInput = document.getElementById('chat-input');
  const message = chatInput.value;
  chatInput.value = '';
  socket.emit('chatMessage', { user: username, id: id, message, room: getCurrentRoom() });
}


function displayMessage(message, recid) {

  const chatMessages = document.getElementsByClassName('chats')[0];
  let divElement = document.createElement('div');
  let spanElement = document.createElement('div');

  spanElement.innerText = message;
  if (id == recid) spanElement.className = "user-chat chat-messages" , divElement.style.textAlign = 'right';
  else spanElement.className = "distance-chat chat-messages" , divElement.style.textAlign = 'left';
  divElement.appendChild(spanElement);
  console.log(divElement);
  chatMessages.appendChild(divElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;


}

socket.on('chatMessage', (data) => {
  console.log("xyz");
  displayMessage(`${data.user}: ${data.message}`, data.id);
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
  return roomjoined;
}
