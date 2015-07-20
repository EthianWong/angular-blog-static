/**
 * Created by dell on 2015/6/12.
 */
(function(){

    "use strict";

    var articleCtrls = angular.module('app.article.controllers',[]);

    articleCtrls.controller('articleListCtrl',["$scope","plateInfo","globalPagination","articleInfo","$filter","Notify","windowItems","$state","$modal","$modalService",function($scope,plateInfo,globalPagination,articleInfo,$filter,Notify,windowItems,$state,$modal,$modalService){

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

        $scope.remove = function(_id){
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

        $scope.update = function(_id){
            $state.go("article.update",{_id:_id});
        };

        $scope.show_detail = function(_id){
            var modalInstance;

            modalInstance = $modalService.modalInstance = $modal.open({
                templateUrl: "/views/articles/article-detail.html",
                controller: "articleDetailCtrl",
                windowClass:"modal-article-detail",
                animate:"",
                resolve:{
                    _id:function(){
                     return _id;
                    }
                }
            });
        };

    }]);

    articleCtrls.controller('articleDetailCtrl',["$scope","_id","$modalInstance","articleInfo",function($scope,_id,$modalInstance,articleInfo){

        $scope.article = {};

        if(_id){
            articleInfo.query({_id:_id}).$promise.then(function(data){
                $scope.article = data.context;
            });
        }

        $scope.close = function(){
            $modalInstance.dismiss();
        };

    }]);

    articleCtrls.controller('articleCreateCtrls',["$scope","Notify","$modal","plateInfo","$wind","$alert","$redactor","articleManager","$state","$modalService","articleInfo",function($scope,Notify,$modal,plateInfo,$wind,$alert,$redactor,articleManager,$state,$modalService,articleInfo){

        $scope.isUpdate = $state.params._id ? true : false;

        var default_cover_url = "css/patterns/default_cover.png";

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

        $scope.article = {};

        $scope.title = $scope.isUpdate ? "更新文章" : "添加文章";

        if($scope.isUpdate){
            articleInfo.query($state.params).$promise.then(function(data){
                 $scope.article = data.context;
                 $scope.article.plate_id =  data.context.plate_id._id;
            });
        }else{
            $scope.article = angular.copy(article_init);
            $scope.article.cover_url = default_cover_url;
        }

        // Set default options before load plates
        $scope.plates = [{_id:"",zh_name:"Loading..."}];

        $scope.show_cover = false;

        $scope.alerts = $alert.init();

        $scope.alerts.close = function(index) {
            $alert.close(index);
        };

        // Set editor object
        $scope.editor = [];

        // Load plates
        plateInfo.query().$promise.then(function(data){

            $scope.plates = data.context;

            //Choose default plate
            $scope.article.plate_id = $scope.isUpdate ? $scope.article.plate_id :_.findWhere($scope.plates,{isDefault:true})._id;
        });

        $scope.cancel = function(){
            $state.go("article.list");
        };

        $scope.submit = function(){

            var article = angular.copy($scope.article);

            var keys = $wind.has_empty(article,{cover_url:"images/default_cover.png"});

            if(keys){
                $alert.danger(error[keys]);
            }else{
                articleManager.UpdateOrCreate(article,true).then(function(data){
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

            $redactor.init($scope.editor);

            var modalInstance;

            modalInstance = $modalService.modalInstance = $modal.open(image_upload_options);

            modalInstance.result.then((function(url) {
                $redactor.insert(url);
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