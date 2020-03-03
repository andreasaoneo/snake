// Functions

const canvas = document.getElementById("c");
const startbtn = document.getElementById("s");
const score = document.getElementById("score");
const ctx = canvas.getContext("2d");

var WIDTH = canvas.width;
var HEIGHT = canvas.height;

var dx = 50;
var dy = 50;
var dr = 17.5;
var difficulty = 100;
// 0: left
// 1: up
// 2: right
// 3: down
var direction;
var actualdirection;

var snake;
var size;

var food;

var id;
var playing = false;

function init() {
	createsnake();
	newfood();

	direction = 2;
	size = 1;
	playing = true;
	id = setInterval(step, difficulty);
}

function onKeyDown(evt) {
	newdir = evt.keyCode - 37;

	// only lateral turns are allowed
	// (that is, no u-turns)
	if (newdir != actualdirection && newdir != actualdirection + 2 && newdir != actualdirection - 2) {
		direction = newdir;
	}
}

document.addEventListener("keypress", onKeyDown, false);
document.addEventListener("keydown", onKeyDown, false);

function createsnake() {
	snake = Array();
	var head = Array();
	head.x = WIDTH / 2;
	head.y = HEIGHT / 2;
	snake.push(head);
}

function collision(n) {
	if (n.x < 0 || n.x > WIDTH - 1 || n.y < 0 || n.y > HEIGHT - 1) {
		return true;
	}
	for (var i = 0; i < snake.length; i++) {
		if (snake[i].x == n.x && snake[i].y == n.y) {
			return true;
		}
	}
	return false;
}

function newfood() {
	var wcells = WIDTH / dx;
	var hcells = HEIGHT / dy;

	var randomx = Math.floor(Math.random() * wcells);
	var randomy = Math.floor(Math.random() * hcells);

	food = Array();
	food.x = randomx * dx;
	food.y = randomy * dy;
	food.r = dr;
	size = size + 1;
}

function meal(n) {
	return (n.x == food.x && n.y == food.y);
}

function movesnake() {

	h = snake[0]; // peek head

	// create new head relative to current head
	var n = Array();
	switch (direction) {
		case 0: // left
			n.x = h.x - dx;
			n.y = h.y;
			break;
		case 1: // up
			n.x = h.x;
			n.y = h.y - dy;
			break;
		case 2: // right
			n.x = h.x + dx;
			n.y = h.y;
			break;
		case 3: // down
			n.x = h.x;
			n.y = h.y + dy;
			break;
	}

	// if out of box or collision with ourselves, we die
	if (collision(n)) {
		return false;
	}

	snake.unshift(n);

	// if there's food there
	if (meal(n)) {
		newfood(); // we eat it and another shows up

	} else {
		snake.pop();
		// we only remove the tail if there wasn't food
		// if there was food, the snake grew
	}

	return true;

}

function die() {
	if (id) {
		clearInterval(id);
		playing = false;
	}
}

function circle(x, y, r) {
	ctx.beginPath();
	ctx.arc(x, y, r, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.fill();
}

function rect(x, y, w, h) {
	ctx.beginPath();
	ctx.rect(x + 2, y + 2, w - 4, h - 4);
	ctx.closePath();
	ctx.fill();
}

function screenclear() {
	ctx.fillStyle = "#333333";
	ctx.clearRect(0, 0, WIDTH, HEIGHT);
	rect(0, 0, WIDTH, HEIGHT);
}

function drawsnake(snake) {
	ctx.fillStyle = "#FFFFFF";
	snake.forEach(function (p) {
		rect(p.x, p.y, dx, dy);
	})
}

function drawfood() {
	ctx.fillStyle = "#FF3931";
	rect(food.x, food.y, dx, dy);
}





// App

function gamerun() {
	init();
	startbtn.style.display = "none";
}
function step() {
	update();
	draw();
}
function update() {
	console.log("Snake: " + snake);
	upload(snake);
	score.innerText = size - 1;
	console.log(direction + ", " + actualdirection);
	actualdirection = direction;
	if (!movesnake()) {
		score.innerText = `You died. Score:${size-1}`;
		startbtn.style.display = "";
		die();
	}
}
function draw() {
	screenclear();
	drawsnake(snake);
	drawfood();
}



// Multiplayer


var database = firebase.database();


function upload(snake) {
	var Snake = {
		snake: snake
	};

	// Get a key for a new snake.
	var newPostKey = firebase.database().ref().child('games/').push().key;

	// Write the new snake's data
	var updates = {};
	updates['/games/' + newPostKey] = Snake;

	return firebase.database().ref().update(updates);
}