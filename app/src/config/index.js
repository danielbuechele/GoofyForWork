module.exports = {
	channels: {
		DOCK_COUNT: 'dock-count',
		NEW_CONVERSATION: 'new-conversation',
		NEXT_CONVERSATION: 'next-conversation',
		PREV_CONVERSATION: 'prev-conversation',
	},
	fbDomain: domain => `https://${domain}.facebook.com/messages`,
	updateURL: (platform, version) => `https://goofy-nuts.herokuapp.com/update/${platform}/${version}`,
};
