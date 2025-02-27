<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class EventSystemSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            UserSeeder::class,
            EventCategorySeeder::class,
            EventSeeder::class,
            EventParticipantSeeder::class,
            EventCommentSeeder::class,
            EventRatingSeeder::class,
        ]);
    }
}
