module.exports = function (grunt) {

  grunt.initConfig({
    less: {
      development: {
        files: {
          'app/compiled/app.min.css': 'app/less/app.less'
        },
        options: {
          sourceMap: true
        }
      },
      production: {
        files: {
          'app/compiled/app.min.css': 'app/less/app.less'
        }
      }
    },
    watch: {
      less: {
        files: ['app/less/**/*.less'],
        tasks: ['less:development'],
        options: {
          spawn: false
        }
      },
      server: {
        files: ['server/**/*.js', 'Gruntfile.js'],
        tasks: ['express'],
        options: {
          spawn: false
        }
      }
    },
    express: {
      dev: {
        options: {
          script: 'server/app.js',
          node_env: 'dev',
          port: ''
        }
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'app/js/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    jsbeautifier: {
      modify: {
        src: ['Gruntfile.js', 'app/js/**/*.js'],
        options: {
          config: '.jsbeautifyrc'
        }
      },
      validate: {
        src: ['Gruntfile.js', 'app/js/**/*.js'],
        options: {
          mode: 'VERIFY_ONLY',
          config: '.jsbeautifyrc'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');

  grunt.registerTask('default', ['less', 'express', 'watch']);

  // Clean code before a commit
  grunt.registerTask('clean', ['jsbeautifier:modify', 'jshint']);

  // Validate code (read only)
  grunt.registerTask('validate', ['jsbeautifier:validate', 'jshint']);

  // Heroku
  grunt.registerTask('build', ['less:production']);

};
