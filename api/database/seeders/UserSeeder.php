<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        $users = [
            [
                'email' => 'ahmed@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'email' => 'fatima@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'email' => 'mohammed@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'email' => 'leila@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'email' => 'karim@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'email' => 'samira@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'email' => 'youssef@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'email' => 'amina@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'email' => 'omar@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'email' => 'nadia@example.com',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }
    }
}
