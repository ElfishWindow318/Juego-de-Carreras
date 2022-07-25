var canvas;
var backgroundImage, track;
var database;
var form, player, game;
var playerCount, gameState;
var car1_IMG, car2_IMG;
var allPlayers, car1, car2, coins, fuels, obstacles;
var cars = [];
var coin_image, fuel_image, obstacle1Image, obstacle2Image;
var life_image;
var blast_image
function preload() {
  backgroundImage = loadImage("./assets/background.png");
  track = loadImage("./assets/track.jpg");
  car1_IMG = loadImage("./assets/car1.png");
  car2_IMG = loadImage("./assets/car2.png");
  coin_image = loadImage("./assets/goldCoin.png");
  fuel_image = loadImage("./assets/fuel.png");
  obstacle1Image = loadImage("./assets/obstacle1.png");
  obstacle2Image = loadImage("./assets/obstacle2.png");
  life_image = loadImage("./assets/life.png");
  blast_image = loadImage("./assets/blast.png");
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  database = firebase.database();
  game = new Game();
  game.getState();
  game.start();
}

function draw() {
  background(backgroundImage);
  if(playerCount == 2) {
    game.update(1);
  }
  if(gameState == 1) {
    game.play();
  }
    
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
};