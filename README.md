# gulp-test-i18n
Gulp plugin to generate a test translation file from GNU gettext POT files with a configurable function

# usage

    var gulp = require('gulp'),
        g = require('gulp-load-plugins')({lazy: false});

    gulp.task('test-translations', function() {
      return gulp.src('po/**/*.pot')
        .pipe(g.testI18n({
          // optional parameters
          fn: function(s) {
            // this is the default function
            return s.split('').reverse().join('');
          },
          language: 'test'
        }))
        .pipe(gulp.dest('./translations/'));
    });

Based on https://www.npmjs.com/package/gulp-pseudo-i18n
