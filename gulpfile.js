var gulp = require('gulp');
var browserify = require('gulp-browserify');

// Basic usage
gulp.task('build', function() {
  // Single entry point to browserify
  gulp.src('./js/EventBus.js')
    .pipe(browserify({
      standalone: "EventBus"
    }))
    .pipe(gulp.dest('./build/js'))
});

gulp.task('default', ['build'])