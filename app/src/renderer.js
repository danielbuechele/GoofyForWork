const { BrowserWindow, app } = require('electron').remote;
const remote = require('electron').remote;
const { Menu, autoUpdater, dialog } = remote;
const config = require('./config');
const defaultMenu = require('electron-default-menu');
const fs = require('fs');
const css = fs.readFileSync(__dirname + '/assets/fb.css', 'utf-8');
const env = require('./config/env.js');
const Config = require('electron-config');
const userConfig = new Config();
let loginWindow;

onload = () => {
	const webview = document.getElementById('webview');
	const setup = document.getElementById('setup');
	let domain = userConfig.get('domain');

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
		},
		{
			type: 'separator',
		},
		{
			label: 'Show notifications in menu bar',
			type: 'checkbox',
			checked: userConfig.get('menubar'),
			click() {
				userConfig.set('menubar', !userConfig.get('menubar'));
				remote.app.relaunch();
				remote.app.exit(0);
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
					const c = webview.getWebContents().session.cookies;
					c.get({}, (error, cookies) => {
						for (var i = cookies.length - 1; i >= 0; i--) {
							const { name, domain, path, secure } = cookies[i];
							const url = 'http' + (secure ? 's' : '') + '://' + domain + path;
							c.remove(url, name, () => {});
						}
					});
					userConfig.delete('domain');
					app.relaunch();
				},
			}
		);
		document.getElementById('webview').setAttribute('src', config.fbDomain(domain));
	} else {
		setup.className = 'active';
		setup.onsubmit = () => {
			let domain = setup.querySelector('input').value.trim();
			userConfig.set('domain', domain);
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
		if (webview.getURL().startsWith(config.fbDomain())) {
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
		if (e.channel === config.channels.DOCK_COUNT) {
			app.setBadgeCount(e.args[0]);
		}
	});

	webview.addEventListener('did-get-redirect-request', ({ oldURL, newURL }) => {
		if (oldURL.startsWith(config.fbDomain()) && /\.facebook\.com\/work\/login/.test(newURL)) {
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
				if (url.startsWith(config.fbDomain())) {
					loginWindow.close();
					webview.loadURL(config.fbDomain(domain));
				}
			});

		} else if (newURL.startsWith(config.fbDomain()) && loginWindow) {
			loginWindow.close();
		}
	});
};
