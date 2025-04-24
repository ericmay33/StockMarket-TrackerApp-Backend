import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createHash } from 'crypto';
import * as users from './users.js'
import { createAuthToken, validateAuthToken } from './auth.js'
import { InvalidAuthTokenError } from './errors.js'
import { getLoginRequestValidator, formatAjvValidationErrors } from './schema.js';

dotenv.config()

const app = express();
const port = 3000;

async function main() {
    await initializeServer();
}

async function initializeServer() {
	console.log('Initializing Express Server...')

	app.use(express.json());

	console.log('Configuring CORS...')
	app.use(cors({
		origin: ['http://127.0.0.1:5000', 'http://localhost:5000']
	}))

	function logError(err: unknown) {
		if (err instanceof Error) {
		  console.error(`${err.message}\n\n${err.stack}`)
		}
		else {
		  console.error(`ERROR: ${err}`)
		}
	}
	
	interface TokenPayload {
		id: number
	}

	console.log('Defining endpoint GET /portfolio');
	app.get('/portfolio', async (req, res): Promise<any> => {		// Get user portfolio information
		try {
			if (!req.headers.token) {
				return res.status(401).json({ error: 'Unauthorized' })
			}
			const token = req.headers.token as string;
			const payload = validateAuthToken<TokenPayload>(token);
			const user = await users.getUserById(payload.id);

			if (!user) {
				return res.status(401).json({ error: 'Unauthorized' })
			}

			const userResponse = {
				portfolio: user.portfolio as users.PortfolioStock[]
			}
			return res.status(200).json(userResponse);

		} catch(err: unknown) {
			if (err instanceof InvalidAuthTokenError) {
			  return res.status(401).json({ error: 'Unauthorized' })
			}
			logError(err)
			return res.status(500).json({ error: 'Unable to get user info due to interal server error' })
		}  
	});


	console.log('Defining endpoint GET /stocks');
	app.get('/stocks', async (req, res): Promise<any> => {		// Get all stock data
		
	});


	console.log('Defining endpoint GET /user');
	app.get('/user', async (req, res): Promise<any> => { 		// Get user data
		try {
			if (!req.headers.token) {
				return res.status(401).json({ error: 'Unauthorized' })
			}
			const token = req.headers.token as string;
			const payload = validateAuthToken<TokenPayload>(token);
			const user = await users.getUserById(payload.id);

			if (!user) {
				return res.status(401).json({ error: 'Unauthorized' })
			}

			const userResponse = {
				id: user.id, 
				firstName: user.firstName, 
				lastName: user.lastName,
				username: user.username,
				balance: user.balance
			}
			return res.status(200).json(userResponse);

		} catch(err: unknown) {
			if (err instanceof InvalidAuthTokenError) {
			  return res.status(401).json({ error: 'Unauthorized' })
			}
			logError(err)
			return res.status(500).json({ error: 'Unable to get user info due to internal server error' })
		}  
	});

	interface accountRequestBody {
		username: string,
		password: string
	}
	
	console.log('Defining endpoint POST /login');
	app.post('/login', async (req, res): Promise<any> => {		// Login as existing user: DO TODAY
		const validator = getLoginRequestValidator();
		if (!validator(req.body)) {
			return res.status(400).json({ error: 'malformed/invalid request body', message: formatAjvValidationErrors(validator.errors) })
      	}
		const body = req.body as accountRequestBody;
		const username = body.username;
		const passwordHash = createHash('sha256').update(body.password).digest('hex');

		

	});


	console.log('Defining endpoint POST /register');
	app.post('/register', async (req, res): Promise<any> => { 	// Create new user: DO TODAY

	});


	console.log('Defining endpoint POST /buy');
	app.post('/buy', async (req, res): Promise<any> => {		// Buy stock as user

	});


	console.log('Defining endpoint POST /sell');
	app.post('/sell', async (req, res): Promise<any> => {		// Sell stock as user

	});


	// Start express server
    app.listen(port, () => {
    	console.log(`Listening on port ${port}`)
	})

  console.log('Express Server Initialized!')
}

main();