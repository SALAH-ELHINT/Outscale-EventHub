<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventRating;
use App\Models\EventParticipant;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class EventRatingSeeder extends Seeder
{
    public function run()
    {
        $ratingComments = [
            
            5 => [
                "Exceptional event! Everything was perfect from start to finish.",
                "Best event I've attended in Morocco. Impeccably organized.",
                "An absolute 5-star experience. Will definitely attend again next year.",
                "Outstanding organization, venue, and content. Exceeded all expectations.",
                "World-class event that perfectly showcased Moroccan culture and hospitality."
            ],

            
            4 => [
                "Great event overall. Only minor logistical issues prevented a perfect score.",
                "Very well organized and enjoyable. The content was excellent.",
                "Highly enjoyable experience. Just a few small things could be improved.",
                "Excellent event with good attention to detail. Looking forward to next time.",
                "Very good experience. The venue was perfect for this type of gathering."
            ],

            
            3 => [
                "Decent event but could use some improvements in organization.",
                "Average experience. Some parts were excellent while others needed work.",
                "Good concept but execution was somewhat lacking.",
                "The content was good but logistics could be better organized.",
                "Interesting event but fell short of expectations in some areas."
            ],

            
            2 => [
                "Disappointing experience overall. Many organizational issues.",
                "The concept was promising but the execution was poor.",
                "Too crowded and poorly managed. Expected much better.",
                "Several problems with scheduling and facilities. Needs improvement.",
                "Did not meet expectations. Would think twice before attending again."
            ],

            
            1 => [
                "Very disappointing. Would not recommend.",
                "Poorly organized with multiple serious issues.",
                "Complete waste of time and money. Avoid this event.",
                "Failed to deliver on any of its promises. Very frustrated.",
                "Terrible experience from start to finish. Never again."
            ]
        ];

        $events = Event::where('status', 'completed')->get();

        foreach ($events as $event) {
            $attendedParticipants = EventParticipant::where('event_id', $event->id)
                                                  ->where('status', 'attended')
                                                  ->get();

            $ratingCount = rand(min(count($attendedParticipants), 3), min(count($attendedParticipants), 8));

            $selectedParticipants = $attendedParticipants->random(min($ratingCount, $attendedParticipants->count()));

            foreach ($selectedParticipants as $participant) {
                $ratingValue = $this->getWeightedRating();
                $ratingComment = $ratingComments[$ratingValue][array_rand($ratingComments[$ratingValue])];

                $ratingDate = $event->date->copy()->addDays(rand(1, 7));

                if ($ratingDate > Carbon::now()) {
                    $ratingDate = Carbon::now();
                }

                EventRating::create([
                    'event_id' => $event->id,
                    'user_id' => $participant->user_id,
                    'rating' => $ratingValue,
                    'comment' => $ratingComment,
                    'created_at' => $ratingDate,
                    'updated_at' => $ratingDate
                ]);
            }
        }
    }

    private function getWeightedRating()
    {
        $rand = rand(1, 100);

        if ($rand <= 40) { 
            return 5;
        } elseif ($rand <= 70) { 
            return 4;
        } elseif ($rand <= 85) { 
            return 3;
        } elseif ($rand <= 95) { 
            return 2;
        } else { 
            return 1;
        }
    }
}
