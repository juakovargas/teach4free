<?php

namespace App\Http\Controllers;

use App\Models\ClassSession;
use App\Models\TeacherReview;
use App\Notifications\TeacherReviewNotification;
use App\Services\BadgeAwardingService;
use App\Services\ReviewEligibilityService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function create(Request $request, ClassSession $session, ReviewEligibilityService $eligibility): Response
    {
        $session->load(['offer:id,title,slug', 'teacher:id,name,avatar_path,avatar_url', 'attendees', 'application']);

        abort_unless($eligibility->canReview($request->user(), $session), 403);

        return Inertia::render('reviews/create', [
            'session' => [
                'id' => $session->id,
                'title' => $session->title,
                'starts_at' => $session->starts_at,
                'ends_at' => $session->ends_at,
                'timezone' => $session->timezone,
                'offer' => $session->offer,
                'teacher' => [
                    'id' => $session->teacher->id,
                    'name' => $session->teacher->name,
                    'avatar' => $session->teacher->avatar,
                ],
            ],
        ]);
    }

    public function store(Request $request, ClassSession $session, ReviewEligibilityService $eligibility, BadgeAwardingService $badges): RedirectResponse
    {
        $session->load(['offer', 'teacher', 'attendees', 'application']);

        abort_unless($eligibility->canReview($request->user(), $session), 403);

        $data = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:160'],
            'comment' => [
                'nullable',
                'string',
                'max:4000',
                Rule::requiredIf(fn (): bool => in_array((int) $request->input('rating'), [1, 2], true)),
            ],
        ]);

        $review = TeacherReview::create([
            'teacher_user_id' => $session->teacher_user_id,
            'student_user_id' => $request->user()->id,
            'class_session_id' => $session->id,
            'teaching_offer_id' => $session->teaching_offer_id,
            'rating' => (int) $data['rating'],
            'title' => $data['title'] ?? null,
            'comment' => $data['comment'] ?? null,
            'status' => TeacherReview::STATUS_PUBLISHED,
        ]);

        $session->teacher->notify(new TeacherReviewNotification(
            $review,
            TeacherReviewNotification::EVENT_REVIEW_RECEIVED,
        ));
        $badges->awardForTeacher($session->teacher);

        return redirect()->route('my-sessions.index')->with('status', __('ui.reviews.created'));
    }
}
