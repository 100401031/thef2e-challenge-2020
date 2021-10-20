'use strict';
const { src, dest, series, watch, parallel } = require('gulp');
const $ = require('gulp-load-plugins')();
var gulpif = require('gulp-if');
const webpack = require('webpack-stream');
var browserSync = require('browser-sync').create();
var del = require('del');
var autoprefixer = require('autoprefixer');
$.sass.compiler = require('node-sass');

// 使用BrowserSync建立本地測試用web server
function serve() {
  browserSync.init({
    server: {
      baseDir: './dist/',
    },
    open: false,
    reloadDebounce: 500, //設定reload時間間隔
  });
}

//設定已完成不用編譯的子專案
const buildAll = true; //是否要全部重新編譯
//設定要忽略專案
const ignoreProject = buildAll ? null : ['musicPlayer'];
const ignore = (src, template) => {
  if (!ignoreProject) return;
  ignoreProject.forEach((item) => {
    src.push(`${template.replace('(ignoreName)', item)}`);
  });
  return src;
};

//清空dist資料夾
function clean() {
  const srcArray = ['dist/**', '!dist'];
  ignore(srcArray, '!dist/(ignoreName)');
  return del(srcArray);
}

var ignoreSvgInject = function (file) {
  return !file.path.includes('musicPlayer');
};

function pug() {
  const srcArray = ['source/*/*.pug', '!source/layout/*.pug'];
  ignore(srcArray, '!source/(ignoreName)/*.pug');
  return (
    src(srcArray)
      .pipe($.plumber())
      .pipe(
        $.pug({
          pretty: true,
          data: {
            env: process.env.NODE_ENV, //將環境變數傳入pug文件，以便於於文件內判斷Vue執行環境
          },
        })
      )
      .pipe(gulpif(ignoreSvgInject, $.injectSvg({ base: '/source' })))
      // .pipe($.injectSvg({ base: '/source' })) // TODO: don't need this for music player
      .pipe(
        $.rename((file) => {
          file.dirname = file.basename + '/';
          file.basename = 'index';
        })
      )
      .pipe(dest('./dist/'))
      .pipe(browserSync.stream())
  );
}
function compileSass() {
  const srcArray = ['source/*/scss/**/*.scss'];
  ignore(srcArray, '!source/(ignoreName)/scss/**/*.scss');
  return src(srcArray)
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass().on('error', $.sass.logError))
    .pipe($.postcss([autoprefixer()])) //PostCSS 加入前綴
    .pipe($.sourcemaps.write('./')) //建立 sourcemaps (產生.map文件)
    .pipe(
      $.rename((file) => {
        file.dirname = file.dirname.replace('scss', 'css');
      })
    )
    .pipe(dest('./dist'));
}

function babel() {
  const srcArray = ['source/*/js/**/*.js'];
  ignore(srcArray, '!source/(ignoreName)/js/**/*.js');
  return src(srcArray)
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe(
      $.babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(
      $.if(
        process.env.NODE_ENV === 'production',
        $.uglify({
          compress: {
            drop_console: true,
          },
        })
      )
    )
    .pipe($.sourcemaps.write('.'))
    .pipe(dest('./dist'))
    .pipe(browserSync.stream());
}

function webpackBabel() {
  const srcArray = ['source/*/js/**/*.js'];
  ignore(srcArray, '!source/(ignoreName)/js/**/*.js');
  return src(srcArray)
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe(
      webpack({
        mode: 'production',
        entry: {
          cloudDrive: './source/js/cloudDrive.js',
          musicPlayer: './source/js/musicPlayer.js',
        },
        output: {
          filename: '[name].js',
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
                  presets: ['@babel/env'],
                },
              },
            },
          ],
        },
      })
    )
    .pipe(
      $.if(
        process.env.NODE_ENV === 'production',
        $.uglify({
          compress: {
            drop_console: true,
          },
        })
      )
    )
    .pipe(dest('./dist'))
    .pipe(browserSync.stream());
}

function image() {
  const srcArray = ['./source/*/image/**/*.{png,gif,jpg,svg,ico}'];
  ignore(srcArray, '!source/(ignoreName)/image/**/*.{png,gif,jpg,svg,ico}');
  return src(srcArray)
    .pipe(
      $.if(
        process.env.NODE_ENV === 'production',
        $.imagemin() //壓縮圖片
      )
    )
    .pipe(dest('./dist'));
}
function audio() {
  const srcArray = ['./source/*/sound/**/*.mp3'];
  ignore(srcArray, '!source/(ignoreName)/sound/**/*.mp3');
  return src(srcArray).pipe(dest('./dist'));
}
function json() {
  const srcArray = ['./source/*/json/**/*.json'];
  ignore(srcArray, '!source/(ignoreName)/json/**/*.json');
  return src(srcArray).pipe(dest('./dist'));
}
// function vendorJS() {
//   return src('./node_modules/jquery/dist/jquery.js')
//     .pipe($.if(process.env.NODE_ENV === 'production', $.uglify()))
//     .pipe(dest('./dist/js'));
// }

//監聽檔案變更(監聽路徑, 任務名稱)
function watchFiles() {
  //檔案變更時自動執行任務
  watch('./source/*/**/*.pug', pug);
  watch('./source/*/scss/*.scss', compileSass);
  watch('./source/*/js/**/*.js', babel);
  watch('./source/*/image/**/*.{png,gif,jpg,svg}', image);
  watch('./source/*/json/**/*.json', json);

  //檔案變更時自動重整測試sever
  watch('dist/*/*.html').on('change', browserSync.reload);
  watch('dist/*/css/*.css').on('change', browserSync.reload);
  watch('dist/*/js/*.js').on('change', browserSync.reload);
}
function deploy() {
  return src('./dist/**/*').pipe($.ghPages());
}

exports.build = series(clean, pug, compileSass, babel, image, audio, json); //導出專案
exports.buildData = series(image, json); //導出資料(方便編輯資料)
exports.deploy = deploy; //自動部署至Github page
exports.default = parallel(
  clean,
  pug,
  compileSass,
  babel,
  image,
  audio,
  json,
  serve,
  watchFiles
); //開發時執行任務
