module.exports = {
	'rules': {
		'indent': [
			2,
			'tab'
		],
		'quotes': [
			2,
			'single'
		],
		'linebreak-style': [
			2,
			'unix'
		],
		'semi': [
			2,
			'always'
		]
	},
	'env': {
		'es6': true,
		'commonjs': true,
		'browser': true,
		'greasemonkey': true
	},
	"parserOptions": {
		'ecmaVersion': 6,
		'sourceType': 'module'
	},
	'extends': 'eslint:recommended'
};
