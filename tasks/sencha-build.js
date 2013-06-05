/*
 * grunt-contrib-concat
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
    grunt.registerMultiTask('sencha-build', 'Integrate with phantomjs.', function () {

        var phantomjs = require('grunt-lib-phantomjs').init(grunt);
        var errorCount = 0;

        // Built-in error handlers.
        phantomjs.on('fail.load', function (url) {
            phantomjs.halt();
            grunt.verbose.write('Running PhantomJS...').or.write('...');
            grunt.log.error();
            grunt.warn('PhantomJS unable to load "' + url + '" URI.');
        });

        phantomjs.on('fail.timeout', function () {
            phantomjs.halt();
            grunt.log.writeln();
            grunt.warn('PhantomJS timed out.');
        });

        phantomjs.on('error.onError', function () {
            phantomjs.halt();
            grunt.warn('PhantomJS crashed.');

        });

        phantomjs.on('done', function (data) {
            phantomjs.halt();
        });

        // This task is async.
        var done = this.async();

        var path = require('path'),
            asset = path.join.bind(null, __dirname, '..');

        var options = this.options({
            timeout: 300000,
            projectRoot: '',
            phantomScript: 'tasks/phantomjs/main.js'
        });

        console.log("Building", options.projectRoot);

        phantomjs.on('build-ready', function (dependencies) {
            dependencies.forEach(function (element, index) {
                dependencies[index] = options.projectRoot + '/' + element;
            });

            grunt.config.set('dependencies_files', dependencies);

            phantomjs.halt();
        });

        // Spawn phantomjs
        phantomjs.spawn(options.projectRoot + '/index.html', {
                // Additional PhantomJS options.
                options: options,
                // Complete the task when done.
                done: function (err) {
                    done(err || errorCount === 0);
                }
            }
        )
        ;

    });

};
