const socket = io();

let isDrawer = false;

var host = undefined;

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
function wanttojoin(room){
  roomjoined = room;
}

socket.on("connect" ,()=>{
  joinRoom(roomjoined);
});

socket.on('updateRooms', (rooms) => {
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


socket.on('Updateusers' , (users) =>{

  console.log(users);

  const userList = document.getElementsByClassName('users')[0];

  userList.innerHTML = '';

  users.forEach((user)=>{
    if(host === undefined) host = user.username;
    const divs = document.createElement('div');
    const icons = document.createElement('i');
    icons.className  = "fa fa-trash-o";
    icons.style.color = 'red';
    icons.setAttribute('onclick' ,`remove('${user.username}')`);
    divs.setAttribute("class", "connecteduser");
    divs.innerHTML = `${user.username}    `;
    if(user.username !== username)
    divs.appendChild(icons);
    userList.appendChild(divs);
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

socket.on('drawingHistory' ,(drawings)=>{
  context.clearRect(0, 0, canvas.width, canvas.height);
    drawings.forEach((data)=> {
    Drawthis(data);
  });

});

socket.on('turnChange', (data) => {
  isDrawer = data.turn === socket.id;
  updateTurnStatus();
});

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
  // console.log(divElement);
  chatMessages.appendChild(divElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;


}

socket.on('chatMessage', (data) => {
  displayMessage(`${data.user}: ${data.message}`, data.id);
});


function clearCanvas() {
  if(!isDrawer){

    alert("You can only clear within your turn.");

    return;

  }
  socket.emit('clearCanvas', getCurrentRoom());
}

const canvas = document.getElementById('drawingCanvas');
const context = canvas.getContext('2d');
let isDrawing = false;
let drawing = false;
let mouseleaved = true;
context.strokeStyle = '#000';
let selectedTool = 'brush';
var selectedcolor = '#000';
var Lwidth = 10;
let mxbrussize = context.lineWidth;
let px = 0;
let py = 0;
let x =0;
let y =0;
let nw = 0;

function draw(event) {

  x = event.clientX - canvas.getBoundingClientRect().left;
  y = event.clientY - canvas.getBoundingClientRect().top;

  context.lineCap = 'round';

  if ((!drawing) || (mouseleaved)) {
    context.beginPath();
    context.moveTo(x, y);
    px = x;
    py = y;
  } else {

    if(!isDrawer){
      drawing = false;
      mouseleaved = true;
      alert('You only able to Draw within Your Drawn turn.');
      return;
    }

    let canvasRect = canvas.getBoundingClientRect();
    let data = {
      px: px / canvasRect.width,
      py: py / canvasRect.height,
      x: x / canvasRect.width,
      y: y / canvasRect.height,
      selectedTool:selectedTool,
      selectedcolor:selectedcolor,
      Lwidth:Lwidth,
      room: getCurrentRoom(),
    };

    socket.emit('drawLine', data);
    px = x , py = y;
  }
}

function throttle(callback, delay) {
  let throttling = false;

  return function (...args) {
    if (!throttling) {
      callback.apply(this, args);
      throttling = true;
      setTimeout(() => {
        throttling = false;
      }, delay);
    }
  };
}
const throttledDraw = throttle(draw, 20);

canvas.addEventListener('mousedown', () => {
  drawing = true;
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
});

canvas.addEventListener('mousemove', throttledDraw);

canvas.addEventListener('mouseleave', () => {
  mouseleaved = true;
});

canvas.addEventListener('mouseenter', () => {
  mouseleaved = false;
});

function undo() {
}

function redo() {
}


window.addEventListener('keydown', (event) => {
  if (event.ctrlKey) {
    switch (event.key) {
      case '+':
        Lwidth +=1, event.preventDefault() , mxbrussize = Math.max(mxbrussize , context.lineWidth);
        break;
      case '-':
        Lwidth -=1 ,event.preventDefault();
        break;
    }
  }
});

function selectBrush() {
    selectedTool = 'brush';
    context.globalCompositeOperation = 'source-over';
    console.log('Selected Tool: Brush');
}

function selectEraser() {
    selectedTool = 'eraser';
    context.globalCompositeOperation = 'destination-out';
    console.log('Selected Tool: Eraser');
}

function changeColor(color) {
    context.strokeStyle = color;
    selectedcolor = color;
    console.log('Selected Color: ' + color);
}

socket.on('clearCanvas', () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
});

function getCurrentRoom() {
  return roomjoined;
}


function Drawthis(data){
  
  if(data.selectedTool === 'brush'){
    context.strokeStyle = data.selectedcolor;
    context.lineWidth  = data.Lwidth;
    selectBrush();
  }
  else if(data.selectedTool === 'eraser'){
    context.lineWidth  = data.Lwidth;
    selectEraser();
  }

  let canvasRect = canvas.getBoundingClientRect();
  data.px = data.px * canvasRect.width;
  data.py = data.py * canvasRect.height;
  data.x = data.x * canvasRect.width;
  data.y = data.y * canvasRect.height;
  context.beginPath();
  context.moveTo(data.px, data.py);
  context.lineTo(data.x, data.y);
  context.stroke();

}


socket.on("drawLine" ,(data)=>{

    Drawthis(data);

});


function startCountdown(val , onthis , data) {
  var countdown = val;
  var countdownElement = document.getElementById(onthis);

  let countdownInterval = setInterval(function() {
    countdown--;
    if (countdown < 0) {
        countdownElement.textContent = 3;
        clearInterval(countdownInterval);
        let x = document.getElementsByClassName('countdown-container')[0];
        x.style.display = 'none';
        nextfunc(data);
        return 0;
    }
    countdownElement.textContent = countdown;
  }, 1000);
}

function nextfunc(data){

  let count  = 5;

  let gameinterval  = setInterval(function(){
    --count;
    
    document.getElementById('remainingtime').innerHTML  = count;
    if(count < 0){
      isDrawer = false;
      clearInterval(gameinterval);
      document.getElementById('whotodraw').textContent  = 'Draw the word:  ';
      document.getElementById('drawguessword').innerHTML = 'XX';
      document.getElementById('remainingtime').innerHTML  = 'XX'; 
      document.getElementById('drawinguser').innerHTML  = '';


    }

  },1000);
}

function startthegame(){
    socket.emit('startgame'  ,{room:getCurrentRoom() , username:username , id:id});
    // startCountdown(3  , 'countdown');
    // let x = document.getElementsByClassName('countdown-container')[0];
    // x.style.display = 'flex';
    // x.style.display = 'none';
}


socket.on('turnchange' , (data)=>{

  let y = document.getElementById('learderboard'); y.style.display = 'none';
  let nx = document.getElementById('newstartbtn'); nx.style.display = 'none';
  document.getElementById('formakenone').style.display = 'block';
  console.log("hellow");
  console.log(data);
  if(data.username === username){
    isDrawer = true;
    document.getElementById('whotodraw').textContent  = 'Draw the word:  ';
    document.getElementById('drawguessword').innerHTML = data.word;
    document.getElementById('fordrawguess').textContent = 'Draw';
    document.getElementById('wordspara').textContent = `Word : ${data.word}`;
  }
  else{

    document.getElementById('whotodraw').textContent  = 'Guess the Word Drawn';
    document.getElementById('drawguessword').innerHTML = '';
    document.getElementById('fordrawguess').textContent = 'Guess';
    document.getElementById('wordspara').textContent = '';
    document.getElementById('drawinguser').innerHTML  = data.username + ' is Drawing';

  }
  startCountdown(3  , 'countdown' , data);
  let x = document.getElementsByClassName('countdown-container')[0];
  x.style.display = 'flex';

});

socket.on('makealert' ,(data)=>{
  alert(data.message);
});

function copyToClipboard() {
  var tempTextarea = document.createElement("textarea");
  tempTextarea.value = roomjoined;
  document.body.appendChild(tempTextarea);
  tempTextarea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextarea);
  alert("Text copied to clipboard: \n" + roomjoined);
}

function remove(user){

  socket.emit('removeplayer' , {room: getCurrentRoom(), username:username , id:id , player:user});

}

socket.on('initiateRedirect' , (data)=>{
    alert("You are removed from this game by Host");
    window.location.href = data.to;
});

socket.on('endgame', (data)=>{
  document.getElementById('formakenone').style.display = 'none';
  let x = document.getElementsByClassName('countdown-container')[0];
  x.style.display = 'flex';
  let y = document.getElementById('learderboard');
  y.style.display = 'flex';

  let nx = document.getElementById('newstartbtn');

  nx.style.display = 'block';

});