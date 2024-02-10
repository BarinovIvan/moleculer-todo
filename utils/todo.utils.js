function getCurrentFormattedDate(params) {
	return  new Date().toISOString().split('T')[0];
}

module.exports = { getCurrentFormattedDate };
