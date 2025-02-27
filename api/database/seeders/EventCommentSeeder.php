<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\EventComment;
use App\Models\EventParticipant;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class EventCommentSeeder extends Seeder
{
    public function run()
    {
        $comments = [
            // General positive comments
            "This event was fantastic! I enjoyed every minute of it.",
            "Great organization and wonderful atmosphere. Looking forward to the next one!",
            "One of the best events I've attended in Morocco. Highly recommended!",
            "The venue was perfect for this type of gathering. Well chosen!",
            "I learned so much during this event. Thank you to the organizers!",

            // Specific to cultural events
            "The traditional music performances were absolutely mesmerizing.",
            "I loved how this event showcased authentic Moroccan heritage.",
            "The cultural exchange opportunities at this event were invaluable.",
            "The exhibition of local crafts was impressive and beautifully arranged.",

            // Food related
            "The food tastings were exceptional - truly representing the best of Moroccan cuisine.",
            "I never knew Moroccan cuisine had so many regional variations. Eye-opening experience!",
            "The cooking demonstration was informative and entertaining.",

            // Business events
            "Met some great contacts during the networking session. Very productive event.",
            "The speakers were knowledgeable and the discussions were stimulating.",
            "Well-organized conference with excellent insights into the Moroccan market.",

            // Neutral/Suggestions
            "Good event overall, though the venue could have been larger.",
            "Enjoyed the program but wished there was more time for Q&A.",
            "Interesting concept, but the schedule was a bit too packed.",
            "The event was good, but I'd suggest better signage next time.",
            "Would have appreciated more translation services for international guests.",

            // Music events
            "The acoustics were perfect and the performers were world-class.",
            "This concert showcased the incredible talent in the Moroccan music scene.",
            "The fusion of traditional and modern sounds was brilliantly executed.",

            // Pre-event comments
            "Looking forward to attending this event! The program looks promising.",
            "Can't wait to participate. Will there be any workshop materials provided?",
            "Excited about this upcoming event. Hope the weather cooperates!",
            "Just registered and looking forward to meeting like-minded people.",
            "This is exactly the kind of event I've been waiting for in Morocco."
        ];

        $events = Event::all();

        foreach ($events as $event) {
            $participants = EventParticipant::where('event_id', $event->id)
                                           ->where('status', 'confirmed')
                                           ->orWhere('status', 'attended')
                                           ->get();

            $commentCount = rand(0, min(count($participants), 10));

            $selectedParticipants = $participants->random(min($commentCount, $participants->count()));

            foreach ($selectedParticipants as $participant) {
                $commentText = $comments[array_rand($comments)];

                $commentDate = $event->status === 'completed'
                    ? $event->date->copy()->addDays(rand(1, 5))
                    : Carbon::now()->subDays(rand(1, 10));

                if ($commentDate > Carbon::now()) {
                    $commentDate = Carbon::now();
                }

                EventComment::create([
                    'event_id' => $event->id,
                    'user_id' => $participant->user_id,
                    'content' => $commentText,
                    'created_at' => $commentDate,
                    'updated_at' => $commentDate
                ]);
            }

            if ($event->status === 'published') {
                $organizerComment = EventComment::create([
                    'event_id' => $event->id,
                    'user_id' => $event->organizer_id,
                    'content' => "Thank you all for your interest in this event! We're excited to host you and promise an unforgettable experience.",
                    'created_at' => Carbon::now()->subDays(rand(5, 15)),
                    'updated_at' => Carbon::now()->subDays(rand(5, 15))
                ]);
            }
        }
    }
}
