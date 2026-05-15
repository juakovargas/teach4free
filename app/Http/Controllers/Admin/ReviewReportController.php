<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\ReviewReport;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReviewReportController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'status' => $request->string('status')->toString() ?: 'open',
            'type' => $request->string('type')->toString() ?: 'all',
            'priority' => $request->string('priority')->toString() ?: 'all',
            'search' => $request->string('search')->toString(),
        ];

        $reports = ReviewReport::query()
            ->with([
                'review.teacher:id,name,email,avatar_path,avatar_url',
                'review.student:id,name,email,avatar_path,avatar_url',
                'review.session:id,title,status,starts_at',
                'review.offer:id,title,slug',
                'reporter:id,name,email,avatar_path,avatar_url',
            ])
            ->when($filters['status'] !== 'all', fn (Builder $query) => $query->where('status', $filters['status']))
            ->when($filters['type'] !== 'all', fn (Builder $query) => $query->where('type', $filters['type']))
            ->when($filters['priority'] !== 'all', fn (Builder $query) => $query->where('priority', $filters['priority']))
            ->when($filters['search'], function (Builder $query, string $search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->where('description', 'like', "%{$search}%")
                        ->orWhereHas('reporter', fn (Builder $query) => $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"))
                        ->orWhereHas('review.teacher', fn (Builder $query) => $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"))
                        ->orWhereHas('review.student', fn (Builder $query) => $query
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"))
                        ->orWhereHas('review', fn (Builder $query) => $query
                            ->where('comment', 'like', "%{$search}%")
                            ->orWhere('title', 'like', "%{$search}%"));
                });
            })
            ->orderByRaw("case priority when 'urgent' then 0 when 'high' then 1 when 'normal' then 2 else 3 end")
            ->latest()
            ->limit(100)
            ->get();

        return Inertia::render('admin/review-reports/index', [
            'reports' => $reports->map(fn (ReviewReport $report): array => $this->reportSummary($report))->values(),
            'filters' => $filters,
            'types' => ReviewReport::TYPES,
            'statuses' => ReviewReport::STATUSES,
            'priorities' => ReviewReport::PRIORITIES,
        ]);
    }

    public function show(ReviewReport $report): Response
    {
        $report->load([
            'review.teacher:id,name,email,avatar_path,avatar_url,banned_at,blocked_at',
            'review.student:id,name,email,avatar_path,avatar_url,banned_at,blocked_at',
            'review.session:id,title,status,starts_at,ends_at,timezone',
            'review.offer:id,title,slug',
            'reporter:id,name,email,avatar_path,avatar_url',
            'resolver:id,name,email',
        ]);

        return Inertia::render('admin/review-reports/show', [
            'report' => [
                ...$this->reportSummary($report),
                'description' => $report->description,
                'admin_notes' => $report->admin_notes,
                'resolved_at' => $report->resolved_at,
                'resolver' => $report->resolver ? ['name' => $report->resolver->name, 'email' => $report->resolver->email] : null,
            ],
            'statuses' => ReviewReport::STATUSES,
            'priorities' => ReviewReport::PRIORITIES,
        ]);
    }

    public function update(Request $request, ReviewReport $report): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string', Rule::in(ReviewReport::STATUSES)],
            'priority' => ['required', 'string', Rule::in(ReviewReport::PRIORITIES)],
            'admin_notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $resolved = in_array($data['status'], [
            ReviewReport::STATUS_RESOLVED,
            ReviewReport::STATUS_DISMISSED,
        ], true);

        $report->forceFill([
            'status' => $data['status'],
            'priority' => $data['priority'],
            'admin_notes' => $data['admin_notes'] ?? null,
            'resolved_by' => $resolved ? $request->user()->id : null,
            'resolved_at' => $resolved ? now() : null,
        ])->save();

        $report->review?->forceFill([
            'reported_count' => $report->review->reports()->count(),
        ])->save();

        AuditLog::create([
            'actor_user_id' => $request->user()->id,
            'target_user_id' => $report->review?->student_user_id,
            'action' => 'admin.review_report.updated',
            'metadata' => ['review_report_id' => $report->id, 'status' => $report->status],
            'ip_address' => $request->ip(),
        ]);

        return back()->with('status', __('ui.admin_review_reports.updated'));
    }

    /**
     * @return array<string, mixed>
     */
    private function reportSummary(ReviewReport $report): array
    {
        return [
            'id' => $report->id,
            'type' => $report->type,
            'status' => $report->status,
            'priority' => $report->priority,
            'created_at' => $report->created_at,
            'description' => $report->description,
            'reporter' => $report->reporter ? ['name' => $report->reporter->name, 'email' => $report->reporter->email] : null,
            'review' => $report->review ? [
                'id' => $report->review->id,
                'rating' => $report->review->rating,
                'title' => $report->review->title,
                'comment' => $report->review->comment,
                'status' => $report->review->status,
                'teacher' => $report->review->teacher ? ['name' => $report->review->teacher->name, 'email' => $report->review->teacher->email] : null,
                'student' => $report->review->student ? ['name' => $report->review->student->name, 'email' => $report->review->student->email] : null,
                'session' => $report->review->session ? ['title' => $report->review->session->title, 'status' => $report->review->session->status] : null,
                'offer' => $report->review->offer ? ['title' => $report->review->offer->title, 'slug' => $report->review->offer->slug] : null,
            ] : null,
        ];
    }
}
