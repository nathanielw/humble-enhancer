'use strict';

require('babel-core/register');

var watchify = require('watchify');
var browserify = require('browserify');
var babel = require('babelify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var assign = require('lodash.assign');
var del = require('del');
var jasmine = require('gulp-jasmine');
var sass = require('gulp-sass');
var lazypipe = require('lazypipe');
var header = require('gulp-header');
var fs = require('fs');
var pkg = require('./package.json');

var addMetadata = lazypipe()
	.pipe(function() {
		return header(fs.readFileSync('./src/metadata.txt', 'utf8'), { pkg: pkg });
	});

var opts = {
	dest: './dist-dev',
	distDest: './dist'
};

var customBundleOpts = {
	entries: ['./src/index.js'],
	debug: true
};

var bundleOpts = assign({}, watchify.args, customBundleOpts);
var babelOpts = {
	presets: ['es2015'],
	compact: false
};

var browserifyBundler = browserify(bundleOpts)
	.transform(babel.configure(babelOpts));

function bundle(bundler) {
	return bundler.bundle()
		.on('error', gutil.log.bind(gutil, 'Browserify Error'))
		.pipe(source('humble_enhancer.user.js'))
		.pipe(buffer())
		.pipe(addMetadata())
		.pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
		.pipe(sourcemaps.write('./')) // writes .map file
		.pipe(gulp.dest(opts.dest));
}

gulp.task('browserify', function () {
	return bundle(browserifyBundler);
});

gulp.task('watchify', function() {
	var bundler = watchify(browserifyBundler);

	bundler.on('log', gutil.log);
	bundler.on('update', function() {
		bundle(bundler);
	});

	return bundle(bundler);
});

gulp.task('browserify:dist', function () {
	var babelOptsDist = assign({}, babelOpts, {
		sourceMaps: false,
		comments: false
	});

	var bundleOptsDist = assign({}, customBundleOpts, {
		debug: false
	});

	var bundler = browserify(bundleOptsDist)
		.transform(babel.configure(babelOptsDist));

	return bundler.bundle()
		.on('error', gutil.log.bind(gutil, 'Browserify Error'))
		.pipe(source('humble_enhancer.user.js'))
		.pipe(buffer())
		.pipe(addMetadata())
		.pipe(gulp.dest(opts.distDest));
});

gulp.task('test', function() {
	gulp.src(['spec/**/*[sS]pec.js'])
	.pipe(jasmine({
		includeStackTrace: true
	}));
});

function styles(dest) {
	return gulp.src('./src/css/**/*.scss')
	.pipe(sass().on('error', sass.logError))
	.pipe(gulp.dest(dest));
}

gulp.task('styles', function() {
	return styles(opts.dest);
});

gulp.task('styles:dist', function() {
	return styles(opts.distDest);
});

gulp.task('styles:watch', ['styles'], function () {
	gulp.watch('./src/css/**/*.scss', ['styles']);
});

gulp.task('clean', function() {
	del.sync([opts.dest, opts.distDest]);
});

gulp.task('watch', ['watchify', 'styles:watch']);

gulp.task('build', ['browserify', 'styles']);
gulp.task('build:dist', ['clean', 'browserify:dist', 'styles:dist']);
