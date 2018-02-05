
var board = document.getElementById("board");

var boardConcontroller = new BoardController(board);

window.addEventListener( 'mousemove', onMouseMove, false );
board.addEventListener( 'mousedown', onDocumentMouseDown, false );
board.addEventListener( 'touchstart', onDocumentTouchStart, false );

board.addEventListener('onTileClick',function(event){
    console.log(event.detail.position);
},false);

boardConcontroller.rotateCamera([0,0]);

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
