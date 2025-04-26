import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function main() {
    const requestBody = {
        username: 'Eric',
        password: '1234'
    }
    const tokenResponse = await axios.post(`${BASE_URL}/login`, requestBody);
    const token = tokenResponse.data.token;

    const requestBody2 = {
        ticker: 'AAPL',
        amount: 2
    }

    const sellResponse = await axios.post(`${BASE_URL}/sell`, requestBody2, { headers: { token }});
    const updatedUser = sellResponse.data;
    console.log(JSON.stringify(updatedUser, null, 2));
}

main()