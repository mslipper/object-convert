'use strict';
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var excludeGitignore = require('gulp-exclude-gitignore');
var istanbul = require('gulp-istanbul');
var tape = require('gulp-tape');
var tapSpec = require('tap-spec');
var noCoverage = process.argv.indexOf('--no-coverage') > -1;

gulp.task('static', function () {
  return gulp.src('**/*.js')
    .pipe(excludeGitignore())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('pre-test', function () {
  return gulp.src('lib/**/*.js')
    .pipe(istanbul({
      includeUntested: true
    }))
    .pipe(istanbul.hookRequire());
});

gulp.task('test', noCoverage ? [] : ['pre-test'], function () {
  var stream = gulp.src('test/**/*.js')
    .pipe(tape({
      reporter: tapSpec()
    }));

  if (!noCoverage) {
    stream.pipe(istanbul.writeReports());
  }
});

gulp.task('default', ['static', 'test']);
