const DbMixin = require('../mixins/db.mixin');
const { DataTypes } = require('sequelize');

module.exports = {
	name: 'todos',
	mixins: [DbMixin({ collection: 'todos'})],

	model: {
		name: 'todos',
		define: {
			id: {
				type: DataTypes.UUID,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
				allowNull: false
			},
			title: {
				type: DataTypes.STRING,
				allowNull: false
			},
			completed: {
				type: DataTypes.BOOLEAN,
				defaultValue: false
			},
			date: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW
			}
		},
		options: {
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
		find: {
			rest: 'POST /find',
			params: {
				id: 'string'
			},
			async handler({ params }) {
				return await this.adapter.findById(params.id);
			}
		},
		edit: {
			rest: 'POST /edit',
			params: {
				id: 'string',
				title: {type: 'string', optional: true},
				completed: { type: 'boolean', optional: true },
			},
			async handler({ params }) {
				return await this.adapter.updateById(params.id, { $set: { ...params } });
			}
		},
		remove: {
			rest: 'POST /remove',
			params: {
				id: 'string'
			},
			async handler({ params }) {
				return await this.adapter.removeById(params.id);
			}
		},
		add: {
			rest: 'POST /add',
			params: {
				title: 'string|min:3',
				completed: { type: 'boolean', optional: true },
			},
			async handler({ params }) {
				params.completed = params.completed || false;
				return await this.adapter.insert({...params});
			}
		},
		check: {
			rest: 'POST /check',
			params: {
				id: 'string'
			},
			async handler({params}) {
				return await this.adapter.updateById(params.id, { $set: { completed: true } });
			}
		},
		uncheck: {
			rest: 'POST /uncheck',
			params: {
				id: 'string'
			},
			async handler({params}) {
				return await this.adapter.updateById(params.id, { $set: { completed: false } });
			}
		}
	},
	methods: {
		async seedDB() {
			await this.adapter.insertMany([
				{ title: 'Купить молоко' },
				{ title: 'Зайти в парикмахерскую' },
				{ title: 'Написать по поводу заказа' },
			]);
		}
	},
};
