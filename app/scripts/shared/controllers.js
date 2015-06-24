/**
 * Created by dell on 2015/6/8.
 * this is a global controllers
 */

(function(){

    "use strict";

    var controllers = angular.module('app.controllers',['app.services','ngFileUpload']);

    controllers.controller('MainCtrl',['$scope',"$rootScope","$state",function($scope,$rootScope,$state){

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

    controllers.controller('imageManagerCtrl',['$scope','$modalInstance','Upload','$timeout','Notify','Request','oss','globalConfig',function($scope,$modalInstance,Upload,$timeout,Notify,Request,oss,globalConfig){

        $scope.isUpload = false;

        var upload = function(file){

            Request.default();

            var params = {
                'bucket':'change'
            };

            oss.token(oss.oss_options(params)).then(function(data){

                /*fields: {policy: policy,signature:signature}*/

                file.upload = Upload.upload(oss.upload_options({fields:data,file: file}));

                file.upload.then(function (response) {
                    $timeout(function () {
                        Notify('上传成功','success');
                        Request.progress();
                        $modalInstance.close(globalConfig.ossPreviewUrl + response.data.url);
                    });
                }, function (response) {
                    if(response.data){
                        Notify(response.data.message,'danger');
                    }
                    Request.progress();
                });

                /*
                 file.upload.progress(function (evt) {
                 $scope.isUpload = true;
                 console.log(Math.min(100, parseInt(100.0 * evt.loaded / evt.total)));
                 });*/

            });

        };

        $scope.fileSelected = function(files){
            if(files && files.length){
                upload(files[0]);
            }
        };

        $scope.dismiss = function(){
            $modalInstance.dismiss("cancel");
        };
    }]);

}).call(this);