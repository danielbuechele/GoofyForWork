var fs = require('fs');

fs.writeFileSync('app/src/config/env.json', JSON.stringify({
	name: process.env.NODE_ENV || 'development',
	appName: process.env.APP_NAME || 'Goofy for Work',
	product: process.env.PRODUCT || 'workplace', // 'workplace' or 'www'
	updateURL: process.env.UPDATE_URL || 'https://goofy-nuts.herokuapp.com/update',
}));
