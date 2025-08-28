const axios = require('axios');

const BASE_URL = 'http://localhost:5001';
const SESSION_ID = 'test-session-' + Date.now();

async function testConversationalMemory() {
    console.log('🧪 Testing Conversational Memory with LangGraph Checkpointing');
    console.log('=' .repeat(60));
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

        // Test 2: Second message - should reference previous context
        console.log('2️⃣ Sending second message...');
        const response2 = await axios.post(`${BASE_URL}/api/chat`, {
            message: "What did I just say?",
            sessionId: SESSION_ID
        });
        console.log('✅ Response 2:', response2.data.reply.summary || response2.data.reply);
        console.log('');

        // Test 3: Third message - should maintain conversation flow
        console.log('3️⃣ Sending third message...');
        const response3 = await axios.post(`${BASE_URL}/api/chat`, {
            message: "Can you remember our conversation so far?",
            sessionId: SESSION_ID
        });
        console.log('✅ Response 3:', response3.data.reply.summary || response3.data.reply);
        console.log('');

        // Test 4: Check conversation history
        console.log('4️⃣ Retrieving conversation history...');
        const historyResponse = await axios.get(`${BASE_URL}/api/chat/history/${SESSION_ID}`);
        console.log('✅ History retrieved:', {
            sessionId: historyResponse.data.sessionId,
            messageCount: historyResponse.data.messageCount,
            history: historyResponse.data.history.map(msg => ({
                type: msg.constructor?.name || typeof msg,
                content: typeof msg.content === 'string' ? msg.content.substring(0, 100) + '...' : 'Object content'
            }))
        });
        console.log('');

        // Test 5: Test with a different session - should be separate
        console.log('5️⃣ Testing separate session...');
        const differentSessionId = 'different-session-' + Date.now();
        const response4 = await axios.post(`${BASE_URL}/api/chat`, {
            message: "This is a different session",
            sessionId: differentSessionId
        });
        console.log('✅ Different session response:', response4.data.reply.summary || response4.data.reply);
        console.log('');

        // Test 6: Back to original session - should still have context
        console.log('6️⃣ Back to original session...');
        const response5 = await axios.post(`${BASE_URL}/api/chat`, {
            message: "Are you still remembering our conversation?",
            sessionId: SESSION_ID
        });
        console.log('✅ Original session response:', response5.data.reply.summary || response5.data.reply);
        console.log('');

        console.log('🎉 Conversational Memory Test Completed Successfully!');
        console.log('=' .repeat(60));

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

async function testDatabaseQueryMemory() {
    console.log('🧪 Testing Database Query Memory');
    console.log('=' .repeat(60));
    console.log(`📝 Session ID: ${SESSION_ID}-db`);
    console.log('');

    try {
        // Test 1: First database query
        console.log('1️⃣ Sending first database query...');
        const response1 = await axios.post(`${BASE_URL}/api/chat`, {
            message: "List all devices",
            sessionId: `${SESSION_ID}-db`
        });
        console.log('✅ Database Response 1:', response1.data.reply.summary || response1.data.reply);
        console.log('');

        // Test 2: Follow-up query referencing previous context
        console.log('2️⃣ Sending follow-up query...');
        const response2 = await axios.post(`${BASE_URL}/api/chat`, {
            message: "Show me more details about the first device",
            sessionId: `${SESSION_ID}-db`
        });
        console.log('✅ Database Response 2:', response2.data.reply.summary || response2.data.reply);
        console.log('');

        // Test 3: Another follow-up
        console.log('3️⃣ Sending another follow-up...');
        const response3 = await axios.post(`${BASE_URL}/api/chat`, {
            message: "What was the first query I asked?",
            sessionId: `${SESSION_ID}-db`
        });
        console.log('✅ Database Response 3:', response3.data.reply.summary || response3.data.reply);
        console.log('');

        console.log('🎉 Database Query Memory Test Completed!');
        console.log('=' .repeat(60));

    } catch (error) {
        console.error('❌ Database test failed:', error.response?.data || error.message);
    }
}

// Run tests
async function runAllTests() {
    console.log('🚀 Starting Conversational Memory Tests...\n');
    
    await testConversationalMemory();
    console.log('\n');
    await testDatabaseQueryMemory();
    
    console.log('\n🏁 All tests completed!');
}

// Check if server is running first
async function checkServerHealth() {
    try {
        const response = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Server is running:', response.data.message);
        return true;
    } catch (error) {
        console.error('❌ Server is not running. Please start the server first:');
        console.error('   npm run dev');
        return false;
    }
}

// Main execution
async function main() {
    const serverRunning = await checkServerHealth();
    if (serverRunning) {
        await runAllTests();
    }
}

main().catch(console.error);
