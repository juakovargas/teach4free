<?php

namespace App\Http\Controllers;

use App\Models\TeacherReview;
use App\Notifications\TeacherReviewNotification;
use App\Services\TeacherReputationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherReviewController extends Controller
{
    public function __construct(private readonly TeacherReputationService $reputations) {}

    public function index(Request $request): Response
    {
        $reviews = TeacherReview::query()
            ->where('teacher_user_id', $request->user()->id)
            ->with([
                'student:id,name,avatar_path,avatar_url',
                'session:id,title,starts_at,status',
                'offer:id,title,slug',
            ])
            ->latest()
            ->get();

        $publicReviews = $reviews->filter(fn (TeacherReview $review): bool => $review->isPubliclyVisible());

        return Inertia::render('teacher/reviews/index', [
            'reputationSummary' => $this->reputations->forTeacher($request->user()),
            'summary' => [
                'average_rating' => $publicReviews->count() > 0 ? round((float) $publicReviews->avg('rating'), 1) : null,
                'published_reviews_count' => $publicReviews->count(),
                'pending_responses_count' => $publicReviews
                    ->filter(fn (TeacherReview $review): bool => blank($review->teacher_response))
                    ->count(),
                'hidden_reviews_count' => $reviews
                    ->where('status', TeacherReview::STATUS_HIDDEN)
                    ->count(),
            ],
            'reviews' => $reviews->map(fn (TeacherReview $review): array => [
                'id' => $review->id,
                'rating' => $review->rating,
                'title' => $review->title,
                'comment' => $review->comment,
                'status' => $review->status,
                'teacher_response' => $review->teacher_response,
                'teacher_responded_at' => $review->teacher_responded_at,
                'reported_count' => $review->reported_count,
                'created_at' => $review->created_at,
                'student' => [
                    'name' => $review->student?->name,
                    'avatar' => $review->student?->avatar,
                ],
                'session' => $review->session ? [
                    'title' => $review->session->title,
                    'starts_at' => $review->session->starts_at,
                    'status' => $review->session->status,
                ] : null,
                'offer' => $review->offer ? [
                    'title' => $review->offer->title,
                    'slug' => $review->offer->slug,
                ] : null,
                'can_respond' => in_array($review->status, TeacherReview::PUBLIC_STATUSES, true),
            ])->values(),
        ]);
    }

    public function updateResponse(Request $request, TeacherReview $review): RedirectResponse
    {
        abort_unless((int) $review->teacher_user_id === (int) $request->user()->id, 403);
        abort_unless(in_array($review->status, TeacherReview::PUBLIC_STATUSES, true), 403);

        $data = $request->validate([
            'teacher_response' => ['required', 'string', 'max:2500'],
        ]);

        $review->forceFill([
            'teacher_response' => $data['teacher_response'],
            'teacher_responded_at' => now(),
        ])->save();

        $review->student?->notify(new TeacherReviewNotification(
            $review,
            TeacherReviewNotification::EVENT_TEACHER_RESPONSE_ADDED,
        ));

        return back()->with('status', __('ui.reviews.response_saved'));
    }
}
