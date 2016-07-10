/**
 * (C) 2016 printf.jp
 */
var gulp =       require('gulp');
var typescript = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var source =     require('vinyl-source-stream');

/**
 * サーバービルド
 */
gulp.task('build-server', function ()
{
    var src =
    [
//      '!./node_modules/**',
        './server/**/*.ts'
    ];

    var tsOptions =
    {
        target: 'es6',
        module: 'commonjs'
    };

    var smOptions =
    {
        includeContent: false,
        sourceRoot: function (file)
        {
            return file.base;
        }
    };

    gulp.src(src)
        .pipe(sourcemaps.init())
        .pipe(typescript(tsOptions))
        .pipe(sourcemaps.write('./', smOptions))
        .pipe(gulp.dest('./build'));
});

/**
 * クライアントビルド
 */
gulp.task('typeScript', function ()
{
    var src =
    [
        './client/**/*.ts'
    ];

    var tsOptions =
    {
    };

    gulp.src(src)
        .pipe(typescript(tsOptions))
        .pipe(gulp.dest('./build-client'));
});

gulp.task('build-client', ['typeScript'], function ()
{
    buildClient('index.js');
    buildClient('signup.js');
    buildClient('signup-confirm.js');
    buildClient('login.js');
    buildClient('forget.js');
    buildClient('reset.js');
    buildClient('settings.js');
    buildClient('settings-account-email.js');
    buildClient('settings-account-email-change.js');
    buildClient('settings-account-password.js');
});

function buildClient(fileName)
{
    browserify({entries: ['./build-client/' + fileName]})
        .bundle()
        .pipe(source('./www/static/js/' + fileName))
        .pipe(gulp.dest('.'));
}

gulp.task('build', ['build-server', 'build-client']);
gulp.task('default', ['build']);
