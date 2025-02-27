<?php

namespace Database\Seeders;

use App\Models\EventCategory;
use Illuminate\Database\Seeder;

class EventCategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            [
                'name' => 'Cultural Festival',
                'description' => 'Events celebrating Moroccan culture, traditions, and heritage'
            ],
            [
                'name' => 'Music Concert',
                'description' => 'Live performances featuring traditional and modern Moroccan music'
            ],
            [
                'name' => 'Food & Culinary',
                'description' => 'Moroccan cuisine tastings, cooking classes, and food festivals'
            ],
            [
                'name' => 'Art Exhibition',
                'description' => 'Showcases of Moroccan visual arts, paintings, and crafts'
            ],
            [
                'name' => 'Sports',
                'description' => 'Athletic competitions, tournaments, and sports events in Morocco'
            ],
            [
                'name' => 'Business & Networking',
                'description' => 'Professional gatherings, conferences, and business events'
            ],
            [
                'name' => 'Educational Workshop',
                'description' => 'Learning experiences, seminars, and knowledge-sharing events'
            ],
            [
                'name' => 'Charity',
                'description' => 'Fundraising and community service events supporting local causes'
            ],
            [
                'name' => 'Tourism',
                'description' => 'Events showcasing Moroccan travel destinations and experiences'
            ],
            [
                'name' => 'Technology',
                'description' => 'Tech conferences, hackathons, and innovation showcases in Morocco'
            ],
        ];

        foreach ($categories as $categoryData) {
            EventCategory::create($categoryData);
        }
    }
}
