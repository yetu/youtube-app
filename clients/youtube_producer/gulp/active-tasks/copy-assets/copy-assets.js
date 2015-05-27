var gulp = require('gulp'),
        templates = require('../../common-config').path.templates,
        fonts = require('../../common-config').path.fonts,
        img = require('../../common-config').path.img,
        sendToTv = require('../../common-config').path.sendToTv,
        yt_viewer = require('../../common-config').path.yt_viewer,
        ui_videoList = require('../../common-config').path.ui_videoList,
        views = require('../../common-config').path.views,
        clean = require('gulp-clean');

gulp.task('clean-dev-dest', function () {
    return gulp.src(cfg.dev.dest, {read: false})
            .pipe(clean());
});

gulp.task('copy-assets', function () {
    gulp.src(fonts.build.src, {base: './'})
            .pipe(gulp.dest(fonts.build.dest));
    gulp.src(templates.build.src, {base: './'})
            .pipe(gulp.dest(templates.build.dest));
    gulp.src(sendToTv.build.src, {base: './'})
            .pipe(gulp.dest(sendToTv.build.dest));
    gulp.src(yt_viewer.build.src, {base: './'})
            .pipe(gulp.dest(yt_viewer.build.dest));
    gulp.src(ui_videoList.build.src, {base: './'})
            .pipe(gulp.dest(ui_videoList.build.dest));
    return gulp.src(img.build.src, {base: './'})
            .pipe(gulp.dest(img.build.dest));
});

gulp.task('copy-ref-templates', function () {
    return gulp.src(views.build.src, {base: './'})
            .pipe(gulp.dest(views.build.dest));
});
