/**
 * Created by dell on 2015/6/12.
 */
(function(){

    "use strict";

    var articleCtrls = angular.module('app.article.controllers',[]);

    articleCtrls.controller('articleCreateCtrls',["$scope","Notify","$modal","plateInfo","$wind","$alert","$redactor","articleManager","$state","$modalService",function($scope,Notify,$modal,plateInfo,$wind,$alert,$redactor,articleManager,$state,$modalService){

        var default_cover_url = "images/default_cover.png";

        var article_init = {
            title:"",
            plate_id:"",
            cover_url:"",
            content:""
        };

        var error = {
            title:"请填写标题",
            cover_url:"请选择封面图片",
            content:"请填写内容"
        };

        // Initialization model
        $scope.article = angular.copy(article_init);

        // Set default cover
        $scope.article.cover_url = default_cover_url;

        // Set default options before load plates
        $scope.plates = [{_id:"",zh_name:"Loading..."}];

        $scope.show_cover = false;

        $scope.alerts = $alert.init();

        $scope.alerts.close = function(index) {
            $alert.close(index);
        };

        // Set edit object
        $scope.edit = $redactor.init("redactor-content");

        // Load plates
        plateInfo.query().$promise.then(function(data){

            $scope.plates = data.context;

            //Choose default plate
            $scope.article.plate_id = _.findWhere($scope.plates,{isDefault:true})._id;
        });

        $scope.submit = function(){

            $scope.article.content = $scope.edit.content();

            var article = angular.copy($scope.article);

            var keys = $wind.has_empty(article,{cover_url:"images/default_cover.png"});

            if(keys){
                $alert.danger(error[keys]);
            }else{
                articleManager.create(article).then(function(data){
                    Notify(data.message,'success');
                    $state.go("article.list");
                });
            }

        };

        var image_upload_options = {
            templateUrl: "/views/common/edit-image-upload.html",
            controller: "editImageUploadCtrl",
            windowClass:"modal-upload-image"
        };

        $scope.show_image_manager = function(){

            var modalInstance;

            modalInstance = $modalService.modalInstance = $modal.open(image_upload_options);

            modalInstance.result.then((function(url) {
                $scope.edit.insertImage(url);
            }));
        };

        $scope.choose_cover = function(){

            var modalInstance;

            modalInstance = $modalService.modalInstance = $modal.open(image_upload_options);

            modalInstance.result.then((function(url) {

                $scope.show_cover = true;
                $scope.article.cover_url = url;

            }));

        };

    }]);

}).call(this);