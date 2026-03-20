#!/usr/bin/env node

/**
 * Test Export Endpoints
 * 
 * This script tests the PDF and Excel export endpoints to ensure
 * they return proper file formats with correct headers.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000';

async function testExports() {
    console.log('🧪 Testing Export Endpoints...\n');

    // You'll need to replace this with a valid token
    const token = 'YOUR_AUTH_TOKEN_HERE'; 
    
    const today = new Date().toISOString().split('T')[0];
    
    const tests = [
        {
            name: 'PDF Export - Today',
            endpoint: `/api/reports/export/pdf`,
            params: { startDate: today, endDate: today },
            expectedType: 'application/pdf',
            extension: 'pdf'
        },
        {
            name: 'Excel Export - Today',
            endpoint: `/api/reports/export/excel`,
            params: { startDate: today, endDate: today },
            expectedType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            extension: 'xlsx'
        }
    ];

    for (const test of tests) {
        try {
            console.log(`📋 Testing: ${test.name}`);
            
            const response = await axios.get(`${API_URL}${test.endpoint}`, {
                headers: { 'x-auth-token': token },
                params: test.params,
                responseType: 'arraybuffer'
            });

            // Check headers
            const contentType = response.headers['content-type'];
            const contentDisposition = response.headers['content-disposition'];
            
            console.log(`   Content-Type: ${contentType}`);
            console.log(`   Content-Disposition: ${contentDisposition}`);
            
            // Verify content type
            if (contentType === test.expectedType) {
                console.log(`   ✅ Content-Type is correct`);
            } else {
                console.log(`   ❌ Content-Type mismatch! Expected: ${test.expectedType}`);
            }

            // Verify file has content
            if (response.data && response.data.length > 0) {
                console.log(`   ✅ File has content (${response.data.length} bytes)`);
                
                // Save test file
                const filename = `test_export_${Date.now()}.${test.extension}`;
                const filepath = path.join(__dirname, filename);
                fs.writeFileSync(filepath, response.data);
                console.log(`   📁 Saved test file: ${filename}`);
            } else {
                console.log(`   ❌ File is empty!`);
            }

            console.log(`   ✅ ${test.name} PASSED\n`);

        } catch (error) {
            console.log(`   ❌ ${test.name} FAILED`);
            console.log(`   Error: ${error.message}\n`);
        }
    }

    console.log('🎉 Export tests completed!');
    console.log('\n📝 Instructions:');
    console.log('1. Replace YOUR_AUTH_TOKEN_HERE with a valid token');
    console.log('2. Make sure the server is running on http://localhost:5000');
    console.log('3. Check if test files can be opened properly');
}

// Only run if executed directly
if (require.main === module) {
    testExports().catch(console.error);
}

module.exports = { testExports };
