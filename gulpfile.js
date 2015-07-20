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
    var del = require('del');

    var paths = {
        src: 'app',
        dist: 'dist'
    };

    // 默认任务
    gulp.task('default', ["server","less","watch"]);

    // 搭建静态服务器
    gulp.task('server', function() {

        Browsersync.init({
            server: {
                baseDir: paths.src
            }
        });

    });

    // 编译Less文件
    gulp.task('less',function(){

        gulp.src([paths.src + '/less/style.less'])
            .pipe(plugins.less())
            .pipe(gulp.dest(paths.src + '/css'));

    });

    // 监控文件
    gulp.task('watch',function(){

        gulp.watch(paths.src + '/less/**/*.less', ['less']);

        gulp.watch([
                paths.src +"/**/*.html",
                paths.src + "/js/**/*.js",
                paths.src + "/lib/**/*.js",
                paths.src + "/css/**/*.css",
                paths.src + "/lib/**/*.css"
        ]).on("change", Browsersync.reload);

    });


}).call(this);