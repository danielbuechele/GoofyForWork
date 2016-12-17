const { ipcRenderer, shell } = require('electron');
const latestMessages = new Map();

document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('#wmMasterViewThreadlist ._kx').forEach(unreadMessage => {
		latestMessages.set(unreadMessage.getAttribute('id'), unreadMessage.querySelector('._l3').textContent);
	});

	setInterval(() => {
		// dock count
		const unread = document.querySelector('._50q0 ._1r:not(.hidden_elem)');
		if (unread) {
			const unreadCount = parseInt(unread.textContent.replace(/[^0-9]/g,''));
			if (!isNaN(unreadCount)) {
				ipcRenderer.sendToHost('dock-count', unreadCount);
			} else {
				ipcRenderer.sendToHost('dock-count', 0);
			}
		} else {
			ipcRenderer.sendToHost('dock-count', 0);
		}

		// notifications
		document.querySelectorAll('#wmMasterViewThreadlist ._kx').forEach(unreadMessage => {
			const id = unreadMessage.getAttribute('id');
			const message = unreadMessage.querySelector('._l3').textContent;
			const name = unreadMessage.querySelector('._l1').textContent;
			const image = unreadMessage.querySelector('._55lt img').getAttribute('src');
			if (latestMessages.get(id) !== message) {
				latestMessages.set(id, message);
				let notification = new Notification(name, { body: message, icon: image, data: id });
				notification.onclick = e => {
					document.querySelector(`[id="${e.target.data}"] ._k_`).click();
				};
			}
		});

		document.querySelectorAll('a[href^="http"], a[href^="/"]').forEach(n => {
			n.onclick = (e) => {
				e.preventDefault();
				e.stopImmediatePropagation();
				e.stopPropagation();
				let href = e.target.getAttribute('href');
				if (href.startsWith('/')) {
					href = location.protocol + '//' + location.hostname + href;
				}
				shell.openExternal(href);
			};
		});

	}, 1000);
});
