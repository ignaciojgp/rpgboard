module.component("cameraControls", {
        templateUrl:"templates/cameraControls.template.html",
        bindings:{
            conHandler:"="
        },
        controller:function($scope){

            $scope.clickButton = function(sender){
                if($scope.$ctrl.conHandler != null){
                    $scope.$ctrl.conHandler(sender);
                }
            }
        }
    }
);
