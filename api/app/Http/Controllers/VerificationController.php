<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Log;

class VerificationController extends Controller
{
    public function verify(Request $request)
    {
        try {
            $userId = $request->query('id');
            $user = User::findOrFail($userId);

            if ($user->hasVerifiedEmail()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email already verified',
                    'redirect' => '/login'
                ]);
            }

            if ($user->markEmailAsVerified()) {
                event(new Verified($user));
            }

            return response()->json([
                'success' => true,
                'message' => 'Email verified successfully',
                'redirect' => '/login'
            ]);

        } catch (\Exception $e) {
            Log::error('Email verification error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification link',
                'redirect' => '/login'
            ], 400);
        }
    }

    public function resend(Request $request)
    {
        try {
            $user = $request->user();

            if ($user->hasVerifiedEmail()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email already verified'
                ]);
            }

            $user->sendEmailVerificationNotification();

            return response()->json([
                'success' => true,
                'message' => 'Verification link sent successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Resend verification error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to resend verification email'
            ], 500);
        }
    }
}
