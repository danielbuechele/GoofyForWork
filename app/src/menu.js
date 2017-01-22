const fs = require('fs');
const css = fs.readFileSync(__dirname + '/assets/menu.css', 'utf-8');
const config = require('./config');
const env = require('./config/env.js');
const remote = require('electron').remote;

onload = () => {
	const webview = document.getElementById('webview');
	let domain = localStorage.getItem('domain');
	if (domain) {
		document.getElementById('webview').setAttribute('src', `https://${domain}.facebook.com`);
		webview.addEventListener('dom-ready', () => {
			webview.insertCSS(css);
			if (env.name === 'development') {
				webview.openDevTools();
			}
		});

		webview.addEventListener('ipc-message', (e) => {
			if (e.channel === config.channels.NOTIFICATION_COUNT) {
				const unread = parseInt(e.args[0]);
				remote.getGlobal('sharedObject').unread = unread;
				remote.getGlobal('sharedObject').mb.tray.setImage(config.getMenuBarIconPath(false, unread));
			}
		});
	}
};
