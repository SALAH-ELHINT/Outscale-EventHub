<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventParticipant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class EventParticipantSeeder extends Seeder
{
    public function run()
    {
        $users = User::all();
        $events = Event::all();

        $statuses = ['pending', 'confirmed', 'cancelled', 'attended'];

        foreach ($events as $event) {
            if ($event->status === 'completed') {
                $usersForEvent = $users->random(min(8, $users->count()));
                foreach ($usersForEvent as $index => $user) {
                    if ($user->id !== $event->organizer_id) {
                        $status = $index < 6 ? 'attended' : 'cancelled';
                        $this->createParticipant($event, $user, $status);
                    }
                }
            } elseif ($event->status === 'cancelled') {
                $usersForEvent = $users->random(min(5, $users->count()));
                foreach ($usersForEvent as $user) {
                    if ($user->id !== $event->organizer_id) {
                        $this->createParticipant($event, $user, 'cancelled');
                    }
                }
            } elseif ($event->status === 'published') {
                $confirmedCount = $event->current_participants;
                $pendingCount = rand(2, 5);
                $cancelledCount = rand(1, 3);

                $totalParticipants = $confirmedCount + $pendingCount + $cancelledCount;
                $usersForEvent = $users->random(min($totalParticipants, $users->count()));

                $userIndex = 0;

                for ($i = 0; $i < $confirmedCount && $userIndex < count($usersForEvent); $i++) {
                    $user = $usersForEvent[$userIndex];
                    if ($user->id !== $event->organizer_id) {
                        $this->createParticipant($event, $user, 'confirmed');
                        $userIndex++;
                    }
                }

                for ($i = 0; $i < $pendingCount && $userIndex < count($usersForEvent); $i++) {
                    $user = $usersForEvent[$userIndex];
                    if ($user->id !== $event->organizer_id) {
                        $this->createParticipant($event, $user, 'pending');
                        $userIndex++;
                    }
                }

                for ($i = 0; $i < $cancelledCount && $userIndex < count($usersForEvent); $i++) {
                    $user = $usersForEvent[$userIndex];
                    if ($user->id !== $event->organizer_id) {
                        $this->createParticipant($event, $user, 'cancelled');
                        $userIndex++;
                    }
                }
            }
        }
    }

    private function createParticipant($event, $user, $status)
    {
        $registrationDate = $event->date->copy()->subDays(rand(1, 30));

        if ($registrationDate > Carbon::now()) {
            $registrationDate = Carbon::now();
        }

        EventParticipant::create([
            'event_id' => $event->id,
            'user_id' => $user->id,
            'status' => $status,
            'registration_date' => $registrationDate
        ]);
    }
}
