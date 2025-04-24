import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function main() {
    const requestBody = {
        username: 'Eric',
        password: '1234'
    }
    const tokenResponse = await axios.post(`${BASE_URL}/login`, requestBody);
    const token = tokenResponse.data.token;
    
    const deleteResponse = await axios.delete(`${BASE_URL}/login`, { headers: { token }})
    const deleted = deleteResponse.data;
    console.log(JSON.stringify(deleted, null, 2));
}

main()