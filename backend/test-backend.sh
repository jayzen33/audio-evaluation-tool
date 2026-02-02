#!/bin/bash
# Test script to verify backend progress saving/loading functionality

API_URL="http://localhost:5000"

echo "=== Testing Audio Evaluation Tools Backend ==="
echo ""

# Test 1: Health Check
echo "1. Testing health endpoint..."
response=$(curl -s "${API_URL}/api/health")
if echo "$response" | grep -q "ok"; then
    echo "✓ Backend is healthy"
else
    echo "✗ Backend health check failed"
    exit 1
fi
echo ""

# Test 2: Create User
echo "2. Creating test user..."
response=$(curl -s -X POST "${API_URL}/api/users" \
    -H "Content-Type: application/json" \
    -d '{"id": "scorer_001", "name": "Test Scorer"}')
if echo "$response" | grep -q "scorer_001"; then
    echo "✓ User created successfully"
else
    echo "✗ Failed to create user"
    exit 1
fi
echo ""

# Test 3: Save Comparison Progress
echo "3. Saving comparison progress..."
response=$(curl -s -X POST "${API_URL}/api/progress/comparison/exp1/scorer_001" \
    -H "Content-Type: application/json" \
    -d '{
        "sample-1": {"model_a": "good", "model_b": "bad"},
        "sample-2": {"model_a": "maybe", "model_b": "good"}
    }')
if echo "$response" | grep -q "sample-1"; then
    echo "✓ Comparison progress saved"
else
    echo "✗ Failed to save comparison progress"
    exit 1
fi
echo ""

# Test 4: Load Comparison Progress
echo "4. Loading comparison progress..."
response=$(curl -s "${API_URL}/api/progress/comparison/exp1/scorer_001")
if echo "$response" | grep -q "sample-1" && echo "$response" | grep -q "sample-2"; then
    echo "✓ Comparison progress loaded correctly"
else
    echo "✗ Failed to load comparison progress"
    exit 1
fi
echo ""

# Test 5: Save ABTest Progress
echo "5. Saving AB test progress..."
response=$(curl -s -X POST "${API_URL}/api/progress/abtest/exp1/scorer_001" \
    -H "Content-Type: application/json" \
    -d '{
        "sample-1": "model_a",
        "sample-2": "model_b"
    }')
if echo "$response" | grep -q "sample-1"; then
    echo "✓ AB test progress saved"
else
    echo "✗ Failed to save AB test progress"
    exit 1
fi
echo ""

# Test 6: Save MOS Progress
echo "6. Saving MOS progress..."
response=$(curl -s -X POST "${API_URL}/api/progress/mos/exp1/scorer_001" \
    -H "Content-Type: application/json" \
    -d '{
        "sample-1-model_a": 4,
        "sample-1-model_b": 2,
        "sample-2-model_a": 5
    }')
if echo "$response" | grep -q "sample-1-model_a"; then
    echo "✓ MOS progress saved"
else
    echo "✗ Failed to save MOS progress"
    exit 1
fi
echo ""

# Test 7: List All User Progress
echo "7. Listing all progress for user..."
response=$(curl -s "${API_URL}/api/users/scorer_001/progress")
if echo "$response" | grep -q "comparison" && \
   echo "$response" | grep -q "abtest" && \
   echo "$response" | grep -q "mos"; then
    echo "✓ All progress types recorded"
else
    echo "✗ Failed to retrieve all progress"
    exit 1
fi
echo ""

# Test 8: Update Progress (simulating continuation)
echo "8. Updating comparison progress (simulating continuation)..."
response=$(curl -s -X POST "${API_URL}/api/progress/comparison/exp1/scorer_001" \
    -H "Content-Type: application/json" \
    -d '{
        "sample-1": {"model_a": "good", "model_b": "bad"},
        "sample-2": {"model_a": "maybe", "model_b": "good"},
        "sample-3": {"model_a": "bad", "model_b": "maybe"}
    }')
if echo "$response" | grep -q "sample-3"; then
    echo "✓ Progress updated successfully"
else
    echo "✗ Failed to update progress"
    exit 1
fi
echo ""

# Test 9: Verify Update Persisted
echo "9. Verifying updated progress persisted..."
response=$(curl -s "${API_URL}/api/progress/comparison/exp1/scorer_001")
if echo "$response" | grep -q "sample-3"; then
    echo "✓ Updated progress persisted correctly"
else
    echo "✗ Updated progress not found"
    exit 1
fi
echo ""

echo "=== All Tests Passed! ==="
echo ""
echo "The backend is working correctly:"
echo "  • Users can be created"
echo "  • Progress is saved to database"
echo "  • Progress can be loaded"
echo "  • Progress can be updated"
echo "  • All tool types (comparison, abtest, mos) work"
echo ""
echo "Next steps:"
echo "  1. Start the backend: cd backend && ./run.sh"
echo "  2. Start the frontend: npm run dev"
echo "  3. Open the app and log in as a user"
echo "  4. Your progress will be saved automatically!"
