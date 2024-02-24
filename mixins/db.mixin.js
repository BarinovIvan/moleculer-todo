'use strict';

const DbService	= require('moleculer-db');
const SequelizeAdapter = require('moleculer-db-adapter-sequelize');

module.exports = function({ collection }) {
	const seedMethods = new Map([
		['todos', 'seedTodosTable'],
		['users', 'addDefaultUser'],
	]);

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
			const count = await this.adapter.count();
			if (count === 0) {
				this.logger.info(`The '${collection}' collection is empty. Seeding the collection...`);
				const seedMethod = seedMethods.get(collection);
				if (seedMethod && typeof this[seedMethod] === 'function') {
					await this[seedMethod]();
					this.logger.info(`Seeding collection '${collection}' is done. Number of records: ${await this.adapter.count()}`);
				} else {
					this.logger.warn(`No seed method defined for the '${collection}' collection.`);
				}
			}
		}
	};

	return schema;
};
