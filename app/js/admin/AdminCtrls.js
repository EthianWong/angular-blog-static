/**
 * Created by dell on 2015/6/9.
 */
(function(){

    "use strict";

    var adminCtrls = angular.module('app.admin.controllers',["app.admin.services"]);

    adminCtrls.controller('loginCtrl',['$scope','$location','adminManager','Notify',function($scope,$location,adminManager,Notify){

        var admin_init = {
            "name":"",
            "password":""
        };

        $scope.admin = angular.copy(admin_init);

        $scope.login = function(){

            adminManager.login($scope.admin).then(function(){
                $location.path('/');
                $scope.disabled_submit = false;
            },function(){
                $scope.disabled_submit = false;
            });
        };

    }]);

}).call(this);