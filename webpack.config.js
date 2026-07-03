const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const RemoveEmptyScriptsPlugin = require( 'webpack-remove-empty-scripts' );
const DependencyExtractionWebpackPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const path = require( 'path' );
module.exports = ( env ) => {
	return [
		{
			...defaultConfig,
			module: {
				...defaultConfig.module,
				rules: [ ...defaultConfig.module.rules ],
			},
			mode: env.mode,
			devtool: 'source-map',
		},
		{
			entry: {
				'alerts-dlx-common': { import: './src/scss/common.scss' },
				'alerts-dlx-block-editor': './src/scss/block-editor.scss',
				'alerts-dlx-gfont-roboto': { import: './src/scss/fonts/roboto.scss' },
				'alerts-dlx-gfont-lato': { import: './src/scss/fonts/lato.scss' },
				'alerts-dlx-bootstrap-styles': './src/scss/bootstrap/styles.scss',
				'alerts-dlx-chakra-styles': './src/scss/chakra/styles.scss',
				'alerts-dlx-material-styles': './src/scss/material/styles.scss',
				'alerts-dlx-shoelace-styles': './src/scss/shoelace/styles.scss',
				'alerts-dlx-dismiss': './src/js/dismiss/index.js',
				'alerts-dlx-admin-style': './src/admin.scss',
				'alerts-dlx-admin-settings': './src/react/Settings/index.js',
			},
			resolve: {
				alias: {
					react: path.resolve( 'node_modules/react' ),
					'react-dom': path.resolve( 'node_modules/react-dom' ),
					'@wordpress/i18n': path.resolve( 'node_modules/@wordpress/i18n' ),
					'@wordpress/element': path.resolve( 'node_modules/@wordpress/element' ),
					'@wordpress/components': path.resolve( 'node_modules/@wordpress/components' ),
				},
			},
			mode: env.mode,
			devtool: env.mode === 'development' ? 'source-map' : false,
			output: {
				filename: '[name].js',
				sourceMapFilename: '[file].map[query]',
				assetModuleFilename: 'fonts/[name][ext]',
				clean: true,
			},
			module: {
				rules: [
					{
						test: /\.(js|jsx)$/,
						exclude: /(node_modules|bower_components)/,
						loader: 'babel-loader',
						options: {
							presets: [ '@babel/preset-env', '@babel/preset-react' ],
							plugins: [
								'@babel/plugin-proposal-class-properties',
								'@babel/plugin-transform-arrow-functions',
								[
									'@babel/plugin-proposal-optional-chaining-assign',
									{
										version: '2023-07',
									},
								],
							],
						},
					},
					{
						test: /\.scss$/,
						exclude: /(node_modules|bower_components)/,
						use: [
							{
								loader: MiniCssExtractPlugin.loader,
							},
							{
								loader: 'css-loader',
								options: {
									sourceMap: true,
								},
							},
							{
								loader: 'resolve-url-loader',
							},
							{
								loader: 'sass-loader',
								options: {
									sourceMap: true,
								},
							},
						],
					},
					{
						test: /\.css$/,
						use: [
							{
								loader: MiniCssExtractPlugin.loader,
							},
							{
								loader: 'css-loader',
								options: {
									sourceMap: true,
								},
							},
							'sass-loader',
						],
					},
					{
						test: /\.(woff2?|ttf|otf|eot|svg)$/,
						include: [ path.resolve( __dirname, 'fonts' ) ],
						exclude: /(node_modules|bower_components)/,
						type: 'asset/resource',
					},
				],
			},
			plugins: [
				new RemoveEmptyScriptsPlugin(),
				new MiniCssExtractPlugin(),
				new DependencyExtractionWebpackPlugin( {
					requestToExternal( request ) {
						if ( 'react-dom/client' === request ) {
							return [ 'ReactDOM', 'client' ];
						}
					},
					requestToHandle( request ) {
						if ( 'react-dom/client' === request ) {
							return 'react-dom';
						}
					},
				} ),
			],
		},
	];
};
