const { ipcRenderer, shell } = require('electron');
const config = require('../config');
const latestMessages = new Map();

const NEW_MESSAGE_BUTTON = '._1enh ._36ic ._30yy._2oc8';
const UNREAD_MESSAGE_COUNT = '#mercurymessagesCountValue';
const MESSAGE_LIST = '._4u-c._9hq ul[role=grid]';
const MESSAGE_PREVIEW = '._1htf span';
const MESSAGE_PREVIEW_EM = '_4qba';
const MESSAGE_ID = '._5l-3._1ht5';
const MESSAGE_SENDER = '._1ht6';
const MESSAGE_SENDER_PICTURE = '._55lt img';
const EMOJI = '_1ift';
const MUTED = '_569x';
const SELECTED_CONVERSATION = '._1ht2';
const ACTIVATE_CONVERSATION = 'a._1ht5';

ipcRenderer.on(config.channels.NEW_CONVERSATION, () => {
	document.querySelector(NEW_MESSAGE_BUTTON).click();
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
	// dock count
	document.querySelector(UNREAD_MESSAGE_COUNT).addEventListener('DOMSubtreeModified', e => {
		ipcRenderer.sendToHost(config.channels.DOCK_COUNT, parseInt(e.target.textContent) || 0);
	});
});


let waitForMessageListToLoad = () => {
	if (document.querySelector(MESSAGE_LIST)) {
		watchMessageList();
	} else {
		setTimeout(waitForMessageListToLoad, 100);
	}
};
waitForMessageListToLoad();

let watchMessageList = () => {
	// init latestMessages
	document.querySelector(MESSAGE_LIST).childNodes.forEach(message => {
		latestMessages.set(message.querySelector(MESSAGE_ID).getAttribute('id'), messageWithEmojis(message.querySelector(MESSAGE_PREVIEW)));
	});

	document.querySelector(MESSAGE_LIST).addEventListener('DOMSubtreeModified', () => {
		document.querySelector(MESSAGE_LIST).childNodes.forEach(message => {
			const id = message.querySelector(MESSAGE_ID).getAttribute('id');
			const messageBody = messageWithEmojis(message.querySelector(MESSAGE_PREVIEW));
			if (latestMessages.get(id) !== messageBody) {
				const name = message.querySelector(MESSAGE_SENDER).textContent;
				const image = message.querySelector(MESSAGE_SENDER_PICTURE).getAttribute('src');

				// check if it's a message from myself
				const parent = message.querySelector(MESSAGE_PREVIEW).parentElement;
				const isMessageFromSelf = parent.classList.contains(MESSAGE_PREVIEW_EM) && parent.hasAttribute('data-intl-translation') && parent.getAttribute('data-intl-translation') !== '{conversation_snippet}';

				const muted = message.classList.contains(MUTED);

				if (!isMessageFromSelf && !muted) {
					let notification = new Notification(name, { body: messageBody, icon: image, data: id, silent: true });
					notification.onclick = e => {
						document.querySelector(`[id="${e.target.data}"] ${ACTIVATE_CONVERSATION}`).click();
					};
				}

				latestMessages.set(id, messageBody);
			}
		});
	});
};

function messageWithEmojis(node) {
	let message = '';
	node.childNodes.forEach(n => {
		if (n.nodeType === 3) {
			message += n.textContent;
		} else if (n.nodeName === 'IMG' && n.classList.contains(EMOJI)) {
			const alt = n.getAttribute('alt');
			message += alt;
		} else if (n.nodeName === 'EM' && n.querySelector('[alt="󰀀"]')) {
			// facebook thumb up
			message += '👍';
		}
	});
	return message;
}


// open links in new window
setInterval(() => {
	document.querySelectorAll('a').forEach(n => {
		n.onclick = (e) => {
			let { target } = e;
			while (target && target.tagName !== 'A') {
				target = target.parentElement;
			}
			let href = target.getAttribute('href') || target.getAttribute('data-href');
			const path = location.pathname.split('/');
			if (
				!href || href === '#' || // buttons
				href === '/new' || // new button
				href && path.length > 1 && href.startsWith(`${location.origin}/${path[1]}`) || // links to other conversations
				href && href.contains('.fbcdn.net/') // inline images in conversations
			) {
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
}, 500);
