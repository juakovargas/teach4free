<?php

namespace App\Http\Controllers;

use App\Models\ReviewReport;
use App\Models\TeacherReview;
use App\Models\User;
use App\Notifications\ReviewReportSubmittedNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ReviewReportController extends Controller
{
    public function store(Request $request, TeacherReview $review): RedirectResponse
    {
        abort_if((int) $review->student_user_id === (int) $request->user()->id, 403);
        abort_unless($review->isPubliclyVisible(), 403);

        $data = $request->validate([
            'type' => ['required', 'string', Rule::in(ReviewReport::TYPES)],
            'description' => ['nullable', 'string', 'max:4000'],
        ]);

        $duplicateOpenReport = ReviewReport::query()
            ->where('teacher_review_id', $review->id)
            ->where('reporter_user_id', $request->user()->id)
            ->whereIn('status', [ReviewReport::STATUS_OPEN, ReviewReport::STATUS_IN_REVIEW])
            ->exists();

        if ($duplicateOpenReport) {
            return back()->withErrors(['type' => __('ui.reviews.duplicate_report_error')]);
        }

        DB::transaction(function () use ($data, $request, $review): void {
            $report = ReviewReport::create([
                'teacher_review_id' => $review->id,
                'reporter_user_id' => $request->user()->id,
                'type' => $data['type'],
                'description' => $data['description'] ?? null,
                'status' => ReviewReport::STATUS_OPEN,
                'priority' => ReviewReport::defaultPriorityFor($data['type']),
            ]);

            $review->forceFill([
                'reported_count' => $review->reports()->count(),
            ])->save();

            User::query()
                ->where('role', User::ROLE_ADMIN)
                ->get()
                ->each(fn (User $admin) => $admin->notify(new ReviewReportSubmittedNotification($report)));
        });

        return back()->with('status', __('ui.reviews.report_submitted'));
    }
}
