'use strict';

const { MoleculerClientError } = require('moleculer').Errors;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DbMixin = require('../mixins/db.mixin');
const {DataTypes} = require('sequelize');

module.exports = {
	name: 'users',
	mixins: [
		DbMixin('users'),
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
				if (entity.username) {
					const foundUser = await this.adapter.findOne({ where: { username: entity.username } });
					if (foundUser) {
						throw new MoleculerClientError('Username is exist!', 422);
					}
				}

				entity.password = bcrypt.hashSync(entity.password, 10);

				const { dataValues: createdUser } = await this.adapter.insert(entity);

				const token = this.generateJWT(createdUser);
				ctx.meta.$responseHeaders = {
					'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}`
				};
				return { message: 'Successful registered'};
			}
		},
		login: {
			rest: 'POST /users/login',
			params: {
				username: { type: 'string' },
				password: { type: 'string', min: 1 }
			},
			async handler(ctx) {
				const entity = ctx.params;
				const user = await this.adapter.findOne({ where: { username: entity.username } });
				if (!user) {
					throw new MoleculerClientError('Email or password is invalid!', 422);
				}

				const res = await bcrypt.compare(entity.password, user.password);
				if (!res) {
					throw new MoleculerClientError('Wrong password!', 422);
				}

				const token = this.generateJWT(user);
				ctx.meta.$responseHeaders = {
					'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}`
				};

				return { message: 'Successful login'};
			}
		},
		logout: {
			rest: 'POST /users/logout',
			async handler(ctx) {
				ctx.meta.$responseHeaders = {
					'Set-Cookie': 'token=; HttpOnly; Path=/; Max-Age=0'
				};
				return { message: 'Successfully logged out' };
			}
		},

		get: {
			rest: 'GET /:id'
		},
		delete: {
			rest: 'DELETE /delete',
			params: {
				id: 'string'
			},
			async handler(ctx) {
				const {id} = ctx.params;
				const deleted = await this.adapter.removeById(id);
				if (!deleted) {
					throw new MoleculerClientError('User not found', 404);
				}
				return { message: 'User deleted successfully' };
			}
		},
		resolveToken: {
			params: {
				token: 'string'
			},
			async handler(ctx) {
				const decoded = await new this.Promise((resolve, reject) => {
					jwt.verify(ctx.params.token, this.settings.JWT_SECRET, (err, decoded) => {
						if (err)
							return reject(err);

						resolve(decoded);
					});
				});

				if (decoded.id)
					return this.getById(decoded.id);
			}
		},
	},

	methods: {
		generateJWT(user) {
			const today = new Date();
			const exp = new Date(today);
			exp.setDate(today.getDate() + 60);

			return jwt.sign({
				id: user.id,
				username: user.username,
				exp: Math.floor(exp.getTime() / 1000)
			}, this.settings.JWT_SECRET);
		},
		parseCookies(cookieHeader) {
			const list = {};
			cookieHeader && cookieHeader.split(';').forEach((cookie) => {
				const parts = cookie.split('=');
				list[parts.shift().trim()] = decodeURI(parts.join('='));
			});
			return list;
		}
	}
};
