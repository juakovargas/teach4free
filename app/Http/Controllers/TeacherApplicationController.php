<?php

namespace App\Http\Controllers;

use App\Models\TeachingOffer;
use App\Models\TeachingOfferApplication;
use App\Services\TeachingOfferApplicationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherApplicationController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('teacher/applications/index', [
            'applications' => $this->applicationsFor($request->user()->id)->get(),
            'offer' => null,
        ]);
    }

    public function offerIndex(Request $request, TeachingOffer $offer): Response
    {
        abort_unless($offer->user_id === $request->user()->id, 403);

        return Inertia::render('teacher/applications/index', [
            'applications' => $this->applicationsFor($request->user()->id)
                ->where('teaching_offer_id', $offer->id)
                ->get(),
            'offer' => $offer->only(['id', 'title', 'slug']),
        ]);
    }

    public function accept(
        Request $request,
        TeachingOfferApplication $application,
        TeachingOfferApplicationService $service,
    ): RedirectResponse {
        $this->authorizeTeacher($request, $application);

        $data = $request->validate([
            'teacher_response' => ['nullable', 'string', 'max:2000'],
        ]);

        $service->accept($application, $data['teacher_response'] ?? null);

        return back()->with('status', __('ui.teacher_applications.accepted'));
    }

    public function reject(
        Request $request,
        TeachingOfferApplication $application,
        TeachingOfferApplicationService $service,
    ): RedirectResponse {
        $this->authorizeTeacher($request, $application);

        $data = $request->validate([
            'teacher_response' => ['nullable', 'string', 'max:2000'],
        ]);

        $service->reject($application, $data['teacher_response'] ?? null);

        return back()->with('status', __('ui.teacher_applications.rejected'));
    }

    public function cancel(
        Request $request,
        TeachingOfferApplication $application,
        TeachingOfferApplicationService $service,
    ): RedirectResponse {
        $this->authorizeTeacher($request, $application);

        $data = $request->validate([
            'teacher_response' => ['nullable', 'string', 'max:2000'],
        ]);

        $service->cancelByTeacher($application, $data['teacher_response'] ?? null);

        return back()->with('status', __('ui.teacher_applications.cancelled'));
    }

    private function authorizeTeacher(Request $request, TeachingOfferApplication $application): void
    {
        abort_unless($application->teacher_user_id === $request->user()->id, 403);
    }

    private function applicationsFor(int $teacherId)
    {
        return TeachingOfferApplication::query()
            ->where('teacher_user_id', $teacherId)
            ->with([
                'student:id,name,email,avatar_path,avatar_url',
                'preferredLanguage:id,code,name,native_name',
                'offer:id,user_id,teaching_category_id,teaching_subject_id,title,slug,session_type,max_students,duration_minutes',
                'offer.category:id,name,slug,color',
                'offer.subject:id,name,slug',
                'offer.languages:id,code,name,native_name',
            ])
            ->latest('requested_at');
    }
}
