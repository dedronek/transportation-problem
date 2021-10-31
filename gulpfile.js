var gulp = require('gulp'),
    typescript = require("gulp-typescript"),
    sass = require('gulp-sass'),
    watch = require("gulp-watch"),
    livereload = require('gulp-livereload'),
    minify_css = require('gulp-clean-css');
minify_js = require('gulp-minify');



gulp.task('sass', function() {
    gulp.src('style/**/main.scss')
        .pipe(sass()) //Changing from SCSS to CSS
        .pipe(minify_css({compatibility: 'ie8'})) //Minify CSS
        .pipe(gulp.dest('./style'))
});


gulp.task('typescript', function () {
    return gulp.src('src/**/script.ts')
        .pipe(typescript({
            noImplicitAny: true,
            outFile: 'script.src'
        }))
        .pipe(minify_js({
            ext:{
                src:'.src',
                min:'.min.src'
            } /* ,
            exclude: ['tasks'], Those files won't minify
           ignoreFiles: ['.combo.src', '-min.src']
             Won't minify files which matches pattern. */
        }))
        .pipe(gulp.dest('./src'))
});


gulp.task('watch', function() { minify_js
    gulp.watch('src/**/*.ts', ['typescript']);
    gulp.watch('style/**/*.scss', ['sass']);
});


gulp.task('default', ['watch']);

/*
Jeśli nie zadziała, pobrać pliki zawarte w "package.json" za pomocą
komendy "npm install" albo "sudo npm install"
*/