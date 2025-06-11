<div align="center">
  <img src="assets/icon.svg" alt="icon" width="128"/>
</div>
<h1 align="center">Earned Shine Detailing</h1>
<div align="center">
  <a href="https://nextjs.org/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/Next.js-black?logo=next.js" alt="Next.js"></a>
  <a href="https://reactjs.org/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB" alt="React"></a>
  <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://spring.io/projects/spring-boot" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/Spring_Boot-6DB33F?logo=spring-boot&logoColor=white" alt="Spring Boot"></a>
  <a href="https://openjdk.org/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/Java-ED8B00?logo=java&logoColor=white" alt="Java"></a>
  <a href="https://stripe.com/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/Stripe-635BFF?logo=stripe&logoColor=white" alt="Stripe"></a>
  <a href="https://tailwindcss.com/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS"></a>
  <a href="https://www.framer.com/motion/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/Framer%20Motion-black?logo=framer&logoColor=white" alt="Framer Motion"></a>
  <a href="https://developers.google.com/gmail/api" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/Gmail_API-D14836?logo=gmail&logoColor=white" alt="Gmail API"></a>
  <a href="https://aws.amazon.com/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/AWS-232F3E?logo=amazon-aws&logoColor=white" alt="AWS"></a>
  <a href="https://www.docker.com/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" alt="Docker"></a>
  <a href="https://vercel.com/" target="_blank" rel="noreferrer"><img src="https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white" alt="Vercel"></a>
</div>

---


A premium car detailing service platform that connects customers with professional mobile car detailing services. 

## Live Website

- [https://earnedshine.com](https://earnedshine.com)

## Features

- **Mobile Car Detailing Services** - Three service tiers from basic shine to signature packages
- **Online Booking System** - Real-time availability checking and appointment scheduling
- **Payment Processing** - Secure payments via Stripe with online and in-person options
- **Email Automation** - Booking confirmations and notifications via Gmail API
- **Admin Dashboard** - Comprehensive booking management and business analytics
- **Calendar Integration** - Automatic calendar invites for appointments

## Tech Stack

### Frontend

- **Next.js** - Utilizes the App Router for server-side rendering, API routes as a proxy to the backend, and full type safety with TypeScript
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **Shadcn**

### Backend

- **Spring Boot** - REST API development with authentication (Spring Security) and web support (Spring Web)
- **Java**
- **Amazon DynamoDB** - Database for booking/user data
- **AWS Cognito** - Authentication and authorization for admin dashboard
- **Stripe** - Payment processing, webhooks
- **Gmail API** - Email automation
- **Google OAuth2**

### DevOps & Deployment

- **Docker** - Containerization for consistent deployments
- **Amazon ECS** - Container orchestration and management
- **Amazon EC2** - Cloud compute instances for hosting
- **Vercel** - Frontend deployment and hosting

## API Endpoints

### Public Endpoints

- `GET /api/availability/slots/{date}` - Get available time slots
- `GET /api/availability/{date}` - Detailed availability for a date
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/{id}` - Get booking by ID
- `GET /api/bookings` - List all bookings
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Cancel booking
- `POST /api/stripe/create-checkout-session` - Create Stripe checkout session
- `POST /api/stripe/webhook` - Stripe webhook handler

### Admin Endpoints

- `GET /api/admin/stats` - Booking statistics
- `GET /api/admin/bookings` - All bookings
- `PUT /api/admin/bookings/{bookingId}` - Update booking status
- `PUT /api/admin/bookings/{bookingId}/hide` - Hide booking
- `POST /api/admin/bookings/{bookingId}/cancel` - Cancel booking
- `DELETE /api/admin/bookings/cleanup` - Cleanup canceled bookings
- `GET /api/admin/me` - Current admin info

### Additional Endpoints

- `GET /api/auth/login-url` - Cognito login URL
- `GET /api/auth/logout-url` - Cognito logout URL
- `GET /api/auth/status` - Authentication status
- `GET /api/gmail-auth/auth-url` - Gmail OAuth URL
- `POST /api/gmail-auth/callback` - Gmail OAuth callback
- `POST /api/gmail-auth/test-email` - Send a test email

## Project Structure

```text
earnedshine/
├── client/
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/
│   │   │   ├── api/
│   │   │   │   ├── admin/
│   │   │   │   ├── auth/
│   │   │   │   ├── availability/
│   │   │   │   ├── bookings/
│   │   │   │   └── stripe/
│   │   │   ├── booking/
│   │   │   ├── success/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   ├── components/
│   │   ├── admin/
│   │   ├── booking/
│   │   ├── landing/
│   │   ├── layout/
│   │   └── ui/
│   ├── lib/
│   ├── types/
│   ├── public/
│   │   └── images/
│   ├── package.json
│   └── next.config.ts
│
└── server/
    ├── src/
    │   └── main/
    │       ├── java/
    │       │   └── com/
    │       │       └── detailing/
    │       │           ├── config/
    │       │           ├── controller/
    │       │           ├── model/
    │       │           ├── repository/
    │       │           ├── service/
    │       │           └── util/
    │       └── resources/
    │           └── application.yml
    ├── Dockerfile
    ├── mvnw
    ├── mvnw.cmd
    └── pom.xml
```

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Viper-Industries/earnedshine.git
   cd earnedshine
   ```

2. **Install frontend dependencies**

   ```bash
   cd client
   npm install
   ```

3. **Build the backend**

   ```bash
   cd server
   ./mvnw clean install
   ```

4. **Run the development servers**

   Frontend:

   ```bash
   cd client
   npm run dev
   ```

   Backend:

   ```bash
   cd server
   ./mvnw spring-boot:run
   ```

## Configuration

### Frontend Environment (.env.local)

```ini
BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

### Backend Environment (application.yml or environment variables)

```yaml
# Server
server.port=8080
frontend.url=http://localhost:3000

# AWS
aws.region=us-east-2

# Stripe
stripe.api.key=your-stripe-secret-key
stripe.webhook.secret=your-webhook-secret

# Cognito/OAuth
cognito.domain=your-cognito-domain
spring.security.oauth2.client.registration.cognito.client-id=your-cognito-client-id
spring.security.oauth2.client.registration.cognito.client-secret=your-cognito-client-secret
spring.security.oauth2.client.provider.cognito.issuer-uri=your-cognito-issuer-uri

# JWT
app.jwt.secret=your-jwt-secret

# Gmail API
gmail.client-id=your-gmail-client-id
gmail.client-secret=your-gmail-client-secret
gmail.redirect-uri=http://localhost:8080/oauth2callback
gmail.refresh-token=your-refresh-token
gmail.from-email=your-business-email@gmail.com
gmail.from-name=Earned Shine Detailing

# DynamoDB
dynamodb.table-name.bookings=bookings
```
