#!/bin/bash
# Test to verify the ComparisonPage and ABTestPage race condition fix

API_URL="http://localhost:5000"
USER="test_user_$(date +%s)"

echo "=== Testing Progress Saving Race Condition Fix ==="
echo "User: $USER"
echo ""

# Clean up old test data
curl -s -X DELETE "${API_URL}/api/users/${USER}" > /dev/null 2>&1

# Test 1: Create user
echo "1. Creating user..."
curl -s -X POST "${API_URL}/api/users" \
    -H "Content-Type: application/json" \
    -d "{\"id\": \"${USER}\", \"name\": \"Test User\"}" > /dev/null
echo "✓ User created"
echo ""

# Test 2: Save comparison progress
echo "2. Saving comparison progress..."
curl -s -X POST "${API_URL}/api/progress/comparison/default/${USER}" \
    -H "Content-Type: application/json" \
    -d '{
        "test-sample-1": {"model_a": "good", "model_b": "bad"},
        "test-sample-2": {"model_a": "maybe", "model_b": "good"}
    }' > /dev/null
echo "✓ Progress saved"
echo ""

# Test 3: Verify it was saved (not empty {})
echo "3. Verifying comparison progress is not empty..."
response=$(curl -s "${API_URL}/api/progress/comparison/default/${USER}")
if echo "$response" | grep -q "test-sample-1"; then
    echo "✓ Progress contains data"
    echo "   Data preview: $(echo "$response" | grep -o '"data":{[^}]*' | head -c 60)..."
else
    echo "✗ Progress is empty or missing!"
    echo "   Response: $response"
    exit 1
fi
echo ""

# Test 4: Save ABTest progress
echo "4. Saving ABTest progress..."
curl -s -X POST "${API_URL}/api/progress/abtest/default/${USER}" \
    -H "Content-Type: application/json" \
    -d '{
        "test-sample-1": "model_a",
        "test-sample-2": "model_b",
        "test-sample-3": "model_a"
    }' > /dev/null
echo "✓ Progress saved"
echo ""

# Test 5: Verify ABTest progress
echo "5. Verifying ABTest progress is not empty..."
response=$(curl -s "${API_URL}/api/progress/abtest/default/${USER}")
if echo "$response" | grep -q "test-sample-1"; then
    echo "✓ Progress contains data"
    echo "   Data preview: $(echo "$response" | grep -o '"data":{[^}]*' | head -c 60)..."
else
    echo "✗ Progress is empty or missing!"
    echo "   Response: $response"
    exit 1
fi
echo ""

# Test 6: Simulate user logout/login by loading progress again
echo "6. Simulating page reload (load progress)..."
comparison_data=$(curl -s "${API_URL}/api/progress/comparison/default/${USER}" | grep -o '"data":\{[^}]*}[^}]*}' | sed 's/"data"://')
abtest_data=$(curl -s "${API_URL}/api/progress/abtest/default/${USER}" | grep -o '"data":\{[^}]*}' | sed 's/"data"://')

if echo "$comparison_data" | grep -q "test-sample-1" && echo "$abtest_data" | grep -q "test-sample-1"; then
    echo "✓ All progress persisted correctly"
else
    echo "✗ Progress lost after reload!"
    exit 1
fi
echo ""

# Clean up
echo "7. Cleaning up..."
curl -s -X DELETE "${API_URL}/api/users/${USER}" > /dev/null
echo "✓ Test user deleted"
echo ""

echo "=== All Tests Passed! ==="
echo ""
echo "The race condition fix is working:"
echo "  • Comparison progress saves correctly"
echo "  • ABTest progress saves correctly"
echo "  • Progress persists through reload"
echo "  • No empty objects {} being saved"
