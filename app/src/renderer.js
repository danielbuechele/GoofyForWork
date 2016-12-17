const { BrowserWindow, ipcRenderer, app } = require('electron').remote;
const css = require('./fb.css');
const remote = require('electron').remote;
const messagesURL = /\.facebook.com\/messages/;
let loginWindow;

onload = () => {
	const webview = document.getElementById('webview');
	const loading = document.getElementById('loading');

	webview.addEventListener('did-start-loading', () => {});

	webview.addEventListener('did-stop-loading', () => {
		if (messagesURL.test(webview.getURL())) {
			webview.className = '';
		}
	});

	webview.addEventListener('dom-ready', () => {
		webview.insertCSS(css);
		webview.openDevTools();
	});

	webview.addEventListener('ipc-message', (e) => {
		if (e.channel === 'dock-count') {
			app.setBadgeCount(e.args[0]);
		}
	});

	webview.addEventListener('did-get-redirect-request', ({oldURL, newURL, isMainFrame}) => {
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
					webview.loadURL('https://structerre.facebook.com/messages');
				}
			});
			webview.webContents.openDevTools();

		} else if (messagesURL.test(newURL) && loginWindow) {
			loginWindow.close();
		}
	});
};
