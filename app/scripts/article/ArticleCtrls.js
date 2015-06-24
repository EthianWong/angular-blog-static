/**
 * Created by dell on 2015/6/12.
 */
(function(){

    "use strict";

    var articleCtrls = angular.module('app.article.controllers',[]);

    articleCtrls.controller('articleCreateCtrls',["$scope","Notify","$modal",function($scope,Notify,$modal){



        $scope.show_image_manager = function(){

            var modalInstance;

            modalInstance = $modal.open({
                templateUrl: "/views/common/file-upload.html",
                controller: "imageManagerCtrl"
            });

            modalInstance.result.then((function(url) {
                var img = '<img src="'+url+'">';
                $('#redactor-content').redactor('insert.html', img);
            }));
        };

        $scope.previewOptions = {

            maxLength:500,
            type:"image",
            size:{
                width:630,
                height:360
            },
            smSize:{
                width:385,
                height:220
            },
            quantity:0.99

        };

        $scope.resultImage = "";
        $scope.resultImage_sm="";

        $scope.previewDone = function(){
            $scope.previewIsDone = true;
            $scope.$apply();
        };

    }]);

}).call(this);