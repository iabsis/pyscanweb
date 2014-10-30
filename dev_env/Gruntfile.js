module.exports = function(grunt) {
    grunt.initConfig({
        secret: grunt.file.readJSON('/Users/gillesh/secret.json'),
        pkg: grunt.file.readJSON('package.json'), //load configuration
        secret: grunt.file.readJSON('secret.json'),
        sftp: {
            deploy: {
                files: {
                    "./": [
                        "../pyscanweb/static/pyscanweb/css/style.min.css",
                        "../pyscanweb/static/pyscanweb/css/style.css",
                        "../pyscanweb/static/pyscanweb/js/global.min.js",
                        "../pyscanweb/static/pyscanweb/js/global.js"
                    ]
                },
                options: {
                    host: '<%= secret.host %>',
                    username: '<%= secret.username %>',
                    password: '<%= secret.password %>',
                    path: "/usr/share/pyscanweb/pyscanweb",
                    srcBasePath: 'pyscanweb/'
                }
            }
        } ,
 
        concat: { // concatenation task settings
            dist: {
                src: [
                    'js/libs/gumby.js',
                    'js/libs/ui/gumby.retina.js',
                    'js/libs/ui/gumby.fixed.js',
                    'js/libs/ui/gumby.skiplink.js',
                    'js/libs/ui/gumby.toggleswitch.js',
                    'js/libs/ui/gumby.checkbox.js',
                    'js/libs/ui/gumby.radiobtn.js',
                    'js/libs/ui/gumby.tabs.js',
                    'js/libs/ui/gumby.navbar.js',
                    'js/libs/ui/jquery.validation.js',
                    'js/libs/wow.min.js',
        		    'js/libs/jquery.nicescroll.min.js',
                    'js/libs/gumby.init.js',
                    'js/libs/jquery.noty.packaged.min.js',
                    'js/libs/select2.js',
                    'js/plugins.js',
                    'js/main.js',
                    'js/app.js',
                ],
                dest: '../pyscanweb/static/pyscanweb/js/global.js'
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            build: {
                src:  '../pyscanweb/static/pyscanweb/js/global.js',
                dest: '../pyscanweb/static/pyscanweb/js/global.min.js'
            }
        },
        
        cssmin: {
            combine: {
                files: {
                    '../pyscanweb/static/pyscanweb/css/style.min.css': ['../pyscanweb/static/pyscanweb/css/style.css']
                }
            }
        },
        concat_css: {
            options: {
              // Task-specific options go here.
            },
            all: {
              src: ["sass/gumby.css", "css/select2.css"],
              dest: "../pyscanweb/static/pyscanweb/css/style.css"
            },
        },
        compass : {
            dist: {                   // Target
                options: {              // Target options
                    sassDir: 'sass',
                    cssDir: 'sass',
                    require : 'modular-scale',
                    force: true
                }
            },
        },
        watch: {
            scripts: {
                files: ['js/**/*.js','sass/**/*.scss'],
                tasks: ['compass', 'concat', 'concat_css', 'uglify', 'cssmin', 'sftp'],
                options: {
                    spawn: false
                },
            } 
        }
 
    });
    grunt.loadNpmTasks('grunt-contrib-concat'); // which NPM packages to load
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-ssh');
    
    grunt.registerTask('default', ['compass', 'concat', 'uglify', 'cssmin']); // which packages to run
};
