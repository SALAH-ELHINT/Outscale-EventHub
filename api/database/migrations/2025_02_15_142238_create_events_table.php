<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('location');
            $table->dateTime('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->integer('max_participants');
            $table->integer('current_participants')->default(0);
            $table->foreignId('organizer_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['draft', 'published', 'cancelled', 'completed'])->default('draft');
            $table->foreignId('image_id')->nullable()->constrained('uploads')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
