'use strict';

const { MoleculerClientError } = require('moleculer').Errors;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DbMixin = require('../mixins/db.mixin');
const {DataTypes} = require('sequelize');
const {getPaginationOffsetAndLimit} = require('../utils/todo.utils');

module.exports = {
	name: 'users',
	mixins: [
		DbMixin({ collection: 'users' }),
	],

	model: {
		name: 'users',
		define: {
			id: {
				type: DataTypes.UUID,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
				allowNull: false
			},
			username: {
				type: DataTypes.STRING,
				allowNull: false
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false
			}
		},
		options: {
			defaultScope: {
				attributes: { exclude: ['password'] },
			},
		}
	},

	settings: {
		JWT_SECRET: 'secret',
	},

	actions: {
		add: {
			rest: 'POST /add',
			params: {
				user: { type: 'object' }
			},
			async handler(ctx) {
				let entity = ctx.params.user;
				await this.validateUserNotExist(entity.username);
				entity.password = bcrypt.hashSync(entity.password, 10);
				const createdUser = await this.insertUser(entity);
				delete createdUser.password; // remove hashed password from 'add' action request
				return {
					message: 'User is successfully created',
					user: createdUser
				};
			}
		},
		login: {
			rest: 'POST /users/login',
			params: {
				username: { type: 'string' },
				password: { type: 'string', min: 1 }
			},
			async handler(ctx) {
				await this.checkIfDatabaseIsEmpty();
				const entity = ctx.params;
				const user = await this.findUserByUsername({
					username: entity.username,
					withPassword: true
				});
				await this.verifyPassword(entity.password, user.password);
				const token = this.generateJWTToken(user);
				this.setTokenInCookie({ ctx, token });
				return { message: 'Successfully logged in' };
			}
		},
		logout: {
			rest: 'POST /users/logout',
			async handler(ctx) {
				this.resetTokenInCookie(ctx);
				return { message: 'Successfully logged out' };
			}
		},
		delete: {
			rest: 'DELETE /delete',
			params: {
				id: 'string'
			},
			async handler(ctx) {
				const { id: userId } = ctx.params;
				await this.deleteUserById(userId);
				return { message: 'User deleted successfully' };
			}
		},
		resolveToken: {
			params: {
				token: 'string'
			},
			async handler(ctx) {
				const decoded = await this.decodeJWTToken(ctx.params.token);
				return this.getById(decoded.id);
			}
		},
		list: {
			rest: 'GET /',
			params: {
				page: { type: 'number', min: 1, integer: true, optional: true, default: 1 },
				pageSize: { type: 'number', min: 1, integer: true, optional: true, default: 5 }
			},
			async handler({params}) {
				const { offset, limit } = getPaginationOffsetAndLimit({ page: params.page, pageSize: params.pageSize });


				const [result, total] = await Promise.all([
					this.adapter.find({ limit, offset }),
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
		getUser: {
			rest: 'POST /getUser',
			params: {
				username: 'string'
			},
			async handler(ctx) {
				return await this.findUserByUsername({
					username: ctx.params.username,
				});
			}
		},
	},

	methods: {
		async checkIfDatabaseIsEmpty() {
			const isUsersTableEmpty = await this.adapter.count() === 0;
			if (isUsersTableEmpty) {
				throw new MoleculerClientError('There are no users in users table. Please add a user to the database table manually or restart the moleculer project before trying to login in again', 403);
			}
		},
		async validateUserNotExist(username) {
			const foundUser = await this.adapter.findOne({ where: { username } });
			if (foundUser) {
				throw new MoleculerClientError('Username is exist!', 422);
			}
		},

		async insertUser(entity) {
			const { dataValues: createdUser } = await this.adapter.insert(entity);
			return createdUser;
		},
		async findUserByUsername({ username, withPassword }) {
			const user = await this.adapter.findOne({
				where: { username },
				attributes: {
					include: withPassword ? ['password'] : null
				}
			});
			if (!user) {
				throw new MoleculerClientError('User not found!', 422);
			}
			return user;
		},
		async deleteUserById(id) {
			const deleted = await this.adapter.removeById(id);
			if (!deleted) {
				throw new MoleculerClientError('User not found', 404);
			}
		},

		async verifyPassword(plain, hashed) {
			const res = await bcrypt.compare(plain, hashed);
			if (!res) {
				throw new MoleculerClientError('Wrong password!', 422);
			}
		},
		generateJWTToken(user) {
			const today = new Date();
			const exp = new Date(today);
			exp.setDate(today.getDate() + 60);

			return jwt.sign({
				id: user.id,
				username: user.username,
				exp: Math.floor(exp.getTime() / 1000)
			}, this.settings.JWT_SECRET);
		},
		async decodeJWTToken(token) {
			return new Promise((resolve, reject) => {
				jwt.verify(token, this.settings.JWT_SECRET, (err, decoded) => {
					if (err) return reject(err);
					resolve(decoded);
				});
			});
		},
		setTokenInCookie({ctx, token}) {
			ctx.meta.$responseHeaders = {
				'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}`
			};
		},
		resetTokenInCookie (ctx) {
			ctx.meta.$responseHeaders = {
				'Set-Cookie': 'token=; HttpOnly; Path=/; Max-Age=0'
			};
		},

		async addDefaultUser () {
			const defaultUser = { username: 'admin', password: 'admin' };
			defaultUser.password = bcrypt.hashSync(defaultUser.password, 10);
			await this.insertUser(defaultUser);
		}
	}
};
