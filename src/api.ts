import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createHash } from 'crypto';
import * as users from './users.js'
import * as Stocks from './stocks.js'
import { createAuthToken, validateAuthToken } from './auth.js'
import { InvalidAuthTokenError } from './errors.js'
import { getLoginRequestValidator, formatAjvValidationErrors, getRegisterRequestValidator, getTransactionRequestValidator, getStockRequstValidator } from './schema.js';
import { handleBuy, handleSell } from './portfolio.js';

dotenv.config()

const app = express();
const port = 5000;

async function main() {
    await initializeServer();
}

async function initializeServer() {
	console.log('Initializing Express Server...')

	app.use(express.json());

	console.log('Configuring CORS...')
	app.use(cors());

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

	// Get user portfolio information
	console.log('Defining endpoint GET /portfolio');
	app.get('/portfolio', async (req, res): Promise<any> => {
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

			const portfolio = user.portfolio;

			if (!portfolio || portfolio.length === 0) {
				return res.status(200).json([]);
			}

			const portfolioTickers = portfolio.map(stock => stock.ticker) as string[];
			const portfolioStocks = await Stocks.getStocksByTickers(portfolioTickers) as Stocks.Stock[];

			const userResponse = portfolioStocks.map(stock => {
				const userStock = portfolio.find(p => p.ticker === stock.ticker);
				return {
					...stock,
					amount: userStock?.amount ?? 0,
					averagePrice: userStock?.averagePrice ?? 0
				};
			});
	
			return res.status(200).json(userResponse)

		} catch(err: unknown) {
			if (err instanceof InvalidAuthTokenError) {
			  return res.status(401).json({ error: 'Unauthorized' })
			}
			logError(err)
			return res.status(500).json({ error: 'Unable to get user info due to internal server error' })
		}  
	});

	// Get all stock data
	console.log('Defining endpoint GET /stocks');
	app.get('/stocks', async (req, res): Promise<any> => {
		try {
			const stocks = await Stocks.getAllStocks() as Stocks.Stock[];
			return res.status(200).json(stocks);
		} catch(err: unknown) {
			logError(err)
			return res.status(500).json({ error: 'Unable to get stocks info due to internal server error' })
		} 
	});

	interface StockRequestBody {
		ticker: string
	}

	// Get stock data for one ticker
	console.log('Defining endpoint POST /stocks');
	app.post('/stocks/:ticker', async (req, res): Promise<any> => {
		try {
			const ticker = req.params.ticker;
			const stock = await Stocks.getStockByTicker(ticker);
	
			if (!stock) {
				return res.status(404).json({ error: 'Stock does not exist.' });
			}
	
			return res.status(200).json(stock);
		} catch (err) {
			logError(err);
			return res.status(500).json({ error: 'Unable to get stock info due to internal server error' });
		}
	});

	// Get user data
	console.log('Defining endpoint GET /user');
	app.get('/user', async (req, res): Promise<any> => { 
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

	interface loginRequestBody {
		username: string,
		password: string
	}
	
	// Login as existing user
	console.log('Defining endpoint POST /login');
	app.post('/login', async (req, res): Promise<any> => {
		try {
			const validator = getLoginRequestValidator();
			if (!validator(req.body)) {
				return res.status(400).json({ error: 'malformed/invalid request body', message: formatAjvValidationErrors(validator.errors) })
			}
			const body = req.body as loginRequestBody;
			const username = body.username;

			const passwordHash = createHash('sha256').update(body.password).digest('hex');

			const user = await users.getUserByCredentials(username, passwordHash);

			if (!user) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			const authToken = createAuthToken({ id: user.id } as TokenPayload);
			return res.status(201).json({ token: authToken });
		} catch (err: unknown) {
			//logError(err)
			return res.status(500).json({ error: 'Unable to complete login due to internal server error' })
		}
	});

	interface registerRequestBody {
		firstName: string,
		lastName: string,
		username: string,
		password: string
	}

	// Create a new user
	console.log('Defining endpoint POST /register');
	app.post('/register', async (req, res): Promise<any> => {
		try {
			const validator = getRegisterRequestValidator();
			if (!validator(req.body)) {
				return res.status(400).json({ error: 'malformed/invalid request body', message: formatAjvValidationErrors(validator.errors) })
			}
			const body = req.body as registerRequestBody;
			const username = body.username;
			
			const doesUserExist = await users.doesUserExist(username) as boolean;
			if (doesUserExist) {
				return res.status(403).json({ error: "User with that username already exists." })
			}

			const passwordHash = createHash('sha256').update(body.password).digest('hex');
			const newUser = await users.createUser(body.firstName, body.lastName, username, passwordHash) as users.User;

			const authToken = createAuthToken<TokenPayload>({ id: newUser.id }) as string;
			return res.status(201).json({ token: authToken});

		} catch (err: unknown) {
			logError(err)
			return res.status(500).json({ error: 'Unable to complete registration due to internal server error' })
		}
	});


	// Delete existing user
	console.log('Defining endpoint DELETE /user')
	app.delete('/user', async (req, res): Promise<any> => {
		try {
			if (!req.headers.token) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			const token = req.headers.token as string;
			const payload = validateAuthToken<TokenPayload>(token);
			const user = await users.getUserById(payload.id);

			if (!user) {
				return res.status(401).json({ error: 'Unauthorized' });
			}
			
			await users.deleteUserById(user.id);
			return res.status(200).json({ message: 'User deleted successfully' });

		} catch(err: unknown) {
			if (err instanceof InvalidAuthTokenError) {
			  return res.status(401).json({ error: 'Unauthorized' })
			}
			logError(err)
			return res.status(500).json({ error: 'Unable to get user info due to internal server error' })
		} 
	});

	
	interface TransactionRequestBody {
		ticker: string,
		amount: number
	}

	// Buy stock as user
	console.log('Defining endpoint POST /buy');
	app.post('/buy', async (req, res): Promise<any> => {	
		try {
			if (!req.headers.token) {
				return res.status(401).json({ error: 'Unauthorized' });
			}
			const validator = getTransactionRequestValidator(); 
			if (!validator(req.body)) {
				return res.status(400).json({ error: 'malformed/invalid request body', message: formatAjvValidationErrors(validator.errors) });
			}

			const token = req.headers.token as string;
			const payload = validateAuthToken<TokenPayload>(token);
			let user = await users.getUserById(payload.id);

			if (!user) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			const body = req.body as TransactionRequestBody;
			user = await handleBuy(user, body.ticker, body.amount) as users.User;

			if (!user) {
				return res.status(409).json({ error: 'Unable to complete the purchase' });
			}
			return res.status(200).json({ message: 'Purchase successful', user });

		} catch(err: unknown) {
			if (err instanceof InvalidAuthTokenError) {
				return res.status(401).json({ error: 'Unauthorized' })
			}
			logError(err)
			return res.status(500).json({ error: 'Unable to get user info due to internal server error' })
		} 
	});

	// Sell stock as user
	console.log('Defining endpoint POST /sell');
	app.post('/sell', async (req, res): Promise<any> => {
		try {
			if (!req.headers.token) {
				return res.status(401).json({ error: 'Unauthorized' });
			}
			const validator = getTransactionRequestValidator(); 
			if (!validator(req.body)) {
				return res.status(400).json({ error: 'malformed/invalid request body', message: formatAjvValidationErrors(validator.errors) });
			}

			const token = req.headers.token as string;
			const payload = validateAuthToken<TokenPayload>(token);
			let user = await users.getUserById(payload.id);

			if (!user) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			const body = req.body as TransactionRequestBody;
			user = await handleSell(user, body.ticker, body.amount) as users.User;

			if (!user) {
				return res.status(409).json({ error: 'Unable to complete the sale' });
			}
			return res.status(200).json({ message: 'Sale successful', user });

		} catch(err: unknown) {
			if (err instanceof InvalidAuthTokenError) {
				return res.status(401).json({ error: 'Unauthorized' })
			}
			logError(err)
			return res.status(500).json({ error: 'Unable to get user info due to internal server error' })
		} 
	});

	// Start express server
    app.listen(port, () => {
    	console.log(`Listening on port ${port}`)
	})

  console.log('Express Server Initialized!')
}

main();