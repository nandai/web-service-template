/**
 * (C) 2016-2017 printf.jp
 */
const browserify =  require('browserify');
const cssnano =     require('cssnano');
const gulp =        require('gulp');
const abspath =     require('gulp-absolute-path');
const babel =       require('gulp-babel');
const gulpif =      require('gulp-if');
const postcss =     require('gulp-postcss');
const replace =     require('gulp-replace');
const tslint =      require('gulp-tslint');
const typescript =  require('gulp-typescript');
const uglify =      require('gulp-uglify');
const runSequence = require('run-sequence');
const cssNext =     require('postcss-cssnext');
const cssImport =   require('postcss-import');
const cssMixins =   require('postcss-mixins');
const buffer =      require('vinyl-buffer');
const source =      require('vinyl-source-stream');

const babelOptions =
{
  presets: ['latest']
};

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
console.log('NODE_ENV ... ' + process.env.NODE_ENV + '\n');

const isProduction = (process.env.NODE_ENV === 'production');

/**
 * TypeScript
 */
gulp.task('typescript', function ()
{
    const src =
    [
        './src/**/*.ts',
        './src/**/*.tsx'
    ];

    const tsProj = typescript.createProject('./tsconfig.json');

    return gulp
        .src(src)
        .pipe(abspath({rootDir:'./src'}))
        .pipe(tsProj())
        .pipe(babel(babelOptions))  // uglifyのためにやむなくbabel
        .pipe(gulp.dest('./build'));
});

/**
 * remove-client-log
 */
gulp.task('remove-client-log', function()
{
    const src =
    [
        './build/**/*.js',
        '!./build/server/**/*.js',
        '!./build/test/**/*.js'
    ];

    return gulp
        .src(src)
        .pipe(gulpif(isProduction,
            replace(/(const slog_1 = require\(.+\);|\s*slog_1\.slog\.setConfig\(.+\);|\s*slog_1\.slog\.bind\(.+\);|\s*const log = slog_1\.slog\.stepIn\(.+\);|\s*log\.[diwe]\(.+\);|log\.stepOut\(\);)/g, ''))
        )
        .pipe(gulp.dest('./build-client'));
});

/**
 * browserify
 */
gulp.task('browserify', function ()
{
    const src = './build-client/client/main/index.js';
    const dest = './www/static/wst.js';

    browserify({entries: [src]})
        .bundle()
        .pipe(source(dest))
        .pipe(buffer())
        .pipe(gulpif(isProduction, uglify()))
        .pipe(gulp.dest('.'));
});

/**
 * javascript
 */
gulp.task('javascript', function (callback)
{
    return runSequence(
        'typescript',
        'remove-client-log',
        'browserify',
        callback
    )
});

/**
 * css
 */
gulp.task('css', function()
{
    return gulp
        .src('./src/client/css/wst.css')
        .pipe(postcss([cssImport, cssNext, cssMixins]))
        .pipe(gulpif(isProduction, postcss([cssnano])))
        .pipe(gulp.dest('./www/static'));
});

/**
 * tslint
 */
gulp.task('tslint', function ()
{
    const src =
    [
        './src/**/*.ts',
        './src/**/*.tsx'
    ];

    return gulp
        .src(src)
        .pipe(tslint())
        .pipe(tslint.report({emitError:false}));
});

gulp.task('default', ['javascript', 'css']);
