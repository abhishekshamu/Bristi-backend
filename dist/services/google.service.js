"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleService = void 0;
const google_auth_library_1 = require("google-auth-library");
/**
 * GoogleService — verifies Google Identity Services ID tokens (credential)
 * issued to the storefront's Google Client ID. Tokens are verified against
 * Google's public keys and the audience is pinned to GOOGLE_CLIENT_ID so a
 * token minted for another application can never be accepted.
 */
class GoogleService {
    constructor() {
        this.clientId = process.env.GOOGLE_CLIENT_ID || '';
        this.client = new google_auth_library_1.OAuth2Client(this.clientId);
    }
    isConfigured() {
        return Boolean(this.clientId);
    }
    async verifyIdToken(credential) {
        if (!this.clientId) {
            throw new Error('GOOGLE_CLIENT_ID is not configured on the server');
        }
        const ticket = await this.client.verifyIdToken({
            idToken: credential,
            audience: this.clientId,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.sub) {
            throw new Error('Google token payload is missing a subject identifier');
        }
        return {
            sub: payload.sub,
            email: payload.email || '',
            emailVerified: Boolean(payload.email_verified),
            name: payload.name || '',
            givenName: payload.given_name,
            familyName: payload.family_name,
            picture: payload.picture,
        };
    }
}
exports.GoogleService = GoogleService;
