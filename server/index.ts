import fastify, { FastifyRequest } from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';
dotenv.config();
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
let REDIRECT_URL =
    process.env.REDIRECT_URL || 'http://localhost:6060/api/callback';
let MAIN_URL = process.env.MAIN_URL || 'http://localhost:6060';
const NODE_ENV = (process.env.NODE_ENV as string) || 'development';
const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

interface LoggerOptions {
    [key: string]:
        | boolean
        | {
              transport: {
                  target: string;
              };
              serializers: {
                  res(reply: any): any;
                  req(request: any): any;
              };
          };
}

const envToLogger: LoggerOptions = {
    production: true,
    test: false,
};

const server = fastify({
    logger: envToLogger[NODE_ENV] ?? true,
});

const stateKey = 'spotify_auth_state';

// TODO: Clean this up and add error handling
const generateRandomString = (length: number) => {
    return crypto.randomBytes(60).toString('hex').slice(0, length);
};

// Login to Spotify via their auth URL
server.get('/api/login', async (request, reply) => {
    const state = generateRandomString(16);
    reply.header('Set-Cookie', `${stateKey}=${state}; Path=/`);
    const scope =
        'user-read-private user-read-email user-read-recently-played user-top-read user-follow-read user-follow-modify playlist-read-private playlist-read-collaborative playlist-modify-public user-library-read user-library-modify playlist-modify-private user-read-playback-state user-read-currently-playing user-modify-playback-state';

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope,
        redirect_uri: REDIRECT_URL,
        state,
    } as Record<string, string>);

    reply.redirect(
        'https://accounts.spotify.com/authorize?' + params.toString(),
    );
});

// Callback URL after logging in to Spotify that will send the access token to the frontend for use
server.get(
    '/api/callback',
    async (
        req: FastifyRequest<{
            Querystring: {
                code: string;
                state: string;
            };
        }>,
        reply,
    ) => {
        const code = req.query.code || null;
        const state = req.query.state || null;

        if (state === null) {
            console.log('state mismatch');
            const params = new URLSearchParams({
                error: 'state_mismatch',
            } as Record<string, string>);
            reply.redirect('/#' + params.toString());
        } else {
            // clear stateKey cookie
            reply.header('Set-Cookie', `${stateKey}=; Path=/`);
            // @ts-ignore
            const authString: string = new Buffer.from(
                CLIENT_ID + ':' + CLIENT_SECRET,
            ).toString('base64');
            const authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                form: {
                    code: code,
                    redirect_uri: REDIRECT_URL,
                    grant_type: 'authorization_code',
                },
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    Authorization: 'Basic ' + authString,
                },
                json: true,
            };

            const { data } = await axios.post(
                authOptions.url,
                authOptions.form,
                { headers: authOptions.headers },
            );

            const access_token = data.access_token;
            const refresh_token = data.refresh_token;

            const params = new URLSearchParams({
                access_token: access_token,
                refresh_token: refresh_token,
            } as Record<string, string>);

            reply.redirect(MAIN_URL + '/?' + params.toString());
        }
    },
);

server.get(
    '/api/refresh_token',
    async (
        req: FastifyRequest<{
            Querystring: {
                refresh_token: string;
            };
        }>,
        reply,
    ) => {
        try {
            const refresh_token = req.query.refresh_token;
            // @ts-ignore
            const authString: string = new Buffer.from(
                CLIENT_ID + ':' + CLIENT_SECRET,
            ).toString('base64');
            const authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                headers: {
                    Authorization: 'Basic ' + authString,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                form: {
                    grant_type: 'refresh_token',
                    refresh_token,
                },
                json: true,
            };

            const { data } = await axios.post(
                authOptions.url,
                authOptions.form,
                { headers: authOptions.headers },
            );

            const access_token = data.access_token;

            reply.send({
                access_token: access_token,
            });
        } catch (err) {
            console.error(err);
            reply.send({
                error: err,
            });
        }
    },
);

// Send static index.html file in production since Vite cannot
// perform TS compilation when receiving the index.html file
// from a server request. So Vite handles the index.html file for development
// instead of the server
server.register(fastifyStatic, {
    root: path.join(__dirname, '../frontend-build'),
});

server.setNotFoundHandler((request, reply) => {
    reply.header('Content-Type', 'text/html');
    return reply.sendFile('index.html');
});

server.listen({ host: HOST, port: PORT }, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log(`Server listening on port ${PORT}`);
});
