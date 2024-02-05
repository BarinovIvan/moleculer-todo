const DbMixin = require('../mixins/db.mixin');


module.exports = {
	name: 'todo',
	mixins: [DbMixin('todos')],

	/**
	 * Settings
	 */
	settings: {
		fields: ['_id', 'title', 'completed', 'date'],
		entityValidator: {
			title: 'string|min:3',
			completed: 'boolean'
		}
	},
	hooks: {
		before: {
			create(ctx) {
				ctx.params.completed = false;
			}
		}
	},


	actions: {
		// list: {
		// 	handler(ctx) {
		// 		console.log('todo.list');
		// 		// return ctx.call("todo.find").then(console.log);
		// 	},
		// },
		// get: {
		// 	handler(ctx) {
		// 		console.log('todo.get');
		// 		// return ctx.call("todo.get", { id: 2 } ).then(console.log);
		//
		// 	},
		// },
		// create: {
		// 	handler(ctx) {
		// 		console.log('todo.create');
		// 		return this.adapter.create({ id: 10, title: 'Hey', completed: false }).then(console.log);
		// 	},
		// },
		// update: {
		// 	handler(ctx) {
		// 		console.log('todo.update');
		// 		// return ctx.call("todo.update", { id: 2, title: "CHANGED VIA UPDATE METHODS"} ).then(console.log);
		//
		// 	},
		// },
		// remove: {
		// 	handler(ctx) {
		// 		console.log('todo.remove');
		// 		// return ctx.call("todo.remove", { id: 2} ).then(console.log);
		// 	},
		// },
		// TODO: add pagination
		// listWithPagination: {
		// 	handler(ctx) {
		// 		const result = this.actions.list(ctx);
		// 		console.log('result :', result);
		// 		console.log({
		// 			data: result.rows,
		// 			pagination: {
		// 				currentPage: result.page,
		// 				perPage: result.pageSize,
		// 				totalPages: result.totalPages,
		// 				totalEntries: result.total
		// 			}
		// 		});
		// 		return {
		// 			data: result.rows,
		// 			pagination: {
		// 				currentPage: result.page,
		// 				perPage: result.pageSize,
		// 				totalPages: result.totalPages,
		// 				totalEntries: result.total
		// 			}
		// 		};
		// 	}
		// },
	},
	methods: {
		async seedDB() {
			await this.adapter.insertMany([
				{ title: 'Купить молоко', completed: false, date: 2020 },
				{ title: 'Зайти в парикмахерскую', completed: false, date: 2020 },
				{ title: 'Написать по поводу заказа', completed: false, date: 2020 },
			]);
		}
	},
};
