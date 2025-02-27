<?php

use App\Http\Controllers\EventController;
use App\Http\Controllers\EventCommentController;
use App\Http\Controllers\EventRatingController;
use App\Http\Controllers\EventParticipantController;
use App\Http\Controllers\EventCategoryController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;


Route::prefix('events')->name('events.')->group(function () {
    Route::get('/', [EventController::class, 'readAll'])->name('index');
    Route::get('/categories', [EventCategoryController::class, 'index'])->name('categories.index');
    Route::get('/{id}', [EventController::class, 'readOne'])->name('show');
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('dashboard')->name('dashboard.')->group(function () {
        Route::get('/registered-events', [DashboardController::class, 'getRegisteredEvents'])->name('registered-events');
        Route::get('/participant-events', [DashboardController::class, 'getAllParticipantEvents'])->name('participant-events');
        Route::get('/organized-events', [DashboardController::class, 'getOrganizedEvents'])->name('organized-events');
        Route::get('/statistics', [DashboardController::class, 'getEventStatistics'])->name('statistics');
        Route::get('/events/{eventId}/participants', [DashboardController::class, 'getEventParticipants'])->name('event-participants');
        Route::get('/upcoming-events', [DashboardController::class, 'getUpcomingEvents'])->name('upcoming-events');
        Route::get('/activity-summary', [DashboardController::class, 'getActivitySummary'])->name('activity-summary');
    });
});

Route::middleware(['auth:sanctum'])->prefix('events')->name('events.')->group(function () {
    Route::get('/categories', [EventCategoryController::class, 'index'])->name('categories.index');

    Route::post('/', [EventController::class, 'createOne'])->name('store');
    Route::put('/{id}', [EventController::class, 'updateOne'])->name('update');
    Route::get('/{id}/edit', [EventController::class, 'edit'])->name('edit');
    Route::delete('/{id}', [EventController::class, 'destroy'])->name('destroy');

    Route::post('/{id}/register', [EventController::class, 'register'])->name('register');
    Route::post('/{id}/unregister', [EventController::class, 'unregister'])->name('unregister');

    Route::get('/{id}/participants', [EventController::class, 'getParticipants'])->name('participants');
    Route::get('/{eventId}/participants', [EventParticipantController::class, 'index']);
    Route::get('/{eventId}/participants/{participantId}', [EventParticipantController::class, 'show']);
    Route::put('/{eventId}/participants/{participantId}/status', [EventParticipantController::class, 'updateStatus']);
    Route::put('/{eventId}/participants/{participantId}', [EventController::class, 'updateParticipantStatus'])->name('update-participant-status');

    Route::get('/{id}/comments', [EventCommentController::class, 'index'])->name('comments.index');
    Route::post('/{id}/comments', [EventCommentController::class, 'store'])->name('comments.store');
    Route::put('/{eventId}/comments/{commentId}', [EventCommentController::class, 'update'])->name('comments.update');
    Route::delete('/{eventId}/comments/{commentId}', [EventCommentController::class, 'destroy'])->name('comments.destroy');

    Route::get('/{id}/ratings', [EventRatingController::class, 'index'])->name('ratings.index');
    Route::post('/{id}/ratings', [EventRatingController::class, 'store'])->name('ratings.store');
    Route::put('/{eventId}/ratings/{ratingId}', [EventRatingController::class, 'update'])->name('ratings.update');
    Route::delete('/{eventId}/ratings/{ratingId}', [EventRatingController::class, 'destroy'])->name('ratings.destroy');
});
