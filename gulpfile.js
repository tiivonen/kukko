var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var jade        = require('gulp-jade');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var rename      = require('gulp-rename');


var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};


/**
 * Build the Jekyll Site
 */

gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
        .on('close', done);
});


/**
 * Rebuild Jekyll & do page reload
 */

gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});


/**
 * Wait for jekyll-build, then launch the Server
 */

gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        browser: "google chrome",
        server: {
            baseDir: '_site'
        }
    });
});


/**
 * Compile files from assets/css into both _site/assets/css (for live injecting) and site (for future jekyll builds)
 */

 gulp.task('sass', function () {
     return gulp.src('assets/css/main.sass')
         .pipe(sass({
             includePaths: ['css'],
             onError: browserSync.notify
         }))
         .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
         .pipe(gulp.dest('_site/assets/css'))
         .pipe(browserSync.reload({stream:true}))
         .pipe(gulp.dest('assets/css'));
 });


/**
 * Minify js to _site/assets/js/main.min.js
 */

 gulp.task('minify', function () {
     return gulp.src('assets/js/main.js')
         .pipe(uglify())
         .pipe(rename('main.min.js'))
         .pipe(gulp.dest('_site/assets/js'))
         .pipe(browserSync.reload({stream:true}))
         .pipe(gulp.dest('assets/js'));
 });


/**
 * Jade compiles _jadefiles/*.jade to _includes/*.html
 */

gulp.task('jade', function(){
  return gulp.src('_jadefiles/*.jade')
  .pipe(jade())
  .pipe(gulp.dest('_includes'));
});


/**
 * Watch sass files for changes & recompile
 * Watch js files, run uglify and reload BrowserSync
 * Watch html/md files, run jekyll & reload BrowserSync
 */

gulp.task('watch', function () {
    gulp.watch('assets/css/**', ['sass']);
    gulp.watch('assets/js/**', ['minify']);
    gulp.watch(['index.html', '_layouts/*.html', '_posts/*', '_includes/*'], ['jekyll-rebuild']);
    gulp.watch(['_jadefiles/*.jade'], ['jade']);
});


/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */

gulp.task('default', ['browser-sync', 'watch', 'minify']);
