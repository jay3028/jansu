# Jan Suraksha Frontend

National Last-Mile Trust & Verification Platform - Frontend

## Team - Wavelet Tree

**Team Members:**
- **Abhinav Rai** - Rajiv Gandhi Institute Of Petroleum Technology
- **Kunal Kumar** - Rajiv Gandhi Institute Of Petroleum Technology
- **Jay Kumar** - Rajiv Gandhi Institute Of Petroleum Technology

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- JavaScript (ES6+)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Run development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── auth/          # Authentication pages
│   ├── dashboard/     # Role-based dashboards
│   ├── verify/        # Agent verification
│   └── layout.js      # Root layout
├── components/        # Reusable components
├── hooks/             # Custom React hooks
└── services/          # API services
```

## Features

### Authentication
- Email + Password signup/login
- Mobile + OTP signup/login
- Role-based routing

### Dashboards
- **Citizen** - Verify agents, view history
- **Worker** - Profile management, QR code
- **Provider** - Worker management, onboarding
- **Police** - Agent search, verification, incidents
- **Admin** - System management, audit logs
- **Bank** - AePS safety checkpoint

### Verification
- QR code scanning
- Phone number lookup
- Universal Agent ID search
- Real-time trust status

## User Roles

1. **Citizen** - Verify agents before transactions
2. **Worker** - Manage profile, view status
3. **Provider** - Onboard and manage workers
4. **Bank** - AePS transaction safety
5. **Police** - Agent verification and incident logging
6. **Admin** - System administration

## Status Colors

- **Green** - Verified and safe
- **Yellow** - Caution / Pending
- **Red** - Suspended / High risk
