var module = angular.module("rpgboard",[]);

module.controller("main-controller",mainController);

function mainController($scope,$http){
    //propiedades
    var characterModel = 'assets/warrior.obj';
    var characterTexture = "assets/warrior_difuse.jpg";

    $scope.selectedResource = null;
    $scope.boardConcontroller = null;
    $scope.availableResources = [];
    //modo de juego
    $scope.playModelSelected = null;
    $scope.screenModes = [FLOOR_EDITION, WALL_EDITION, CHARACTER_EDITION, PLAY_MODE];
    $scope.submode = null;
    $scope.modeOptions = [];
    $scope.selectedScreenMode = null;
    $scope.showModelControls = false;
    //ng methods
    $scope.changeMode = changeMode;
    $scope.clickOnOption = changeOption;
    $scope.clickRotateButton = clickRotateButton;
    $scope.cameraControlsHandler = onClickControlCameraButton;
    $scope.changeSelectedResource = changeSelectedResource;
    $http.get('config/resources.json')
        .then(function(res){
            $scope.resources = res.data;
            init();
        });


    function init(){
        var board = document.getElementById("board");
        $scope.boardConcontroller = new BoardController(board);
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

        $scope.boardConcontroller.rotateCamera([0,0]);

        changeMode(FLOOR_EDITION);
    }

    $scope.$watch("availableResources",function(newValue,oldValue){
        $scope.selectedResource = newValue[0];
    });
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
        //$scope.boardConcontroller.rotateCamera(rotation);
    }
    function onDocumentMouseDown( event ) {
        event.preventDefault();
        $scope.boardConcontroller.clickInteractionWithCoods( event.offsetX,event.offsetY );
    }
    function onDocumentTouchStart( event ) {
        event.preventDefault();
        $scope.boardConcontroller.clickInteractionWithCoods(  event.touches[0].offsetX,event.touches[0].offsetY );
    }

    //GUI events
    function changeMode(value){
        $scope.selectedScreenMode = value;
        $scope.selectedResource = null;
        switch ($scope.selectedScreenMode) {
            case "floor edition":
                $scope.modeOptions = ["add","delete"];
                $scope.showModelControls = false;
                $scope.availableResources = $scope.resources.floorTiles;
                break;
            case "wall edition":
                $scope.modeOptions = ["add","delete"];
                $scope.showModelControls = false;

                $scope.availableResources = $scope.resources.wallTiles;
                break;
            case "character edition":
                $scope.boardConcontroller.hideFloorGrid();
                $scope.boardConcontroller.hideWallGrid();
                $scope.modeOptions = ["add","delete"];
                $scope.availableResources = $scope.resources.characterModels;
                break;
            case "play mode":
                $scope.boardConcontroller.hideFloorGrid();
                $scope.boardConcontroller.hideWallGrid();
                $scope.modeOptions = ["rotate left","rotate right"];
                $scope.availableResources = [];
                break;
            default:

        }

        changeOption($scope.modeOptions[0]);
    }
    function changeOption(option){
        $scope.submode = option;

        if($scope.selectedScreenMode == FLOOR_EDITION)
        {
            $scope.boardConcontroller.hideWallGrid();

            if( $scope.submode == "add"){
                $scope.boardConcontroller.showFloorGrid();
            }else{
                $scope.boardConcontroller.hideFloorGrid();
            }
        }

        if($scope.selectedScreenMode == WALL_EDITION)
        {
            $scope.boardConcontroller.hideFloorGrid();

            if( $scope.submode == "add"){
                $scope.boardConcontroller.showWallGrid();
            }else{
                $scope.boardConcontroller.hideWallGrid();
            }
        }
    }
    function clickRotateButton(direction){
        if($scope.playModelSelected != null){
            $scope.boardConcontroller.rotateObjectByStep($scope.playModelSelected,direction);
        }
    }
    function onClickControlCameraButton(sender){
        cameraAction(sender);
    }
    function changeSelectedResource(resource){
        $scope.selectedResource = resource;
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
            addModel(event.detail.position.x,event.detail.position.z);
        }else if($scope.selectedScreenMode == FLOOR_EDITION && $scope.submode == "delete")
        {
            $scope.boardConcontroller.deleteObject(event.detail);
        }else if($scope.selectedScreenMode == PLAY_MODE && $scope.playModelSelected != null)
        {
            $scope.boardConcontroller.moveObjectToPosition($scope.playModelSelected,event.detail.position.x,event.detail.position.z);
            console.log("moving objet to position x:"+event.detail.position.x+" z:"+event.detail.position.z);
        }
    }
    function onUserWallTileClick(event){
        if($scope.selectedScreenMode == WALL_EDITION && $scope.submode == "delete")
        {
            $scope.boardConcontroller.deleteObject(event.detail);
        }
    }
    function onUserModelClick(event){
        if($scope.selectedScreenMode == CHARACTER_EDITION && $scope.submode == "delete"){
            $scope.boardConcontroller.deleteObject(event.detail);
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
    function addTile(x,y){
        if($scope.selectedResource != null){
            $scope.boardConcontroller.createTileWithTexture(x,y,$scope.selectedResource.image);
        }else{
            printMessage("select a resource in the toolbox",0);
        }
    }
    function addWallTile(x,y,pos){
        if($scope.selectedResource != null){
            $scope.boardConcontroller.createWallTileWithTexture(x,y,pos,2,$scope.selectedResource.image)
        }else{
            printMessage("select a resource in the toolbox",0);
        }
    }
    function addModel(x,y){
        if($scope.selectedResource != null){
            var model = $scope.boardConcontroller.addModel($scope.selectedResource.geometry,$scope.selectedResource.texture,x,y);
        }else{
            printMessage("select a resource in the toolbox",0);
        }
    }

    function printMessage(message,type){
        $scope.$apply(function(){
            $scope.message = message;
        });

        setTimeout(function(){
            $scope.$apply(function(){
                $scope.message = null;
            })
        },2000);

    }

    function cameraAction(command){

        switch (command) {
            case "rl":
            $scope.boardConcontroller.rotateLeft(0.01);
            break;
            case "rr":
            $scope.boardConcontroller.rotateRight(0.01);
            break;
            case "up":
            $scope.boardConcontroller.moveForward(1);
            break;
            case "down":
            $scope.boardConcontroller.moveBackward(1);
            break;
            case "left":
            $scope.boardConcontroller.trackLeft(1);
            break;
            case "right":
            $scope.boardConcontroller.trackRight(1);
            break;
            default:

        }

    }
    function changeTileImage(texture){
        $scope.textureIMG = texture;
    }

}
