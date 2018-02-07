var module = angular.module("rpgboard",[]);

module.controller("main-controller",mainController);

function mainController($scope,$http){

    var board = document.getElementById("board");
    var textureIMG = 'assets/stone.jpg';
    var boardConcontroller = new BoardController(board);
    var characterModel = 'assets/warrior.obj';
    var characterTexture = "assets/warrior_difuse.jpg";

    //listener
    document.addEventListener("keydown", keyDown, false);
    window.addEventListener( 'mousemove', onMouseMove, false );
    board.addEventListener( 'mousedown', onDocumentMouseDown, false );
    board.addEventListener( 'touchstart', onDocumentTouchStart, false );

    board.addEventListener( 'onTileClick', onTileClick, false );
    board.addEventListener( 'onWallTileClick', onWallTileClick, false );
    board.addEventListener( 'onUserFloorTileClick', onUserFloorTileClick, false );
    board.addEventListener( 'onUserWallTileClick', onUserWallTileClick, false );
    board.addEventListener( 'onUserModelClick', onUserModelClick, false );
    board.addEventListener( 'onModelAdded', onModelAdded, false );
    //ng methods
    $scope.changeMode = changeMode;
    $scope.clickOnOption = changeOption;
    $scope.clickRotateButton = clickRotateButton;
    $scope.cameraControlsHandler = onClickControlCameraButton;


    //modo de juego
    $scope.playModelSelected = null;
    $scope.screenModes = [FLOOR_EDITION, WALL_EDITION, CHARACTER_EDITION, PLAY_MODE];
    $scope.submode = null;
    $scope.modeOptions = [];
    $scope.selectedScreenMode = null;
    $scope.showModelControls = false;

    boardConcontroller.rotateCamera([0,0]);
    $http.get('config/resources.json')
       .then(function(res){
          $scope.resources = res.data;
        });
    changeMode(FLOOR_EDITION);


    //events
    function keyDown(e) {
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
    function onMouseMove(event){
        event.preventDefault();
        var rotation = [0,0];
        rotation[0] = event.clientX / window.innerWidth;
        rotation[1] = event.clientY / window.innerHeight;
        //boardConcontroller.rotateCamera(rotation);
    }
    function onDocumentMouseDown( event ) {
        event.preventDefault();
        boardConcontroller.clickInteractionWithCoods( event.offsetX,event.offsetY );
    }
    function onDocumentTouchStart( event ) {
        event.preventDefault();
        boardConcontroller.clickInteractionWithCoods(  event.touches[0].offsetX,event.touches[0].offsetY );
    }

    //GUI events
    function changeMode(value){
        $scope.selectedScreenMode = value;
        switch ($scope.selectedScreenMode) {
            case "floor edition":
                $scope.modeOptions = ["add","delete"];
                $scope.showModelControls = false;

                break;
            case "wall edition":
                $scope.modeOptions = ["add","delete"];
                $scope.showModelControls = false;

                break;
            case "character edition":
                boardConcontroller.hideFloorGrid();
                boardConcontroller.hideWallGrid();
                $scope.modeOptions = ["add","delete"];
                break;
            case "play mode":
                boardConcontroller.hideFloorGrid();
                boardConcontroller.hideWallGrid();
                $scope.modeOptions = ["rotate left","rotate right"];
                break;
            default:

        }

        changeOption($scope.modeOptions[0]);
    }
    function changeOption(option){
        $scope.submode = option;

        if($scope.selectedScreenMode == FLOOR_EDITION)
        {
            boardConcontroller.hideWallGrid();

            if( $scope.submode == "add"){
                boardConcontroller.showFloorGrid();
            }else{
                boardConcontroller.hideFloorGrid();
            }
        }

        if($scope.selectedScreenMode == WALL_EDITION)
        {
            boardConcontroller.hideFloorGrid();

            if( $scope.submode == "add"){
                boardConcontroller.showWallGrid();
            }else{
                boardConcontroller.hideWallGrid();
            }
        }
    }
    function clickRotateButton(direction){
        if($scope.playModelSelected != null){
            boardConcontroller.rotateObjectByStep($scope.playModelSelected,direction);
        }
    }
    function onClickControlCameraButton(sender){
        cameraAction(sender);
    }

    //grid assets events
    function onTileClick(event){
        if($scope.selectedScreenMode == FLOOR_EDITION && $scope.submode == "add"){
            addTile(event.detail.position.x,event.detail.position.z);
        }
    }
    function onWallTileClick(event){
        console.log(event.detail.position);
        addWallTile(event.detail.tilePosition.x,event.detail.tilePosition.z,event.detail.wallPosition);
    }
    //user assets events
    function onUserFloorTileClick(event){
        if($scope.selectedScreenMode == CHARACTER_EDITION && $scope.submode == "add")
        {
            addWarrior(event.detail.position.x,event.detail.position.z);
        }else if($scope.selectedScreenMode == FLOOR_EDITION && $scope.submode == "delete")
        {
            boardConcontroller.deleteObject(event.detail);
        }else if($scope.selectedScreenMode == PLAY_MODE && $scope.playModelSelected != null)
        {
            boardConcontroller.moveObjectToPosition($scope.playModelSelected,event.detail.position.x,event.detail.position.z);
            console.log("moving objet to position x:"+event.detail.position.x+" z:"+event.detail.position.z);
        }
    }
    function onUserWallTileClick(event){
        if($scope.selectedScreenMode == WALL_EDITION && $scope.submode == "delete")
        {
            boardConcontroller.deleteObject(event.detail);
        }
    }
    function onUserModelClick(event){
        if($scope.selectedScreenMode == CHARACTER_EDITION && $scope.submode == "delete"){
            boardConcontroller.deleteObject(event.detail);
        }
        if($scope.selectedScreenMode == PLAY_MODE || $scope.selectedScreenMode == CHARACTER_EDITION ){
            $scope.$apply(function(){
                $scope.playModelSelected = event.detail;
                $scope.showModelControls = true;

            })
        }
    }
    function onModelAdded(event){
        $scope.$apply(function(){
            $scope.playModelSelected = event.detail;
            $scope.showModelControls = true;
            
        })
    }

    //private methods
    function addWarrior(x,y){
        var model = boardConcontroller.addModel(characterModel,characterTexture,x,y);

    }
    function addTile(x,y){
        boardConcontroller.createTileWithTexture(x,y,textureIMG);
    }
    function addWallTile(x,y,pos){
        boardConcontroller.createWallTileWithTexture(x,y,pos,2,textureIMG)
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

}
