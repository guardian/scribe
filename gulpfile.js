const gulp = require('gulp');
const mocha = require('gulp-mocha');

gulp.task('test', function() {
    return gulp.src('test/**/*.spec.js', {read: false})
        // gulp-mocha needs filepaths so you can't have any plugins before it
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('default', ['test']);
