Diamond Magic — Production-ready Starter (Frontend + Backend)

What's included:
- index.html (login/signup)
- user.html (user dashboard)
- admin.html (admin panel)
- firebase.js (client Firebase config)
- style.css (styles)
- server.js (Node.js backend example to verify BEP20 transfers and credit Firestore)
- .env.example
- README.md

Important steps to make it "original / production":
1. Firebase Console
   - Create project (or use existing diamond-magic-1cd40)
   - Enable Authentication (Email/Password)
   - Enable Realtime Database or Firestore (this project uses Realtime DB for client examples; server uses Firestore)
   - Create an Admin user (Auth > Users) and copy its UID. Paste that UID into admin.html at ADMIN_UID placeholder.

2. Backend
   - Download service account key JSON from Firebase Console (Project Settings > Service Accounts) and save as serviceAccountKey.json in backend root (same folder as server.js).
   - Copy .env.example to .env and set values (TARGET_ADDRESS, BSC_RPC, FIREBASE_DB_URL).
   - Install dependencies: npm i express body-parser ethers firebase-admin dotenv
   - Start server: node server.js (or deploy to Heroku/Render/DigitalOcean). Ensure HTTPS and CORS for frontend.

3. Security & production notes
   - Do NOT store serviceAccountKey.json in public repos.
   - Use HTTPS for backend.
   - Harden Firebase Rules to restrict reads/writes to authenticated users and admin UID.
   - Implement KYC/AML before enabling withdrawals.
   - Consider monitoring and rate-limiting backend endpoints.

4. How deposit flow works (production)
   - User sends BEP20 token to TARGET_ADDRESS using wallet.
   - User provides txHash to frontend (or frontend can call server to check user's recent TXs).
   - Frontend posts txHash + uid to /api/verify-tx on backend.
   - Backend verifies transaction, checks Transfer events to TARGET_ADDRESS, credits user's balance in Firestore, and saves payment record.

If you want, I can:
- Replace ADMIN_UID in admin.html if you give the UID.
- Deploy the backend to Render/Heroku for you (I will provide commands and exact steps).
- Add server endpoint to receive txHash from frontend automatically.
