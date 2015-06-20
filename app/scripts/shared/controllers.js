/**
 * Created by dell on 2015/6/8.
 * this is a global controllers
 */

(function(){

    "use strict";

    var controllers = angular.module('app.controllers',['app.services']);

    controllers.controller('MainCtrl',['$scope',"$rootScope","fixHeight","$state",function($scope,$rootScope,fixHeight,$state){

        //监听修复高度
        $rootScope.$on('$viewContentLoaded', function(){
            fixHeight();
        });

        //监测用户登录
        $scope.$on('$stateChangeStart',function(event, toState, toParams, fromState){
            toState.previousUrl = fromState.url;

            if(!sessionStorage.AUTHOR && toState.name != "login"){
                event.preventDefault();
                $state.go('login');
            }else if(sessionStorage.AUTHOR && toState.name == "login"){
                sessionStorage.removeItem("AUTHOR");
                $state.go('login');
            }
            else{
                if(sessionStorage.AUTHOR && toState.name != "login"){

                    var user = JSON.parse(sessionStorage.getItem('AUTHOR'));
                    $scope.last_time = angular.copy(user.last_login);
                }
            }
            sessionStorage.setItem('report_error',toState.name);
        });

    }]);

}).call(this);