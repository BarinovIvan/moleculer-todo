function getPaginationOffsetAndLimit({ page, pageSize }) {
	const offset = (page - 1) * pageSize;
	const limit = pageSize;

	return { offset, limit };
}

module.exports = { getPaginationOffsetAndLimit };
