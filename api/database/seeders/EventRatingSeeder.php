<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Event;
use App\Models\User;
use App\Models\EventRating;
use Illuminate\Database\Seeder;

class EventRatingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $events = Event::all();
        $users = User::all();

        $comments = [
            "Excellent event, very informative!",
            "Well organized and great speakers",
            "Good content but could be more interactive",
            "Wonderful networking opportunity",
            "Very practical and useful information",
            "Could have been better organized",
            "Outstanding event, exceeded expectations",
            "Good but room for improvement",
            "Very professional and informative",
            "Great value for time spent"
        ];

        foreach ($events as $event) {
            $ratingCount = rand(5, 15);

            for ($i = 0; $i < $ratingCount; $i++) {
                EventRating::firstOrCreate(
                    [
                        'event_id' => $event->id,
                        'user_id' => $users->random()->id
                    ],
                    [
                        'rating' => rand(3, 5),
                        'comment' => $comments[array_rand($comments)]
                    ]
                );
            }
        }
    }
}
