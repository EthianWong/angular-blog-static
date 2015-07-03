/**
 * Created by dell on 2015/6/12.
 */
(function(){

    "use strict";

    var articleCtrls = angular.module('app.article.controllers',[]);

    articleCtrls.controller('articleListCtrl',["$scope","plateInfo","globalPagination","articleInfo","$filter","Notify","windowItems",function($scope,plateInfo,globalPagination,articleInfo,$filter,Notify,windowItems){

        var condition_init = {
            title:"",
            plate_id:"",
            isVisible:""
        };

        $scope.articles = [];

        $scope.pagination = globalPagination.create();

        $scope.pagination.resource = articleInfo;

        $scope.plates = plateInfo.query();

        $scope.condition = angular.copy(condition_init);

        $scope.select = function(page){

            var conditions = angular.copy($scope.condition);

            $scope.pagination.select(page,conditions).$promise.then(function(data){
                $scope.articles = data.context;
            });

        };

        $scope.search = function(){
            $scope.select(1);
        };

        $scope.reset = function(){
            $scope.condition = angular.copy(condition_init);
            $scope.select(1);
        };

        $scope.select(1);

        $scope.delete = function(_id){
            windowItems.confirm("提示","是否删除此数据？一经删除不可还原",function(){
                articleInfo.delete({_id:_id}).$promise.then(function(data){
                    Notify(data.message,'success');
                    $scope.select(1);
                })
            });
        };

        $scope.update_visible = function(obj){

            var page = angular.copy($scope.pagination.page);

            var params = {
                _id:obj._id,
                isVisible:obj.isVisible ? false : true
            };
            articleInfo.update(params).$promise.then(function(data){
                Notify(data.message,'success');
                $scope.select(page);
            });
        };

    }]);

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