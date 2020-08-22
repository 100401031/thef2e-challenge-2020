'use strict';
const { src, dest, series, watch, parallel } = require('gulp');
const $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync').create();
var del = require('del');
var autoprefixer = require('autoprefixer');
$.sass.compiler = require('node-sass');

function defaultTask(cb) {
  // place code for your default task here
  cb();
}

// 使用BrowserSync建立本地測試用web serve
function serve() {
  browserSync.init({
    server: {
      baseDir: './dist/'
    },
    open: false,
    reloadDebounce: 500 //設定reload時間間隔
  });
}

function clean() {
  return del(['dist/**', '!dist']);
}
function pug() {
  return src(['source/view/*.pug'])
    .pipe($.plumber())
    .pipe(
      $.pug({
        pretty: true,
        data: {
          // Feed the templates
          env: process.env.NODE_ENV
        }
      })
    )
    .pipe(dest('./dist/'))
    .pipe(browserSync.stream());
}
function compileSass() {
  return src('source/scss/**/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.postcss([autoprefixer()])) // 將編譯完成的 CSS 做 PostCSS 處理
    .pipe($.sourcemaps.write('./')) // 生成 sourcemaps 文件 (.map)
    .pipe(dest('./dist/css'));
}

function babel() {
  return src('./source/js/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe(
      $.babel({
        presets: ['@babel/env']
      })
    )
    .pipe(
      $.if(
        process.env.NODE_ENV === 'production',
        $.uglify({
          compress: {
            drop_console: true
          }
        })
      )
    )
    .pipe($.sourcemaps.write('.'))
    .pipe(dest('./dist/js'))
    .pipe(browserSync.stream());
}
function image() {
  return src('./source/image/**/*.{png,gif,jpg,svg}')
    .pipe(
      $.if(
        process.env.NODE_ENV === 'production',
        //minify image
        $.imagemin()
      )
    )
    .pipe(dest('./dist/image'));
}
function json() {
  return src('./source/json/**/*.json').pipe(dest('./dist/json'));
}
function vendorJS() {
  return src('./node_modules/jquery/dist/jquery.js')
    .pipe($.if(process.env.NODE_ENV === 'production', $.uglify()))
    .pipe(dest('./dist/js'));
}
//監聽檔案變更(監聽路徑, 任務名稱)
function watchFiles() {
  //檔案變更時自動執行任務
  watch('./source/**/*.pug', pug);
  watch('./source/scss/**/*.scss', compileSass);
  watch('./source/js/**/*.js', babel);
  watch('./source/image/**/*.{png,gif,jpg,svg}', image);
  watch('./source/json/**/*.json', json);

  //檔案變更時自動重整測試sever
  watch('dist/*.html').on('change', browserSync.reload);
  watch('dist/css/*.css').on('change', browserSync.reload);
  watch('dist/js/*.js').on('change', browserSync.reload);
}

// 專案完成時的導出任務
exports.build = series(clean, pug, compileSass, babel, image, vendorJS, json);
exports.default = parallel(
  clean,
  pug,
  compileSass,
  babel,
  image,
  vendorJS,
  json,
  serve,
  watchFiles
);
