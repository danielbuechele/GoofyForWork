module.exports = {
	channels: {
		DOCK_COUNT: 'dock-count',
		NEW_CONVERSATION: 'new-conversation',
		NEXT_CONVERSATION: 'next-conversation',
		PREV_CONVERSATION: 'prev-conversation',
	},
	fbDomain: (domain = localStorage.getItem('domain')) => domain === 'www' ? 'https://www.facebook.com/messages' : `https://${domain}.facebook.com/chat`,
	updateURL: (platform, version) => `https://goofy-nuts.herokuapp.com/update/${platform}/${version}`,
};
