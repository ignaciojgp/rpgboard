var module = angular.module("rpgboard",[]);

module.controller("main-controller",mainController);

function mainController($scope,$http){

    var board = document.getElementById("board");
    var textureIMG = 'assets/stone.jpg';
    var boardConcontroller = new BoardController(board);
    var characterModel = 'assets/warrior.obj';
    var characterTexture = "assets/warrior_difuse.jpg";

    //listener
    window.addEventListener( 'mousemove', onMouseMove, false );
    board.addEventListener( 'mousedown', onDocumentMouseDown, false );
    board.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener("keydown", keyDownTextField, false);

    board.addEventListener( 'onTileClick', onTileClick, false );
    board.addEventListener( 'onWallTileClick', onWallTileClick, false );
    board.addEventListener( 'onUserFloorTileClick', onUserFloorTileClick, false );
    board.addEventListener( 'onUserWallTileClick', onUserWallTileClick, false );
    board.addEventListener( 'onUserModelClick', onUserModelClick, false );

    //modo de juego
    $scope.screenModes = [FLOOR_EDITION, WALL_EDITION, CHARACTER_EDITION, PLAY_MODE];
    $scope.submode = null;
    $scope.modeOptions = [];
    $scope.selectedScreenMode = null;
    $scope.clickOnOption = function(option){
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

    $scope.changeMode = function(value){
        $scope.selectedScreenMode = value;
        $scope.showModelControl = false;
        switch ($scope.selectedScreenMode) {
            case "floor edition":
                $scope.modeOptions = ["add","delete"];
                break;
            case "wall edition":
                $scope.modeOptions = ["add","delete"];
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
                $scope.showModelControl = true;
                break;
            default:

        }

        $scope.clickOnOption($scope.modeOptions[0]);
    }
    $scope.changeMode(FLOOR_EDITION);

    $scope.showModelControl = false;
    $scope.clickRotateButton = function(direction){
        if($scope.playModelSelected != null){
            var rot = (2 * Math.PI) * 0.125;

            var angle = direction == "rr" ? angle = rot : -rot;
            $scope.playModelSelected.rotation.y+=angle;
        }
    }

    boardConcontroller.rotateCamera([0,0]);

    $http.get('config/resources.json')
       .then(function(res){
          $scope.resources = res.data;
        });

    $scope.cameraControlsHandler = onClickControlCameraButton;
    $scope.playModelSelected = null;
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
        if($scope.selectedScreenMode == PLAY_MODE){
            $scope.playModelSelected = event.detail;
        }
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
        cameraAction(sender);
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



}
