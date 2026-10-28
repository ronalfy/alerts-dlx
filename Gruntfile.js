module.exports = function( grunt ) {
	grunt.initConfig( {
		compress: {
			main: {
				options: {
					archive: 'alerts-dlx.zip',
				},
				files: [
					{ src: [ 'alerts-dlx.php' ], dest: '/', filter: 'isFile' },
					{ src: [ 'readme.txt' ], dest: '/', filter: 'isFile' },
					{ src: [ 'php/**' ], dest: '/' },
					{ src: [ 'lib/**' ], dest: '/' },
					{ src: [ 'dist/**' ], dest: '/' },
					{ src: [ 'build/**' ], dest: '/' },
					{ src: [ 'assets/**' ], dest: '/' },
				],
			},
		},
	} );

	grunt.registerTask( 'composer_guard', 'Add ABSPATH guards to Composer-generated files.', function() {
		const done = this.async();
		const { exec } = require( 'child_process' );
		exec( 'php bin/add-composer-guards.php', { cwd: process.cwd() }, function( error, stdout, stderr ) {
			if ( error ) {
				grunt.log.error( error );
				if ( stderr ) {
					grunt.log.error( stderr );
				}
				done( false );
				return;
			}
			grunt.log.write( stdout );
			done();
		} );
	} );

	grunt.registerTask( 'default', [ 'composer_guard', 'compress' ] );

	grunt.loadNpmTasks( 'grunt-contrib-compress' );
};
