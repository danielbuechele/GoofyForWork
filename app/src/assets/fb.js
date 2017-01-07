const { ipcRenderer, shell } = require('electron');
const config = require('../config');
const latestMessages = new Map();

const NEW_MESSAGE = '._42ft._4jy0._3mv._4jy3._517h._51sy';
const UNREAD_COUNT = '._50q0 ._1r:not(.hidden_elem)';
const UNREAD_MESSAGES = '#wmMasterViewThreadlist ._kx';
const MESSAGE_PREVIEW = '._l3';
const MESSAGE_SENDER = '._l1';
const MESSAGE_SENDER_PICTURE = '._55lt img';
const SEND_ON_ENTER_DISABLED = '._1r_[aria-checked="false"]';
const SELECTED_CONVERSATION = '#wmMasterViewThreadlist ._kv';
const ACTIVATE_CONVERSATION = '._k_';

ipcRenderer.on(config.channels.NEW_CONVERSATION, () => {
	document.querySelector(NEW_MESSAGE).click();
});

ipcRenderer.on(config.channels.NEXT_CONVERSATION, () => {
	let nextConversation = document.querySelector(SELECTED_CONVERSATION).nextSibling;
	if (nextConversation) {
		nextConversation.querySelector(ACTIVATE_CONVERSATION).click();
	}
});

ipcRenderer.on(config.channels.PREV_CONVERSATION, () => {
	let nextConversation = document.querySelector(SELECTED_CONVERSATION).previousSibling;
	if (nextConversation) {
		nextConversation.querySelector(ACTIVATE_CONVERSATION).click();
	}
});

document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll(UNREAD_MESSAGES).forEach(unreadMessage => {
		latestMessages.set(unreadMessage.getAttribute('id'), unreadMessage.querySelector('._l3').textContent);
	});

	setInterval(() => {

		// dock count
		const unread = document.querySelector(UNREAD_COUNT);
		if (unread) {
			const unreadCount = parseInt(unread.textContent.replace(/[^0-9]/g,''));
			if (!isNaN(unreadCount)) {
				ipcRenderer.sendToHost(config.channels.DOCK_COUNT, unreadCount);
			} else {
				ipcRenderer.sendToHost(config.channels.DOCK_COUNT, 0);
			}
		} else {
			ipcRenderer.sendToHost(config.channels.DOCK_COUNT, 0);
		}

		// notifications
		document.querySelectorAll(UNREAD_MESSAGES).forEach(unreadMessage => {
			const id = unreadMessage.getAttribute('id');
			const message = unreadMessage.querySelector(MESSAGE_PREVIEW).textContent;
			const name = unreadMessage.querySelector(MESSAGE_SENDER).textContent;
			const image = unreadMessage.querySelector(MESSAGE_SENDER_PICTURE).getAttribute('src');
			if (latestMessages.get(id) !== message) {
				latestMessages.set(id, message);
				let notification = new Notification(name, { body: message, icon: image, data: id });
				notification.onclick = e => {
					document.querySelector(`[id="${e.target.data}"] ${ACTIVATE_CONVERSATION}`).click();
				};
			}
		});

		// open links in new window
		document.querySelectorAll('a[href^="http"], a[href^="/"]').forEach(n => {
			n.onclick = (e) => {
				let { target } = e;
				while (target && target.tagName !== 'A') {
					target = target.parentElement;
				}
				let href = target.getAttribute('href');
				if (href && href.startsWith(`${location.origin}/messages`)) {
					return;
				}
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

		// enable send on enter
		const sendOnEnter = document.querySelector(SEND_ON_ENTER_DISABLED);
		if (sendOnEnter) {
			sendOnEnter.click();
		}

	}, 1000);
});
