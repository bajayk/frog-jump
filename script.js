var queue
var stage, canvas;
var riverStreamMatrix, riverStream;
var insects_sequence;
var frog_sequence;
var frog;


var insects = [];
var leaves = [];

//constants
const SIDE_GRASS_WIDTH = 200;
const RIVER_WIDTH = 400;
const FOLIAGE_WIDTH = 66;

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
    startGame();
}

function startGame(){
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener('tick', function(e){
        gameLoop();        
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


