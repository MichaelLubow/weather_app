"use strict";

var gulp = require('gulp');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var duration = require('gulp-duration');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var path = require('path');
//if bringing in Neat you don't have to import Bourbon separately as the includePaths will include it by default
var bourbonNeat = require('node-neat').includePaths;

var config = {
    fileNames: {
        appBundle: "app_bundle.js",
        vendorBundle: "vendor_bundle.js"
    },
    gulpTasks: {
        dev: 'dev',
        prod: 'prod',
        browserSync: 'browserSync',
        nodemon: 'nodemon',
        compile: {
            all: 'compile:all',
            js: {
                all: 'compile:jsAll',
                app: 'compile:jsApp',
                vendor: 'compile:jsVendor'
            }  ,
            scss: {
                all: 'compile:scssAll',
                app: 'compile:scssApp',
                vendor: 'compile:scssVendor'
            }
        },
        watch: {
            js: {
                app: 'watch:jsApp',
                vendor: "watch:jsVendor"
            },
            scss: {
                app: 'watch:scssApp',
                vendor: 'watch:scssVendor'
            }
        },
        reload: {
            js: 'reload:jsApp',
            scss: 'reload:scssApp'
        }
    },
    js: {
        entryFiles: {app: "main.js", vendor: "vendor.js"},
        src: "client/src/js",
        dist: "client/dist/js",
        vendor: "client/src/js/vendor"
    },
    css: {
        src: "client/src/scss",
        dist: "client/dist/css",
        vendor: "client/src/scss/vendor",
        publicSrc: "client/src/scss/public",
        publicDist: "public/css"
    }
};

var initBrowserify = function(dir, src, options){
    console.log("dir ", dir);
    console.log("src ", src);
    return browserify(path.join(dir, src), options);
};

var bundle = function(b, bundleName) {
    var bundleTimer = duration('Javascript bundle time');
    b.transform(babelify, {presets: ['es2015', 'react']})
        .transform(bundleName === config.fileNames.vendorBundle ? debowerify : reactify)
        .bundle()
        .on('error', console.error)
        .pipe(source(bundleName))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./sourcemaps'))
        .pipe(gulp.dest(config.js.dist))
        .pipe(bundleTimer);
};

var compileSCSS = function(srcDir, destDir){
    gulp.src(srcDir)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'expanded', includePaths: bourbonNeat}).on('error', sass.logError))
        .pipe(autoprefixer({browsers: ['last 2 versions']}))
        .pipe(sourcemaps.write('./sourcemaps'))
        .pipe(gulp.dest(destDir))
        .pipe(browserSync.stream());
};

//General Gulp Tasks

gulp.task('default', [config.gulpTasks.dev], function() {
    console.log("gulp default");
});

gulp.task(config.gulpTasks.dev, [config.gulpTasks.compile.all, config.gulpTasks.browserSync], function(){
    console.log("gulp dev")
});

//TODO need to create prod gulp flow
gulp.task(config.gulpTasks.prod, function(){
    console.log("gulp prod")
});

gulp.task(config.gulpTasks.compile.all, [config.gulpTasks.compile.js.all, config.gulpTasks.compile.scss.all], function(){
   console.log('compileAll');
});

gulp.task('watch', [config.gulpTasks.watch.scss.app, config.gulpTasks.watch.js.app], function(){
    console.log('gulp watch');
});

gulp.task(config.gulpTasks.nodemon, function(cb){
    var started = false;
    return nodemon({
        script: 'bin/www.js',
        verbose: true,
        watch: ['./server', './bin']
        //tasks: ['browserify_app']
    })
    .on('start', function(){
        console.log('Nodemon started');
        //prevent nodemon from running multiple times, the cb is a gulp thing
        if (!started) {
            started = true;
            cb();
        }
    })
    .on('restart', function(){
        console.log("Nodemon restarted")
    })
    .on('crash', function(){
        console.log('Nodemon crashed');
    })
    .on('exit', function(){
        console.log('Nodemon exited');
    })
});

gulp.task(config.gulpTasks.browserSync, [config.gulpTasks.watch.scss.app, config.gulpTasks.watch.scss.vendor, config.gulpTasks.nodemon], function() {
    console.log("gulp browserSync");
    browserSync.init({
        proxy: 'http://localhost:8000',
        browser: "google chrome",
        notify: false
    });

    //scss changes
    //gulp.watch(config.css.src + '/**/*.scss');//, ['reload:scss']);

    //js changes
    gulp.watch(config.js.src + '/**/*.js', [config.gulpTasks.reload.js]);

    //html template changes
    gulp.watch('**/*.ejs').on("change", function(){
        browserSync.reload();
    });
});

//JS Gulp Tasks
gulp.task(config.gulpTasks.compile.js.app, function(){
    console.log('gulp compile:appjs');
    var b = initBrowserify(config.js.src, config.js.entryFiles.app, {
        debug: true
    });

    //bundle the app files
    bundle(b, config.fileNames.appBundle);
});

gulp.task(config.gulpTasks.compile.js.vendor, function(){
    console.log('gulp compile:vendorjs');
    var b = initBrowserify(config.js.vendor, config.js.entryFiles.vendor, {
        debug: true
    });

    //bundle the vendor files
    bundle(b, config.fileNames.vendorBundle);
});

gulp.task(config.gulpTasks.compile.js.all, [config.gulpTasks.compile.js.app, config.gulpTasks.compile.js.vendor], function(){
    console.log('gulp compile:jsAll');
});

gulp.task(config.gulpTasks.watch.js.app, function(){
    console.log('gulp watch:appjs');
    //initiate Browserify instance
    //when using watchify you MUST set the cache and packageCache properties on the browserify instance
    console.log("config.js.entryFiles.app, ", config.js.entryFiles.app);
    var b = initBrowserify(config.js.src, config.js.entryFiles.app, {
        //basedir: path.join(config.paths.root, config.paths.client, config.paths.src), //leave this off
        debug: true,
        cache: {},
        packageCache: {}
    });

    //add watchify plugin
    //TODO are we actually ignforing the vendor files here, I don't currently think so
    b.plugin(watchify, {
        ignoreWatch: ['**/node_modules/**']
    });

    //listen on watchify events
    b.on('update', function(){
        bundle(b, config.fileNames.appBundle);
    });
    b.on('log', console.log);
    b.on('time', function(time){console.log("Bundle created in", time + "ms")});

    //bundle the file
    bundle(b, config.fileNames.appBundle);
});

gulp.task(config.gulpTasks.reload.js, [config.gulpTasks.watch.js.app], function(){
    browserSync.reload();
});


//SCSS Gulp Tasks

gulp.task(config.gulpTasks.compile.scss.app, function(){
    //compile all non public, non vendor CSS files
    compileSCSS(config.css.src + '/*.scss', config.css.dist);
    //compile public CSS files
    compileSCSS(config.css.publicSrc + '/*.scss', config.css.publicDist);
});

gulp.task(config.gulpTasks.compile.scss.vendor, function(){
    //compile vendor CSS files
    compileSCSS(config.css.vendor + '/**/*.scss', config.css.dist);
});

gulp.task(config.gulpTasks.compile.scss.all, [config.gulpTasks.compile.scss.app, config.gulpTasks.compile.scss.vendor], function(){
    console.log('gulp compile:scssAll');
});

//watches both framework and module SCSS files
gulp.task(config.gulpTasks.watch.scss.app, function(){
    gulp.watch(config.css.src + '**/*.scss', [config.gulpTasks.compile.scss.app]);
});

gulp.task(config.gulpTasks.watch.scss.vendor, function(){
    gulp.watch(config.css.vendor + '**/*.scss', [config.gulpTasks.compile.scss.vendor]);
});

//don't need this because a full browserSync reload is not required since we can just inject SCSS changes on the fly
//gulp.task('reload:scss', ['compile:scss'], function(){
//    browserSync.reload();
//});