/**
 * (C) 2016 printf.jp
 */
const gulp =        require('gulp');
const abspath =     require('gulp-absolute-path');
const typescript =  require('gulp-typescript');
const babel =       require('gulp-babel');
const sourcemaps =  require('gulp-sourcemaps');
const browserify =  require('browserify');
const source =      require('vinyl-source-stream');
const runSequence = require('run-sequence');

const tsOptions =
{
    target: 'es6',
    module: 'commonjs',
    jsx:    'react'
};

const babelOptions =
{
  presets: ['latest']
};

/**
 * サーバービルド
 */
gulp.task('server', function ()
{
    const src =
    [
//      '!./node_modules/**',
        './src/server/**/*.ts'
    ];

    const smOptions =
    {
        includeContent: false,
        sourceRoot: function (file)
        {
            return file.base;
        }
    };

    gulp.src(src)
        .pipe(sourcemaps.init())
        .pipe(abspath({rootDir:'./src'}))
        .pipe(typescript(tsOptions))
        .pipe(sourcemaps.write('./', smOptions))
        .pipe(gulp.dest('./build/server'));
});

/**
 * クライアントビルド
 */
gulp.task('client-typeScript', function ()
{
    const src =
    [
        './src/client/**/*.ts',
        './src/client/**/*.tsx'
    ];

    return gulp.src(src)
        .pipe(abspath({rootDir:'./src'}))
        .pipe(typescript(tsOptions))
//      .pipe(babel(babelOptions))
        .pipe(gulp.dest('./build/client'));
});

gulp.task('client-browserify', function ()
{
    buildClient('wst.js');
    buildClient('index.js');
    buildClient('signup-confirm.js');
    buildClient('sms.js');
    buildClient('reset.js');
    buildClient('settings.js');
    buildClient('settings-account.js');
    buildClient('settings-account-email.js');
    buildClient('settings-account-email-change.js');
    buildClient('settings-account-password.js');
    buildClient('not-found.js');
});

function buildClient(fileName)
{
    browserify({entries: ['./build/client/app/' + fileName]})
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
