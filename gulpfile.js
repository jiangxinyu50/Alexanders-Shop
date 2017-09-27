var gulp = require('gulp');
var base64 = require('gulp-base64');
var cssnano = require('cssnano');  //更好用的css压缩!
var ifElse = require('gulp-if-else');
var postcss = require('gulp-postcss'); //postcss本身
var ugjs = require('gulp-uglify');
var replace = require('gulp-replace');
var imagemin = require('gulp-imagemin');
var rev = require('gulp-rev-append');
var clean = require('gulp-clean');
var htmlreplace = require('gulp-html-replace');
var browserSync = require('browser-sync').create();
var less = require('gulp-less');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('autoprefixer');
var changed = require('gulp-changed');

var path = 'src/',
    csspath = 'src/css/**/*.css',
    sasspath = 'src/sass/**/*.scss',
    jspath = 'src/js/**/*.js',
    htmlpath = 'src/views/**/*.html',
    ifonpath = 'src/webfont/**',
    lesspath = 'src/less/**/*.less',
    outlesspath = 'src/less/**/style.less',
    imagepath = 'src/images/**/*';

var disPath = './Public/',
    disCssPath = './Public/css',
    disJsPath = './Public/js',
    disHtmlPath = './src/views',
    disImagePath = './Public/images',
    disifonpath = './Public/webfont';

var plugin_path = '/Public/plugins';

var urlTag = '';
var NODE_ENV = '';


gulp.task('default', function() {
    //css变动时自动生成
    gulp.watch([csspath],['css']);

    gulp.watch([jspath],['ugjs']);

    gulp.watch([lesspath],['less']);

    gulp.watch([imagepath],['images']);

    gulp.start('browser-sync');

    gulp.watch([htmlpath, csspath, jspath], function() {
         browserSync.reload();
    });
});

gulp.task('ugjs',function() {
    return gulp.src(jspath)
        .pipe(ugjs())
        .pipe(gulp.dest(disJsPath));
});

gulp.task('css',function() {
    var processes = [cssnano];

    gulp.src(csspath)
        .pipe(changed(disCssPath))
        .pipe(base64({
            extensions: ['png', /\.jpg#datauri$/i],
            maxImageSize: 10*1024 // bytes,
        }))
        .pipe(gulp.dest(disCssPath));
});

gulp.task('images', function () {
    return gulp.src(imagepath)
        .pipe(changed(disImagePath))
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest(disImagePath));
});

gulp.task('view',function() {
    return gulp.src(htmlpath)
        .pipe(changed(disHtmlPath))
        .pipe(rev())
        .pipe(replace('[plugins]' , plugin_path))
        .pipe(gulp.dest(disHtmlPath));
});

gulp.task('clean',function() {
    return gulp.src(disHtmlPath, {read: true})
        .pipe(clean());
});

gulp.task('less', function() {
    var processes = [
        autoprefixer({browsers: ['last 2 version', 'safari 5', 'opera 12.1', 'ios 6', 'android 4','> 10%']}),
    ];
    gulp.src([outlesspath, '!component*.less'])
        .pipe(changed('./src/css'))
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(less())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./src/css'));
});

// 静态服务器
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
});
