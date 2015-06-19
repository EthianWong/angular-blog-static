/**
 * Created by dell on 2015/6/9.
 */
(function(){

    "use strict";

    var adminServices = angular.module('app.admin.services',["app.services"]);

    adminServices.factory("adminInfo",["ApiServer",function(ApiServer){
        return ApiServer.createResource('admin/login',{},{
            "login":{method:'POST',url:ApiServer.getApiUrl('admin/login')}
        });
    }]);

    adminServices.service('admin',[function(){
        this._id;
        this.name;
        this.last_login;
        this.token;

        this.set = function(info){
            this._id = info._id;
            this.name = info.name;
            this.last_login = info.last_login;
            this.token = info.token;
        };
    }]);

    adminServices.service('adminManager',['adminInfo','$q','admin',function(adminInfo,$q,admin){

        this.login = function(user_info){

            var deferred = $q.defer();

            adminInfo.login(user_info).$promise.then(function(response){
                admin.set(response.context);
                sessionStorage.setItem("USERTOKEN",JSON.stringify(response.context));
                deferred.resolve(response);
            },function(){
                deferred.reject();
            });

            return deferred.promise;
        }
    }]);

}).call(this);
