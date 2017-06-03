/**
 * (C) 2016-2017 printf.jp
 */
const gulp =        require('gulp');
const abspath =     require('gulp-absolute-path');
const typescript =  require('gulp-typescript');
const babel =       require('gulp-babel');
const browserify =  require('browserify');
const source =      require('vinyl-source-stream');
const runSequence = require('run-sequence');
const postcss =     require('gulp-postcss');
const cssImport =   require('postcss-import');
const cssNext =     require('postcss-cssnext');
const cssMixins =   require('postcss-mixins');

const tsOptions =
{
    target: 'es6',
    module: 'commonjs',
    jsx:    'react',
    experimentalDecorators: true
};

// const babelOptions =
// {
//   presets: ['latest']
// };

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
console.log('NODE_ENV ... ' + process.env.NODE_ENV + '\n');

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
});

function buildClient(fileName)
{
    browserify({entries: ['./build/client/app/' + fileName]})
        .bundle()
        .pipe(source('./www/static/js/' + fileName))
        .pipe(gulp.dest('.'));
}

gulp.task('javascript', function (callback)
{
    return runSequence(
        'typescript',
        'browserify',
        callback
    )
});

gulp.task('css', function()
{
    return gulp
      .src('./src/client/css/wst.css')
      .pipe(postcss([cssImport, cssNext, cssMixins]))
      .pipe(gulp.dest('./www/static/components'));
});

gulp.task('default', ['javascript', 'css']);
