const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testAPI = async () => {
    try {
        console.log('--- Starting API Tests ---');

        // 1. Register
        console.log('1. Testing Registration...');
        const uniqueEmail = `test${Date.now()}@example.com`;
        const registerRes = await axios.post(`${API_URL}/auth/register`, {
            fullname: 'Test User',
            email: uniqueEmail,
            password: 'password123',
            country: 'Test Country',
            role: 'member'
        });
        console.log('Registration Success:', registerRes.status === 200);
        const token = registerRes.data.token;

        // 2. Login
        console.log('2. Testing Login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: uniqueEmail,
            password: 'password123'
        });
        console.log('Login Success:', loginRes.status === 200);

        // 3. Create Report
        console.log('3. Testing Report Submission...');
        const reportRes = await axios.post(`${API_URL}/reports`, {
            date: new Date().toISOString().split('T')[0],
            evangelism_hours: 2.5,
            people_reached: 5
        }, {
            headers: { 'x-auth-token': token }
        });
        console.log('Report Submission Success:', reportRes.status === 200);

        // 4. Get Reports
        console.log('4. Testing Get Reports...');
        const getReportsRes = await axios.get(`${API_URL}/reports`, {
            headers: { 'x-auth-token': token }
        });
        console.log('Get Reports Success:', getReportsRes.data.length > 0);

        // 5. Export PDF
        console.log('5. Testing PDF Export...');
        const pdfRes = await axios.get(`${API_URL}/reports/export/pdf`, {
            headers: { 'x-auth-token': token }
        });
        console.log('PDF Export Success:', pdfRes.status === 200);

        console.log('--- All Tests Passed ---');

    } catch (err) {
        console.error('Test Failed:', err.response ? err.response.data : err.message);
    }
};

testAPI();
