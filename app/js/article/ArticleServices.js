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

        this.UpdateOrCreate = function(article_info,isUpdateContent){

            var method;

            isUpdateContent = isUpdateContent ? isUpdateContent : false;

            if(article_info._id){

                // Set update time is now
                if(isUpdateContent)
                    article_info.update_time = new Date();
                method = articleInfo.update(article_info);

            }else{

                method = articleInfo.create(article_info);

            }

            var deferred = $q.defer();

            method.$promise.then(function(response){
                deferred.resolve(response);
            },function(){
                deferred.reject();
            });
            return deferred.promise;
        };

    }]);

}).call(this);