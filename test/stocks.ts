import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function main() {
    const response = await axios.get(`${BASE_URL}/stocks`);
    const data = response.data;

    console.log(JSON.stringify(data, null, 2));
}

main()