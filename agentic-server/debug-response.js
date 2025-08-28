const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

async function debugAPIResponse() {
    try {
        console.log('🔍 Testing API response format...');
        
        const testMessage = {
            message: "Hello, test message",
            sessionId: "debug-test-" + Date.now()
        };

        console.log('📤 Sending request:', testMessage);
        
        const response = await axios.post(`${BASE_URL}/api/chat`, testMessage);
        
        console.log('📥 Raw response:', JSON.stringify(response.data, null, 2));
        
        // Test what happens when we try to access different parts
        console.log('\n🔍 Response analysis:');
        console.log('response.data type:', typeof response.data);
        console.log('response.data.reply type:', typeof response.data.reply);
        console.log('response.data.reply:', response.data.reply);
        
        if (response.data.reply && typeof response.data.reply === 'object') {
            console.log('response.data.reply.summary:', response.data.reply.summary);
            console.log('response.data.reply.data:', response.data.reply.data);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

debugAPIResponse();
