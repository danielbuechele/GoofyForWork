const electron = require('electron');
const path = require('path');
const os = require('os');

module.exports = {
	channels: {
		DOCK_COUNT: 'dock-count',
		NEW_CONVERSATION: 'new-conversation',
		NEXT_CONVERSATION: 'next-conversation',
		PREV_CONVERSATION: 'prev-conversation',
		NOTIFICATION_COUNT: 'notification-count',
	},
	fbDomain: (domain = localStorage.getItem('domain')) => domain === 'www' ? 'https://www.facebook.com/messages' : `https://${domain}.facebook.com/chat`,
	updateURL: (platform, version) => `https://goofy-nuts.herokuapp.com/update/${platform}/${version}`,
	getMenuBarIconPath: (focus, unread) => {
		let mode = 'dark';
		const sysPrefs = electron.systemPreferences || electron.remote.systemPreferences;
		if (os.platform() === 'darwin' && !sysPrefs.isDarkMode() && !focus) {
			mode = 'light';
		}
		return path.join(__dirname, '..', 'assets', `menu-workplace-${mode}-${unread ? 'unread' : 'read'}.png`);
	},
};
