var board = document.getElementById("board");
var textureIMG = 'assets/stone.jpg';
var boardConcontroller = new BoardController(board);
var characterModel = 'assets/warrior.obj';
var characterTexture = "assets/warrior_difuse.jpg";

window.addEventListener( 'mousemove', onMouseMove, false );
board.addEventListener( 'mousedown', onDocumentMouseDown, false );
board.addEventListener( 'touchstart', onDocumentTouchStart, false );
document.addEventListener("keydown", keyDownTextField, false);

board.addEventListener( 'onTileClick', onTileClick, false );
board.addEventListener( 'onWallTileClick', onWallTileClick, false );
board.addEventListener( 'onUserFloorTileClick', onUserFloorTileClick, false );


boardConcontroller.rotateCamera([0,0]);

function onTileClick(event){

    addTile(event.detail.position.x,event.detail.position.z);

}
function onWallTileClick(event){
    console.log(event.detail.position);
    addWallTile(event.detail.tilePosition.x,event.detail.tilePosition.z,event.detail.wallPosition);
}
function onUserFloorTileClick(event){
    // console.log(event.detail.position);
    // addTile(event.detail.position.x,event.detail.position.z);
    addWarrior(event.detail.position.x,event.detail.position.z);
}
function addWarrior(x,y){
    boardConcontroller.addModel(characterModel,characterTexture,x,y);

}
function addTile(x,y){
    boardConcontroller.createTileWithTexture(x,y,textureIMG);
}
function addWallTile(x,y,pos){
    boardConcontroller.createWallTileWithTexture(x,y,pos,2,textureIMG)
}

function onDocumentTouchStart( event ) {
    event.preventDefault();
    boardConcontroller.clickInteractionWithCoods(  event.touches[0].offsetX,event.touches[0].offsetY );
}

function onDocumentMouseDown( event ) {
    event.preventDefault();
    boardConcontroller.clickInteractionWithCoods( event.offsetX,event.offsetY );
}

function onMouseMove(event){
    event.preventDefault();
    var rotation = [0,0];
    rotation[0] = event.clientX / window.innerWidth;
    rotation[1] = event.clientY / window.innerHeight;
    //boardConcontroller.rotateCamera(rotation);
}

function onClickControlCameraButton(sender){
    cameraAction(sender.name);
}

function keyDownTextField(e) {
    var keyCode = e.keyCode;

    switch (keyCode) {
        case 87:
        cameraAction("up");
        break;
        case 83:
        cameraAction("down");
        break;
        case 37:
        cameraAction("left");
        break;
        case 39:
        cameraAction("right");
        break;
        case 65:
        cameraAction("rl");
        break;
        case 68:
        cameraAction("rr");
        break;

    }
}





function cameraAction(command){

    switch (command) {
        case "rl":
        boardConcontroller.rotateLeft(0.01);
        break;
        case "rr":
        boardConcontroller.rotateRight(0.01);
        break;
        case "up":
        boardConcontroller.moveForward(1);
        break;
        case "down":
        boardConcontroller.moveBackward(1);
        break;
        case "left":
        boardConcontroller.trackLeft(1);
        break;
        case "right":
        boardConcontroller.trackRight(1);
        break;
        default:

    }

}

function changeTileImage(texture){
    textureIMG = texture;
}

function ocultaGrid(){
    boardConcontroller.toggleFlootGrid();

}
function ocultaWallGrid(){
    boardConcontroller.toggleWallGrid();

}
