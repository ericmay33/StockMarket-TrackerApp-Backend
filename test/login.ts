import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function main() {
    const requestBody = {
        username: 'Eric',
        password: '1234'
    }
    const tokenResponse = await axios.post(`${BASE_URL}/login`, requestBody);
    const token = tokenResponse.data.token;
    console.log(JSON.stringify(token, null, 2));
}

main()