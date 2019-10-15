var queue
var stage, canvas;
var riverStreamMatrix, riverStream;

//constants
const SIDE_GRASS_WIDTH = 200;
const RIVER_WIDTH = 400;
const FOLIAGE_WIDTH = 66;


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

    stage.update();

}