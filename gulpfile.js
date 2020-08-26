'use strict';
const { src, dest, series, watch, parallel } = require('gulp');
const $ = require('gulp-load-plugins')();
const webpack = require('webpack-stream');
var browserSync = require('browser-sync').create();
var del = require('del');
var autoprefixer = require('autoprefixer');
$.sass.compiler = require('node-sass');

// 使用BrowserSync建立本地測試用web server
function serve() {
  browserSync.init({
    server: {
      baseDir: './dist/'
    },
    open: false,
    reloadDebounce: 500 //設定reload時間間隔
  });
}

//清空dist資料夾
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
          env: process.env.NODE_ENV //將環境變數傳入pug文件，以便於於文件內判斷Vue執行環境
        }
      })
    )
    .pipe($.injectSvg({ base: '/source' }))
    .pipe(dest('./dist/'))
    .pipe(browserSync.stream());
}
function compileSass() {
  return src('source/scss/**/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.postcss([autoprefixer()])) //PostCSS 加入前綴
    .pipe($.sourcemaps.write('./')) //建立 sourcemaps (產生.map文件)
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

function webpackBabel() {
  return src('./source/js/**/*.js')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe(
      webpack({
        mode: 'production',
        entry: {
          cloudDrive: './source/js/cloudDrive.js',
          musicPlayer: './source/js/musicPlayer.js'
        },
        output: {
          filename: '[name].js'
        },
        devtool: 'source-map',
        module: {
          rules: [
            {
              test: /\.m?js$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/env']
                }
              }
            }
          ]
        }
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
    .pipe(dest('./dist/js'))
    .pipe(browserSync.stream());
}

function image() {
  return src('./source/image/**/*.{png,gif,jpg,svg}')
    .pipe(
      $.if(
        process.env.NODE_ENV === 'production',
        $.imagemin() //壓縮圖片
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
  watch('./source/js/**/*.js', webpackBabel);
  watch('./source/image/**/*.{png,gif,jpg,svg}', image);
  watch('./source/json/**/*.json', json);

  //檔案變更時自動重整測試sever
  watch('dist/*.html').on('change', browserSync.reload);
  watch('dist/css/*.css').on('change', browserSync.reload);
  watch('dist/js/*.js').on('change', browserSync.reload);
}
function deploy() {
  return src('./dist/**/*').pipe($.ghPages());
}

exports.build = series(clean, pug, compileSass, webpackBabel, image, vendorJS, json); //導出專案
exports.buildData = series(image, json); //導出資料(方便編輯資料)
exports.deploy = deploy; //自動部署至Github page
exports.default = parallel(clean, pug, compileSass, webpackBabel, image, json, serve, watchFiles); //開發時執行任務
