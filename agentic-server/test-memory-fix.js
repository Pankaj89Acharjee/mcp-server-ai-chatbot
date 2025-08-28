const axios = require('axios');

const BASE_URL = 'http://localhost:5001';
const SESSION_ID = 'test-memory-' + Date.now();

async function testConversationalMemory() {
    console.log('🧪 Testing Conversational Memory with Database Connection Handling');
    console.log('=' .repeat(70));
    console.log(`📝 Session ID: ${SESSION_ID}`);
    console.log('');

    try {
        // Test 1: First message - should establish context
        console.log('1️⃣ Sending first message...');
        const response1 = await axios.post(`${BASE_URL}/api/chat`, {
            message: "Hello, I'm testing the conversation memory",
            sessionId: SESSION_ID
        });
        console.log('✅ Response 1:', response1.data.reply.summary || response1.data.reply);
        console.log('');

        // Test 2: Follow-up message - should remember context
        console.log('2️⃣ Sending follow-up message...');
        const response2 = await axios.post(`${BASE_URL}/api/chat`, {
            message: "What did I just say?",
            sessionId: SESSION_ID
        });
        console.log('✅ Response 2:', response2.data.reply.summary || response2.data.reply);
        console.log('');

        // Test 3: Database query - should work despite connection issues
        console.log('3️⃣ Testing database query...');
        const response3 = await axios.post(`${BASE_URL}/api/chat`, {
            message: "Show me some data",
            sessionId: SESSION_ID
        });
        console.log('✅ Response 3:', response3.data.reply.summary || response3.data.reply);
        console.log('');

        // Test 4: Another follow-up - should maintain conversation
        console.log('4️⃣ Testing conversation continuity...');
        const response4 = await axios.post(`${BASE_URL}/api/chat`, {
            message: "Can you summarize our conversation so far?",
            sessionId: SESSION_ID
        });
        console.log('✅ Response 4:', response4.data.reply.summary || response4.data.reply);
        console.log('');

        // Test 5: Check conversation history
        console.log('5️⃣ Checking conversation history...');
        const historyResponse = await axios.get(`${BASE_URL}/api/chat/history/${SESSION_ID}`);
        console.log('✅ History:', historyResponse.data);
        console.log('');

        console.log('🎉 All tests completed!');
        console.log('📊 Summary:');
        console.log(`   - Session maintained: ${SESSION_ID}`);
        console.log(`   - Messages processed: 4`);
        console.log(`   - Memory working: ${historyResponse.data.messages ? 'Yes' : 'No'}`);

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

async function testNewSession() {
    console.log('\n🔄 Testing new session creation...');
    const NEW_SESSION_ID = 'new-session-' + Date.now();
    
    try {
        const response = await axios.post(`${BASE_URL}/api/chat`, {
            message: "This is a new conversation",
            sessionId: NEW_SESSION_ID
        });
        console.log('✅ New session response:', response.data.reply.summary || response.data.reply);
    } catch (error) {
        console.error('❌ New session test failed:', error.response?.data || error.message);
    }
}

// Run tests
async function runAllTests() {
    await testConversationalMemory();
    await testNewSession();
}

runAllTests();
