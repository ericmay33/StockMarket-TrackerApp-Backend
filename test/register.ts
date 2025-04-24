import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function main() {
    const requestBody = {
        firstName: 'Geekavanni', 
        lastName: 'Spoto',
        username: 'Gio',
        password: '1234',
    }
    const tokenResponse = await axios.post(`${BASE_URL}/register`, requestBody);
    const token = tokenResponse.data.token;

    console.log(JSON.stringify(token, null, 2));
}

main()