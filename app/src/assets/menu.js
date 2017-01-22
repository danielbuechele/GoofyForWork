const { ipcRenderer, shell } = require('electron');
const config = require('../config');

const NOTIFICATION_COUNT = '#notificationsCountValue';

setInterval(() => {
	document.querySelectorAll('a').forEach(n => {
		n.onclick = (e) => {
			let { target } = e;
			while (target && target.tagName !== 'A') {
				target = target.parentElement;
			}
			let href = target.getAttribute('href') || target.getAttribute('data-href');
			e.preventDefault();
			e.stopImmediatePropagation();
			e.stopPropagation();
			if (href && href.startsWith('/')) {
				href = location.protocol + '//' + location.hostname + href;
			}
			if (href) {
				shell.openExternal(href);
			}
		};
	});
}, 500);

document.addEventListener('DOMContentLoaded', () => {
	ipcRenderer.sendToHost(config.channels.NOTIFICATION_COUNT, parseInt(document.querySelector(NOTIFICATION_COUNT).textContent) || 0);

	document.querySelector(NOTIFICATION_COUNT).addEventListener('DOMSubtreeModified', e => {
		ipcRenderer.sendToHost(config.channels.NOTIFICATION_COUNT, parseInt(e.target.textContent) || 0);
	});
});
