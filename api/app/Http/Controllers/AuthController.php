<?php

namespace App\Http\Controllers;

use App\Enums\ROLE;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function me(Request $request)
    {
        try {
            $user = Auth::user();
            if (! $user) {
                return response()->json(['success' => false, 'errors' => [__('auth.user_not_found')]]);
            }
            $admin = $request->input('admin');
            if ($admin && ! $user->hasRole(ROLE::ADMIN)) {
                return response()->json(['success' => false, 'errors' => [__('auth.not_admin')]]);
            }

            return response()->json(
                [
                    'success' => true,
                    'data' => [
                        'user' => $user,
                    ],
                ]
            );
        } catch (\Exception $e) {
            Log::error('Error caught in function AuthController.me: '.$e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json(['success' => false, 'errors' => [__('common.unexpected_error')]]);
        }
    }

    public function login(LoginRequest $request)
    {
        try {
            $user = User::where('email', $request->input('email'))->first();

            if (!$user || !Hash::check($request->input('password'), $user->password)) {
                return response()->json([
                    'success' => false,
                    'errors' => [__('auth.failed')]
                ]);
            }

            $admin = $request->input('admin');
            if ($admin && !$user->hasRole(ROLE::ADMIN)) {
                return response()->json([
                    'success' => false,
                    'errors' => [__('auth.not_admin')]
                ]);
            }

            $token = $user->createToken('authToken', ['expires_in' => 60 * 24 * 30])->plainTextToken;

            $user->update(['last_login_at' => now()]);

            return response()->json([
                'success' => true,
                'data' => [
                    'token' => $token,
                    'user' => $user
                ],
                'message' => __('auth.login_success')
            ]);
        } catch (\Exception $e) {
            Log::error('Error in AuthController.login: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json([
                'success' => false,
                'errors' => [__('common.unexpected_error')]
            ]);
        }
    }

    public function register(RegisterRequest $request)
    {
        try {
            return DB::transaction(function () use ($request) {
                $user = User::create([
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'name' => $request->name
                ]);

                $user->assignRole(ROLE::USER);

                try {
                    $user->sendEmailVerificationNotification();
                    Log::info('Verification email sent to: ' . $user->email);
                } catch (\Exception $e) {
                    Log::error('Failed to send verification email: ' . $e->getMessage());
                }

                $token = $user->createToken('authToken')->plainTextToken;

                return response()->json([
                    'success' => true,
                    'data' => [
                        'token' => $token,
                        'user' => $user
                    ],
                    'message' => 'Registration successful. Please check your email to verify your account.'
                ]);
            });
        } catch (\Exception $e) {
            Log::error('Registration error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                
            ], 500);
        }
    }

    public function logout()
    {
        try {
            $user = Auth::user();
            $user->tokens()->delete();

            return response()->json(['success' => true, 'message' => __('auth.logout_success')]);
        } catch (\Exception $e) {
            Log::error('Error caught in function AuthController.logout: '.$e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json(['success' => false, 'errors' => [__('common.unexpected_error')]]);
        }
    }

    public function requestPasswordReset(Request $request)
    {
        try {
            $email = $request->email;
            $status = Password::sendResetLink(['email' => $email]);
            if ($status === Password::RESET_LINK_SENT) {
                return response()->json(['success' => true, 'message' => __('auth.password_reset_link_sent')]);
            } elseif ($status === Password::INVALID_USER) {
                return response()->json(['success' => false, 'errors' => [__('users.not_found')]]);
            } elseif ($status === Password::INVALID_TOKEN) {
                return response()->json(['success' => false, 'errors' => [__('auth.invalid_token')]]);
            } elseif ($status === Password::RESET_THROTTLED) {
                return response()->json(['success' => false, 'errors' => [__('auth.reset_throttled')]]);
            }

            return response()->json(['success' => false, 'errors' => [__('common.unexpected_error')]]);
        } catch (\Exception $e) {
            Log::error('Error caught in function AuthController.requestPasswordReset: '.$e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json(['success' => false, 'errors' => [__('common.unexpected_error')]]);
        }
    }

    public function resetPassword(Request $request)
    {
        try {
            return DB::transaction(
                function () use ($request) {
                    $status = Password::reset(
                        $request->only('email', 'password', 'password_confirmation', 'token'),
                        function ($user, $password) {
                            $user->password = Hash::make($password);
                            $user->save();
                        }
                    );
                    if ($status === Password::PASSWORD_RESET) {
                        return response()->json(['success' => true, 'message' => __('auth.password_reset_success')]);
                    } elseif ($status === Password::INVALID_USER) {
                        return response()->json(['success' => false, 'errors' => [__('users.not_found')]]);
                    } elseif ($status === Password::INVALID_TOKEN) {
                        return response()->json(['success' => false, 'errors' => [__('auth.invalid_token')]]);
                    } elseif ($status === Password::RESET_THROTTLED) {
                        return response()->json(['success' => false, 'errors' => [__('auth.reset_throttled')]]);
                    }

                    return response()->json(['success' => false, 'errors' => [__('common.unexpected_error')]]);
                }
            );
        } catch (\Exception $e) {
            Log::error('Error caught in function AuthController.resetPassword: '.$e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json(['success' => false, 'errors' => [__('common.unexpected_error')]]);
        }
    }
}
