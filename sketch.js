// List of todo's
// TODO: Add more effects
//      Jumping slope
// TODO: Better helicopter gif?

var mountainbackground;
var snow = [];

var info;
var infoScreen;
var playGame;

// Game background and position
var gamebackground;
var backgroundY = 0;
var selectPage;


// Skier object and images
var skier;
var skierImgLeft;
var skierImgRight;

// Used to start displaying skier
var distSkier;
var distSet = 400;

// Dificulty setting and images
var difficulty;
var easy;
var medium;
var hard;

// Obstacle variables
var tree1;
var tree2;
var tree3;
var tree4;
var rock1;
var rock2;
var rock3;
var obstacleImgs;
var obstacles = [];
var numObstacles;
var speedObst;

// Lives and skier status variables
var lives = 3;
var life1, life2, life3;
var life, nolife;
var newLives = [];
var skierVulnerable;
var isJumpingSlope = false;
var countFall;
var setCountFall;
var livesLevel;

// Hold logo image
var startLogo;


// Sound effects
var sound1, sound2, soundBase, wind1, wind2;

var selectedDificulty;

// Record of scores
var scores = {};
var currentScore = 0;

// Used to calculate final score
var multiScore;

// Used to properly display finishing line
var finalDist;
var barFinalDist=0;

// Effects
// Ski trace
var skiTraceArray = [];
// snow falling during game
var snowEffect;


// Variables to show points subtracted or added to score
var sub100;
var gotLife = false;
var add100;


// Animations and gifs
var helicopter;
var helicopterX;
var helicopterAnimation = true;

// Animated Obstacles
var wolfLeft;
var wolfRight;
var wolf = [wolfLeft, wolfRight];
var hawkLeft;
var hawkRight;
var hawk = [hawkLeft, hawkRight];
var animals;

var points = 0;
var mode = "start";
var inst = false;
var showBackgroundArt = true;
var howWhite = 227;
var rateOfSnowColor = 0.007;
var showSelectPage = true;
var selectPageY = 0;
var subtracted = 0;

// For input in final screen
var input, button;

function preload() {
    // load in all of our graphics
    mountainbackground = loadImage("images/mountainbackground.jpg");
    startLogo = loadImage("images/snowyTopsLogo.png");
    info = loadImage("images/infobutton.png");
    playGame = loadImage("images/playbutton.png");
    infoScreen = loadImage("images/infoPage.png");

    gamebackground = loadImage("images/snowymountain.jpg");
    selectPage = loadImage("images/snowmountainselect.png");

    backbutton = loadImage("images/backbutton.png");

    for (var i = 0; i < 10; i++) {
        snow.push(new SnowFlake(random(-400, 600), random(-600, 500), 1, "images/snow1.png"));
    }

    tree1 = loadImage("images/tree1.png");
    tree2 = loadImage("images/tree21.png");
    tree3 = loadImage("images/tree31.png");
    tree4 = loadImage("images/tree41.png");
    rock1 = loadImage("images/rock1.png");
    rock2 = loadImage("images/rock2.png");
    rock3 = loadImage("images/rock3.png");


    skierImgLeft = loadImage("images/skileft.png");
    skierImgRight = loadImage("images/skiright.png");
    skierImgLeftDown = loadImage("images/skileftdown.png");
    skierImgRightDown = loadImage("images/skirightdown.png");

    life = loadImage("images/lifegood.png");
    nolife = loadImage("images/lifebad.png");

    sound1 = loadSound("sounds/leftturn.mp3");
    sound2 = loadSound("sounds/rightturn.mp3");
    soundBase = loadSound("sounds/openingScreen.mp3");
    wind1 = loadSound("sounds/wind1.mp3");
    wind2 = loadSound("sounds/wind2.mp3");

    helicopter = loadGif("images/helicopter.gif");

    wolfLeft = loadGif("images/wolfLeft.gif");
    wolfRight = loadGif("images/wolfRight.gif");
    wolf = [wolfLeft, wolfRight];

    hawkLeft = loadGif("images/hawkLeft.gif");
    hawkRight = loadGif("images/hawkRight.gif");
    hawk = [hawkLeft, hawkRight];
}

function setup() {
    textSize(12);
    var theCanvas = createCanvas(1200, 700);
    theCanvas.style('display', 'block');  
    theCanvas.style('margin', 'auto');

    // Get skier object
    skier = new Skier(width/2-30, 140);

    setImageObjectsSize();
    
    // Seeting objestacles arrays
    obstacleImgs = [tree1, tree2, tree3, tree4, rock1, rock2, rock3];
    animatedObsImgs = [hawk, wolf];

    // Setting skier options;
    resetSkierOptions();

    soundBase.setVolume(0.5);
    sound1.setVolume(0.5);
    sound2.setVolume(0.5);
    soundBase.loop();
    wind1.loop();

    noStroke();

    input = createInput();
    input.hide();

    button = createButton('submit');
    button.hide();
    
    putLivesOnTrack(1150, 5000);

    snowEffect = new SnowFalling();

    // Set initial position for helicopter
    helicopterX = -helicopter.width;
}

function draw() {

    if(mode == "start") {
        if(!soundBase.isPlaying()) soundBase.loop();
        displayStartScreen();
        snow.forEach((flake) => {
            flake.moveAndDisplay();
        });
    }
    // Info page: displays instructions for game, can go back tod start or play
    else if(mode == "info"){
        displayInfoScreen();
        snow.forEach((flake) => {flake.moveAndDisplay();});
        if(mouseIsPressed && mouseX < 200 && mouseY< 200) mode = "start";
    }
    //this is select level page
    else if(mode == "setdifficulty"){
        displaySetDifficultyScreen();
        snow.forEach((flake) => {flake.moveAndDisplay();});
    }
    //setting variables based on level selected
    else if(mode == "setgame"){
        setGame();
        mode = "game";

    }
    //game mode, where the you avoid obstacles
    else if(mode == "game") {
        // Setting layer on back and varying its color
        background(howWhite);
        varyWhitenessSnow();
        // Slide animations and helicopter
        if(showBackgroundArt) moveArt();
        if(helicopterAnimation) enterHelicopter();

        // Final Line
        if (distSkier > finalDist - height && height - barFinalDist > 0) displayFinishLine();

        // Main part of game
        if (distSkier > distSet) gameLogic();
        
        moveSkierAndCheckVulnerability();

        //check for skier vulnerability
        if (!skierVulnerable) textIfHurt();

        if (gotLife) textIfExtra();

        //dist and score keeper
        distSkier++;

        checkLives(lives);
        displayScoreAndLives();

        if (keyIsDown(13)) mode = "pause";

        snowEffect.moveDisplayAndRemove();
    }
    else if(mode == "pause"){
        soundBase.stop();
        background(howWhite);
        textSize(32);
        text("Press SPACE to Resume", width/2-180, height/2-15);a
        if(keyIsDown(32)){
            mode = "game";
            soundBase.loop();
        }
        snowEffect.moveDisplayAndRemove();
    }
    else if(mode == "getUserName"){
        soundBase.stop();
        background(howWhite);
        input.show();
        input.position(width/2-40, height/2-15);
        button.show();
        button.position(input.x + input.width, height/2-15);
        button.mousePressed(toScore);
        snowEffect.moveDisplayAndRemove();
    }
    //go to next level and reset variables
    else if(mode == "setNextLevel"){
        showBackgroundArt = true;
        skierVulnerable = true;
        obstacles = [];
        animatedObstacles = [];
        howWhite = 227;
        background(255);
        fill(0);
        text("Score: "+currentScore, width/2-100, height/2-30);
        text("Press SPACE to Continue on the Next Level", width/2-150, height/2+10);
        if(keyIsDown(32)){
            mode = "game";
        }
        snowEffect.moveDisplayAndRemove();
    }
    else if(mode == "records"){
        background(227);
        fill(0);
        var plusThis = 25;
        text("HIGHEST SCORES: ", width/2-60, height/2-30);Object.keys(scores);
        Object.keys(scores).forEach((key)=>{
            text(key + ": " +scores[key], width/2-60, height/2-30+plusThis);
            plusThis+=25;
        });

        displayBackButton();

        if(mouseIsPressed && mouseX < 200 && mouseY< 200){
            mode = "start";
            showBackgroundArt = true;
            backgroundstartY = 250;
            backgroundY = 0;
        }
        snowEffect.moveDisplayAndRemove();
    }
}

function setGame(){

    distSkier = 0;
    currentScore = 0;

    life1 = new Lives(width-100, 100);
    life2 = new Lives(width-100, 150);
    life3 = new Lives(width-100, 200);

    lives = 3;
        //obstacle array filling up the initial obstacle array
    obstacles = [];
    while(obstacles.length < 20){
        var r = Math.round(random(0, 1)*2);
        obstacles.push(new Obstacle(random(0, 1150), random(750, 1900), obstacleImgs[r]));
    }

    animatedObstacles = [];
    while(animatedObstacles.length < 4) animatedObstacles.push(new AnimatedObstacle(random(100, 1000), random(750, 8000), random(animatedObsImgs)));

    finalDist = 2500;
    if(selectedDificulty == "easy"){
        speedObst = 3;
        numObstacles = 17;
        multiScore = 1.0;
        livesLevel = 3;
    }else if(selectedDificulty == "medium"){
        speedObst = 4;
        numObstacles = 23;
        multiScore = 1.15;
        livesLevel = 2;
    }else if(selectedDificulty == "hard"){
        speedObst = 5;
        numObstacles = 29;
        multiScore = 1.30;
        livesLevel = 1;
    }
    setCountFall = 120;
}

function moveArt(){
    if(showSelectPage){
        image(gamebackground, 0, backgroundY, 1200, 700);
        image(selectPage, 0, selectPageY, 1200, 700);
        selectPageY -= speedObst;
        if(selectPageY < -620) showSelectPage = false;
    }else if(showBackgroundArt) {
        image(gamebackground, 0, backgroundY, 1200, 700);
        backgroundY -= speedObst;
        if(backgroundY < -700) showBackgroundArt = false;
    }
}

function enterHelicopter(){
    if(helicopterAnimation){
        helicopter.play();
        image(helicopter, helicopterX, 100, 300, 130);
        helicopterX += 3.5;
        if(helicopterX > width)
            helicopterAnimation = false;
    }    
}

function varyWhitenessSnow(){
    if (howWhite < 200 || howWhite > 255) rateOfSnowColor *= -1;
    howWhite += rateOfSnowColor;
}

function displayFinishLine(){
    fill(216, 0, 0, 70);
    rect(0, height - barFinalDist, width, 15);
    text("FINISH LINE", width / 2 - 30, height - barFinalDist + 13);
    barFinalDist += speedObst;
    if (skier.y - 90 >= height - barFinalDist + 13) {
        mode = "setNextLevel";
        resetObjectsAndValues();
    }
}

function setImageObjectsSize(){
    life.resize(40,40);
    nolife.resize(40, 40);
    selectPage.resize(1200, 700);
}

function resetObjectsAndValues(){
    distSkier = 250;
    numObstacles *= 1.2;
    numObstacles = int(numObstacles);
    speedObst += 0.3;
    backgroundY = 0;
    showBackgroundArt = true;
    barFinalDist = 0;
    skier.x = width/2-100;
    obstacles = [];
    skiTraceArray = [];
    inst = false;
    howWhite = 227;
    rateOfSnowColor = 0.007;
    subtracted = 0;
}

function resetSkierOptions(){
    distSkier = 0;
    skierVulnerable = true;
    speedObst = 3;
}

function displayInfoScreen(){
    image(mountainbackground, 0, 0, 1200, 700);
    fill(240, 90);
    rect(280, 150, 640, 400);
    image(startLogo, width / 2 - 300, height / 2 - 340, 600, 120);
    image(infoScreen, 200, 150, 700, 400);
    image(skierImgLeft, 640, 200);
    image(wolfRight, 600, 350);
    image(hawkLeft, 800, 240);
    displayBackButton();
}

function displayStartScreen(){
    var playX = width/2-150;
    var playY = height/2;
    var infoX = width/2+150;
    var infoY = height/2;

    image(mountainbackground, 0, 0, 1200, 700);
    image(startLogo, width / 2 - 300, height / 2 - 340, 600, 120);

    fill(255, 100);

    rect(width/2 - 355, height/2 - 130, 700, 300);
    imageMode(CENTER);
    image(info, infoX, infoY, 200, 200);
    image(playGame, playX, playY,200, 200);
    imageMode(CORNER);
    if(mouseIsPressed){
        // user selects play
        if(dist(mouseX, mouseY, playX, playY)<100) mode = "setdifficulty";
        // user selects info
        if(dist(mouseX, mouseY, infoX, infoY)<100) mode = "info";
    }
}

function displaySetDifficultyScreen(){
    image(mountainbackground, 0, 0, 1200, 700);
    image(startLogo, width / 2 - 300, height / 2 - 340, 600, 120);
    image(selectPage, 0, 0);
    displayBackButton();
    if(mouseIsPressed && mouseX < 200 && mouseY< 200) mode = "start";

    if (mouseIsPressed) {
        if (mouseX > width / 2 - 50 && mouseX < width / 2 + 50) {
            if (mouseY > height / 2 - 100 && mouseY < height / 2 - 50) {
                mode = "setgame";
                selectedDificulty = "easy";
            }
            if (mouseY > height / 2 && mouseY < height / 2 + 50) {
                mode = "setgame";
                selectedDificulty = "medium";
            }
            if (mouseY > height / 2 + 100 && mouseY < height / 2 + 150) {
                mode = "setgame";
                selectedDificulty = "hard";
            }
            if (mouseY > height / 2 + 220 && mouseY < height / 2 + 270) inst = true;
        }
    }
}

function checkCollisionAndMoveAllObstacleArray(arrayIn, toSubtract){
    for (var j = 0; j < arrayIn.length; j++) {
        arrayIn[j].moveAndDisplay();
        if (arrayIn[j].checkCollision(skier.xPos(), skier.yPos()) && skierVulnerable) {
            skierVulnerable = false;
            countFall = 0;
            currentScore -= toSubtract;
            subtracted = toSubtract;
            sub100 = skier.y - 20;
            lives--;
        }

        //recycling the obstacle
        if (arrayIn[j].remove()) {
            arrayIn.splice(j, 1);
            j--;
        }
    }
}

function checkCollisionLife(){
    for (var j = 0; j < newLives.length; j++) {
        newLives[j].moveAndDisplay();
        if (newLives[j].checkCollision(skier.xPos(), skier.yPos())) {
            newLives.splice(j, 1);
            j--;
            if (lives == 3) {
                gotLife = true;
                add100 = skier.y - 20;
                currentScore += 200;
            } else if (lives == 2) {
                life3.addLife();
                lives++;
            } else if (lives == 1) {
                life2.addLife();
                lives++;
            }
        }

        if (newLives[j] && newLives[j].remove()) {
            newLives.splice(j, 1);
            j--;
        }
    }
}

function checkCollisionInAll(){
    checkCollisionAndMoveAllObstacleArray(obstacles, 100); 
    checkCollisionAndMoveAllObstacleArray(animatedObstacles, 200); 
    checkCollisionLife();
}

function moveSkierAndCheckVulnerability(){
    if(!showSelectPage)
        if (skierVulnerable || countFall % 2 == 0)
            skier.moveAndDisplay();
}

function gameLogic(){
    // Placing new objects on track
    skiTraceArray.push(new Trace(skier.x, skier.y));
    putLivesOnTrack(1950, 5000);
    while (obstacles.length < numObstacles) obstacles.push(new Obstacle(random(0, 1150), random(750, 1900), random(obstacleImgs)));
    while(animatedObstacles.length < numObstacles/4) animatedObstacles.push(new AnimatedObstacle(random(100, 1000), random(750, 8000), random(animatedObsImgs)));

    // Placing ski tracks
    skiTraceArray.forEach((skiTrace) => { skiTrace.moveAndDisplay();});
    if (skiTraceArray.length > 2000) {
        skiTraceArray.shift();
    }

    checkCollisionInAll();

    currentScore++;
}

function textIfHurt(){
    countFall++;
    if (countFall > setCountFall) skierVulnerable = true;
    fill(200, 10, 30);
    textSize(13);
    if(subtracted == 100) text("-100", skier.x, sub100);
    else text("-200", skier.x, sub100);
    sub100 -= speedObst;
    fill(howWhite);
}

function textIfExtra(){
    fill(10, 200, 30);
    textSize(13);
    text("+100", skier.x, add100);
    add100 -= speedObst;
    fill(howWhite);
    if (add100 < -30) gotLife = false;
}

function displayScoreAndLives(){
    fill(0);
    text("SCORE: " + currentScore, width - 100, 50);
    if (lives > 0) {
        life1.display();
        life2.display();
        life3.display();
    }else{
        mode = "getUserName";
        resetObjectsAndValues();
        resetSkierOptions();
    }
}

function putLivesOnTrack(x, y){
    if (newLives.length < livesLevel) newLives.push(new Life(random(0, x), random(750, y)));
}

function checkLives(lives){
    if (lives == 3){
        life1.addLife();
        life2.addLife();
        life3.addLife();
    }
    else if (lives == 2) {
        life1.addLife();
        life2.addLife();
        life3.removeLife();
    }
    else if (lives == 1) {
        life1.addLife();
        life2.removeLife();
        life3.removeLife();
    }
}

function toScore(){
    scores[input.value()] = currentScore;
    input.value('');
    mode = "records";
    input.hide();
    button.hide();
}

function displayBackButton(){
    image(backbutton, 0, 0, 100, 100);
    fill(0);
    fill(howWhite);
    text("BACK TO MAIN MENU", 10, 110);
}


class Life{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.src = life;
    }
    moveAndDisplay(){
        this.y -= speedObst;
        image(this.src, this.x, this.y);
    }

    checkCollision(x1, y1){
        if(dist(x1, y1, this.x, this.y) < 50){
            return true;
        }
    }

    remove(){
        if (this.y < -100){
            return true;
        }
    }
}

class SnowFlake{
    constructor(xLoc, yLoc, speed, art){
      this.x = xLoc;
      this.y = yLoc;
      this.speed = speed;
      this.art = loadImage(art);
    }

    moveAndDisplay(){
      this.y += this.speed;
      if(this.y >= height){
        this.y = -600;
        this.x = random(-400, 600);
      }
      image(this.art, this.x, this.y);
    }

}


class Obstacle{
    constructor(x, y, imagesource){
        this.x = x;
        this.y = y;
        this.src = imagesource;
        this.width = imagesource.width;
        this.height = imagesource.height;
    }

    moveAndDisplay(){
        this.y -= speedObst;
        image(this.src, this.x, this.y);
    }

    checkCollision(x1, y1){
        if(dist(x1, y1, this.x, this.y) < 50){
            return true;
        }
    }

    remove(){
        if (this.y < -100){
            return true;
        }
    }
}


class Skier{
    constructor(x, y, skierWidth, skierHeight){
        this.x = x;
        this.y = y;
        this.src = skierImgLeft;
        this.playSound1 = true;
        this.playSound2 = true;
        this.width = skierWidth;
        this.heigth = skierHeight;
        this.jumpRate = 1;
    }

    fall(){
        if (this.y < 130){
            this.y += 2;
        }
    }//fall, could fall out of helicopter

    xPos(){
        return this.x;
    }

    yPos(){
        return this.y;
    }

    sendBack(x1, y1){
        this.x = x1;
        this.y = y1;
    }

    jumping(){
        this.heigth += this.jumpRate;
        this.width += this.jumpRate;
        if(this.heigth > 400){
            this.jumpRate *= -1;
        }

        if(this.heigth == 200){
            isJumpingSlope = false;
        }
    }
    moveAndDisplay(){
        if (keyIsDown(65) && this.x > 50){
            this.x -= 2;
            this.src = skierImgRight;
            if (this.playSound1) {
                if(sound1.isPlaying() == false) sound1.play();
                this.playSound1 = false;
                this.playSound2 = true;
            }
        }
        if (keyIsDown(68) == true && this.x <= 1150){
            this.x += 2;
            this.src = skierImgLeft;
            if(this.playSound2) {
                if(sound2.isPlaying() == false) sound2.play();
                this.playSound2 = false;
                this.playSound1 = true;
            }
        }
        if (keyIsDown(87) == true && this.y > 131){
            this.y -= 1;
            speedObst -= 0.005;
        }

        if (keyIsDown(83) == true && this.y < 260){
            this.y += 3;
            speedObst += 0.005;
        }

        if(this.src == skierImgRight || this.src == skierImgLeft){
            speedObst += 0.001;
        }

        if(this.src == skierImgLeft)
            if(this.x + this.width < width) this.x += 1;
        else if(this.src == skierImgRight)
            if(this.x > 0) this.x -= 1;
        image(this.src, this.x, this.y);
    }//move
}

class Trace{
    constructor(x,y){
        this.x = x+30;
        this.y = y+30;
    }

    moveAndDisplay () {
      fill(howWhite -30) ;
      this.y -= speedObst;
      var dia = random(4, 20);
      ellipse(this.x, this.y, dia, dia);
    }

    getY(){
        return this.y;
    }
}

class Lives{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.src = life;
    }

    display(){
        image(this.src, this.x, this.y);
    }

    removeLife(){
        this.src = nolife;
    }

    addLife(){
        this.src = life;
    }
}

class SnowFalling{
    constructor(){
        this.xS = [];
        this.yS = [];
        this.diameter = [];
        while(this.xS.length < 500){
            this.xS.push(random(0, 1180));
            this.yS.push(random(-1200, -10));
            this.diameter.push(random(1, 10));
        }
    }

    moveDisplayAndRemove(){
        fill(howWhite-50);
        for(var i = 0; i< this.xS.length; i++){
            this.yS[i] += 1;
            ellipse(this.xS[i], this.yS[i], this.diameter[i], this.diameter[i]);
            if(this.yS[i] > height){
                this.yS.splice(i, 1);
                this.xS.splice(i, 1);
                this.diameter.splice(i, 1);
                i--;
            }
        }

        while(this.xS.length < 500){
            this.xS.push(random(0, 1180));
            this.yS.push(random(-1200, -10));
            this.diameter.push(random(1, 10));
        }
    }

}



class AnimatedObstacle{
    constructor(x, y, imagesources){
        this.x = x;
        this.y = y;
        this.speedX = speedObst;
        this.src = [];
        this.src = imagesources;
        this.currentSrc = this.src[1];
        this.width = imagesources[0].width;
        this.height = imagesources[0].height;
    }

    moveAndDisplay(){
        this.y -= speedObst;
        this.x += this.speedX;
        if(this.x + this.width >= width || this.x <= 0) {
            this.speedX *= -1;
            if (this.speedX > 0) this.currentSrc = this.src[1];
            else this.currentSrc = this.src[0];
        }
        if(this.y < height && this.y + this.height > 0) image(this.currentSrc, this.x, this.y);
    }

    checkCollision(x1, y1){
        if(dist(x1, y1, this.x, this.y) < 50){
            return true;
        }
    }

    remove(){
        if (this.y < -100){
            return true;
        }
    }
}


// TODO: Extra
class SlopesRelief{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }

    moveAndDisplay () {
        fill(howWhite-30) ;
        this.y -= speedObst;
        var dia = random(4, 20);
        ellipse(this.x, this.y, dia, dia);
    }

    getY(){
        return this.y;
    }
}