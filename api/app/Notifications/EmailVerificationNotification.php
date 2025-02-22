<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\HtmlString;

class EmailVerificationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    private string $frontendUrl;

    public function __construct()
    {
        $this->frontendUrl = config('app.frontend_url');
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Welcome to ' . config('app.name') . ' - Verify Your Email')
            ->view('emails.verify-email', [
                'url' => $verificationUrl,
                'appName' => config('app.name'),
                'expiresIn' => Config::get('auth.verification.expire', 60)
            ]);
    }

    protected function verificationUrl($notifiable): string
    {
        $backendUrl = URL::temporarySignedRoute(
            'auth.verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );

        // If frontend URL is configured, replace the backend URL with frontend URL
        if ($this->frontendUrl) {
            $parsedUrl = parse_url($backendUrl);
            return $this->frontendUrl . '/verify-email?' . ($parsedUrl['query'] ?? '');
        }

        return $backendUrl;
    }
}
