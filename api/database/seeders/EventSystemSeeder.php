<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EventSystemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $this->call([
            EventCategorySeeder::class,
            EventSeeder::class,
            EventParticipantSeeder::class,
            EventCommentSeeder::class,
            EventRatingSeeder::class,
        ]);
    }
}
