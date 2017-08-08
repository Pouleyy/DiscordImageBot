import gulp from "gulp";
import path from "path";
import pump from "pump";
import del from "del";
import babel from "gulp-babel";
import eslint from "gulp-eslint";
import sourcemaps from "gulp-sourcemaps";

const paths = {
    main: {
        dir: "src",
        src: "src/**/*.js",
        dest: "dist"
    },
    // tests: {
    //     dir: "tests",
    //     src: "tests/**/*.js",
    //     dest: "dist/tests"
    // },
    clean: "dist/*"
};

const clean = () => del(paths.clean, { dot: true });
export { clean };

export function lint() {
    return gulp.src(["src/**/*.js"])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}

function build_src(done) {
    pump([
        gulp.src([paths.main.src]),
        sourcemaps.init(),
        babel(),
        sourcemaps.write({
            includeContent: false,
            sourceRoot: function (file) {
                return path.relative(file.relative, path.join(file.cwd, paths.main.dir));
            }
        }),
        gulp.dest(paths.main.dest)
    ],
        done
    );
}

// function build_test(done) {
//     pump([
//         gulp.src([paths.tests.src]),
//         sourcemaps.init(),
//         babel(),
//         sourcemaps.write({
//             includeContent: false,
//             sourceRoot: function (file) {
//                 return "../" + path.relative(file.relative, path.join(file.cwd, paths.tests.dir));
//             }
//         }),
//         gulp.dest(paths.tests.dest)
//     ],
//         done
//     );
// }

export const build = gulp.series(clean, build_src);

export default build;