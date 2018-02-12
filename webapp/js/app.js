var module = angular.module("rpgboard",["map"]);

module.controller("app-controller",appController);

function appController($scope,$http){

    $scope.shareMap = beginShareMap;
    $scope.executedCommands = [];
    $scope.mapID = getJsonFromUrl().mapid;
    $scope.userID = guid();
    $scope.requests = {};


    var requireLastMap = false;
    //asignacion del id inicial
    if($scope.mapID != null){
        requireLastMap = true;
    }else{
        $scope.mapID = guid();
    }

    var socket = io.connect();
    socket.on("connect",function(){
        socket.emit("joinRoom",$scope.mapID);
    });

    //map initial update
    if(requireLastMap){
        var newRequest = {"id":guid(),  "type":"update","state":"send","from":$scope.userID};
        newRequest.mapID = $scope.mapID;
        $scope.requests[newRequest.id] = newRequest;
        socket.emit("lastMapRequest",newRequest);
    }

    //cuando un usuario solicita la actualizacion
    socket.on("lastMapRequest",function(args){
        if(args.from != $scope.userID){
            //construir el mapa
            $scope.lastMapRequest = args;
            $scope.$broadcast("beginExport",args);
        }
    });

    $scope.$on("exportEndResult",function(event,args){

        var response = $scope.lastMapRequest;
        response.data = args;
        response.from = $scope.userID;

        socket.emit("lastMapResponse",response);

    });

    //cuando un usuario solicita la actualizacion
    socket.on("lastMapResponse",function(args){
        var request = $scope.requests[args.id];
        if(args.from != $scope.userID && request != null){


            $scope.$broadcast("updateRequest",JSON.parse(args.data));
        }
    });




    $scope.$on("mapCommand",function(event,args){
        $scope.executedCommands.push(args.commandId);

        if($scope.mapID != null){
            args.mapID = $scope.mapID;
            args.from = $scope.userID;
            socket.emit("mapCommand",args);
        }

    });


    socket.on("mapCommand",function(args){

        if(args.from != $scope.userID){

            if(args.mapID == $scope.mapID){
                console.log("on socket event");
                $scope.$broadcast("onExternalCommand",args);
            }
        }else{
            console.log("my own event: onExternalCommand ignored");
        }

    });


    function beginShareMap(){

        $scope.$broadcast('beginExport', {});

    }

}
