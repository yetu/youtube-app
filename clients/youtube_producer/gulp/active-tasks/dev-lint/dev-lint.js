var gulp = require('gulp'),
    cache = require('gulp-cached'),
    path = require('../../common-config').path,
    jshint = require('gulp-jshint');

gulp.task('dev-lint', function () {
    return gulp.src(path.scripts.lint)
            .pipe(jshint())
            .pipe(jshint.reporter('default'));
});