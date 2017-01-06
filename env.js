var fs = require('fs');

fs.createReadStream(`app/src/config/env_${process.env.NODE_ENV === 'production' ? 'production' : 'development'}.json`).pipe(fs.createWriteStream('app/src/config/env.json'));
