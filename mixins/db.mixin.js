'use strict';

const fs = require('fs');
const DbService	= require('moleculer-db');
const SequelizeAdapter = require('moleculer-db-adapter-sequelize');
const { Pool } = require('pg');

module.exports = function({ collection }) {
	const cacheCleanEventName = `cache.clean.${collection}`;

	const schema = {
		mixins: [DbService],

		adapter: new SequelizeAdapter(
			'postgresql://postgres:1234@localhost:5432',
			{
				dialect: 'postgres',
				logging: false,
				define: {
					freezeTableName: true,
					timestamps: false
				}
			}
		),

		async started() {
			if (this.seedDB) {
				const count = await this.adapter.count();
				if (count === 0) {
					this.logger.info(`The '${collection}' collection is empty. Seeding the collection...`);
					await this.seedDB();
					this.logger.info('Seeding is done. Number of records:', await this.adapter.count());
				}
			}
		}
	};

	return schema;
};
