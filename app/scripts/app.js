/**
 * Created by dell on 2015/6/8.
 * this is app init
 */
(function () {

    var app = angular.module('changeMgr', [
        'ui.router',                    // Routing
        'ui.bootstrap',                  // Bootstrap
        'app.config',
        'app.controllers',
        'app.directives',
        'app.services',
        'app.admin.controllers',
        'app.admin.services',
        'app.plate.controllers',
        'app.plate.services',
        'ui.sortable',
        'app.article.controllers'
    ]);

    app.config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push('errorInterceptor');
        $httpProvider.interceptors.push('paramsFilter');
    }]);

})();