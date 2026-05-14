<?php

use App\Http\Controllers\Admin\AnalyticsController as AdminAnalyticsController;
use App\Http\Controllers\Admin\CalendarOverviewController as AdminCalendarOverviewController;
use App\Http\Controllers\Admin\CategoryProposalController as AdminCategoryProposalController;
use App\Http\Controllers\Admin\CookieSettingsController as AdminCookieSettingsController;
use App\Http\Controllers\Admin\ImpersonationController as AdminImpersonationController;
use App\Http\Controllers\Admin\IncidentController as AdminIncidentController;
use App\Http\Controllers\Admin\LanguageController as AdminLanguageController;
use App\Http\Controllers\Admin\PlaceholderController as AdminPlaceholderController;
use App\Http\Controllers\Admin\PlatformSettingsController as AdminPlatformSettingsController;
use App\Http\Controllers\Admin\SessionController as AdminSessionController;
use App\Http\Controllers\Admin\StudentController as AdminStudentController;
use App\Http\Controllers\Admin\SubjectProposalController as AdminSubjectProposalController;
use App\Http\Controllers\Admin\TeacherController as AdminTeacherController;
use App\Http\Controllers\Admin\TeachingCategoryController as AdminTeachingCategoryController;
use App\Http\Controllers\Admin\TeachingOfferApplicationController as AdminTeachingOfferApplicationController;
use App\Http\Controllers\Admin\TeachingOfferController as AdminTeachingOfferController;
use App\Http\Controllers\Admin\TeachingSubjectController as AdminTeachingSubjectController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\WorldMapController as AdminWorldMapController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\ContentPageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\LocaleController;
use App\Http\Controllers\MySessionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\NotificationPreferenceController;
use App\Http\Controllers\ProfilePreferencesController;
use App\Http\Controllers\PublicOfferController;
use App\Http\Controllers\PublicTeacherController;
use App\Http\Controllers\StudentApplicationController;
use App\Http\Controllers\StudentProfileController;
use App\Http\Controllers\SupportReportController;
use App\Http\Controllers\TeacherApplicationController;
use App\Http\Controllers\TeacherApplicationSessionController;
use App\Http\Controllers\TeacherAvailabilityController;
use App\Http\Controllers\TeacherOfferController;
use App\Http\Controllers\TeacherProfileController;
use App\Http\Controllers\TeacherProposalController;
use App\Http\Controllers\TeacherSessionController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::inertia('/about', 'about')->name('about');
Route::get('/terms', [ContentPageController::class, 'terms'])->name('terms');
Route::get('/privacy', [ContentPageController::class, 'privacy'])->name('privacy');
Route::get('/cookie-policy', [ContentPageController::class, 'cookiePolicy'])->name('cookie-policy');
Route::get('/community-guidelines', [ContentPageController::class, 'communityGuidelines'])->name('community-guidelines');
Route::get('/teacher-guidelines', [ContentPageController::class, 'teacherGuidelines'])->name('teacher-guidelines');
Route::get('/free-learning-rules', [ContentPageController::class, 'freeLearningRules'])->name('free-learning-rules');

Route::get('/teachers', [PublicTeacherController::class, 'index'])->name('teachers.index');
Route::get('/teachers/{user}', [PublicTeacherController::class, 'show'])->name('teachers.show');
Route::get('/offers', [PublicOfferController::class, 'index'])->name('offers.index');
Route::get('/offers/{offer}', [PublicOfferController::class, 'show'])->name('offers.show');
Route::get('/support/report', [SupportReportController::class, 'create'])->name('support.report.create');
Route::post('/support/report', [SupportReportController::class, 'store'])->name('support.report.store');

Route::post('/locale', [LocaleController::class, 'update'])->name('locale.update');

Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::post('offers/{offer}/apply', [StudentApplicationController::class, 'store'])->name('offers.apply');

    Route::get('my-applications', [StudentApplicationController::class, 'index'])->name('my-applications.index');
    Route::patch('my-applications/{application}/cancel', [StudentApplicationController::class, 'cancel'])->name('my-applications.cancel');
    Route::get('my-sessions', [MySessionController::class, 'index'])->name('my-sessions.index');
    Route::patch('my-sessions/{session}/cancel', [MySessionController::class, 'cancel'])->name('my-sessions.cancel');

    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'read'])->name('notifications.read');
    Route::post('admin/impersonation/stop', [AdminImpersonationController::class, 'stop'])->name('admin.impersonation.stop');

    Route::get('profile/preferences', [ProfilePreferencesController::class, 'edit'])->name('profile.preferences.edit');
    Route::put('profile/preferences', [ProfilePreferencesController::class, 'update'])->name('profile.preferences.update');
    Route::post('profile/preferences/avatar', [ProfilePreferencesController::class, 'updateAvatar'])->name('profile.preferences.avatar.update');
    Route::delete('profile/preferences/avatar', [ProfilePreferencesController::class, 'destroyAvatar'])->name('profile.preferences.avatar.destroy');
    Route::get('profile/notification-preferences', [NotificationPreferenceController::class, 'edit'])->name('profile.notification-preferences.edit');
    Route::put('profile/notification-preferences', [NotificationPreferenceController::class, 'update'])->name('profile.notification-preferences.update');

    Route::get('profile/student', [StudentProfileController::class, 'edit'])->name('profile.student.edit');
    Route::put('profile/student', [StudentProfileController::class, 'update'])->name('profile.student.update');

    Route::get('profile/teacher', [TeacherProfileController::class, 'edit'])->name('profile.teacher.edit');
    Route::put('profile/teacher', [TeacherProfileController::class, 'update'])->name('profile.teacher.update');
    Route::post('profile/teacher/banner', [TeacherProfileController::class, 'updateBanner'])->name('profile.teacher.banner.update');
    Route::delete('profile/teacher/banner', [TeacherProfileController::class, 'destroyBanner'])->name('profile.teacher.banner.destroy');
    Route::post('profile/teacher/activate', [TeacherProfileController::class, 'activate'])->name('profile.teacher.activate');
    Route::post('profile/teacher/pause', [TeacherProfileController::class, 'pause'])->name('profile.teacher.pause');

    Route::prefix('teacher')->name('teacher.')->group(function () {
        Route::get('availability', [TeacherAvailabilityController::class, 'index'])->name('availability.index');
        Route::post('availability', [TeacherAvailabilityController::class, 'store'])->name('availability.store');
        Route::patch('availability/{availability}', [TeacherAvailabilityController::class, 'update'])->name('availability.update');
        Route::delete('availability/{availability}', [TeacherAvailabilityController::class, 'destroy'])->name('availability.destroy');
        Route::post('availability/exceptions', [TeacherAvailabilityController::class, 'storeException'])->name('availability.exceptions.store');
        Route::patch('availability/exceptions/{exception}', [TeacherAvailabilityController::class, 'updateException'])->name('availability.exceptions.update');
        Route::delete('availability/exceptions/{exception}', [TeacherAvailabilityController::class, 'destroyException'])->name('availability.exceptions.destroy');
        Route::get('applications', [TeacherApplicationController::class, 'index'])->name('applications.index');
        Route::patch('applications/{application}/accept', [TeacherApplicationController::class, 'accept'])->name('applications.accept');
        Route::patch('applications/{application}/reject', [TeacherApplicationController::class, 'reject'])->name('applications.reject');
        Route::patch('applications/{application}/cancel', [TeacherApplicationController::class, 'cancel'])->name('applications.cancel');
        Route::post('applications/{application}/schedule-session', [TeacherApplicationSessionController::class, 'store'])->name('applications.schedule-session');
        Route::get('sessions', [TeacherSessionController::class, 'index'])->name('sessions.index');
        Route::patch('sessions/{session}/complete', [TeacherSessionController::class, 'complete'])->name('sessions.complete');
        Route::patch('sessions/{session}/cancel', [TeacherSessionController::class, 'cancel'])->name('sessions.cancel');
        Route::patch('sessions/{session}/no-show', [TeacherSessionController::class, 'noShow'])->name('sessions.no-show');
        Route::resource('offers', TeacherOfferController::class)
            ->except(['show', 'destroy'])
            ->parameters(['offers' => 'offer']);
        Route::get('offers/{offer}/applications', [TeacherApplicationController::class, 'offerIndex'])->name('offers.applications.index');
        Route::post('offers/{offer}/publish', [TeacherOfferController::class, 'publish'])->name('offers.publish');
        Route::post('offers/{offer}/unpublish', [TeacherOfferController::class, 'unpublish'])->name('offers.unpublish');
        Route::post('offers/{offer}/pause-applications', [TeacherOfferController::class, 'pauseApplications'])->name('offers.pause-applications');
        Route::post('offers/{offer}/resume-applications', [TeacherOfferController::class, 'resumeApplications'])->name('offers.resume-applications');
        Route::post('category-proposals', [TeacherProposalController::class, 'storeCategory'])->name('category-proposals.store');
        Route::post('subject-proposals', [TeacherProposalController::class, 'storeSubject'])->name('subject-proposals.store');
    });

    Route::middleware('admin')->group(function () {
        Route::prefix('admin')->name('admin.')->group(function () {
            Route::get('/', AdminDashboardController::class)->name('dashboard');
            Route::get('dashboard', AdminDashboardController::class)->name('dashboard.show');
            Route::get('world-map', AdminWorldMapController::class)->name('world-map');
            Route::get('analytics', [AdminAnalyticsController::class, 'edit'])->name('analytics.edit');
            Route::put('analytics', [AdminAnalyticsController::class, 'update'])->name('analytics.update');
            Route::get('calendar-overview', AdminCalendarOverviewController::class)->name('calendar-overview');
            Route::get('platform-settings', [AdminPlatformSettingsController::class, 'edit'])->name('platform-settings.edit');
            Route::put('platform-settings', [AdminPlatformSettingsController::class, 'update'])->name('platform-settings.update');
            Route::get('cookie-settings', [AdminCookieSettingsController::class, 'edit'])->name('cookie-settings.edit');
            Route::put('cookie-settings', [AdminCookieSettingsController::class, 'update'])->name('cookie-settings.update');
            Route::get('teachers', [AdminTeacherController::class, 'index'])->name('teachers.index');
            Route::get('students', [AdminStudentController::class, 'index'])->name('students.index');
            Route::resource('users', AdminUserController::class)
                ->only(['index', 'show', 'update']);
            Route::post('users/{user}/ban', [AdminUserController::class, 'ban'])->name('users.ban');
            Route::post('users/{user}/unban', [AdminUserController::class, 'unban'])->name('users.unban');
            Route::post('users/{user}/block', [AdminUserController::class, 'block'])->name('users.block');
            Route::post('users/{user}/unblock', [AdminUserController::class, 'unblock'])->name('users.unblock');
            Route::post('users/{user}/impersonate', [AdminImpersonationController::class, 'start'])->name('users.impersonate');
            Route::resource('incidents', AdminIncidentController::class)
                ->only(['index', 'show', 'update']);
            Route::get('reports', fn () => redirect()->route('admin.incidents.index'))->name('reports.index');
            Route::resource('languages', AdminLanguageController::class)
                ->except(['show', 'destroy']);
            Route::resource('categories', AdminTeachingCategoryController::class)
                ->except(['show'])
                ->parameters(['categories' => 'category']);
            Route::get('category-proposals', [AdminCategoryProposalController::class, 'index'])->name('category-proposals.index');
            Route::patch('category-proposals/{proposal}', [AdminCategoryProposalController::class, 'update'])->name('category-proposals.update');
            Route::resource('subjects', AdminTeachingSubjectController::class)
                ->except(['show'])
                ->parameters(['subjects' => 'subject']);
            Route::get('subject-proposals', [AdminSubjectProposalController::class, 'index'])->name('subject-proposals.index');
            Route::patch('subject-proposals/{proposal}', [AdminSubjectProposalController::class, 'update'])->name('subject-proposals.update');
            Route::get('teaching-offers', [AdminTeachingOfferController::class, 'index'])->name('teaching-offers.index');
            Route::get('teaching-offers/{offer}', [AdminTeachingOfferController::class, 'show'])->name('teaching-offers.show');
            Route::patch('teaching-offers/{offer}/toggle-active', [AdminTeachingOfferController::class, 'toggleActive'])->name('teaching-offers.toggle-active');
            Route::get('applications', [AdminTeachingOfferApplicationController::class, 'index'])->name('applications.index');
            Route::get('sessions', [AdminSessionController::class, 'index'])->name('sessions.index');
            Route::get('{section}', AdminPlaceholderController::class)->name('placeholder');
        });
    });
});

require __DIR__.'/settings.php';
