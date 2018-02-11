var module = angular.module("rpgboard",["map"]);

module.controller("app-controller",appController);

function appController($scope,$http){

    $scope.mapID = getJsonFromUrl().mapid;
    var socket = io.connect();
    socket.on("connect",function(){
        socket.emit("joinRoom",$scope.mapID);
    });


    if($scope.mapID != null){
        $http.get("/api/map?mapID="+$scope.mapID,).then(function(res){
            setTimeout(function(){
                $scope.$broadcast("updateRequest",res.data);
            },500);
        })
    }else{
        $scope.mapID = guid();
    }

    $scope.shareMap = beginShareMap;
    $scope.executedCommands = [];


    $scope.$on("mapCommand",function(event,args){
        //debugger;
        $scope.executedCommands.push(args.commandId);

        if($scope.mapID != null){
            args.mapID = $scope.mapID;
            socket.emit("mapCommand",args);
        }

    });


    socket.on("mapCommand",function(args){

        if($scope.executedCommands.indexOf(args.commandId) == -1){

            if(args.mapID == $scope.mapID){
                console.log("on socket event");
                $scope.$broadcast("onExternalCommand",args);
            }
        }else{
            console.log("onExternalCommand ignored");
        }

    });


    function beginShareMap(){

        $scope.$broadcast('beginExport', {});

    }

}
