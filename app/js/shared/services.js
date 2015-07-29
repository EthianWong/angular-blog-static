/**
 * Created by dell on 2015/6/8.
 * this is a global service
 */
(function(){

    "use strict";

    var services = angular.module("app.services",["cgNotify","app.config","ngResource"]);

    /**
     * Api server
     */
    services.service("ApiServer",
    ["globalConfig","$resource","$q",function(globalConfig,$resource,$q){

        this.getApiUrl = function(url){
            return globalConfig.apiUrl + url;
        };

        this.createResource = function(url,param_defaults,actions_defaults){

            var canceler = $q.defer();

            var inner_actions = {
                'query':  {method:'GET',timeout:canceler.promise},
                'create':  {method:'POST'},
                'update' : {method:'PUT'},
                'delete' :{method:'DELETE'}
            };

            var inner_param_defaults = {};

            var params = _.extend(inner_param_defaults,param_defaults);

            var actions = _.extend(inner_actions,actions_defaults);

            return $resource(this.getApiUrl(url), params,actions);
        };

    }]);



    /**
     * notify
     */
    services.factory("Notify",["notify",function(notify){
        return function (msg,state){
            notify({
                message:msg,
                classes: 'alert-'+state,
                templateUrl:"views/common/notify.html"
            });
        };
    }]);

    /**
     * error action
     */
    services.factory('errorInterceptor',['$q','Notify','$injector',function($q,Notify,$injector){
        return {
            'responseError': function(response) {

                var status = response.status;

                if(_.indexOf([422,404,400,500,405], status) != -1 ){

                    Notify(response.data.message,'danger');

                    if(status == 405){
                        $injector.get("$state").go('login');
                    }
                }

                return $q.reject(response);
            }
        }
    }]);

    /**
     * request处理
     */
    services.factory('requestInterceptor', ["globalConfig",function (globalConfig) {
        return {
            request: function (config) {

                var delete_empty = function(data){

                    //删除value为空的key
                    _.each(data,function(val,name){
                        if($.trim(val).length == 0){
                            delete  data[name];
                        }
                    })
                };

                delete_empty(config.method == "GET" ?config.params : config.data);

                // 如果请求地址是api服务器 添加authorization
                if(config.url.indexOf(globalConfig.apiUrl) != -1){
                    var token = sessionStorage.getItem('TOKEN');
                    config.headers.authorization = token ? token : "";
                }
                return config;
            }
        }
    }]);

    /**
     * response interceptor
     * extend expires times
     */
    services.factory('responseInterceptor', ["globalConfig",function (globalConfig) {
        return {
            "response": function (response) {

                if(response.config.url.indexOf(globalConfig.apiUrl) != -1){

                    var token = response.headers("X-Authorization");

                    if(token){
                        sessionStorage.setItem("TOKEN",token);
                    }
                }
                return response;
            }
        }
    }]);


    /**
     * 公用分页
     */
    services.factory('globalPagination',[
    "$http","$q","ApiServer",
    function($http,$q,ApiServer){
        return{
            create:function(){
                return {
                    items_per_page:10,
                    total_items:0,
                    total_pages:0,
                    page:1,
                    max_size:5,
                    query_method:'query',
                    resource:null,
                    sort:"",
                    init:function(page){
                        this.page = page;
                        this.total_items = this.items_per_page * page;
                    },
                    select:function(page,condition,fields){
                        if(condition == null)
                            condition = {};
                        condition['page'] = this.page = page?page:1;
                        condition['per-page'] = this.items_per_page;
                        var _self = this;
                        if(this.sort)
                            condition.sort = this.sort;
                        return this.resource[_self.query_method](condition,function(data,headers){
                            var total_items = headers('X-Pagination-Total-Count');
                            var total_pages = Math.ceil(total_items / _self.items_per_page);

                            _self.total_items = total_items;
                            _self.total_pages = total_pages;
                        });
                    }
                }
            }
        }
    }]);

    /**
     * 保存 XMLHttpRequest 解决pace与upload插件冲突
     */
    services.service('Request', [function () {

        //pace.js 会重写 XMLHttpRequest 所以先将原生的 XMLHttpRequest 储存

        this.default_request = window.XMLHttpRequest;

        this.pace_request = "";


        //在要进行upload之前,将pace.js 重写过的 XMLHttpRequest 还原
        this.default = function(){

            this.pace_request =  window.XMLHttpRequest;

            window.XMLHttpRequest = this.default_request;
        };

        //upload结束后 将XMLHttpRequest 改变为pace.js 的 XMLHttpRequest
        this.progress = function(){

            window.XMLHttpRequest = this.pace_request;

        };

    }]);


    /**
     * 获取 upyun oss 认证
     */
    services.factory('oss', ["globalConfig","ApiServer","$http","$q",function (globalConfig,ApiServer,$http,$q) {

        return {

            token:function(params){

                var url = ApiServer.getApiUrl("upload/signature");
                var deferred = $q.defer();

                params = {policy:window.Base64.encode(JSON.stringify(params))};

                $http.post(url,params).
                    success(function(data, status, headers, config) {

                        deferred.resolve(_.extend(data.context,params));

                    }).
                    error(function(data, status, headers, config) {
                        deferred.reject(data);
                    });

                return deferred.promise;

            },

            oss_options:function(options){

                var default_options = {
                    'expiration': (new Date().getTime()) + 60,
                    'save-key': '/{year}/{mon}/{day}/upload_{filemd5}{.suffix}',
                    'allow-file-type': 'jpg,jpeg,gif,png'
                };

                return _.extend(default_options,options);

            },

            upload_options:function(options){

                var default_options = {
                    url: globalConfig.ossUploadUrl,
                    method: 'POST',
                    fileFormDataName: 'file',
                    sendFieldsAs: "form"
                };

                return _.extend(default_options,options);

            }

        };

    }]);

    /**
     * custom
     */
    services.factory('$wind', [function () {

        return {
            /**
             * 验证对象中的属性去除空格后是否为空
             * @param { Object }  obj 需要验证的对象
             * @param { Object }  matches 需要匹配的对象 (应对有些属性含有默认值，但提交时不能为默认值)
             */
            has_empty:function(obj,matches){

                var error = [];

                $.each(obj,function(key,ele){

                    if(_.isEmpty($.trim(ele))){
                        error.push(key);
                        return false;
                    }

                });

                if(matches && error.length == 0){

                    $.each(matches,function(key,ele){

                        if(_.has(obj,key)){
                            if(obj[key] == ele){
                                error.push(key);
                                return false;
                            }
                        }

                    });
                }

                return error.length == 0 ? undefined : error;
            }
        };

    }]);

    /**
     * Alert
     */
    services.service('$alert', ["$timeout",function ($timeout) {

        this.alerts = [];

        this.init = function(){
            return this.alerts = [];
        };

        this.warning = function(msg){
            this.addAlert({type:'warning',msg:msg});
        };
        this.success = function(msg){
            this.addAlert({type:'success',msg:msg});
        };
        this.danger = function(msg){
            this.addAlert({type:'danger',msg:msg});
        };
        this.info = function(msg){
            this.addAlert({type:'info',msg:msg});
        };
        this.addAlert = function(msg){
            this.alerts.push(msg);
        };
        this.clear = function(){
            this.alerts.splice(0);
        };
        this.close = function(index) {
            this.alerts.splice(index, 1);
        };

    }]);

    /**
     * redactor
     */
    services.service('$redactor', [function () {

        this.core = "";

        this.cursor = 0;

        this.init = function(obj){
            this.core = obj;
            // Save editor's cursor index , Because editor will lose cursor when modal open and focus other input
            this.cursor = obj.caret.getOffset();
            return this;
        };

        this.insert = function(url){
            var _self = this;
            var image = "<img src='"+url+"'>";
            // Set editor's cursor index
            _self.core.caret.setOffset(_self.cursor);
            _self.core.insert.html(image);
        };

    }]);

    /**
     * $modalService
     * fix modal is always show on view change
     */
    services.service('$modalService', [function () {

        this.modalInstance = [];

        this.close = function(){
            if($("body").hasClass("modal-open"))
                this.modalInstance.dismiss();
        }

    }]);

    services.factory('imageInfo', [function () {

        var natural = function(src,callback){
            var img = new Image();
            img.src = src;
            img.onload = function() {
                callback(img.naturalWidth,img.naturalHeight);
            };
        };

        return {
            get:function(file,callback){
                var reader = new FileReader();
                reader.onload = function(event) {
                    var content = event.target.result;
                    natural(content,function(width,height){
                        callback(width,height);
                    });
                };
                reader.readAsDataURL(file);
            }
        };

    }]);

    services.filter('fileSize', function() {
        return function(input) {
            if(input < 1024){
                return input + " B";
            }
            else if (input > 1024 && input < 1024 * 1024) {
                return (input / 1024).toFixed(1) + " KB";
            }else {
                return (input / 1024 / 1024).toFixed(1) + " MB";
            }
        }
    });

    services.factory('windowItems', ["$modal","$modalService",function ($modal,$modalService) {

        return {
            /**
             *
             * @param title
             * @param message
             * @param callback  確定事件
             * @param callback2 取消事件
             * @param btn_txt 自定義操作按鈕名稱
             */
            confirm : function(title, message, callback, callback2, btn_txt) {
                var $modalInstance;
                $modalInstance = $modalService.modalInstance = $modal.open({
                    templateUrl: 'views/common/dialog-confirm.html',
                    controller: 'windowCtrl',
                    size:'sm',
                    windowClass: 'modal-confirm',
                    resolve: {
                        data : function(){
                            return {
                                'title' : title,
                                'content': message,
                                'callback' : callback == undefined || "" ? Function : callback,
                                'callback2' : callback == undefined || "" ? Function : callback2,
                                'btn_txt' : btn_txt==undefined || "" ? "確定" : btn_txt
                            };
                        }
                    }
                });
                return $modalInstance;
            }
        };

    }]);

}).call(this);
