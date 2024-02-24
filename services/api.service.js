'use strict';

const ApiGateway = require('moleculer-web');

module.exports = {
	name: 'api',
	mixins: [ApiGateway],
	settings: {
		port: process.env.PORT || 3000,
		ip: '0.0.0.0',
		routes: [
			{
				path: '/api',
				whitelist: [
					'**'
				],
				aliases: {
					'GET /users': 'users.list',
					'POST /users/login': 'users.login',
					'POST /users/logout': 'users.logout',
					'DELETE /users/delete': 'users.delete',
					'POST /users/add': 'users.add',
					'POST /users/getUser': 'users.getUser',

					'GET /todos': 'todos.list',
					'POST /todos/add': 'todos.add',
					'POST /todos/check': 'todos.check',
					'POST /todos/uncheck': 'todos.uncheck',
					'POST /todos/find': 'todos.find',
					'POST /todos/edit': 'todos.edit',
					'POST /todos/remove': 'todos.remove',
				},
				mergeParams: true,
				authentication: true,
				authorization: false,
				bodyParsers: {
					json: {
						strict: false,
						limit: '1MB'
					},
					urlencoded: {
						extended: true,
						limit: '1MB'
					}
				},
				mappingPolicy: 'all',
				logging: true
			},
		],
		log4XXResponses: false,
		logRequestParams: null,
		logResponseData: null,
		assets: {
			folder: 'public',
			options: {}
		}
	},

	methods: {
		async authenticate(ctx, route, req) {
			if (req.url === '/users/login') {
				return;
			}

			const token = this.getTokenFromCookie(req.headers.cookie);
			const user = await ctx.call('users.resolveToken', { token });
			if (user) {
				ctx.meta.user = user;
				return user;
			} else {
				throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_INVALID_TOKEN);
			}
		},
		getTokenFromCookie (cookiesHeader) {
			if (!cookiesHeader) {
				throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_NO_TOKEN);
			}

			let token;
			const cookies = cookiesHeader.split(';').map(cookie => cookie.trim());
			const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
			if (tokenCookie) {
				token = tokenCookie.split('=')[1];
			} else {
				throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_NO_TOKEN);
			}

			return token;
		}
	}
};
