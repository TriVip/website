require('dotenv').config();
const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔐 Testing admin login...');
    console.log('📧 Email: admin@rareparfume.com');
    console.log('🔑 Password: admin123');
    console.log('🔑 JWT_SECRET from env:', process.env.JWT_SECRET ? 'Set' : 'Not set');

    const response = await axios.post('http://localhost:5000/api/admin/login', {
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
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testLogin();
