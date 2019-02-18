var gulp = require("gulp");
var sass = require("gulp-sass");
var rename = require("gulp-rename")
var concat = require("gulp-concat");
var babel = require("gulp-babel")
var autoprefixer = require("gulp-autoprefixer");
var uglify = require("gulp-uglify");
var mincss = require("gulp-clean-css");
var server = require("gulp-webserver");
var url = require("url")
var fs = require("fs")
var path = require("path");
var minHTML = require("gulp-htmlmin");
var resData = require("./src/data/data")

//开发环境下
//起服务
gulp.task("server", function () {
    return gulp.src("./src")
    .pipe(server({
        port: 9090,
        livereload: true,
        middleware: function (req, res, next) {
            var pName = url.parse(req.url).pathname;
            if (pName == "/favicon.ico") {
                return res.end("")
            } else if (pName == "/api/data") {
                return res.end(JSON.stringify({code:1,data:resData}))
            } else {
                pName = pName == "/" ? "index.html" : pName;
                return res.end(fs.readFileSync(path.join(__dirname,"src",pName)))
            }
        }
    }))
})

//编译css
gulp.task("scss", function () {
    return gulp.src("./src/scss/**/*.scss")
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(gulp.dest("./src/css"))
})

//编译合并js

gulp.task("js", function () {
    return gulp.src("./src/js/**/*.js")
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat("all.js"))
        .pipe(gulp.dest("./src/alljs"))
})

//监听scss,js

gulp.task("watch",function(){
    return gulp.watch(["./src/scss/**/*.scss","./src/js/**/*.js"],gulp.series("scss","js"))
})

gulp.task("default", gulp.series("scss", "js", "server", "watch"))

//上线环境
//压缩css
gulp.task("zipCSS", function () {
    return gulp.src("./src/css/**/*.css")
        .pipe(mincss())
        .pipe(gulp.dest("./dist/css"))
})
//压缩js

gulp.task("zipJS", function () {
    return gulp.src("./src/alljs/**/*.js")
        .pipe(uglify())
        .pipe(gulp.dest("./dist/js"))
})
//压缩html
gulp.task("zipHTML", function () {
    return gulp.src(["./src/**/*.html","./package.json"])
        .pipe(minHTML({ collapseWhitespace: true }))
        .pipe(gulp.dest("./dist"))
})

gulp.task("build",gulp.parallel("zipCSS","zipJS","zipHTML"))