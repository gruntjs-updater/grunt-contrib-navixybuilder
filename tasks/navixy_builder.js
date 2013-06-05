/*
 * navixy-builder
 * https://github.com/Kinestetic/grunt-contrib-navixybuilder.git
 *
 * Copyright (c) 2013 Kinestetic
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    grunt.registerTask('navixy_builder', 'Build main NavixyPro interface', function () {

        var buildDestination = 'build',
            destinationFileName = 'app.js',
            options = this.options(),
            applcations = options.applications,

            senchaBuildConfig = {},
            concatBuildConfig = {},
            uglifyBuildConfig = {},
            copyBuildConfig = {},

            mainTaskSequence = [];

        if (applcations && applcations.length) {
            applcations.forEach(function (app) {
                if (!app.noSencha) {
                    senchaBuildConfig[app.name] = {
                        options: {
                            projectRoot: app.path
                        }
                    };

                    var buildDesinationFilePath = [buildDestination, app.path, destinationFileName].join('/'),
                        concatSrc = ['<%= dependencies_files %>'];

                    if (app.productionFiles) {
                        concatSrc.push([ app.path, app.productionFiles].join('/'));
                    }

                    concatBuildConfig[app.name] = {
                        src: concatSrc,
                        dest: buildDesinationFilePath
                    };

                    uglifyBuildConfig[app.name] = {
                        src: buildDesinationFilePath,
                        dest: buildDesinationFilePath
                    };
                }

                if (app.copyFiles && app.copyFiles.length) {

                    app.copyFiles.forEach(function (value, index) {
                        app.copyFiles[index] = [app.path, value].join('/');
                    });

                    copyBuildConfig[app.name] = {
                        expand: true,
                        src: app.copyFiles,
                        dest: [buildDestination, ''].join('/')
                    };
                }

                var taskSequence = ['copy:' + app.name];

                if (!app.noSencha) {
                    taskSequence.push('sencha-build:' + app.name,
                        'concat:' + app.name,
                        'uglify:' + app.name);
                }

                mainTaskSequence = mainTaskSequence.concat(taskSequence);
            });

            var appBuildConfig = {pkg: grunt.file.readJSON('package.json'),
                'sencha-build': senchaBuildConfig,
                'concat': concatBuildConfig,
                'uglify': uglifyBuildConfig,
                'copy': copyBuildConfig
            };

            grunt.initConfig(appBuildConfig);
            grunt.loadNpmTasks('grunt-contrib-concat');
            grunt.loadNpmTasks('grunt-contrib-uglify');
            grunt.loadNpmTasks('grunt-contrib-copy');

            grunt.task.run(mainTaskSequence);
        } else {
            grunt.fail.fatal('No application config provided');
        }
    });

};