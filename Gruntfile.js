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
    requirejs: {
      compile: {
        options: {
          baseUrl: "src",
          name: "scribe",
          paths: {
            'lodash-amd': '../bower_components/lodash-amd',
            'immutable': '../bower_components/immutable/dist/immutable'
          },
          optimize: "none",
          generateSourceMaps: true,
          out: "dist/scribe.js"
        }
      }
    }
  });

  grunt.registerTask('build', ['requirejs']);

  grunt.registerTask('test', ['mochaTest']);

  grunt.registerTask('default', 'mochaTest');

};
