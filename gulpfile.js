/**
 * (C) 2016 printf.jp
 */
const gulp =        require('gulp');
const abspath =     require('gulp-absolute-path');
const typescript =  require('gulp-typescript');
const babel =       require('gulp-babel');
const browserify =  require('browserify');
const source =      require('vinyl-source-stream');
const runSequence = require('run-sequence');

const tsOptions =
{
    target: 'es6',
    module: 'commonjs',
    jsx:    'react'
};

// const babelOptions =
// {
//   presets: ['latest']
// };

/**
 * TypeScript
 */
gulp.task('typescript', function ()
{
    const src =
    [
//      '!./node_modules/**',
        './src/**/*.ts',
        './src/**/*.tsx'
    ];

    return gulp.src(src)
        .pipe(abspath({rootDir:'./src'}))
        .pipe(typescript(tsOptions))
//      .pipe(babel(babelOptions))
        .pipe(gulp.dest('./build'));
});

gulp.task('browserify', function ()
{
    buildClient('wst.js');
    buildClient('signup-confirm.js');
    buildClient('reset.js');
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

gulp.task('default', function (callback)
{
    return runSequence(
        'typescript',
        'browserify',
        callback
    )
});
