// Test the checkCondition function for commandRunSuccess
const { ParsedConditionType } = require('./out/src/lib/condition-parser');
const { checkCondition } = require('./out/src/lib/condition-checker');

console.log('Testing checkCondition for commandRunSuccess...\n');

// Mock vscode module since we're running outside VS Code
const vscode = {
    window: {
        activeTextEditor: null
    },
    workspace: {
        findFiles: () => Promise.resolve([]),
        rootPath: ''
    }
};

// Inject mock
global.vscode = vscode;

async function runTests() {
    // Test 1: Successful command (exit 0)
    try {
        const parsed1 = { type: ParsedConditionType.commandRunSuccess, args: ['exit 0'] };
        const result1 = await checkCondition(parsed1);
        if (result1 === true) {
            console.log('✓ Test 1 PASSED: "exit 0" returns true');
        } else {
            console.error('✗ Test 1 FAILED: "exit 0" should return true, got:', result1);
        }
    } catch (e) {
        console.error('✗ Test 1 FAILED with error:', e.message);
    }

    // Test 2: Failed command (exit 1)
    try {
        const parsed2 = { type: ParsedConditionType.commandRunSuccess, args: ['exit 1'] };
        const result2 = await checkCondition(parsed2);
        if (result2 === false) {
            console.log('✓ Test 2 PASSED: "exit 1" returns false');
        } else {
            console.error('✗ Test 2 FAILED: "exit 1" should return false, got:', result2);
        }
    } catch (e) {
        console.error('✗ Test 2 FAILED with error:', e.message);
    }

    // Test 3: Valid echo command
    try {
        const parsed3 = { type: ParsedConditionType.commandRunSuccess, args: ['echo "test"'] };
        const result3 = await checkCondition(parsed3);
        if (result3 === true) {
            console.log('✓ Test 3 PASSED: echo command returns true');
        } else {
            console.error('✗ Test 3 FAILED: echo should return true, got:', result3);
        }
    } catch (e) {
        console.error('✗ Test 3 FAILED with error:', e.message);
    }

    // Test 4: Invalid command
    try {
        const parsed4 = { type: ParsedConditionType.commandRunSuccess, args: ['this-command-does-not-exist-xyz123'] };
        const result4 = await checkCondition(parsed4);
        if (result4 === false) {
            console.log('✓ Test 4 PASSED: Invalid command returns false');
        } else {
            console.error('✗ Test 4 FAILED: Invalid command should return false, got:', result4);
        }
    } catch (e) {
        console.error('✗ Test 4 FAILED with error:', e.message);
    }

    // Test 5: Test "always" condition still works
    try {
        const parsed5 = { type: ParsedConditionType.always, args: [] };
        const result5 = await checkCondition(parsed5);
        if (result5 === true) {
            console.log('✓ Test 5 PASSED: "always" condition still works');
        } else {
            console.error('✗ Test 5 FAILED: "always" should return true, got:', result5);
        }
    } catch (e) {
        console.error('✗ Test 5 FAILED with error:', e.message);
    }

    console.log('\n✅ All checkCondition tests completed!');
}

runTests().catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
});
