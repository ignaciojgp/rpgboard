
var board = document.getElementById("board");

var boardCon = new BoardController(board);

window.addEventListener( 'mousemove', onMouseMove, false );
board.addEventListener( 'mousedown', onDocumentMouseDown, false );
board.addEventListener( 'touchstart', onDocumentTouchStart, false );
boardCon.rotateCamera([0,0]);

function onDocumentTouchStart( event ) {
    event.preventDefault();
    boardCon.clickInteractionWithCoods(  event.touches[0].offsetX,event.touches[0].offsetY );
}

function onDocumentMouseDown( event ) {
    event.preventDefault();
    boardCon.clickInteractionWithCoods( event.offsetX,event.offsetY );
}

function onMouseMove(event){
    event.preventDefault();
    var rotation = [0,0];
    rotation[0] = event.clientX / window.innerWidth;
    rotation[1] = event.clientY / window.innerHeight;

}
