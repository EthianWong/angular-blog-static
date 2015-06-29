/**
 * Created by dell on 2015/6/29.
 */
(function(){



    "use strict";

    var plateServices = angular.module("app.article.services",["app.services"]);

    plateServices.factory("articleInfo",["ApiServer",function(ApiServer){
        return ApiServer.createResource('article/:_id',{_id:"@_id"},{});
    }]);

    plateServices.service('articleManager',['articleInfo','$q',function(articleInfo,$q){

        this.create = function(article_info){
            var deferred = $q.defer();
            articleInfo.create(article_info).$promise.then(function(response){
                deferred.resolve(response);
            },function(){
                deferred.reject();
            });
            return deferred.promise;
        };

    }]);

}).call(this);