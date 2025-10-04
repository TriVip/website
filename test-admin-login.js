// Test script để kiểm tra API login từ góc nhìn frontend
const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('🔐 Testing admin login from frontend perspective...');

    // Simulate frontend API call (using proxy)
    const response = await axios.post('http://localhost:3001/api/admin/login', {
      email: 'admin@rareparfume.com',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login successful!');
    console.log('Response:', response.data);

  } catch (error) {
    console.log('❌ Login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
      console.log('Data:', error.response.data);
    } else if (error.request) {
      console.log('No response received:', error.message);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testAdminLogin();
