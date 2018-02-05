var board = document.getElementById("board");
var textureIMG = 'assets/stone.jpg';
var boardConcontroller = new BoardController(board);

window.addEventListener( 'mousemove', onMouseMove, false );
board.addEventListener( 'mousedown', onDocumentMouseDown, false );
board.addEventListener( 'touchstart', onDocumentTouchStart, false );
board.addEventListener( 'onTileClick', onTileClick, false );
document.addEventListener("keydown", keyDownTextField, false);



boardConcontroller.rotateCamera([0,0]);

function onTileClick(event){
    console.log(event.detail.position);
    addTile(event.detail.position.x,event.detail.position.z);

}

function addTile(x,y){
    boardConcontroller.createTileWithtexture(x,y,textureIMG);
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
        case 38:
        cameraAction("up");
        break;
        case 40:
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
