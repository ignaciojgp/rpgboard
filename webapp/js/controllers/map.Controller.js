var module = angular.module("map",[]);

module.controller("map-controller",mapController);

function mapController($scope,$http){
    //propiedades
    var characterModel = 'assets/warrior.obj';
    var characterTexture = "assets/warrior_difuse.jpg";

    $scope.objs = {};
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
            case 80://p
            exportMap();
            break;
            case 73://i
            importMap();
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
        rotateModel(direction);
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
            //            $scope.boardConcontroller.deleteObject(event.detail);
            mapCommand({
                "action":"delete",
                "idObject":event.detail.mapObjectId
            });

        }else if($scope.selectedScreenMode == PLAY_MODE && $scope.playModelSelected != null)
        {
            //$scope.boardConcontroller.moveObjectToPosition(
            // $scope.playModelSelected,
            // event.detail.position.x,
            // event.detail.position.z);
            mapCommand({
                "action":"move",
                "idObject":$scope.playModelSelected.mapObjectId,
                "origin":{"x":$scope.playModelSelected.position.x,"y":$scope.playModelSelected.position.z},
                "destination":{"x":event.detail.position.x,"y":event.detail.position.z}
            });

        }
    }
    function onUserWallTileClick(event){
        if($scope.selectedScreenMode == WALL_EDITION && $scope.submode == "delete")
        {
            //            $scope.boardConcontroller.deleteObject(event.detail);
            mapCommand({
                "action":"delete",
                "idObject":event.detail.mapObjectId
            });

        }
    }
    function onUserModelClick(event){
        if($scope.selectedScreenMode == CHARACTER_EDITION && $scope.submode == "delete"){
            //            $scope.boardConcontroller.deleteObject(event.detail);
            mapCommand({
                "action":"delete",
                "idObject":event.detail.mapObjectId
            });

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
            var obj = event.detail;
            $scope.objs[obj.mapObjectId]["obj"] = obj;
            //$scope.objs[obj.mapObjectId] = obj;
            //propagar el evento en el socket
        })
    }

    //private methods
    function addTile(x,y){
        if($scope.selectedResource != null){
            //$scope.boardConcontroller.createTileWithTexture(x,y,$scope.selectedResource.image);
            mapCommand({
                "action":"add",
                "type":"floorTile",
                "position":{"x":x,"y":y},
                "textureURL":$scope.selectedResource.image
            });

        }else{
            printMessage("select a resource in the toolbox",0);
        }
    }
    function addWallTile(x,y,pos){
        if($scope.selectedResource != null){
            //$scope.boardConcontroller.createWallTileWithTexture(x,y,pos,2,$scope.selectedResource.image)
            mapCommand({
                "action":"add",
                "type":"wallTile",
                "position":{"x":x,"y":y},
                "textureURL":$scope.selectedResource.image,
                "orientation":pos,
                "height":2
            });

        }else{
            printMessage("select a resource in the toolbox",0);
        }
    }
    function addModel(x,y){
        if($scope.selectedResource != null){
            //$scope.boardConcontroller.addModel($scope.selectedResource.geometry,$scope.selectedResource.texture,x,y);

            mapCommand({
                "action":"add",
                "type":"model",
                "position":{"x":x,"y":y},
                "geometryURL":$scope.selectedResource.geometry,
                "textureURL":$scope.selectedResource.texture,
                "rotation":0
            });

        }else{
            printMessage("select a resource in the toolbox",0);
        }
    }
    function rotateModel(direction){
        if($scope.playModelSelected != null){
            //$scope.boardConcontroller.rotateObjectByStep($scope.playModelSelected,direction);
            var rot = (2 * Math.PI) * 0.125;//step size
            var angle = direction == "rr" ? angle = rot : -rot;
            var finalAngle = $scope.playModelSelected.rotation.y+=angle;

            mapCommand({
                "action":"rotate",
                "idObject":$scope.playModelSelected.mapObjectId,
                "angle":finalAngle
            });

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

    function mapCommand(command){
        switch (command.action) {
            case "add":

                if(command.idObject == null || $scope.objs[command.idObject] == null){

                    if(command.idObject == null){
                        command.idObject = guid();
                    }

                    //se agrega el objeto
                    switch (command.type) {
                        case "floorTile":
                            var tile = $scope.boardConcontroller.createTileWithTexture(
                                command.position.x,
                                command.position.y,
                                command.textureURL,
                                command.idObject);
                            $scope.objs[command.idObject] =
                                {
                                    "obj":tile,
                                    "type":"floorTile",
                                    "position":command.position,
                                    "textureURL":command.textureURL,
                                    "idObject":command.idObject
                                };

                            //propagar el evento en el socket
                            $scope.$emit('mapCommand', command);
                            break;

                        case "wallTile":
                            var tile = $scope.boardConcontroller.createWallTileWithTexture(
                                command.position.x,
                                command.position.y,
                                command.orientation,
                                command.height,
                                command.textureURL,
                                command.idObject);
                            $scope.objs[command.idObject] = {
                                "obj":tile,
                                "type":"wallTile",
                                "position":command.position,
                                "textureURL":command.textureURL,
                                "idObject":command.idObject,
                                "height":command.height,
                                "orientation":command.orientation
                            };
                            //propagar el evento en el socket
                            $scope.$emit('mapCommand', command);
                            break;

                        case "model":
                            $scope.boardConcontroller.addModel(
                                command.geometryURL,
                                command.textureURL,
                                command.position.x,
                                command.position.y,
                                command.rotation,
                                command.idObject);
                            //el obj se asigna en el evento onModelAdded
                            $scope.objs[command.idObject] = {
                                "type":"model",
                                "position":command.position,
                                "textureURL":command.textureURL,
                                "geometryURL":command.geometryURL,
                                "rotation":command.rotation,
                                "idObject":command.idObject,
                            };
                            $scope.$emit('mapCommand', command);
                            break;

                    }
                    console.log("add obj with id:"+command.idObject);

                }else{
                    //ya ha sido agregado
                    console.log("ya se ha agregado");
                }

                break;
            case "move":
                var objToMove = $scope.objs[command.idObject];
                if(objToMove!= null && (objToMove.rotation != command.destination.x || objToMove.position.y != command.destination.y)){
                    //$scope.boardConcontroller.deleteObject(objToMove);
                    console.log("move obj with id:"+command.idObject);
                    $scope.boardConcontroller.moveObjectToPosition(
                        objToMove.obj,
                        command.destination.x,
                        command.destination.y
                    );

                    objToMove.position = command.destination

                    //propagar el evento
                    $scope.$emit('mapCommand', command);

                }else{
                    console.log("comando ignorado: "+command );
                }

                break;
            case "rotate":
                var objToRotate = $scope.objs[command.idObject];
                if(objToRotate!= null && objToRotate.rotation != command.angle){
                    //$scope.boardConcontroller.deleteObject(objToRotate);
                    console.log("rotate obj with id:"+command.idObject);
                    $scope.boardConcontroller.rotateObject(objToRotate.obj,command.angle);
                    objToRotate.rotation = command.angle;
                    //propagar el evento
                    $scope.$emit('mapCommand', command);
                }else{
                    console.log("comando ignorado: "+command );
                }


                break;
            case "delete":
                var objToDelete = $scope.objs[command.idObject];
                if(objToDelete!= null){

                    $scope.boardConcontroller.deleteObject(objToDelete.obj);
                    delete $scope.objs[command.idObject];
                    console.log("delete obj with id:"+command.idObject);

                    //propagar el evento
                    $scope.$emit('mapCommand', command);
                }

                break;
            default:

        }
    }

    function exportMap(){
        $scope.$apply(function(){

            var output = [];

            for(var i in $scope.objs){
                var newObj = JSON.parse(JSON.stringify($scope.objs[i]));
                newObj.idObject = i;
                delete newObj.obj;

                output.push(newObj);
            }

            $scope.exportOutput =JSON.stringify(output);
        });
    }

    function importMap(){

        clearMap();

        var info = JSON.parse($scope.exportOutput);

        for(var i in info){
            var command = info[i];
            command.action = "add";

            mapCommand(command);
        }

    }

    function clearMap(){
        for(var i in $scope.objs){
            mapCommand({
                "action":"delete",
                "idObject":i
            });
        }
    }
}
