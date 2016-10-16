
	// Gulp
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

	gulp.task('default', function(){

		gulp.watch('./scss/*.scss', function(event){
			gulp.run('sass');
		});
		gulp.watch(['./app.js', './components/*/*.js'], function(event){
			gulp.run('uglify');
		});
	});