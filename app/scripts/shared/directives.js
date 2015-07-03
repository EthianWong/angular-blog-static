/**
 * Created by dell on 2015/6/8.
 * this is a global directives
 */


(function(){


    var directives = angular.module('app.directives',['app.services']);


    /**
     * use small or default layout
     */
    directives.directive('body', [function(){
        return {
            restrict: 'E',
            link: function() {

                $(window).bind("load resize", function() {
                    if ($(this).width() < 769) {
                        $('body').addClass('body-small')
                    } else {
                        $('body').removeClass('body-small')
                    }
                });
            }
        };
    }]);


    /**
     * sideNavigation - Directive for run metsiMenu on sidebar navigation
     */
    directives.directive('sideNavigation', ["$timeout",function($timeout){
        return {
            restrict: 'A',
            link: function(scope, element) {
                // Call the metsiMenu plugin and plug it to sidebar navigation
                $timeout(function(){
                    element.metisMenu();
                });

                // Enable initial fixed sidebar

                var sidebar = element.parent();
                sidebar.slimScroll({
                    height: '100%',
                    railOpacity: 0.9
                });
            }
        };
    }]);


    /**
     * iboxTools - Directive for iBox tools elements in right corner of ibox
     */
    directives.directive('iboxTools', ["$timeout",function($timeout){
        return {
            restrict: 'A',
            scope: true,
            templateUrl: '../../views/common/ibox_tools.html',
            controller: function ($scope, $element) {

                // Function for collapse ibox
                $scope.showhide = function () {
                    var ibox = $element.closest('div.ibox');
                    var icon = $element.find('i:first');
                    var content = ibox.find('div.ibox-content');
                    content.slideToggle(200);
                    // Toggle icon from up to down
                    icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                    ibox.toggleClass('').toggleClass('border-bottom');
                    $timeout(function () {
                        ibox.resize();
                        ibox.find('[id^=map-]').resize();
                    }, 50);
                };

                // Function for close ibox
                $scope.closebox = function () {
                    var ibox = $element.closest('div.ibox');
                    ibox.remove();
                }
            }
        };
    }]);


    /**
     * minimalizaSidebar - Directive for minimalize sidebar
     */
    directives.directive('minimalizaSidebar', ['$timeout',function($timeout){

        return {
            restrict: 'A',
            template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary " href="" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
            controller: function ($scope, $element) {
                $scope.minimalize = function () {
                    $("body").toggleClass("mini-navbar");
                    if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
                        // Hide menu in order to smoothly turn on when maximize menu
                        $('#side-menu').hide();
                        // For smoothly turn on menu
                        setTimeout(
                            function () {
                                $('#side-menu').fadeIn(500);
                            }, 100);
                    } else if ($('body').hasClass('fixed-sidebar')){
                        $('#side-menu').hide();
                        setTimeout(
                            function () {
                                $('#side-menu').fadeIn(500);
                            }, 300);
                    } else {
                        // Remove all inline style from jquery fadeIn function to reset menu state
                        $('#side-menu').removeAttr('style');
                    }
                }
            }
        };

    }]);


    /**
     * icheck
     */
    directives.directive('icheck', ["$timeout",function($timeout){
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function($scope, element, $attrs, ngModel) {
                return $timeout(function() {
                    var value;
                    value = $attrs['value'];

                    $scope.$watch($attrs['ngModel'], function(newValue){
                        $(element).iCheck('update');
                    });

                    return $(element).iCheck({
                        checkboxClass: 'icheckbox_square-green',
                        radioClass: 'iradio_square-green'

                    }).on('ifChanged', function(event) {
                        if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
                            $scope.$apply(function() {
                                return ngModel.$setViewValue(event.target.checked);
                            });
                        }
                        if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
                            return $scope.$apply(function() {
                                return ngModel.$setViewValue(value);
                            });
                        }
                    });
                });
            }
        };
    }]);

    /**
     * redactor
     */
    directives.directive('redactor', ["$timeout",function($timeout){
        return {
            restrict: 'A',
            require: 'ngModel',
            scope:{
                redactor:"="
            },
            link: function($scope, element, $attrs,ngModel) {

                $scope.editor = this;

                var editor = $(element).redactor({
                    plugins:['table'],
                    focus: true,
                    initCallback: function()
                    {
                        $scope.redactor = this;
                    },
                    changeCallback:function(){
                        $scope.$apply(function() {
                            ngModel.$setViewValue(element.redactor('code.get'));
                        });
                    }
                });

                ngModel.$render();
                element.on('remove',function(){
                    element.off('remove');
                    element.redactor('core.destroy');
                });

                ngModel.$render = function() {
                    if(angular.isDefined(editor)) {
                        $timeout(function() {
                            element.redactor('code.set', ngModel.$viewValue || '');
                        });
                    }
                };
            }
        };
    }]);

    /**
     * scrollbar
     */
    directives.directive('scrollbar', ["$timeout",function($timeout){
        return {
            restrict: 'EA',
            link: function(scope, element) {

                var init = function(){

                    var height = $(window).height() - 60;
                    $(element).slimScroll({height: height + "px"});

                };

                $(window).resize(function() {
                    $timeout(function(){
                        $(element).slimScroll({"destroy":true});
                        init();
                    });
                });

                init();
            }
        };
    }]);

}).call(this);