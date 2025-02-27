# EventHub

EventHub is a full-stack event management platform built with Laravel (Backend) and Next.js (Frontend). The system allows users to create, manage, and participate in events with features like real-time updates and email notifications.

## Table of Contents
- [Requirements](#requirements)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Features](#features)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Configuration](#configuration)
- [Testing](#testing)

## Requirements

### Backend
- PHP >= 8.1
- Laravel 10.x
- MySQL 8.0+
- Composer

### Frontend
- Node.js >= 16
- Next.js 13+
- TypeScript
- Material-UI

## Installation

### Backend Setup

1. Clone the repository:
```bash
git clone git@github.com:SALAH-ELHINT/Outscale-EventHub.git
cd eventhub-backend
```

2. Install dependencies:
```bash
composer install
```

3. Set up environment file:
```bash
cp .env.example .env
```

4. Configure your .env file with:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=eventhub
DB_USERNAME=your_username
DB_PASSWORD=your_password

MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
```

5. Generate application key:
```bash
php artisan key:generate
```

6. Run migrations and seeders:
```bash
php artisan migrate --seed
```

### Frontend Setup

1. Clone the repository:
```bash
git clone git@github.com:SALAH-ELHINT/Outscale-EventHub.git
cd eventhub-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env.local
```

4. Update .env.local with your backend URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

5. Start development server:
```bash
npm run dev
```

## Project Structure

### Backend Structure
```
app/
├── Http/
│   ├── Controllers/
│   │   ├── EventController.php
│   │   ├── AuthController.php
│   │   └── DashboardController.php
│   ├── Requests/
│   └── Resources/
├── Models/
│   ├── Event.php
│   ├── User.php
│   └── EventParticipant.php
├── Notifications/
└── Services/
```

### Frontend Structure
```
src/
├── components/
│   ├── events/
│   ├── dashboard/
│   └── shared/
├── pages/
│   ├── events/
│   ├── dashboard/
│   └── auth/
└── styles/
```

## Features

### Authentication
- User registration with email verification
- Login system
- Password reset functionality

### Event Management
- Create, edit, and delete events
- Event status management (Draft, Published, Cancelled, Completed)
- Participant management
- Event categories

### Dashboard
- Event statistics
- Participant tracking
- Upcoming events overview

### Notifications
- Email notifications for registration and updates
- In-app notifications

## API Documentation

### Authentication Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
```

### Event Endpoints
```
GET    /api/events
POST   /api/events
GET    /api/events/{id}
PUT    /api/events/{id}
DELETE /api/events/{id}
POST   /api/events/{id}/register
```

### Dashboard Endpoints
```
GET /api/dashboard/stats
GET /api/dashboard/upcoming-events
GET /api/dashboard/registered-events
```

## Database

### Key Tables
- users
- events
- event_participants
- event_categories
- event_comments
- event_ratings
- uploads

### Event Statuses
- Draft
- Published
- Cancelled
- Completed

### Participant Statuses
- Pending
- Confirmed
- Cancelled
- Attended

## Configuration

### Email Configuration (Mailtrap)
1. Create a Mailtrap account
2. Get SMTP credentials
3. Update .env file with credentials

4. Update filesystem config in config/filesystems.php

## Testing

### Backend Testing
```bash
php artisan test
```

### Frontend Testing
```bash
npm run test
```
