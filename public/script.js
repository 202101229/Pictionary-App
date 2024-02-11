const socket = io();

let isDrawer = false;

var host = undefined;

var opno = 0;

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

var roomjoined;

function joinRoom(room) {
  console.log("joiningroom to " + room);
  socket.emit('joinRoom', { room:room, username:username ,id:id, prevroom : roomjoined});
  // socket.emit('changeroom' ,{roomjoined : roomjoined, wanttojoin : room , username:username});
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
    const hope = document.createElement('span');
    hope.setAttribute("class", "imageclass");
    console.log(user.img);
    hope.innerHTML= `<img class = "foruserimage" src="/file/${user.img}" alt="..">`;
    console.log(hope);
    console.log(divs);
    divs.innerHTML = ` `;
    divs.appendChild(hope);
    let nwspan = document.createElement('span');
    nwspan.innerHTML += `${user.username}    `;
    divs.appendChild(nwspan);
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

function sendMessage(event) {
  event.preventDefault();
  if(!isDrawer){
  const chatInput = document.getElementById('chat-input');
  let message = chatInput.value;
  message = message.trim();
    if(message !== ''){
      chatInput.value = '';
      chatInput.focus();
      socket.emit('chatMessage', { user: username, id: id, message, room: getCurrentRoom() });
    }
  }
  
}

var chatinput =document.getElementById('chat-input');

chatinput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage(event);
  }
});

function displayMessage(message, recid) {

  const chatMessages = document.getElementsByClassName('chats')[0];
  let divElement = document.createElement('div');
  let spanElement = document.createElement('div');

  spanElement.innerText = message;
  if(message.includes('System:') && message.includes('Player') && message.includes('Guess the word currectly.')){
    spanElement.style.color = 'green';
  }
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
let isdoubletaped = false;

function draw(event) {

  if(isdoubletaped){

    x = event.touches[0].clientX - canvas.getBoundingClientRect().left;
    y = event.touches[0].clientY - canvas.getBoundingClientRect().top;

  }else{

  x = event.clientX - canvas.getBoundingClientRect().left;
  y = event.clientY - canvas.getBoundingClientRect().top;
  }

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
      opno:opno,
    };
    console.log(data);
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

  if((mouseleaved === false) && (isDrawer === true)){
    ++opno;
  }
  drawing = true;
});

let lastTouchTime = 0;

canvas.addEventListener('touchstart', (event) => {
  const currentTime = new Date().getTime();
  const timeDiff = currentTime - lastTouchTime;

  if (timeDiff < 3000) {

    event.preventDefault();
    console.log('hii');
    isdoubletaped = true;
    mouseleaved = false;
    if((mouseleaved === false) && (isDrawer === true)){
      ++opno;
    }
    drawing = true;

  }

  lastTouchTime = currentTime;
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
});

canvas.addEventListener('touchend', ()=>{
    mouseleaved = true;
    drawing = false;
    isdoubletaped = false;
});

canvas.addEventListener('mousemove', throttledDraw);

canvas.addEventListener('touchmove', throttledDraw);

canvas.addEventListener('mouseleave', () => {
  mouseleaved = true;
});

canvas.addEventListener('mouseenter', () => {
  mouseleaved = false;
});

function undo() {
  if(!isDrawer){
    alert('You can undo only within your turn.');
    return;
  }

  socket.emit('undo' ,{room : getCurrentRoom()});

}

function redo() {
  if(!isDrawer){
    alert('You can redo only within your turn.');
    return;
  }

  socket.emit('redo' ,{room : getCurrentRoom()});

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

function startthegame(){
    socket.emit('startgame'  ,{room:getCurrentRoom() , username:username , id:id});
}

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

var winnermsg = document.getElementsByClassName('winner-message')[0];

socket.on('endgame', (data)=>{
  document.getElementById('formakenone').style.display = 'none';
  let x = document.getElementsByClassName('countdown-container')[0];
  x.style.display = 'flex';
  let y = document.getElementById('learderboard');
  y.style.display = 'flex';
  let nx = document.getElementById('newstartbtn');

  nx.style.display = 'block';

  let tb = document.getElementById('learderboardbody');

  tb.innerHTML = '';

  let rnk = 1;

  let users = data.users;

  let coorp = users.find( u => u.username === username);

  if(users[0].score === coorp.score){
    winnermsg.style.display = 'block';
  }

  console.log(data);

  console.log(users);

  users.forEach((user)=>{

    let tr = document.createElement('tr');
    let td = document.createElement('td');
    td.style.className = 'rank';

    td.innerHTML = rnk; ++rnk;
    
    tr.appendChild(td);

    td = document.createElement('td');

    td.style.className = 'username';

    td.innerHTML = user.username;

    tr.appendChild(td);

    td = document.createElement('td');

    td.style.className = 'score';

    td.innerHTML = user.score;

    tr.appendChild(td);

    tb.appendChild(tr);

  });

});

var coundownscointainer = document.getElementsByClassName('countdown-container')[0];
var countdownElement = document.getElementById('countdown');
var displaytimes  = document.getElementById('remainingtime');
var learderboard = document.getElementById('learderboard');
var nwstart = document.getElementById('newstartbtn');
var formake = document.getElementById('formakenone');
var whodraw = document.getElementById('whotodraw');
var wordtodraw = document.getElementById('drawguessword');
var draworguess = document.getElementById('fordrawguess');
var wordsp = document.getElementById('wordspara');
var whodrawing = document.getElementById('drawinguser');

socket.on('turnupdates', (data) => {

  let tim  = data.count;


  if(tim > 60){

    learderboard.style.display = 'none';
    nwstart.style.display = 'none';
    coundownscointainer.style.display = 'flex';
    formake.style.display = 'block';
    winnermsg.style.display = 'none';
    if(data.username === username){
      isDrawer = true;
      whodraw.textContent  = 'Draw the word:  ';
      wordtodraw.innerHTML = data.word;
      draworguess.textContent = 'Draw';
      wordsp.textContent = `Word : ${data.word}`;
    }
    else{
      isDrawer = false;
  
      whodraw.textContent  = 'Guess the Word Drawn';
      wordtodraw.innerHTML = '';
      draworguess.textContent = 'Guess';
      wordsp.textContent = '';
      whodrawing.innerHTML  = data.username + ' is Drawing';
  
    }

    countdownElement.textContent  = (tim - 61);

  }else{

    countdownElement.textContent = 5;
    coundownscointainer.style.display = 'none';


    if(data.username === username){
      isDrawer = true;
      whodraw.textContent  = 'Draw the word:  ';
      wordtodraw.innerHTML = data.word;
      whodrawing.innerHTML = '';
    }
    else{

      isDrawer = false;
  
      whodraw.textContent  = 'Guess the Word Drawn : ';
      wordtodraw.innerHTML = data.word2;
      whodrawing.innerHTML  = data.username + ' is Drawing';
  
    }

    displaytimes.innerHTML = tim;

      if(tim === 0){
      whodraw.textContent  = 'Draw the word:  ';
      wordtodraw.innerHTML = 'XX';
      displaytimes.innerHTML  = 'XX'; 
      whodraw.innerHTML  = '';
      }


  }


});