/**
 * Created by dell on 2015/6/10.
 */
(function(){

    "use strict";

    var plateServices = angular.module("app.plate.services",["app.services"]);

    plateServices.factory("plateInfo",["ApiServer",function(ApiServer){
        return ApiServer.createResource('plate/:_id',{_id:"@_id"},{
            "updateSort":{method:'POST',url:ApiServer.getApiUrl('plate/update-sort')}
        });
    }]);

    plateServices.service('plateManager',['plateInfo','$q',function(plateInfo,$q){

        //如果参数含有ID则为修改 反之为添加
        this.UpdateOrCreate = function(plate_info){

            var method;

            if(plate_info._id){
                method = plateInfo.update(plate_info);
            }else{
                method = plateInfo.create(plate_info);
            }

            var deferred = $q.defer();
            method.$promise.then(function(response){
                deferred.resolve(response);
            },function(){
                deferred.reject();
            });
            return deferred.promise;
        }
    }]);




}).call(this);
