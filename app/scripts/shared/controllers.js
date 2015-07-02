/**
 * Created by dell on 2015/6/8.
 * this is a global controllers
 */

(function(){

    "use strict";

    var controllers = angular.module('app.controllers',['app.services','ngFileUpload']);

    controllers.controller('MainCtrl',['$scope',"$rootScope","$state","$modalService",function($scope,$rootScope,$state,$modalService){

        $scope.$on('$stateChangeStart',function(event, toState, toParams, fromState){

            $modalService.close();

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

    controllers.controller('editImageUploadCtrl',['$scope','$modalInstance','Upload','$timeout','Notify','Request','oss','globalConfig','imageInfo','$q',function($scope,$modalInstance,Upload,$timeout,Notify,Request,oss,globalConfig,imageInfo,$q){

        var status = {
            progress:0,
            isReady:false,
            isUploading:false
        };

        var image = {
            type:1,
            object:"",
            info:{
                width:0,
                height:0,
                size:0
            }
        };

        var types = [
            {key:1,value:"选择图片"},
            {key:2,value:"图片地址"}
        ];

        $scope.status = angular.copy(status);

        $scope.image = angular.copy(image);

        $scope.types = angular.copy(types);

        $scope.isUrl = false;

        var file_upload = [];

        // Image preview
        $scope.fileSelected = function(files){
            if(files && files.length){

                $scope.image.object = files[0];

                imageInfo.get(files[0],function(width,height){

                    $scope.image.info = {
                        height:height,
                        width:width,
                        size:files[0].size
                    };

                    $scope.status.isReady = true;
                    $scope.$apply();
                });
            }
        };


        $scope.start_upload = function(){
            upload(angular.extend($scope.image.object));
        };

        $scope.cancel_upload = function(){
            if(file_upload && $scope.status.isUploading){
                file_upload.abort();
                $scope.status.isUploading = false;
                Request.progress();
            }
        };

        $scope.insert_image = function(){
            $modalInstance.close(angular.copy($scope.image.object));
        };

        $scope.check_url = function(){
            var url = $scope.image.object;
            var isString = _.isString(url);
            var isEmpty = ($.trim(url)).length == 0;

            $scope.isUrl = isString && !isEmpty;
        };

        $scope.reset = function(){
            $scope.status.isReady = false;
            $scope.cancel_upload();
            var temp = angular.copy($scope.image);
            $scope.image = angular.copy(image);
            $scope.image.type = temp.type;
        };

        $scope.dismiss = function(){
            $scope.reset();
            $modalInstance.dismiss("cancel");
        };

        var upload = function(file){

            Request.default();

            var params = {
                'bucket':'change'
            };

            oss.token(oss.oss_options(params)).then(function(data){

                file_upload = Upload.upload(oss.upload_options({fields:data,file: file}));

                file_upload.then(function (response) {
                    $timeout(function () {
                        Notify('上传成功','success');
                        Request.progress();
                        $modalInstance.close(globalConfig.ossPreviewUrl + response.data.url);
                    });
                }, function (response) {
                    if(response.data){
                        Notify(response.data.message,'danger');
                    }
                    $scope.status.isUploading = false;
                    Request.progress();
                });

                file_upload.progress(function (evt) {
                    $scope.status.isUploading = true;
                    $scope.status.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                });

            });

        };
    }]);

}).call(this);