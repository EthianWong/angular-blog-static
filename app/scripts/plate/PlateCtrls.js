/**
 * Created by dell on 2015/6/10.
 */
(function(){

    "use strict";

    var PlateCtrls =  angular.module('app.plate.controllers',["app.admin.services"]);

    PlateCtrls.controller('plateListCtrl',['$scope','$modal','plateInfo','globalPagination','$modalService',function($scope,$modal,plateInfo,globalPagination,$modalService){

        //初始化条件
        var init_condition = {
            name:"",
            isVisible:""
        };

        $scope.condition = angular.copy(init_condition);

        //初始化分页
        $scope.pagination = globalPagination.create();

        $scope.pagination.resource = plateInfo;

        $scope.plates= [];

        //查询事件
        $scope.select = function(page){
            var conds = angular.copy($scope.condition);
            $scope.pagination.select(page,conds).$promise.then(function(data){
                $scope.plates = data.context;
            });
        };

        $scope.search = function(){
            $scope.select(1);
        };

        //重置搜索条件
        $scope.reset = function(){
            $scope.condition = angular.copy(init_condition);
            $scope.select(1);
        };

        //加载时执行搜索
        $scope.select(1);

        $scope.action = function(plate){

			var page = angular.copy($scope.pagination.page);

            var modalInstance;
            modalInstance = $modalService.modalInstance = $modal.open({
                templateUrl: "/views/plates/plate-create.html",
                controller: "plateCreateCtrl",
                //需要编辑的项已经全部查询出了 所以直接将需要编辑的值传给下个页面 不需要再次查询
                resolve:{
                    plate:function(){
                        return plate?angular.copy(plate):false;
                    }
                }
            });

            modalInstance.result.then((function(isUpdate) {

				// 如果是更新 重新绑定当前页数据(避免当前为>1的页数 更新后跳回第一页)
				page = isUpdate ? page : 1;
			
                $scope.select(page);

            }));

        };

    }]);

    PlateCtrls.controller('plateCreateCtrl',['$scope','$modalInstance','plateManager','Notify','plate',function($scope,$modalInstance,plateManager,Notify,plate){

        /*初始化用于添加以及更新所用的model*/
        var plate_init = {
            _id:"",
            zh_name:"",
            en_name:"",
            isVisible:true
        };


        $scope.title = plate?"修改文章类型":"添加文章类型";

        $scope.btnText = plate?"保存":"添加";

        $scope.plate = plate?angular.copy(plate):angular.copy(plate_init);

        /*提交按钮的状态防止在网络不好的情况下重复提交*/
        $scope.disabled_submit = false;

        $scope.create = function(){
            $scope.disabled_submit = true;

            plateManager.UpdateOrCreate($scope.plate).then(function(data){

                Notify(data.message,'success');

                $modalInstance.close(plate);

            },function(){
                $scope.disabled_submit = false;
            });

        };

        $scope.cancel = function() {
            $modalInstance.dismiss("cancel");
        };
    }]);


    PlateCtrls.controller('plateOrderCtrl',['$scope','Notify','plateInfo',function($scope,Notify,plateInfo){

        $scope.plates= [];

        var _load  = function(){
            plateInfo.query().$promise.then(function(data){
                //文章栏目数量较少 所以直接使用js排序
                $scope.plates = _.sortBy(data.context, 'order_id');
            });
        };

        _load();

        $scope.saveOrder = function(){

            var result = packageObj($scope.plates);
            plateInfo.updateSort(result).$promise.then(function(data){
                Notify(data.message,'success');
                _load();
            });

        };

        //将对象的顺序设定为orderID
        var packageObj = function(_obj){

            var obj = angular.copy(_obj);

            _.each(obj,function(element, index, list){

                element.order_id = index;

            });

            return obj;

        };

        $scope.sortableOptions = {
            connectWith: ".connectList",
            helper:"clone"
        };

    }]);

}).call(this);