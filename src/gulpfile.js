
var gulp = require('gulp'),
		sass = require('gulp-sass'),
		prefix = require('gulp-autoprefixer'),
		minifycss = require('gulp-minify-css'),
		concat = require('gulp-concat'),
		uglify = require('gulp-uglify'),
		rename = require('gulp-rename');

gulp.task('sass', function (){
	gulp.src(['./scss/*.scss'])
		.pipe(sass({
			includePaths: ['./scss'],
			outputStyle: 'expanded'
		}))
		.pipe(prefix(
			"last 1 version", "> 1%", "ie 8", "ie 7"
			))
		.pipe(gulp.dest('./'));
});

gulp.task('optimize', function (){
	gulp.src(['./app.js', './components/*/*.js'])
		.pipe(concat('all.js'))
		// .pipe(uglify())
		.pipe(gulp.dest('./'));
});

gulp.task('watch', function (){
  gulp.watch('./scss/*.scss', ['sass'])
  .on('change', function(evt) {
      console.log(
          '[watcher] File ' + evt.path.replace(/.*(?=scss)/,'') + ' was ' + evt.type + ', compiling...'
      );
  });
  gulp.watch(['./app.js', './components/*/*.js'], ['optimize'])
  .on('change', function(evt) {
      console.log(
          '[watcher] File ' + evt.path.replace(/.*(?=js)/,'') + ' was ' + evt.type + ', compiling...'
      );
  });
});

gulp.task('default', ['sass', 'optimize', 'watch'], function() {});
