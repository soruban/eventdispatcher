var gulp = require('gulp');
var browserify = require('gulp-browserify');

// Build into a single file with EventBus set as the global namespace.
gulp.task('build', function() {
  gulp.src('./js/EventBus.js')
    .pipe(browserify({
      standalone: "EventBus"
    }))
    .pipe(gulp.dest('./build'))
});

gulp.task('default', ['build']);