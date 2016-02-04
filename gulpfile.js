'use strict';

var watchify = require('watchify');
var browserify = require('browserify');
var babel = require('babelify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var assign = require('lodash.assign')
var del = require('del');

var opts = {
	dest: './dist'
}

var customBundleOpts = {
	entries: ['./src/index.js'],
	debug: true
};

var bundleOpts = assign({}, watchify.args, customBundleOpts);
var browserifyBundler = browserify(bundleOpts)
.transform(babel.configure({
	// Use all of the ES2015 spec
	presets: ['es2015']
}));

gulp.task('browserify', function () {
	return browserifyBundler.bundle()
		.on('error', gutil.log.bind(gutil, 'Browserify Error'))
		.pipe(source('bundle.js'))
		.pipe(buffer())
		.pipe(gulp.dest(opts.dest));
});

gulp.task('watchify', function() {

	var bundler = watchify(browserifyBundler);

	bundler.on('update', bundle);
	bundler.on('log', gutil.log);

	function bundle() {
		return bundler.bundle()
			.on('error', gutil.log.bind(gutil, 'Browserify Error'))
			.pipe(source('bundle.js'))
			.pipe(buffer())
			.pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
			.pipe(sourcemaps.write('./')) // writes .map file
			.pipe(gulp.dest(opts.dest));
	}

	return bundle();
});

gulp.task('clean', function() {
	del.sync(opts.dest + '/**/*');
});

gulp.task('watch', ['watchify']);

gulp.task('build', ['browserify']);