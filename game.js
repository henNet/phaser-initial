var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scale: {
    // mode: Phaser.Scale.RESIZE, // you can find another types in Phaser.Scale.ScaleModeType: RESIZE | FIT | ENVELOP ...
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);
var platforms;
var player;
var stars;
var bombs;
var score = 0;
var scoreText;
var gameOver;
var gameOverText;
var alredyShowGameOver = false;

function preload() {
  this.load.image("sky", "./assets/imgs/sky.png");
  this.load.image("ground", "./assets/imgs/platform.png");
  this.load.image("star", "./assets/imgs/star.png");
  this.load.image("bomb", "./assets/imgs/bomb.png");
  this.load.spritesheet("dude", "assets/imgs/dude.png", {
    frameWidth: 32,
    frameHeight: 48,
  });
}

function create() {
  /* Scenario Background */
  this.add.image(400, 300, "sky");

  /* Ground to the player */
  platforms = this.physics.add.staticGroup();
  platforms.create(400, 568, "ground").setScale(2).refreshBody();
  platforms.create(600, 400, "ground");
  platforms.create(50, 250, "ground");
  platforms.create(750, 220, "ground");

  /* Collectables */
  stars = this.physics.add.group({
    key: "star",
    repeat: 11,
    setXY: { x: 12, y: 0, stepX: 70 },
  });

  stars.children.iterate(function (child) {
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
  });

  /* Enemies */
  bombs = this.physics.add.group();

  /* Player */
  player = this.physics.add.sprite(100, 450, "dude");
  player.setBounce(0.2);
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: "left",
    frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1 /* -1 means loop */,
  });

  this.anims.create({
    key: "turn",
    frames: [{ key: "dude", frame: 4 }],
    frameRate: 20,
  });

  this.anims.create({
    key: "right",
    frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1,
  });

  player.body.setGravityY(600);

  this.physics.add.collider(player, platforms);
  this.physics.add.collider(stars, platforms);
  this.physics.add.overlap(player, stars, collectStar, null, this);
  this.physics.add.collider(bombs, platforms);
  this.physics.add.collider(player, bombs, hitBomb, null, this);
  this.physics.add.collider(bombs, bombs);

  cursors = this.input.keyboard.createCursorKeys();
  scoreText = this.add.text(16, 16, "Score: 0", {
    fontSize: "42px",
    fill: "#16185A",
    fontFamily: "Demo",
    color: "#00f",
  });
}

function collectStar(player, star) {
  star.disableBody(true, true);

  score += 10;
  scoreText.setText("Score: " + score);

  if (stars.countActive(true) === 0) {
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    var x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play("turn");

  gameOver = true;
}

function update() {
  if (cursors.left.isDown) {
    player.setVelocityX(-200);

    player.anims.play("left", true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);

    player.anims.play("right", true);
  } else {
    player.setVelocityX(0);

    player.anims.play("turn");
  }

  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-630);
  }

  if (cursors.space.isDown && player.body.touching.down) {
    player.setVelocityY(-630);
  }

  if (gameOver == true && alredyShowGameOver == false) {
    stars.children.iterate(function (child) {
      child.disableBody(true, true);
    });

    bombs.children.iterate(function (child) {
      child.disableBody(true, true);
    });

    player.disableBody(true, true);
    console.log("Game Over");

    gameOverText = this.add.text(320, 16, "GAME OVER", {
      fontSize: "42px",
      fill: "#A52D2D",
      fontFamily: "Demo",
    });

    alredyShowGameOver = true;
  }
}
