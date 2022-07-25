class Game {
  constructor() {
    this.title = createElement("h2");
    this.resetButton = createButton("");
    this.leadeboard = createElement("h2");
    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");
    this.playerMoving = false;
    this.blast = false;
    this.leftKeyActive = false;
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data){
      gameState = data.val();
    });
  }

  update(state) {
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();
    form = new Form();
    form.display();

    car1 = createSprite(width/2 - 50, height - 100);
    car1.addImage("car1", car1_IMG);
    car1.addImage("blast", blast_image);
    car1.scale = 0.07;
    
    car2 = createSprite(width/2 + 100, height - 100);
    car2.addImage("car2", car2_IMG);
    car2.addImage("blast", blast_image);
    car2.scale = 0.07;

    cars = [car1, car2];
    obstacles = new Group();
    coins = new Group();
    fuels = new Group();

    this.addSprites(fuels, 4, fuel_image, 0.02);
    this.addSprites(coins, 20, coin_image, 0.09);

    var obstaclesPositions = [
      { x: width / 2 + 250, y: height - 800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 1300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 1800, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 2300, image: obstacle2Image },
      { x: width / 2, y: height - 2800, image: obstacle2Image },
      { x: width / 2 - 180, y: height - 3300, image: obstacle1Image },
      { x: width / 2 + 180, y: height - 3300, image: obstacle2Image },
      { x: width / 2 + 250, y: height - 3800, image: obstacle2Image },
      { x: width / 2 - 150, y: height - 4300, image: obstacle1Image },
      { x: width / 2 + 250, y: height - 4800, image: obstacle2Image },
      { x: width / 2, y: height - 5300, image: obstacle1Image },
      { x: width / 2 - 180, y: height - 5500, image: obstacle2Image }
    ];

    this.addSprites(obstacles, obstaclesPositions.length, obstacle1Image, 0.04, obstaclesPositions);
  }

  addSprites(spriteGroup, numberOfSprites, spriteImage, scale, positions = []) {
    for(var i = 0; i < numberOfSprites; i ++){
      var x, y;
      if(positions.length>0){
        x = positions[i].x;
        y = positions[i].y;
        spriteImage = positions[i].image;
      }
      else{
        x = random(width/2+150, width/2-150);
        y = random(-height*4.5, height-400);
      }
      var sprite = createSprite(x,y);
      sprite.addImage("sprite", spriteImage);
      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
  }

  handleElements() {
    form.hide();
    form.titleImg.position(40,50);
    form.titleImg.class("gameTitleAfterEffect");

    this.title.html("Reiniciar Juego");
    this.title.class("Reset");
    this.title.position(width/2+200, 40);

    this.resetButton.class("ResetButton");
    this.resetButton.position(width/2+230, 100);

    this.leadeboard.html("Puntuacion");
    this.leadeboard.class("Reset");
    this.leadeboard.position(width/3-60, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width/3-50, 80);

    this.leader2.class("leadersText");
    this.leader2.position(width/3-50, 130);
  }

  play() {
    this.handleResetButton();
    this.handleElements();
    Player.getPlayersInfo();
    player.getCarsAtEnd();

    if(allPlayers !== undefined) {
      image(track,0,-height*5,width,height*6);
      this.showFuelBar();
      this.showLife();
      this.showLeaderboard();

      var index = 0;
      for(var plr in allPlayers){
        index = index+1;

        var x = allPlayers[plr].positionX;
        var y = height-allPlayers[plr].positionY;
        var currentLife = allPlayers[plr].life;

        if(currentLife <= 0){
          cars[index-1].changeImage("blast");
          cars[index-1].scale = 0.3;
        }
        
        cars[index-1].position.x = x;
        cars[index-1].position.y = y;

        if(index == player.index){
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);

          //camera.position.x = cars[index-1].position.x;
          camera.position.y = cars[index-1].position.y;

          this.handleCoins(index);
          this.handleFuel(index);
          this.obstacleCollision(index);
          this.carCollision(index);

          if(player.life <= 0){
            this.blast = true;
            this.playerMoving = false;
          }
        }
      }

      /*if(this.playerMoving) {
        player.positionY+=5;
        player.update();
      }*/

      this.handlePlayerControls();

      const finishline = height*6-100;
      if(player.positionY>finishline){
        gameState = 2;
        player.rank+=1;
        Player.updateCarsAtEnd(player.rank);
        player.update();
        this.showRank();
      }
      drawSprites();
    }
  }

  handlePlayerControls() {
    if(!this.blast){
      if(keyIsDown(UP_ARROW)){
        player.positionY += 10;
        this.playerMoving = true;
        player.update();
      }
      if(keyIsDown(DOWN_ARROW)){
        player.positionY -= 10;
        player.update();
      }
      if(keyIsDown(LEFT_ARROW)){
        player.positionX -= 10;
        this.leftKeyActive = true;
        player.update();
      }
      if(keyIsDown(RIGHT_ARROW)){
        player.positionX += 10;
        this.leftKeyActive = false;
        player.update();
      }  
    }
  }

  showFuelBar() {
    push();
    image(fuel_image, width/2-130, height-player.positionY-350, 20, 20);
    fill("white");
    rect(width/2-100, height-player.positionY-350,185,20);
    fill("gold");
    rect(width/2-100, height-player.positionY-350,player.fuel,20);
    noStroke();
    pop();
  }

  showLife() {
    push();
    image(life_image, width/2-130, height-player.positionY-400, 20, 20);
    fill("white");
    rect(width/2-100, height-player.positionY-400,185,20);
    fill("red");
    rect(width/2-100, height-player.positionY-350,player.life,20);
    noStroke();
    pop();
  }
  
  handleResetButton() {
    this.resetButton.mousePressed(()=>{
      database.ref("/").set({
        playerCount: 0,
        gameState: 0,
        players: {},
        carsAtEnd: 0,
      });
      window.location.reload();
    });
  }

  showLeaderboard() {
    var leader1, leader2;
    var players = Object.values(allPlayers);
    if((players[0].rank == 0 && players[1].rank == 0) || players[0].rank == 1){
      leader1 = players[0].rank + "&emsp;" + players[0].name + "&emsp;" + players[0].score;
      leader2 = players[1].rank + "&emsp;" + players[1].name + "&emsp;" + players[1].score;
    }
    if(players[1].rank == 1) {
      leader2 = players[0].rank + "&emsp;" + players[0].name + "&emsp;" + players[0].score;
      leader1 = players[1].rank + "&emsp;" + players[1].name + "&emsp;" + players[1].score;
    }
    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }

  handleFuel(index) {
    cars[index-1].overlap(fuels, function(collector, collected){
      player.fuel = 185;
      collected.remove();
    });
    if(player.fuel>0 && this.playerMoving) {
      player.fuel-=0.3;
    }
    if(player.fuel<=0){
      gameState = 2;
      this.gameOver();
    }
  }

  handleCoins(index) {
    cars[index-1].overlap(coins, function(collector, collected){
      player.score += 25;
      collected.remove();
      player.update();
    })
  }
  
  obstacleCollision(index) {
    if(cars[index-1].collide(obstacles)){
      if(this.leftKeyActive) {
        player.positionX += 100;
      }
      else {
        player.positionX -= 100;
      }
      if(player.life > 0) {
        player.life -= 185/4;
      }
      player.update();
    }
  }

  carCollision(index) {
    if(index == 1){
      if(cars[index-1].collide(cars[1])){
        if(this.leftKeyActive) {
          player.positionX += 100;
        } 
       else {
          player.positionX -= 100;
        }
        if(player.life > 0) {
          player.life -= 185/4;
        }
        player.update();
      }
    }
    if(index == 2){
      if(cars[index-1].collide(cars[0])){
        if(this.leftKeyActive) {
          player.positionX += 100;
        } 
       else {
          player.positionX -= 100;
        }
        if(player.life > 0) {
          player.life -= 185/4;
        }
        player.update();
      } 
    }
  }

  showRank() {
    swal({
      title: `Impresionante!${"\n"}Posición${"\n"}${player.rank}`,
      text: "Llegaste A La Meta Con Exito",
      imageUrl: "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "ok"
    });
  }
  gameOver() {
    swal({
      title: `Fin del Juego`,
      text: "Perdiste La Carrera",
      imageUrl: "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
      imageSize: "100x100",
      confirmButtonText: "Gracias Por Jugar"
    });
  }
}