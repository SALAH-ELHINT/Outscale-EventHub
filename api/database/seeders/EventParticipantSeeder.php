<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Event;
use App\Models\User;
use App\Models\EventParticipant;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class EventParticipantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $events = Event::all();
        $users = User::all();
        $statuses = ['pending', 'confirmed', 'cancelled', 'attended'];

        // Get the total number of available users
        $totalUsers = $users->count();

        foreach ($events as $event) {
            // Calculate maximum possible participants based on available users and event limit
            $maxPossibleParticipants = min($totalUsers, $event->max_participants);

            // Randomly select number of participants (between 1 and maxPossibleParticipants, max 5)
            $participantCount = rand(1, min(5, $maxPossibleParticipants));

            // Get random users, limiting by the calculated participant count
            $participants = $users->random($participantCount);

            foreach ($participants as $user) {
                $status = $statuses[array_rand($statuses)];

                EventParticipant::firstOrCreate(
                    [
                        'event_id' => $event->id,
                        'user_id' => $user->id
                    ],
                    [
                        'status' => $status,
                        'registration_date' => Carbon::now()->subDays(rand(1, 30))
                    ]
                );
            }

            // Update current_participants count for confirmed participants
            $confirmedCount = $event->participants()->where('status', 'confirmed')->count();
            $event->update(['current_participants' => $confirmedCount]);
        }
    }
}
