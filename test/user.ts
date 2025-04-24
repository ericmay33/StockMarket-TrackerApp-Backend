import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function main() {
    const requestBody = {
        username: 'Eric',
        password: '1234'
    }
    const tokenResponse = await axios.post(`${BASE_URL}/login`, requestBody);
    const token = tokenResponse.data.token;

    const userResponse = await axios.get(`${BASE_URL}/user`, { headers: { token }});
    const user = userResponse.data;
    console.log(JSON.stringify(user, null, 2));
}

main()