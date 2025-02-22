<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - {{ config('app.name') }}</title>
    <style>
        .email-wrapper {
            background-color: #f8fafc;
            padding: 2rem;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .email-container {
            background-color: white;
            border-radius: 0.5rem;
            padding: 2rem;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 2rem;
        }
        .logo {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            margin-bottom: 1rem;
        }
        .title {
            color: #1a202c;
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 1.5rem;
        }
        .content {
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 2rem;
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
        .button:hover {
            background-color: #4338ca;
        }
        .footer {
            text-align: center;
            color: #718096;
            font-size: 0.875rem;
            margin-top: 2rem;
        }
        .help-text {
            color: #718096;
            font-size: 0.875rem;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="header">
                <img src="{{ config('app.url') }}/images/logo.png" alt="{{ config('app.name') }}" class="logo">
                <h1 class="title">Verify Your Email Address</h1>
            </div>

            <div class="content">
                <p>Hello!</p>
                <p>Thank you for registering with {{ config('app.name') }}. We're excited to have you join us!</p>
                <p>Please click the button below to verify your email address:</p>

                <center>
                    <a href="{{ $url }}" class="button">Verify Email Address</a>
                </center>

                <p class="help-text">If you're having trouble clicking the button, copy and paste this URL into your browser:</p>
                <p class="help-text">{{ $url }}</p>

                <p class="help-text">If you did not create an account, no further action is required.</p>
            </div>

            <div class="footer">
                <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
