# telecomx-user-service

Minimal Express + MongoDB user service.

Environment
- Create a `.env` file from `.env.example` and set `MONGODB_URI`.

Quick start
- Install dependencies: npm install
- Dev server: npm run dev
Run
- Install dependencies: npm install
- Copy `.env.example` to `.env` and set `MONGODB_URI` if you want DB persistence.
- Start (production): npm start
- Start (dev with auto-reload): npm run dev

Try it
- Check service: curl http://localhost:3000/
- Create user (example):

curl -X POST http://localhost:3000/users -H "Content-Type: application/json" -d \
'{"userId":"121323-eefefd-1223232","name":"Test","email":"test@gmail.com","address":{"city":"Cali","country":"Colombia","zipCode":"760001","address":"calle 13 #65-40"},"phone":{"codeNumber":"+57","phoneNumber":3104156262}}'

Example User document
```
{
  "_id": "68dda55c9e85f946b3140262",
  "userId": "121323-eefefd-1223232",
  "name": "Test",
  "email": "test@gmail.com",
  "address": {
    "city": "Cali",
    "country": "Colombia",
    "zipCode": "760001",
    "address": "calle 13 #65-40"
  },
  "phone": {
    "codeNumber": "+57",
    "phoneNumber": 3104156262
  },
  "suspended": false,
  "deleted": false
}
```
