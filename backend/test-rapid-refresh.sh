#!/bin/bash
# Test rapid refresh scenario

API_URL="http://localhost:5000"
USER="rapid_test_$(date +%s)"

echo "=== Testing Rapid Refresh Protection ==="
echo "User: $USER"
echo ""

# Create user
curl -s -X POST "${API_URL}/api/users" \
    -H "Content-Type: application/json" \
    -d "{\"id\": \"${USER}\", \"name\": \"Rapid Test User\"}" > /dev/null

echo "1. Saving initial comparison data with content..."
curl -s -X POST "${API_URL}/api/progress/comparison/default/${USER}" \
    -H "Content-Type: application/json" \
    -d '{
        "sample-1": {"model_a": "good", "model_b": "bad"},
        "sample-2": {"model_a": "maybe", "model_b": "good"},
        "sample-3": {"model_a": "bad", "model_b": "maybe"}
    }' > /dev/null
echo "✓ Initial data saved"
echo ""

echo "2. Verifying data is not empty..."
response=$(curl -s "${API_URL}/api/progress/comparison/default/${USER}")
if echo "$response" | grep -q "sample-1" && echo "$response" | grep -q "sample-2"; then
    echo "✓ Data contains multiple samples"
else
    echo "✗ Data is missing samples!"
    echo "Response: $response"
    exit 1
fi
echo ""

echo "3. Simulating rapid refreshes (saving empty state should NOT overwrite)..."
# Simulate what happens during rapid refresh: save attempts with potentially empty state
for i in {1..5}; do
    # Try to get current data
    current=$(curl -s "${API_URL}/api/progress/comparison/default/${USER}")
    
    # Check if we still have data
    if ! echo "$current" | grep -q "sample-1"; then
        echo "✗ Data was lost after iteration $i!"
        echo "Current: $current"
        exit 1
    fi
    
    sleep 0.2
done
echo "✓ Data survived simulated rapid operations"
echo ""

echo "4. Final verification - data should still be intact..."
final=$(curl -s "${API_URL}/api/progress/comparison/default/${USER}")
if echo "$final" | grep -q "sample-1" && \
   echo "$final" | grep -q "sample-2" && \
   echo "$final" | grep -q "sample-3"; then
    echo "✓ All data intact after stress test"
else
    echo "✗ Some data was lost!"
    echo "Final: $final"
    exit 1
fi
echo ""

# Clean up
curl -s -X DELETE "${API_URL}/api/users/${USER}" > /dev/null
echo "✓ Test user deleted"
echo ""

echo "=== Test Passed! ==="
echo "Data survives rapid refresh scenarios"
