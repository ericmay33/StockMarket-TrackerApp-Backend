import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function main() {
    const requestBody = {
        username: 'Eric',
        password: '1234'
    }
    const tokenResponse = await axios.post(`${BASE_URL}/login`, requestBody);
    const token = tokenResponse.data.token;

    const portfolioResponse = await axios.get(`${BASE_URL}/portfolio`, { headers: { token }});
    const portfolio = portfolioResponse.data;
    console.log(JSON.stringify(portfolio, null, 2));
}

main()