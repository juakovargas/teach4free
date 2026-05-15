<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ReviewReport;
use App\Models\TeacherReview;
use App\Notifications\TeacherReviewNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'status' => $request->string('status')->toString() ?: 'all',
            'rating' => $request->string('rating')->toString() ?: 'all',
            'reported' => $request->string('reported')->toString() ?: 'all',
            'low' => $request->boolean('low'),
            'search' => $request->string('search')->toString(),
        ];

        $reviews = TeacherReview::query()
            ->with([
                'teacher:id,name,email,avatar_path,avatar_url',
                'student:id,name,email,avatar_path,avatar_url',
                'session:id,title,status,starts_at',
                'offer:id,title,slug',
            ])
            ->when($filters['status'] !== 'all', fn (Builder $query) => $query->where('status', $filters['status']))
            ->when($filters['rating'] !== 'all', fn (Builder $query) => $query->where('rating', (int) $filters['rating']))
            ->when($filters['reported'] === 'reported', fn (Builder $query) => $query->where('reported_count', '>', 0))
            ->when($filters['reported'] === 'unreported', fn (Builder $query) => $query->where('reported_count', 0))
            ->when($filters['low'], fn (Builder $query) => $query->whereIn('rating', [1, 2]))
            ->when($filters['search'], function (Builder $query, string $search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('comment', 'like', "%{$search}%")
                        ->orWhereHas('teacher', fn (Builder $query) => $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"))
                        ->orWhereHas('student', fn (Builder $query) => $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"))
                        ->orWhereHas('session', fn (Builder $query) => $query->where('title', 'like', "%{$search}%"))
                        ->orWhereHas('offer', fn (Builder $query) => $query->where('title', 'like', "%{$search}%"));
                });
            })
            ->latest()
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('admin/reviews/index', [
            'reviews' => [
                'data' => $reviews->getCollection()->map(fn (TeacherReview $review): array => $this->reviewSummary($review))->values(),
                'links' => $reviews->linkCollection(),
            ],
            'filters' => $filters,
            'statuses' => TeacherReview::STATUSES,
            'abuseSignals' => $this->abuseSignals(),
        ]);
    }

    public function show(TeacherReview $review): Response
    {
        $review->load([
            'teacher:id,name,email,avatar_path,avatar_url,banned_at,blocked_at',
            'student:id,name,email,avatar_path,avatar_url,banned_at,blocked_at',
            'session:id,title,status,starts_at,ends_at,timezone',
            'offer:id,title,slug',
            'hiddenBy:id,name,email',
            'reports.reporter:id,name,email,avatar_path,avatar_url',
            'reports.resolver:id,name,email',
        ]);

        return Inertia::render('admin/reviews/show', [
            'review' => [
                ...$this->reviewSummary($review),
                'teacher_response' => $review->teacher_response,
                'teacher_responded_at' => $review->teacher_responded_at,
                'admin_notes' => $review->admin_notes,
                'hidden_reason' => $review->hidden_reason,
                'hidden_at' => $review->hidden_at,
                'hidden_by' => $review->hiddenBy ? ['name' => $review->hiddenBy->name, 'email' => $review->hiddenBy->email] : null,
                'session' => $review->session ? [
                    'id' => $review->session->id,
                    'title' => $review->session->title,
                    'status' => $review->session->status,
                    'starts_at' => $review->session->starts_at,
                    'ends_at' => $review->session->ends_at,
                    'timezone' => $review->session->timezone,
                ] : null,
                'reports' => $review->reports->map(fn (ReviewReport $report): array => [
                    'id' => $report->id,
                    'type' => $report->type,
                    'status' => $report->status,
                    'priority' => $report->priority,
                    'description' => $report->description,
                    'admin_notes' => $report->admin_notes,
                    'created_at' => $report->created_at,
                    'reporter' => $report->reporter ? ['name' => $report->reporter->name, 'email' => $report->reporter->email] : null,
                ])->values(),
            ],
            'statuses' => TeacherReview::STATUSES,
        ]);
    }

    public function update(Request $request, TeacherReview $review): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string', Rule::in(TeacherReview::STATUSES)],
            'hidden_reason' => [
                'nullable',
                'string',
                'max:4000',
                Rule::requiredIf(fn (): bool => $request->input('status') === TeacherReview::STATUS_HIDDEN),
            ],
            'admin_notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $previousStatus = $review->status;

        $payload = [
            'status' => $data['status'],
            'admin_notes' => $data['admin_notes'] ?? null,
        ];

        if ($data['status'] === TeacherReview::STATUS_HIDDEN) {
            $payload['hidden_at'] = now();
            $payload['hidden_by'] = $request->user()->id;
            $payload['hidden_reason'] = $data['hidden_reason'];
        }

        if ($data['status'] === TeacherReview::STATUS_PUBLISHED) {
            $payload['hidden_at'] = null;
            $payload['hidden_by'] = null;
            $payload['hidden_reason'] = null;
        }

        $review->forceFill($payload)->save();

        AuditLog::create([
            'actor_user_id' => $request->user()->id,
            'target_user_id' => $review->student_user_id,
            'action' => 'admin.teacher_review.updated',
            'metadata' => ['teacher_review_id' => $review->id, 'status' => $review->status],
            'ip_address' => $request->ip(),
        ]);

        if ($previousStatus !== TeacherReview::STATUS_HIDDEN && $review->status === TeacherReview::STATUS_HIDDEN) {
            $review->student?->notify(new TeacherReviewNotification(
                $review,
                TeacherReviewNotification::EVENT_REVIEW_HIDDEN,
            ));
        }

        return back()->with('status', __('ui.admin_reviews.updated'));
    }

    /**
     * @return array<string, mixed>
     */
    private function reviewSummary(TeacherReview $review): array
    {
        return [
            'id' => $review->id,
            'rating' => $review->rating,
            'title' => $review->title,
            'comment' => $review->comment,
            'status' => $review->status,
            'reported_count' => $review->reported_count,
            'created_at' => $review->created_at,
            'teacher' => $review->teacher ? ['id' => $review->teacher->id, 'name' => $review->teacher->name, 'email' => $review->teacher->email] : null,
            'student' => $review->student ? ['id' => $review->student->id, 'name' => $review->student->name, 'email' => $review->student->email] : null,
            'offer' => $review->offer ? ['title' => $review->offer->title, 'slug' => $review->offer->slug] : null,
            'session_title' => $review->session?->title,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function abuseSignals(): array
    {
        return [
            'many_one_star' => TeacherReview::query()
                ->selectRaw('student_user_id, count(*) as reviews_count')
                ->where('rating', 1)
                ->groupBy('student_user_id')
                ->having('reviews_count', '>=', 3)
                ->with('student:id,name,email')
                ->limit(10)
                ->get()
                ->map(fn (TeacherReview $review): array => [
                    'student' => $review->student?->name ?? $review->student?->email,
                    'count' => (int) $review->reviews_count,
                ]),
            'hidden_reviews' => TeacherReview::query()
                ->selectRaw('student_user_id, count(*) as reviews_count')
                ->where('status', TeacherReview::STATUS_HIDDEN)
                ->groupBy('student_user_id')
                ->having('reviews_count', '>=', 2)
                ->with('student:id,name,email')
                ->limit(10)
                ->get()
                ->map(fn (TeacherReview $review): array => [
                    'student' => $review->student?->name ?? $review->student?->email,
                    'count' => (int) $review->reviews_count,
                ]),
            'reported_reviews' => TeacherReview::query()
                ->selectRaw('student_user_id, sum(reported_count) as reports_count')
                ->where('reported_count', '>=', 1)
                ->groupBy('student_user_id')
                ->having('reports_count', '>=', 3)
                ->with('student:id,name,email')
                ->limit(10)
                ->get()
                ->map(fn (TeacherReview $review): array => [
                    'student' => $review->student?->name ?? $review->student?->email,
                    'count' => (int) $review->reports_count,
                ]),
        ];
    }
}
