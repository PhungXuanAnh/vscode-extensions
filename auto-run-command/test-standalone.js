// Standalone test to verify the new commandRunSuccess condition
const { parseCondition, ParsedConditionType } = require('./out/src/lib/condition-parser');
const assert = require('assert');

console.log('Running standalone tests for commandRunSuccess...\n');

// Test 1: Parsing simple command
try {
    const rule1 = 'commandRunSuccess: echo "test"';
    const result1 = parseCondition(rule1);
    assert.deepEqual(result1, {
        type: ParsedConditionType.commandRunSuccess,
        args: ['echo "test"']
    });
    console.log('✓ Test 1 PASSED: Parsing simple command');
} catch (e) {
    console.error('✗ Test 1 FAILED:', e.message);
}

// Test 2: Parsing complex command
try {
    const rule2 = 'commandRunSuccess: git rev-parse --is-inside-work-tree';
    const result2 = parseCondition(rule2);
    assert.deepEqual(result2, {
        type: ParsedConditionType.commandRunSuccess,
        args: ['git rev-parse --is-inside-work-tree']
    });
    console.log('✓ Test 2 PASSED: Parsing complex command');
} catch (e) {
    console.error('✗ Test 2 FAILED:', e.message);
}

// Test 3: Verify enum value
try {
    assert.equal(ParsedConditionType.commandRunSuccess, 6);
    console.log('✓ Test 3 PASSED: Enum value is correct (6)');
} catch (e) {
    console.error('✗ Test 3 FAILED:', e.message);
}

// Test 4: Test existing conditions still work
try {
    const rule3 = 'always';
    const result3 = parseCondition(rule3);
    assert.deepEqual(result3, {
        type: ParsedConditionType.always,
        args: []
    });
    console.log('✓ Test 4 PASSED: Existing "always" condition still works');
} catch (e) {
    console.error('✗ Test 4 FAILED:', e.message);
}

// Test 5: Test hasFile condition still works
try {
    const rule4 = 'hasFile: package.json';
    const result4 = parseCondition(rule4);
    assert.deepEqual(result4, {
        type: ParsedConditionType.hasFile,
        args: ['package.json']
    });
    console.log('✓ Test 5 PASSED: Existing "hasFile" condition still works');
} catch (e) {
    console.error('✗ Test 5 FAILED:', e.message);
}

// Test 6: Test shell command execution (successful)
const { exec } = require('child_process');
exec('exit 0', (error) => {
    if (!error) {
        console.log('✓ Test 6 PASSED: Shell command "exit 0" returns success');
    } else {
        console.error('✗ Test 6 FAILED: Shell command "exit 0" returned error');
    }
    
    // Test 7: Test shell command execution (failure)
    exec('exit 1', (error) => {
        if (error) {
            console.log('✓ Test 7 PASSED: Shell command "exit 1" returns failure');
        } else {
            console.error('✗ Test 7 FAILED: Shell command "exit 1" did not return error');
        }
        
        console.log('\n✅ All standalone tests completed!');
    });
});
