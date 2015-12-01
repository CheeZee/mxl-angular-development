var ceapp = angular.module('ceapp', ['sociocortex', 'mxl']);

ceapp.controller('testController', function ($scope, scMxl, scAuth, scModel) {

    scAuth.login('sociocortex.sebis@tum.de', 'sebis');
    
    $scope.expectedType = 'Number';
    $scope.mxlParameters = 'list:Sequence<Customer>, map:Function<Customer,Number>';
    $scope.mxlValue = 'find Customer.average(Turnover)';
    $scope.workspaceId = '107yhdgc7q9u6';


    scMxl.autoComplete( $scope.workspaceId).then(function (response) {
        $scope.autoCompletionHints = response.data;
    });

    $scope.runTest = function (value) {
        return scMxl.query({workspace : { id : $scope.workspaceId}}, { expression: value, expectedType: $scope.expectedType, parameterDefinitions: $scope.mxlParameters });
    };

    $scope.wizard = function(expression){
        return scMxl.query({workspace : { id : $scope.workspaceId}}, { expression: 'find ' + expression });
    }

    $scope.validate = function (modelValue, viewValue) {
        return scMxl.validate({workspace : { id : $scope.workspaceId}}, { expression: viewValue, expectedType: $scope.expectedType, parameterDefinitions: $scope.mxlParameters });
    };

    $scope.validateType = function (modelValue, viewValue) {
        return scMxl.validate( {workspace : { id : $scope.workspaceId}}, { expectedType: viewValue });
    };

    $scope.validateParameters = function (modelValue, viewValue) {
        return scMxl.validate({workspace : { id : $scope.workspaceId}}, { parameterDefinitions: viewValue });
    };

    scModel.EntityType.queryByWorkspace({ id: $scope.workspaceId }, function(entities){
        $scope.entities = entities;
    });


});
