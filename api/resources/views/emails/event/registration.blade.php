<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Event Registration Confirmation</title>
    <style>
        .email-wrapper {
            background-color: #f8fafc;
            padding: 2rem;
            font-family: system-ui, -apple-system, sans-serif;
        }
        .email-container {
            background-color: white;
            border-radius: 0.5rem;
            padding: 2rem;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .event-title {
            color: #1a202c;
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }
        .event-details {
            background-color: #f7fafc;
            border-radius: 0.375rem;
            padding: 1rem;
            margin: 1rem 0;
        }
        .event-detail-item {
            margin-bottom: 0.5rem;
        }
        .button {
            display: inline-block;
            background-color: #4f46e5;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.375rem;
            text-decoration: none;
            font-weight: 600;
            margin: 1rem 0;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <h1>Event Registration Confirmation</h1>
            <p>Hello {{ $user->name }},</p>
            <p>You have successfully registered for the following event:</p>

            <div class="event-details">
                <h2 class="event-title">{{ $event->title }}</h2>
                <div class="event-detail-item">
                    <strong>Date:</strong> {{ $event->date->format('F j, Y') }}
                </div>
                <div class="event-detail-item">
                    <strong>Time:</strong> {{ $event->start_time->format('g:i A') }} - {{ $event->end_time->format('g:i A') }}
                </div>
                <div class="event-detail-item">
                    <strong>Location:</strong> {{ $event->location }}
                </div>
            </div>

            <p>Your registration status is currently: <strong>{{ $participant->status }}</strong></p>

            <p>You will receive updates about any changes to your registration status.</p>

            <a href="{{ config('app.frontend_url') }}/events/{{ $event->id }}" class="button">
                View Event Details
            </a>
        </div>
    </div>
</body>
</html>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Event Registration Status Update</title>
    <style>
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <h1>Event Registration Status Update</h1>
            <p>Hello {{ $user->name }},</p>
            <p>Your registration status for the following event has been updated:</p>

            <div class="event-details">
                <h2 class="event-title">{{ $event->title }}</h2>
                <div class="event-detail-item">
                    <strong>Date:</strong> {{ $event->date->format('F j, Y') }}
                </div>
                <div class="event-detail-item">
                    <strong>Time:</strong> {{ $event->start_time->format('g:i A') }} - {{ $event->end_time->format('g:i A') }}
                </div>
                <div class="event-detail-item">
                    <strong>Location:</strong> {{ $event->location }}
                </div>
            </div>

            <p>Your registration status has been changed from <strong>{{ $oldStatus }}</strong> to <strong>{{ $newStatus }}</strong>.</p>

            <a href="{{ config('app.frontend_url') }}/events/{{ $event->id }}" class="button">
                View Event Details
            </a>
        </div>
    </div>
</body>
</html>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Event Registration Cancelled</title>
    <style>
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <h1>Event Registration Cancelled</h1>
            <p>Hello {{ $user->name }},</p>
            <p>Your registration for the following event has been cancelled:</p>

            <div class="event-details">
                <h2 class="event-title">{{ $event->title }}</h2>
                <div class="event-detail-item">
                    <strong>Date:</strong> {{ $event->date->format('F j, Y') }}
                </div>
                <div class="event-detail-item">
                    <strong>Time:</strong> {{ $event->start_time->format('g:i A') }} - {{ $event->end_time->format('g:i A') }}
                </div>
                <div class="event-detail-item">
                    <strong>Location:</strong> {{ $event->location }}
                </div>
            </div>

            <p>If you did not request this cancellation, please contact the event organizer.</p>

            <a href="{{ config('app.frontend_url') }}/events" class="button">
                Browse Other Events
            </a>
        </div>
    </div>
</body>
</html>
