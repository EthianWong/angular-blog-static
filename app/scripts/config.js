/**
 * Created by dell on 2015/6/8.
 * this is a global config
 */

(function(){

    "use strict";

    var config = angular.module('app.config',[]);

    /**
     * Server's location
     */
    config.constant("globalConfig",{
        apiUrl: 'http://localhost:3000/',
        ossPreviewUrl:"http://change.b0.upaiyun.com/",
        ossUploadUrl:"http://v0.api.upyun.com/change"
    });


    /**
     * router config
     */
    config.config(["$stateProvider","$urlRouterProvider",function($stateProvider, $urlRouterProvider){

        $urlRouterProvider.otherwise("/article/article-list");

        $stateProvider
            .state('login',{
                url: "/login",
                templateUrl: "views/common/login.html"
            })
            .state('index', {
                abstract: true,
                url: "/index",
                templateUrl: "views/common/content.html",
            })


            .state('article',{
                abstract: true,
                url: "/article",
                templateUrl: "views/common/content.html"
            })
            .state('article.list',{
                url: "/article-list",
                templateUrl: "views/articles/article-list.html"
            })
            .state('article.create',{
                url: "/article-create",
                templateUrl: "views/articles/article-create.html"
            })


            .state('plate',{
                abstract: true,
                url: "/plate",
                templateUrl: "views/common/content.html"
            })
            .state('plate.list',{
                url: "/plate-list",
                templateUrl: "views/plates/plate-list.html"
            })
            .state('plate.order',{
                url: "/plate-order",
                templateUrl: "views/plates/plate-order.html"
            })


            .state('index.main', {
                url: "/main",
                templateUrl: "views/main.html",
                data: { pageTitle: 'Example view' }
            })
            .state('index.minor', {
                url: "/minor",
                templateUrl: "views/minor.html",
                data: { pageTitle: 'Example view' }
            });
    }]);

    config.run(["$rootScope","$state",function($rootScope, $state){

        $rootScope.$state = $state;

    }]);

}).call(this);