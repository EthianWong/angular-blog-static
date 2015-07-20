/**
 * Created by dell on 2015/7/20.
 * This is gulp init
 */
(function(){

    "use strict";

    var gulp = require('gulp');
    var loadPlugins = require('gulp-load-plugins');
    var plugins = loadPlugins();
    var Browsersync = require('browser-sync').create();

    gulp.task('default', ["server","less","watch"]);

    // 搭建静态服务器
    gulp.task('server', function() {

        Browsersync.init({
            server: {
                baseDir: "./app"
            }
        });

    });

    // 编译Less文件
    gulp.task('less',function(){

        gulp.src(['./app/less/style.less'])
            .pipe(plugins.less())
            .pipe(gulp.dest('./app/css'));

    });

    // 监控文件
    gulp.task('watch',function(){

        gulp.watch('./app/less/**/*.less', ['less']);

        gulp.watch([
            "./app/**/*.html","./app/js/**/*.js","./app/lib/**/*.js","./app/css/**/*.css","./app/lib/**/*.css"
        ]).on("change", Browsersync.reload);

    });




}).call(this);