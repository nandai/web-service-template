/**
 * (C) 2016 printf.jp
 */
var gulp =        require('gulp');
var abspath =     require('gulp-absolute-path');
var typescript =  require('gulp-typescript');
var sourcemaps =  require('gulp-sourcemaps');
var browserify =  require('browserify');
var source =      require('vinyl-source-stream');
var runSequence = require('run-sequence');

var tsOptions =
{
    target: 'es6',
    module: 'commonjs',
    jsx:    'react'
};

/**
 * サーバービルド
 */
gulp.task('server', function ()
{
    var src =
    [
//      '!./node_modules/**',
        './server/**/*.ts'
    ];

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
gulp.task('client-typeScript', function ()
{
    var src =
    [
        './client/**/*.ts',
        './client/**/*.tsx'
    ];

    return gulp.src(src)
        .pipe(abspath())
        .pipe(typescript(tsOptions))
        .pipe(gulp.dest('./build-client'));
});

gulp.task('client-browserify', function ()
{
    buildClient('index.js');
    buildClient('signup.js');
    buildClient('signup-confirm.js');
    buildClient('login.js');
    buildClient('sms.js');
    buildClient('forget.js');
    buildClient('reset.js');
    buildClient('settings.js');
    buildClient('settings-account.js');
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

gulp.task('client', function (callback)
{
    return runSequence(
        'client-typeScript',
        'client-browserify',
        callback
    )
});

gulp.task('default', ['server', 'client']);
