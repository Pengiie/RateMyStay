import { z } from 'zod';
//import { User, userSchema } from './user';
import { sign, verify } from 'jsonwebtoken';
import { prisma } from './db';
import { nanoid } from 'nanoid';
import { userSchema } from 'prisma-gen';
//import { createDatabaseAddress } from './address';

export namespace OAuth {
	class OAuthError extends Error {
		constructor(message: string) {
			super(message);
			this.name = 'OAuthError';
		}
	}

	type Provider = {
		clientId: string;
		clientSecret: string;
		scope: string[];
		url: string;
		tokenUrl: string;
	};

	type AuthorizationData = {
		accessToken: string;
		refreshToken: string;
		expiresIn: number;
		scope: string;
		tokenType: string;
	};

	type ProviderData = Omit<AuthorizationData, 'scope' | 'tokenType'>;

	const providerNames = ['google'] as const;
	export const providerNameSchema = z.enum(providerNames);
	export type ProviderName = z.infer<typeof providerNameSchema>;

	const providers: Record<ProviderName, Provider> = {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			scope: [
				'https://www.googleapis.com/auth/userinfo.email',
				'https://www.googleapis.com/auth/userinfo.profile',
			],
			url: 'https://accounts.google.com/o/oauth2/v2/auth',
			tokenUrl: 'https://oauth2.googleapis.com/token',
		},
	};

	export const authorizationUrls: Record<ProviderName, string> = Object.fromEntries(
		providerNames.map((providerName) => {
			const provider = providers[providerName];
			const additionalParams = [];
			if (providerName === 'google') additionalParams.push('access_type=offline');

			const params = [
				`client_id=${provider.clientId}`,
				`redirect_uri=${process.env.OAUTH_REDIRECT_URI!}/${providerName}`,
				`response_type=code`,
				`scope=${provider.scope.join('%20')}`,
				...additionalParams,
			];

			return [providerName, `${provider.url}?${params.join('&')}`];
		})
	) as Record<ProviderName, string>;

	export const getAuthorizationData = async (
		providerName: ProviderName,
		authorizationToken: string
	): Promise<AuthorizationData> => {
		const provider = providers[providerName];
		const params = new URLSearchParams();

		params.append('client_id', provider.clientId);
		params.append('client_secret', provider.clientSecret);
		params.append('code', authorizationToken);
		params.append('redirect_uri', `${process.env.OAUTH_REDIRECT_URI!}/${providerName}`);
		params.append('grant_type', 'authorization_code');

		const response = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			body: params,
		});
		if (response.status !== 200)
			throw new OAuthError('Invalid authorization token, could be expired');
		const authData = await response.json() as { access_token: string, refresh_token: string, expires_in: number, scope: string, token_type: string };
		return {
			accessToken: authData.access_token,
			refreshToken: authData.refresh_token,
			expiresIn: authData.expires_in,
			scope: authData.scope,
			tokenType: authData.token_type,
		};
	};

	type DeepNullable<T> = T extends object ? { [P in keyof T]: DeepNullable<T[P]> | null } : T;
	type ProviderUserData = DeepNullable<Omit<z.infer<typeof userSchema>, 'id'>>;

	type GoogleUserData = {
		email: string;
		given_name: string;
		family_name: string;
		picture: string;
	};

	const getProviderUserData = async (
		providerName: ProviderName,
		accessToken: string
	): Promise<ProviderUserData> => {
		if (providerName === 'google') {
			const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
			if (response.status !== 200) throw new OAuthError('Invalid access token');

			const userData = (await response.json()) as GoogleUserData;
			return {
				email: userData.email,
				name: userData.given_name,
			};
		}

		throw new Error('Invalid provider name');
	};

	type SignUpJwt = {
		providerName: ProviderName;
		providerData: ProviderData;
	};

	export type SignUpData = {
		currentData: ProviderUserData;
		issues: string[];
		signupJwt: string;
	};

	const createSignupJwt = (providerName: ProviderName, providerData: ProviderData): string => {
		const payload: SignUpJwt = {
			providerName,
			providerData,
		};
		const jwt = sign(payload, process.env.JWT_SECRET!);
		return jwt;
	};

	// export const decodeSignupJwt = (jwt: string): SignUpJwt => {
	// 	const decoded = verify(jwt, process.env.JWT_SECRET);
	// 	return decoded as SignUpJwt;
	// };

	// type SessionJwt = User;

	// const createSessionJwt = (userData: User): string => {
	// 	const payload = userData;
	// 	const jwt = sign(payload, process.env.JWT_SECRET);
	// 	return jwt;
	// };

	// export const decodeSessionJwt = (jwt: string): SessionJwt => {
	// 	const decoded = verify(jwt, process.env.JWT_SECRET);
	// 	return decoded as SessionJwt;
	// };

	// export const signUpUserSchema = userSchema.pick({
	// 	name: true,
	// 	email: true,
	// 	phone: true,
	// 	address: true,
	// });
	// export type SignUpUser = z.infer<typeof signUpUserSchema>;

	// export const signUp = async (signupJwt: string, userData: SignUpUser): Promise<string> => {
	// 	const { providerName, providerData } = decodeSignupJwt(signupJwt);
	// 	const providerUserData = await getProviderUserData(providerName, providerData.accessToken);

	// 	if (providerUserData.email && providerUserData.email !== userData.email)
	// 		throw new OAuthError("Emails don't match");
	// 	if (providerUserData.phone && providerUserData.phone !== userData.phone)
	// 		throw new OAuthError("Phone numbers don't match");

	// 	const userId = nanoid();
	// 	const stripeCustomerId = await createStripeCustomer({ id: userId, ...userData });

	// 	const user = await db
	// 		.with('address', createDatabaseAddress(userData.address))
	// 		.with('user', (db) =>
	// 			db
	// 				.insertInto('user')
	// 				.values({
	// 					id: userId,
	// 					email: userData.email,
	// 					phone: userData.phone,
	// 					first_name: userData.name.first,
	// 					last_name: userData.name.last,
	// 					address_id: (eb) => eb.selectFrom('address').select('id'),
	// 					avatar_url: providerUserData.avatarUrl || null,
	// 					stripe_customer_id: stripeCustomerId,
	// 				})
	// 				.returning('id')
	// 		)
	// 		.insertInto('provider')
	// 		.values({
	// 			id: nanoid(),
	// 			user_id: (eb) => eb.selectFrom('user').select('id'),
	// 			name: providerName,
	// 			access_token: providerData.accessToken,
	// 			refresh_token: providerData.refreshToken,
	// 			expires_at: Date.now() + providerData.expiresIn * 1000,
	// 		})
	// 		.execute();
	// 	if (!user) throw new OAuthError('Failed to create user in database');

	// 	return createSessionJwt({
	// 		id: userId,
	// 		email: userData.email,
	// 		phone: userData.phone,
	// 		name: userData.name,
	// 		address: userData.address,
	// 		avatarUrl: providerUserData.avatarUrl || null,
	// 		stripeCustomerId: stripeCustomerId,
	// 	});
	// };

	// export const signIn = async (
	// 	providerName: ProviderName,
	// 	authorizationToken: string
	// ): Promise<string | SignUpData> => {
	// 	const authorizationData = await getAuthorizationData(providerName, authorizationToken);
	// 	const userData = await getProviderUserData(providerName, authorizationData.accessToken);

	// 	// Check if user already exists
	// 	if (userData.email) {
	// 		const user = await db
	// 			.selectFrom('user')
	// 			.innerJoin('provider', 'user.id', 'provider.user_id')
	// 			.innerJoin('address', 'user.address_id', 'address.id')
	// 			.select([
	// 				'user.id',
	// 				'first_name',
	// 				'last_name',
	// 				'email',
	// 				'phone',
	// 				'state',
	// 				'city',
	// 				'street',
	// 				'zip',
	// 				'avatar_url',
	// 				'stripe_customer_id',
	// 				sql<string[]>`array_agg(provider.name)`.as('providers'),
	// 			])
	// 			.where('user.email', '=', userData.email)
	// 			.groupBy(['user.id', 'address.state', 'address.city', 'address.street', 'address.zip'])
	// 			.executeTakeFirst();

	// 		if (user) {
	// 			// Check if user is signing in with correct provider, only one provider is currently supported
	// 			const usingCurrentProvider = user.providers.includes(providerName);

	// 			if (usingCurrentProvider)
	// 				return createSessionJwt({
	// 					id: user.id,
	// 					email: user.email,
	// 					phone: user.phone,
	// 					name: {
	// 						first: user.first_name,
	// 						last: user.last_name,
	// 					},
	// 					address: {
	// 						state: user.state,
	// 						city: user.city,
	// 						street: user.street,
	// 						zip: user.zip,
	// 					},
	// 					avatarUrl: user.avatar_url,
	// 					stripeCustomerId: user.stripe_customer_id,
	// 				});
	// 			else throw new OAuthError('Email already exists with a different provider');
	// 		}
	// 	}
	// 	// TODO: Check if phone number already exists

	// 	// User doesn't exist, start signup flow
	// 	const parsedUserData = userSchema
	// 		.pick({ name: true, address: true, email: true, phone: true })
	// 		.safeParse(userData);
	// 	const signupJwt = createSignupJwt(providerName, authorizationData);
	// 	return {
	// 		currentData: userData,
	// 		issues: !parsedUserData.success
	// 			? parsedUserData.error.issues.map((issue) => issue.path.join('.'))
	// 			: [],
	// 		signupJwt,
	// 	};
	// };

	// export const createStripeCustomer = async (
	// 	user: Pick<User, 'id' | 'email' | 'phone' | 'name' | 'address'>
	// ): Promise<string> => {
	// 	const customer = await stripe.customers.create({
	// 		name: `${user.name.first} ${user.name.last}`,
	// 		email: user.email,
	// 		phone: user.phone,
	// 		address: {
	// 			line1: user.address.street,
	// 			city: user.address.city,
	// 			state: user.address.state,
	// 			postal_code: user.address.zip,
	// 		},
	// 		metadata: {
	// 			userId: user.id,
	// 		},
	// 	});
	// 	return customer.id;
	// };
}