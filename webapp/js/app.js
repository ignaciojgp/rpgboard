var module = angular.module("rpgboard",["map","socket"]);

module.controller("app-controller",appController);

function appController($scope,$http,socket){
    $scope.$on("mapCommand",function(args){
        //debugger;
        $scope;
    });
}
