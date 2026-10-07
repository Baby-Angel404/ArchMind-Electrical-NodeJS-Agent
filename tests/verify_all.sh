#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "=========================================================="
echo "  ArchMind Full System Verification & Quality Gate        "
echo "=========================================================="

echo "[1/5] Verifying Firmware Native C++ Logic..."
cd "$PROJECT_ROOT/CODE_SCAFFOLDING/firmware"
g++ -std=c++17 test/test_telemetry.cpp -Iinclude -o test/test_runner
./test/test_runner
rm -f test/test_runner
echo "  ✓ Firmware native logic checks passed."

echo "[2/5] Verifying Backend Node.js / NestJS Suite..."
cd "$PROJECT_ROOT/CODE_SCAFFOLDING/backend-nodejs"
npm run typecheck
npm test -- --silent
npm run test:e2e -- --silent
npm run build
echo "  ✓ Backend typecheck, unit tests, e2e tests, and build passed."

echo "[3/5] Verifying Frontend Next.js Production Build..."
cd "$PROJECT_ROOT/CODE_SCAFFOLDING/frontend"
npm run build
echo "  ✓ Frontend Next.js production build passed."

echo "[4/5] Verifying Kaggle Notebook Schema & Integrity..."
cd "$PROJECT_ROOT"
python3 -m json.tool KAGGLE_NOTEBOOK.ipynb > /dev/null
echo "  ✓ KAGGLE_NOTEBOOK.ipynb valid JSON."

echo "[5/5] Verifying Project Structure & Artifacts..."
test -f "$PROJECT_ROOT/SYSTEM_PROMPT.md"
test -f "$PROJECT_ROOT/README.md"
test -f "$PROJECT_ROOT/MODEL_CARD.md"
test -f "$PROJECT_ROOT/LICENSE"
test -f "$PROJECT_ROOT/CHANGELOG.md"
test -f "$PROJECT_ROOT/CONTRIBUTING.md"
test -f "$PROJECT_ROOT/SECURITY.md"
test -f "$PROJECT_ROOT/RELEASE_CHECKLIST.md"
test -f "$PROJECT_ROOT/.env.example"
test -f "$PROJECT_ROOT/.gitignore"
echo "  ✓ Core root documentation and config artifacts present."

echo "=========================================================="
echo "  ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!            "
echo "=========================================================="
