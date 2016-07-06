/**
 * (C) 2016 printf.jp
 */
var gulp =       require('gulp');
var typescript = require('gulp-typescript');
var sourcemaps = require('gulp-sourcemaps');

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
gulp.task('build-client', function ()
{
    buildClient('index.ts');
    buildClient('signup.ts');
    buildClient('signup-confirm.ts');
    buildClient('login.ts');
    buildClient('forget.ts');
    buildClient('reset.ts');
    buildClient('settings.ts');
    buildClient('settings-account-email.ts');
    buildClient('settings-account-email-change.ts');
});

function buildClient(fileName)
{
    var src =
    [
        './client/' + fileName
    ];

    var tsOptions =
    {
    };

    gulp.src(src)
        .pipe(typescript(tsOptions))
        .pipe(gulp.dest('./www/static/components'));
}

gulp.task('build', ['build-server', 'build-client']);
gulp.task('default', ['build']);
