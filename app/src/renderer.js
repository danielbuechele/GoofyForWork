const { BrowserWindow, app } = require('electron').remote;
const remote = require('electron').remote;
const { Menu, autoUpdater, dialog } = remote;
const config = require('./config');
const defaultMenu = require('electron-default-menu');
const fs = require('fs');
const css = fs.readFileSync(__dirname + '/assets/fb.css', 'utf-8');
const env = require('./config/env.js');
const messagesURL = /\.facebook.com\/messages/;
let loginWindow;

onload = () => {
	const webview = document.getElementById('webview');
	const setup = document.getElementById('setup');
	let domain = localStorage.getItem('domain');

	const menu = defaultMenu(app);

	menu.splice(menu.findIndex(item => item.label==='Edit'), 0, {
		label: 'File',
		submenu: [{
			label: 'New Conversation',
			accelerator: 'CmdOrCtrl+N',
			click() {
				webview.send(config.channels.NEW_CONVERSATION);
			},
		}],
	});

	menu[menu.findIndex(item => item.label==='Window')].submenu.push(
		{
			label: 'Select Next Conversation',
			accelerator: 'CmdOrCtrl+]',
			click() {
				webview.send(config.channels.NEXT_CONVERSATION);
			},
		},
		{
			label: 'Select Previous Conversation',
			accelerator: 'CmdOrCtrl+[',
			click() {
				webview.send(config.channels.PREV_CONVERSATION);
			},
		}
	);

	if (domain) {
		menu[1].submenu.push(
			{
				type: 'separator',
			},
			{
				label: `Logout from "${domain}"`,
				click() {
					localStorage.removeItem('domain');
					app.exit();
				},
			}
		);
		document.getElementById('webview').setAttribute('src', config.fbDomain(domain));
	} else {
		setup.className = 'active';
		setup.onsubmit = () => {
			let domain = setup.querySelector('input').value.trim();
			localStorage.setItem('domain', domain);
			document.getElementById('webview').setAttribute('src', config.fbDomain(domain));
		};
	}

	if (env.name === 'production') {
		menu[0].submenu.splice(1, 0, {
			label: 'Check for Update',
			click() {
				autoUpdater.on('update-not-available', () => {
					autoUpdater.removeAllListeners('update-not-available');
					dialog.showMessageBox({
						message: 'No update available',
						detail: `Goofy for Work ${app.getVersion()} is the latest version available.`,
						buttons: ['OK'],
					});
				});
				autoUpdater.checkForUpdates();
			},
		});
	}

	Menu.setApplicationMenu(Menu.buildFromTemplate(menu));

	webview.addEventListener('did-stop-loading', () => {
		if (messagesURL.test(webview.getURL())) {
			webview.className = '';
		}
	});

	webview.addEventListener('dom-ready', () => {
		webview.insertCSS(css);
		if (env.name === 'development') {
			webview.openDevTools();
		}
	});

	webview.addEventListener('ipc-message', (e) => {
		if (e.channel === 'dock-count') {
			app.setBadgeCount(e.args[0]);
		}
	});

	webview.addEventListener('did-get-redirect-request', ({ oldURL, newURL }) => {
		if (messagesURL.test(oldURL) && /\.facebook\.com\/work\/login/.test(newURL)) {
			loginWindow = new BrowserWindow({
				parent: remote.getCurrentWindow(),
				show: false,
				minimizable: false,
				maximizable: false,
				webPreferences: {
					nodeIntegration: false,
				},
			});
			loginWindow.loadURL(oldURL);
			loginWindow.once('ready-to-show', () => {
				loginWindow.show();
			});
			loginWindow.webContents.on('will-navigate', (e, url) => {
				if (messagesURL.test(url)) {
					loginWindow.close();
					webview.loadURL(config.fbDomain(domain));
				}
			});
			webview.webContents.openDevTools();

		} else if (messagesURL.test(newURL) && loginWindow) {
			loginWindow.close();
		}
	});
};
