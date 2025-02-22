<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\EventCategory;
use Illuminate\Database\Seeder;

class EventCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $categories = [
            [
                'name' => 'Technology',
                'description' => 'Events related to technology, programming, and digital innovation'
            ],
            [
                'name' => 'Business',
                'description' => 'Networking events, workshops, and business conferences'
            ],
            [
                'name' => 'Education',
                'description' => 'Training sessions, seminars, and educational workshops'
            ],
            [
                'name' => 'Entertainment',
                'description' => 'Social gatherings, performances, and entertainment events'
            ],
            [
                'name' => 'Science',
                'description' => 'Scientific conferences, research presentations, and discussions'
            ]
        ];

        foreach ($categories as $category) {
            EventCategory::firstOrCreate(
                ['name' => $category['name']],
                ['description' => $category['description']]
            );
        }
    }
}
