<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class EventSeeder extends Seeder
{
    public function run()
    {
        $events = [
            [
                'title' => 'Marrakech International Film Festival',
                'description' => 'A celebration of Moroccan and international cinema featuring screenings, workshops, and celebrity appearances in the historic city of Marrakech.',
                'location' => 'Palais des Congrès, Marrakech',
                'date' => Carbon::now()->addDays(30),
                'start_time' => '10:00',
                'end_time' => '22:00',
                'max_participants' => 500,
                'current_participants' => 320,
                'organizer_id' => 1,
                'status' => 'published',
                'categories' => [1, 4],
            ],
            [
                'title' => 'Fez Sacred Music Festival',
                'description' => 'An annual music festival celebrating spiritual and traditional music from around the world held in the ancient medina of Fez.',
                'location' => 'Bab Al Makina, Fez',
                'date' => Carbon::now()->addDays(15),
                'start_time' => '18:00',
                'end_time' => '23:00',
                'max_participants' => 300,
                'current_participants' => 150,
                'organizer_id' => 2,
                'status' => 'published',
                'categories' => [1, 2],
            ],
            [
                'title' => 'Casablanca Tech Summit',
                'description' => 'The largest technology gathering in Morocco bringing together startups, entrepreneurs, investors, and tech enthusiasts.',
                'location' => 'Hyatt Regency, Casablanca',
                'date' => Carbon::now()->addDays(45),
                'start_time' => '09:00',
                'end_time' => '18:00',
                'max_participants' => 250,
                'current_participants' => 180,
                'organizer_id' => 3,
                'status' => 'published',
                'categories' => [6, 10],
            ],
            [
                'title' => 'Agadir Beach Volleyball Tournament',
                'description' => 'Annual beach volleyball competition featuring teams from across Morocco and international guests.',
                'location' => 'Agadir Beach, Agadir',
                'date' => Carbon::now()->addDays(20),
                'start_time' => '09:00',
                'end_time' => '17:00',
                'max_participants' => 200,
                'current_participants' => 120,
                'organizer_id' => 4,
                'status' => 'published',
                'categories' => [5],
            ],
            [
                'title' => 'Tangier Culinary Week',
                'description' => 'A week-long celebration of Northern Moroccan cuisine with cooking demonstrations, tastings, and food tours.',
                'location' => 'Various locations, Tangier',
                'date' => Carbon::now()->addDays(10),
                'start_time' => '11:00',
                'end_time' => '21:00',
                'max_participants' => 150,
                'current_participants' => 100,
                'organizer_id' => 5,
                'status' => 'published',
                'categories' => [3],
            ],
            [
                'title' => 'Rabat Art Biennale',
                'description' => 'Biennial exhibition showcasing contemporary Moroccan and international art across various venues in Rabat.',
                'location' => 'Mohammed VI Museum of Modern Art, Rabat',
                'date' => Carbon::now()->addDays(60),
                'start_time' => '10:00',
                'end_time' => '19:00',
                'max_participants' => 400,
                'current_participants' => 0,
                'organizer_id' => 6,
                'status' => 'draft',
                'categories' => [4],
            ],
            [
                'title' => 'Essaouira Gnaoua Music Festival',
                'description' => 'World-renowned festival celebrating Gnaoua music and culture with performances throughout the coastal city.',
                'location' => 'Moulay Hassan Square, Essaouira',
                'date' => Carbon::now()->subDays(30),
                'start_time' => '16:00',
                'end_time' => '02:00',
                'max_participants' => 600,
                'current_participants' => 580,
                'organizer_id' => 7,
                'status' => 'completed',
                'categories' => [1, 2],
            ],
            [
                'title' => 'Chefchaouen Photography Workshop',
                'description' => 'Learn photography techniques while exploring the famous blue streets of Chefchaouen with professional photographers.',
                'location' => 'Chefchaouen Medina',
                'date' => Carbon::now()->addDays(5),
                'start_time' => '09:00',
                'end_time' => '17:00',
                'max_participants' => 15,
                'current_participants' => 15,
                'organizer_id' => 8,
                'status' => 'published',
                'categories' => [4, 7],
            ],
            [
                'title' => 'Oujda Business Forum',
                'description' => 'Annual economic conference focusing on cross-border trade and business opportunities in Eastern Morocco.',
                'location' => 'Chamber of Commerce, Oujda',
                'date' => Carbon::now()->addDays(25),
                'start_time' => '08:30',
                'end_time' => '16:30',
                'max_participants' => 100,
                'current_participants' => 65,
                'organizer_id' => 9,
                'status' => 'published',
                'categories' => [6],
            ],
            [
                'title' => 'Atlas Mountains Charity Trek',
                'description' => 'Group hiking expedition raising funds for local education initiatives in rural mountain communities.',
                'location' => 'Imlil, High Atlas Mountains',
                'date' => Carbon::now()->addDays(40),
                'start_time' => '07:00',
                'end_time' => '19:00',
                'max_participants' => 30,
                'current_participants' => 12,
                'organizer_id' => 10,
                'status' => 'published',
                'categories' => [8, 9],
            ],
            [
                'title' => 'Meknes Olive Festival',
                'description' => 'Celebration of olive harvesting season with tastings, demonstrations, and traditional ceremonies.',
                'location' => 'Place El Hedim, Meknes',
                'date' => Carbon::now()->addDays(70),
                'start_time' => '10:00',
                'end_time' => '20:00',
                'max_participants' => 200,
                'current_participants' => 0,
                'organizer_id' => 1,
                'status' => 'draft',
                'categories' => [1, 3],
            ],
            [
                'title' => 'Ouarzazate Film Studio Tours',
                'description' => 'Special guided tours of the famous film studios where numerous Hollywood blockbusters were filmed.',
                'location' => 'Atlas Studios, Ouarzazate',
                'date' => Carbon::now()->subDays(10),
                'start_time' => '09:00',
                'end_time' => '16:00',
                'max_participants' => 50,
                'current_participants' => 32,
                'organizer_id' => 2,
                'status' => 'cancelled',
                'categories' => [9],
            ],
        ];

        foreach ($events as $eventData) {
            $categories = $eventData['categories'];
            unset($eventData['categories']);

            $event = Event::create($eventData);

            foreach ($categories as $categoryId) {
                DB::table('event_category_relationships')->insert([
                    'event_id' => $event->id,
                    'category_id' => $categoryId
                ]);
            }
        }
    }
}
