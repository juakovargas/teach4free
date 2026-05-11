<?php

namespace App\Http\Controllers;

use App\Models\Language;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\TeachingCategory;
use App\Models\TeachingOffer;
use App\Models\TeachingOfferApplication;
use App\Models\TeachingSubject;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_users' => User::query()->count(),
                'active_students' => StudentProfile::query()->where('is_active', true)->count(),
                'active_teachers' => TeacherProfile::query()->where('is_active', true)->count(),
                'teaching_offers' => TeachingOffer::query()->count(),
                'active_teaching_offers' => TeachingOffer::query()->where('is_active', true)->count(),
                'applications' => TeachingOfferApplication::query()->count(),
                'pending_applications' => TeachingOfferApplication::query()
                    ->where('status', TeachingOfferApplication::STATUS_PENDING)
                    ->count(),
                'categories' => TeachingCategory::query()->count(),
                'subjects' => TeachingSubject::query()->count(),
                'active_languages' => Language::query()->where('is_active', true)->count(),
                'reports' => 0,
                'reviews' => 0,
                'google_users' => User::query()->whereNotNull('google_id')->count(),
                'pending_teacher_verifications' => TeacherProfile::query()
                    ->where('is_active', true)
                    ->where('is_verified', false)
                    ->count(),
            ],
        ]);
    }
}
