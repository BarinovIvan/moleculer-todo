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
				mergeParams: true,
				authentication: true,
				authorization: false,
				autoAliases: true,
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
				console.log('Bypassing the authentication for logging in');
				return;
			}

			let token;
			const cookieHeader = req.headers.cookie;
			if (!cookieHeader) {
				throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_NO_TOKEN);
			}

			const cookies = cookieHeader.split(';').map(cookie => cookie.trim());
			const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
			if (tokenCookie) {
				token = tokenCookie.split('=')[1];
			} else {
				throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_NO_TOKEN);
			}

			const user = await ctx.call('users.resolveToken', { token });
			if (user) {
				ctx.meta.user = user;
				return user;
			} else {
				throw new ApiGateway.Errors.UnAuthorizedError(ApiGateway.Errors.ERR_INVALID_TOKEN);
			}

		},
	}
};
