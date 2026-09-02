export interface GoogleUser {
	googleId: string;
	email: string;
	name: string;
	picture: string | null;
	accessToken: string;
	refreshToken: string | null;
}
