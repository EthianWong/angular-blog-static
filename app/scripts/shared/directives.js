/**
 * Created by dell on 2015/6/8.
 * this is a global directives
 */


(function(){


    var directives = angular.module('app.directives',['app.services']);


    /**
     * bind window event to fix height
     */
    directives.directive('body', ["fixHeight",function(fixHeight){
        return {
            restrict: 'E',
            link: function() {

                $(window).bind("load resize scroll", function() {
                    if(!$("body").hasClass('body-small')) {
                        fixHeight();
                    }
                });

                $(window).bind("load resize", function() {
                    if ($(this).width() < 769) {
                        $('body').addClass('body-small')
                    } else {
                        $('body').removeClass('body-small')
                    }
                });
                fixHeight();
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
     * image preview
     */
    directives.directive('imagePreview', ["Notify",function(Notify){
        return {
            restrict: 'A',
            scope : {
                options : '=',
                result:'=',
                smResult:'=',
                done:'&'
            },
            link: function($scope, element, $attrs) {

                var _fileInput = '<input type="file" name="hidden_input" id="hidden_input_file" style="display: none;">';

                //添加隐藏的file input元素
                $(element).after(_fileInput);

                $(element).click(function(){
                   $("#hidden_input_file").click();
                });

                //生成缩略图
                var convertImageSize = function(image){
                    var sm_width = $scope.options.smSize.width;
                    var sm_height = $scope.options.smSize.height;

                    var canvas = document.createElement("canvas");
                    canvas.width = sm_width;
                    canvas.height = sm_height;
                    canvas.getContext("2d").drawImage(image, 0, 0,sm_width,sm_height);
                    return canvas.toDataURL("image/jpeg",$scope.options.quantity);
                };

                var handleFileSelect = function(evt){

                    var file=evt.currentTarget.files[0];
                    var reader = new FileReader();

                    //开始载入文件
                    reader.onloadstart = function(){
                        if(file.size > $scope.options.maxLength * 1024){

                            Notify("文件大小必须小于" + $scope.options.maxLength + "KB",'danger');
                            reader.abort();

                        }
                        else if(file.type.indexOf($scope.options.type) == -1){

                            Notify("只能选择"+$scope.options.type+"类型的文件",'danger');
                            reader.abort();

                        }
                    };

                    //文件载入完成
                    reader.onload = function (evt) {

                        var width = $scope.options.size.width;
                        var height = $scope.options.size.height;

                        var image = new Image();
                        image.src = evt.target.result;

                        if(image.naturalWidth ==  width && image.naturalHeight == height)
                        {
                            $scope.result = evt.target.result;
                            $scope.smResult = convertImageSize(image);
                            $scope.$apply();
                            $scope.done();

                        }else{
                            Notify("图片宽度必须为" + $scope.options.size.width + ",高度必须为" + $scope.options.size.height,'danger');
                        }

                    };

                    reader.readAsDataURL(file);

                };

                $('#hidden_input_file').on('change',handleFileSelect);

            }
        };
    }]);

    /**
     * redactor
     */
    directives.directive('redactor', [function(){
        return {
            restrict: 'A',
            link: function($scope, element, $attrs) {
                $(element).redactor({
                    imageUpload: '/upload.php',
                    plugins:['table','imagemanager']
                });
            }
        };
    }]);

}).call(this);