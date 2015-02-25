/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    cssFolder: 'css',
    scssFolder: 'scss',
    sass: {                              // Task
        dist: {                            // Target
          files: [{
              expand: true,
              cwd: '<%=scssFolder%>', //current working dir
              src: ['*.scss', '!_*.scss'], //sass files filter
              dest: '<%=cssFolder%>', //destination folder
              ext: '.css' //destination extension
          }],
          options: {
              check: false, //should be false else the output is empty!!!
              style: 'expanded'
          }
        }
      },
      autoprefixer: {
        dist: {
          options: {
            browsers: ['last 3 versions', '> 1%', 'ie 10', 'Opera 12']
          },
          files: {
            '<%=cssFolder%>/styles.css': '<%=cssFolder%>/styles.css' //dest : source
          }
        }
      },
      watch: {
        gruntfile: {
            files: 'Gruntfile.js'
        },
        main: {
            files: ['<%=scssFolder%>/*.scss'],
            // tasks: ['sass']
            tasks: ['run']
        }
     }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-autoprefixer');

  // Default task.
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('run', ['sass', 'autoprefixer']);

};
