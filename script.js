var queue
var stage, canvas;
var riverStreamMatrix, riverStream;
var insects_sequence;
var frog_sequence;
var frog;
var startScreen;

var gameRuning = false;
var isGameOver = false;


var insects = [];
var leaves = [];
var score = [];
var lives = [];

//constants
const SIDE_GRASS_WIDTH = 200;
const RIVER_WIDTH = 400;
const FOLIAGE_WIDTH = 66;

const ARROW_KEY_LEFT = 37;
const ARROW_KEY_RIGHT = 39;
const SPACEBAR = 32;

var frog_data = {
    "images":["assets/frog_spritesheet.png"],
    "frames":[
        [0,0,70,90],
        [70, 0, 70, 90]
    ],
    "animations":{
        "seating":[0],
        "jumping":[1]
    }
}

var insects_data = {
    "images":["assets/insects_spritesheet.png"],
    "frames":[
        [0,0,50,50],
        [50,0,50,50],
        [100,0,50,50],
        [0,50,50,50],
        [50,50,50,50],
        [100,50,50,50]
    ],
    "animations":{
        "insect1":[0],
        "insect2":[1],
        "insect3":[2],
        "insect4":[3],
        "insect5":[4],
        "insect6":[5]
    }
}

function preload(){
    queue = new createjs.LoadQueue();
    queue.addEventListener("complete", init);
    queue.loadManifest([
        {id:"side_panel",src:"assets/grass-vector-side.jpg"},
        {id:"river", src:"assets/river-stream-vector.jpg"},
        {id:"foliage", src:"assets/foliage-vector.png"},
        {id:"leaf", src:"assets/leaf-vector.png"},
        {id:"frog", src:"assets/frog_spritesheet.png"},
        {id:"insects", src:"assets/insects_spritesheet.png"}
    ]);
}

function init(){
    canvas = document.getElementById("canvas");
    stage = new createjs.Stage(canvas);
    buildGameBackground();
    createInsects();
    addLeavesAndInsects();
    addFrog();    
    setFrogPosition();
    buildScoreBoard();
    buildLifeBoard();
    buildStartSreen();
    startGame();

    window.onkeydown = moveFrog;
}

function moveFrog(e){

    if(gameRuning){    

        switch(e.keyCode){
            case ARROW_KEY_LEFT: // turn frog left
                frog.rotation -= 10;
                break;
            case ARROW_KEY_RIGHT: // turn frog right
                frog.rotation += 10;
                break;
            case SPACEBAR: // to jump
                jumpFrog();
                break;
            default: // Nothing will happen
                break;
        }

    }else if(isGameOver == false){
        gameRuning = true;
        stage.removeChild(startScreen);
    }
}

function jumpFrog(){
    var angle = toRadians(frog.rotation);
    var jumpDistance = 200;
    var currentPosition = new createjs.Point(frog.x, frog.y);
    var targetPosition = new createjs.Point();

    var xDistance = Math.sin(angle) * jumpDistance;
    var yDistance = Math.cos(angle) * jumpDistance;
    
    targetPosition.x = currentPosition.x + xDistance;
    targetPosition.y = currentPosition.y - yDistance;
    

    if(frog.status == 'seating'){
        frog.status = 'jumping';
        frog.gotoAndStop('jumping');
        createjs.Tween.get(frog, {override:true, onChange:frogJumpProgress}).to({x:targetPosition.x, y:targetPosition.y}, 300).call(frogJumpComplete);
    }
}

function frogJumpProgress(){
    var hit = false;

    for(var i=0; i<leaves.length; i++){

        if(frog.onTheLeaf == i){
            continue;
        }

        var leaf = leaves[i];
        var pt = leaf.globalToLocal(frog.x, frog.y);
        hit = leaf.hitTest(pt.x, pt.y);

        if(hit){
            frog.onTheLeaf = i;
            var insect = leaf.getChildAt(1);
            var insectIndex = insect.currentFrame;
            score[insectIndex].text += 1;

            removeInsect(leaf);
            frog.status = 'seating';
            frog.gotoAndStop('seating');
            createjs.Tween.get(frog, {override:true});
            break;
        }

    }
}

function frogJumpComplete(){
    frog.visible = false;
    frog.status = 'seating';
    frog.gotoAndStop('seating');
    setTimeout(function(){
        frog.visible = true;
        setFrogPosition();
    }, 3000);
    removeOneLife();
}

function removeOneLife(){
    if(lives.length > 0){
        stage.removeChild(lives.pop());
    }else if(gameRuning){
        gameOver();
    }
}

function toRadians(angle){
    return angle * (Math.PI / 180);
}


function startGame(){
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener('tick', function(e){
        if(gameRuning){
            gameLoop();
        }
        
        stage.update();
    });
}


function gameLoop(){
    updateRiver();
    updateLeaves();
    updateFrog();
}


function updateRiver(){
    riverStreamMatrix.ty += 1;
    if(riverStreamMatrix.ty > 800){
        riverStreamMatrix.ty = 0;
    }
}

function updateLeaves(){
    for(var i=0; i<leaves.length; i++){
        var leaf = leaves[i];
        leaf.rotation += leaf.rotationStep;
        leaf.x += leaf.velX;
        if(leaf.x < 275 || leaf.x > 525){
            leaf.velX *= -1;
        }

        leaf.y += leaf.velY;
        if(leaf.y > 700){
            leaf.x = SIDE_GRASS_WIDTH + 100 + Math.floor(Math.random() * 200);
            leaf.y = -50;
            leaf.rotationStep = Math.random()*1 - 0.5;

            if(leaf.numChildren < 2){
                addInsect(leaf);
            }
        }

        
    }
}

function updateFrog(){
    if(frog.status == "seating"){
        var frogLeaf = leaves[frog.onTheLeaf];
        frog.x = frogLeaf.x;
        frog.y = frogLeaf.y;
        frog.rotation += frogLeaf.rotationStep;

        if(frog.y > 650){
            setFrogPosition();
            removeOneLife();
        }
    }
}

function removeInsect(leafContainer){
    leafContainer.removeChildAt(1);
}

function setFrogPosition(){
    for(var i=0; i<leaves.length; i++){
        var leaf = leaves[i];
        if(leaf.y > 200 && leaf.y < 400){
            frog.onTheLeaf = i;
            removeInsect(leaf);
            break;
        }
    }
}

function buildGameBackground(){    
    // Draw Grass
    var sidePanelLeft = new createjs.Bitmap(queue.getResult('side_panel'));
    stage.addChild(sidePanelLeft);

    var sidePanelRight = new createjs.Bitmap(queue.getResult('side_panel'));
    sidePanelRight.x = SIDE_GRASS_WIDTH + RIVER_WIDTH; // side grass:200 + river width:400 = 600
    stage.addChild(sidePanelRight);


    // Draw River
    var river = queue.getResult('river');
    riverStreamMatrix = new createjs.Matrix2D();
    riverStreamMatrix.translate(0, 0);
    riverStream = new createjs.Shape();
    riverStream.graphics.beginBitmapFill(river, "repeat", riverStreamMatrix);
    riverStream.graphics.drawRect(0, 0, RIVER_WIDTH, canvas.height);
    riverStream.x = SIDE_GRASS_WIDTH;
    stage.addChild(riverStream);

    // Draw foliages
    var foliageLeft = new createjs.Bitmap(queue.getResult("foliage"));
    foliageLeft.regX = FOLIAGE_WIDTH/2;
    foliageLeft.x = SIDE_GRASS_WIDTH;
    foliageLeft.shadow = new createjs.Shadow("rgba(0,0,0,0.8)",0,0,10);
    stage.addChild(foliageLeft);

    var foliageRight = new createjs.Bitmap(queue.getResult("foliage"));
    foliageRight.regX = FOLIAGE_WIDTH/2;
    foliageRight.x = SIDE_GRASS_WIDTH + RIVER_WIDTH;
    foliageRight.shadow = new createjs.Shadow("rgba(0,0,0,0.8)",0,0,10);
    stage.addChild(foliageRight);

    

}

function createInsects(){
    insects_sequence = new createjs.SpriteSheet(insects_data);
    for(var i=0; i<6; i++){
        var insect = new createjs.Sprite(insects_sequence);
        insect.regX = 25;
        insect.regY = 25;
        insect.gotoAndStop(i);
        insects.push(insect);
    }
}

function addLeavesAndInsects(){
    var leafTexture = queue.getResult('leaf');

    for(var i=0; i<5; i++){

        var leafContainer = new createjs.Container();
        leafContainer.x = SIDE_GRASS_WIDTH + 100 + Math.floor(Math.random() * 200);
        leafContainer.y = 150 * i + 50;
        leafContainer.velX = Math.random()*2 - 1;
        leafContainer.velY = 0.75;
        leafContainer.rotationStep = Math.random()*1 - 0.5;

        //Add leaf to container
        var leaf = new createjs.Shape();
        var leafMetrix = new createjs.Matrix2D();
        leafMetrix.translate(-50,-50);
        leaf.graphics.beginBitmapFill(leafTexture,'no-repeat',leafMetrix);
        leaf.graphics.drawCircle(0,0,50);        
        leafContainer.addChild(leaf);

        addInsect(leafContainer);

        stage.addChild(leafContainer);
        leaves.push(leafContainer);
    }

}

function addInsect(leafContainer){
    var insect = insects[Math.floor(Math.random()*5)].clone();        
    leafContainer.addChild(insect);    
}

function addFrog(){
    frog_sequence = new createjs.SpriteSheet(frog_data);
    frog = new createjs.Sprite(frog_sequence);
    frog.gotoAndStop('seating');
    frog.regX = 35;
    frog.regY = 45;
    frog.status = "seating";
    stage.addChild(frog);
}

function buildScoreBoard(){
    for(var i=0; i<insects.length; i++){
        var insect = insects[i].clone();
        insect.x = SIDE_GRASS_WIDTH + RIVER_WIDTH + 75;
        insect.y = 75 * i + 100;
        stage.addChild(insect);

        var txt = new createjs.Text(0, "35px Arial", "#ff7700");
        txt.textBaseline = "middle";
        txt.textAlign = "right";
        txt.x = SIDE_GRASS_WIDTH + RIVER_WIDTH + 150;
        txt.y = 75 * i + 100;
        stage.addChild(txt);
        score.push(txt);
    }
}

function buildLifeBoard(){
    for(var i=0; i<5; i++){
        var life = frog.clone();
        life.x = 90;
        life.y = i * 100 + 100;
        life.shodow = new createjs.Shadow("#fff", 0, 0, 5);
        stage.addChild(life);
        lives.push(life);
    }
}


function buildStartSreen(){
    startScreen = new createjs.Container();
    startScreen.x = stage.canvas.width/2;
    startScreen.y = stage.canvas.height/2;
    stage.addChild(startScreen);

    var line1 = new createjs.Text("FROGGY","72px Righteous", "#11ff11");
    line1.textAlign = "center";
    line1.y = -200;
    startScreen.addChild(line1);
    
    var line2 = new createjs.Text("Press any key to","24px Righteous", "#fff");
    line2.textAlign = "center";
    line2.y = -100;
    startScreen.addChild(line2);
    
    var line3 = new createjs.Text("Start Game","48px Righteous", "#fff");
    line3.textAlign = "center";
    line3.y = -40;
    startScreen.addChild(line3);
    
    var line4 = new createjs.Text("Use left and right arrow key to turn left right","24px Righteous", "#fff");
    line4.textAlign = "center";
    line4.y = 50;
    startScreen.addChild(line4);
    
    var line5 = new createjs.Text("Spacebar to Jump","24px Righteous", "#fff");
    line5.textAlign = "center";
    line5.y = 80;
    startScreen.addChild(line5);
}

function gameOver(){
    gameRuning = false;
    isGameOver = true;
    var text = new createjs.Text("Game Over", "48px Righteous", "#fff");
    text.textBaseline = "middle";
    text.textAlign = "center";
    text.x = stage.canvas.width / 2;
    text.y = stage.canvas.height / 2;
    stage.addChild(text);
}