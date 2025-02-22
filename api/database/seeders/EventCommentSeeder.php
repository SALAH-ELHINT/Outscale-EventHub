<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Event;
use App\Models\User;
use App\Models\EventComment;
use Illuminate\Database\Seeder;

class EventCommentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $events = Event::all();
        $users = User::all();

        $comments = [
            "Looking forward to this event!",
            "Great initiative, can't wait to attend.",
            "Will there be any online streaming option?",
            "The agenda looks very interesting.",
            "Is parking available at the venue?",
            "Are presentations going to be shared afterwards?",
            "This is exactly what I've been looking for!",
            "Will there be networking opportunities?",
            "Excited to learn from the experts!",
            "The topic selection is excellent."
        ];

        foreach ($events as $event) {
            $commentCount = rand(3, 8);

            for ($i = 0; $i < $commentCount; $i++) {
                EventComment::firstOrCreate(
                    [
                        'event_id' => $event->id,
                        'user_id' => $users->random()->id,
                        'content' => $comments[array_rand($comments)]
                    ]
                );
            }
        }
    }
}
