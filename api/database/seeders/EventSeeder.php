<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Event;
use App\Models\EventCategory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $users = User::all();
        $categories = EventCategory::all();

        $events = [
            [
                'title' => 'Web Development Workshop',
                'description' => 'Learn the latest web development technologies and best practices',
                'location' => 'Tech Hub, Paris',
                'date' => Carbon::now()->addDays(30),
                'start_time' => '09:00',
                'end_time' => '17:00',
                'max_participants' => 50,
                'current_participants' => 0,
                'status' => 'published',
                'categories' => ['Technology', 'Education']
            ],
            [
                'title' => 'Startup Networking Event',
                'description' => 'Connect with fellow entrepreneurs and investors',
                'location' => 'Business Center, Lyon',
                'date' => Carbon::now()->addDays(45),
                'start_time' => '18:00',
                'end_time' => '21:00',
                'max_participants' => 100,
                'current_participants' => 0,
                'status' => 'published',
                'categories' => ['Business']
            ],
            [
                'title' => 'AI in Healthcare Conference',
                'description' => 'Exploring artificial intelligence applications in healthcare',
                'location' => 'Medical Institute, Marseille',
                'date' => Carbon::now()->addDays(60),
                'start_time' => '10:00',
                'end_time' => '16:00',
                'max_participants' => 200,
                'current_participants' => 0,
                'status' => 'published',
                'categories' => ['Technology', 'Science']
            ]
        ];

        foreach ($events as $eventData) {
            $categoryNames = $eventData['categories'];
            unset($eventData['categories']);

            $eventData['organizer_id'] = $users->random()->id;

            $event = Event::firstOrCreate(
                ['title' => $eventData['title']],
                $eventData
            );

            // Attach categories
            $eventCategories = $categories->filter(function($category) use ($categoryNames) {
                return in_array($category->name, $categoryNames);
            });
            $event->categories()->sync($eventCategories->pluck('id'));
        }
    }
}
