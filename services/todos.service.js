const DbMixin = require('../mixins/db.mixin');
const { getCurrentFormattedDate } = require('../utils/todo.utils');


module.exports = {
	name: 'todos',
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
				ctx.params.completed = ctx.params.completed || false;
				ctx.params.date = getCurrentFormattedDate();
			}
		}
	},



	actions: {
		add: {
			rest: 'POST /add',
			params: {
				title: 'string|min:3',
				completed: { type: 'boolean', optional: true },
			},
			async handler(ctx) {
				ctx.params.completed = ctx.params.completed || false;
				ctx.params.date = getCurrentFormattedDate();
				const result = await this.adapter.insert(ctx.params);
				return result;
			}
		},
		list: {
			rest: 'GET /',
			params: {
				page: { type: 'number', min: 1, integer: true, optional: true, default: 1 },
				pageSize: { type: 'number', min: 1, integer: true, optional: true, default: 5 }
			},
			async handler({params}) {
				const offset = (params.page - 1) * params.pageSize;
				const limit = params.pageSize;

				const [result, total] = await Promise.all([
					this.adapter.find({ limit, offset, sort: ['date'] }),
					this.adapter.count()
				]);

				return {
					data: result,
					pagination: {
						currentPage: params.page,
						pageSize: params.pageSize,
						totalPages: Math.ceil(total / params.pageSize),
						total: total
					}
				};
			}
		},
		check: {
			rest: 'POST /check',
			params: {
				id: 'string'
			},
			async handler({params}) {
				return await this.adapter.updateById(params.id, {
					$set: {
						completed: true
					}
				});
			}
		},
		uncheck: {
			rest: 'POST /uncheck',
			params: {
				id: 'string'
			},
			async handler({params}) {
				console.log(await this.adapter.findById(params.id));
				return await this.adapter.updateById(params.id, {
					$set: {
						completed: false
					}
				});
			}
		}
	},
	methods: {
		async seedDB() {
			await this.adapter.insertMany([
				{ title: 'Купить молоко', completed: false },
				{ title: 'Зайти в парикмахерскую', completed: false },
				{ title: 'Написать по поводу заказа', completed: false },
			]);
		}
	},
};
