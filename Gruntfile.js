module.exports = function(grunt) {

  // Add the grunt-mocha-test tasks.
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-requirejs');

  grunt.initConfig({
    // Configure a mochaTest task
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
        },
        src: ['test/**/*.spec.js']
      }
    },
  });

  function requireConfiguration(optimize, outputFilename) {
    return {
      compile: {
        options: {
          baseUrl: "src",
          name: "scribe",
          paths: {
            'lodash-amd': '../node_modules/lodash-amd',
            'immutable': '../node_modules/immutable/dist/immutable'
          },
          optimize: optimize,
          preserveLicenseComments: false,
          generateSourceMaps: true,
          out: "build/" + outputFilename
        }
      }
    }
  }

  grunt.registerTask('build', 'Build output files', function() {
    grunt.config('requirejs', requireConfiguration('uglify2', 'scribe.min.js'));
    grunt.task.run('requirejs');

    grunt.config('requirejs', requireConfiguration('none', 'scribe.js'));
    grunt.task.run('requirejs');
  });

  grunt.registerTask('test', ['mochaTest']);

  grunt.registerTask('default', 'test');

};
