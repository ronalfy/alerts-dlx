module.exports = function( api ) {
	api.cache.never();
	return {
		plugins: [
			'macros',
			'@babel/plugin-proposal-class-properties',
			'@babel/plugin-transform-arrow-functions',
			[
				'@babel/plugin-proposal-optional-chaining-assign',
				{
					version: '2023-07',
				},
			],
		],
		presets: [ '@babel/preset-env', '@babel/preset-react' ],
	};
};
