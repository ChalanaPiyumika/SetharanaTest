const jwt = require('jsonwebtoken');
const env = require('../../shared/config/env');

/**
 * Jitsi Service (Infrastructure)
 * Builds JaaS (Jitsi as a Service) room names and join info.
 * Uses 8x8.vc's managed Jitsi infrastructure with JWT-secured rooms.
 *
 * JaaS App ID: vpaas-magic-cookie-bc1ac0c8434941698062ee8aa31dd285
 * Docs: https://developer.8x8.com/jaas/docs/api-keys-jwt
 */

class JitsiService {

    /**
     * Generate a unique room name for the given appointment
     * @param {object} appointment - Appointment with publicId
     * @returns {string} Full JaaS room name (appId/roomName)
     */
    createRoom(appointment) {
        const appId = env.JAAS_APP_ID || 'vpaas-magic-cookie-bc1ac0c8434941698062ee8aa31dd285';
        return `${appId}/consult_${appointment.publicId}`;
    }

    /**
     * Generate a signed JWT for JaaS meeting access
     * @param {object} user         - User object with id, firstName, lastName, email, role
     * @param {string} roomName     - Full JaaS room name (appId/roomName)
     * @returns {string}            JWT token
     */
    _generateJWT(user, roomName) {
        const appId = env.JAAS_APP_ID || 'vpaas-magic-cookie-bc1ac0c8434941698062ee8aa31dd285';
        const apiKeyId = env.JAAS_API_KEY_ID || 'vpaas-magic-cookie-bc1ac0c8434941698062ee8aa31dd285/4fe98b';

        // Get private key — stored in env as base64 or multiline (with literal \n)
        let privateKey = env.JAAS_PRIVATE_KEY;
        if (!privateKey) {
            console.warn('⚠ JAAS_PRIVATE_KEY not set — Jitsi JWT will not be generated');
            return null;
        }
        // Handle base64-encoded key or escaped newlines
        if (!privateKey.includes('BEGIN')) {
            privateKey = Buffer.from(privateKey, 'base64').toString('utf8');
        }
        privateKey = privateKey.replace(/\\n/g, '\n');

        const isDoctor = user.role === 'DOCTOR';
        const now = Math.floor(Date.now() / 1000);

        const payload = {
            iss: 'chat',
            iat: now,
            exp: now + 7200, // 2 hours
            nbf: now - 10,
            aud: 'jitsi',
            sub: appId,
            context: {
                user: {
                    id: String(user.id),
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email || '',
                    moderator: isDoctor, // Doctor is moderator
                    avatar: user.imgUrl || '',
                },
                features: {
                    livestreaming: false,
                    recording: false,
                    transcription: false,
                    'outbound-call': false,
                }
            },
            room: '*'
        };

        return jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            header: {
                alg: 'RS256',
                kid: apiKeyId,
            }
        });
    }

    /**
     * Build the join information for a user entering the JaaS room
     * @param {object} user          - User object with firstName, lastName, role
     * @param {object} consultation  - Consultation with roomName
     * @returns {object}             Join info payload
     */
    buildJoinInfo(user, consultation) {
        const domain = '8x8.vc';
        const roomName = consultation.roomName; // Already in format: appId/consult_xxx
        const displayName = `${user.firstName} ${user.lastName}`;
        const jaasJwt = this._generateJWT(user, roomName);
        const joinUrl = `https://8x8.vc/${roomName}`;

        return {
            domain,
            roomName,
            joinUrl,
            displayName,
            jwt: jaasJwt,
        };
    }
}

module.exports = new JitsiService();
