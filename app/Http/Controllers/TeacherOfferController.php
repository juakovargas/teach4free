<?php

namespace App\Http\Controllers;

use App\Models\CategoryProposal;
use App\Models\Language;
use App\Models\PlatformSetting;
use App\Models\TeacherProfile;
use App\Models\TeachingCategory;
use App\Models\TeachingOffer;
use App\Models\UserLanguage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TeacherOfferController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user()->load('teacherProfile');

        return Inertia::render('teacher/offers/index', [
            'teacherReady' => (bool) $user->teacherProfile?->is_active,
            'teachingLanguagesCount' => $this->teachingLanguageIds($request)->count(),
            'offers' => TeachingOffer::query()
                ->where('user_id', $user->id)
                ->with([
                    'category:id,name,slug,color',
                    'subject:id,name,slug',
                    'languages:id,code,name,native_name',
                ])
                ->latest()
                ->get(),
        ]);
    }

    public function create(Request $request): Response
    {
        if (! $this->activeTeacherProfile($request)) {
            return Inertia::render('teacher/offers/not-ready');
        }

        return Inertia::render('teacher/offers/form', [
            ...$this->formProps($request),
            'offer' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $teacherProfile = $this->activeTeacherProfile($request);

        if (! $teacherProfile) {
            return redirect()->route('teacher.offers.index')->with('status', __('ui.teacher_offers.activate_first'));
        }

        $data = $this->validatedOfferData($request);
        $data['user_id'] = $request->user()->id;
        $data['teacher_profile_id'] = $teacherProfile->id;
        $data['slug'] = $this->uniqueSlug($data['title']);
        $data['published_at'] = $data['is_public'] && $data['is_active'] ? now() : null;
        $languageIds = $data['language_ids'];
        unset($data['language_ids']);

        $offer = TeachingOffer::create($data);
        $offer->languages()->sync($languageIds);

        return redirect()->route('teacher.offers.index')->with('status', __('ui.teacher_offers.created'));
    }

    public function edit(Request $request, TeachingOffer $offer): Response
    {
        $this->authorizeOwner($request, $offer);

        if (! $this->activeTeacherProfile($request)) {
            return Inertia::render('teacher/offers/not-ready');
        }

        return Inertia::render('teacher/offers/form', [
            ...$this->formProps($request),
            'offer' => $offer->load(['languages:id,code,name,native_name']),
        ]);
    }

    public function update(Request $request, TeachingOffer $offer): RedirectResponse
    {
        $this->authorizeOwner($request, $offer);

        if (! $this->activeTeacherProfile($request)) {
            return redirect()->route('teacher.offers.index')->with('status', __('ui.teacher_offers.activate_first'));
        }

        $data = $this->validatedOfferData($request, $offer);
        $data['published_at'] = $data['is_public'] && $data['is_active']
            ? ($offer->published_at ?? Carbon::now())
            : null;
        $languageIds = $data['language_ids'];
        unset($data['language_ids']);

        if ($offer->title !== $data['title']) {
            $data['slug'] = $this->uniqueSlug($data['title'], $offer);
        }

        $offer->update($data);
        $offer->languages()->sync($languageIds);

        return redirect()->route('teacher.offers.index')->with('status', __('ui.teacher_offers.updated'));
    }

    public function publish(Request $request, TeachingOffer $offer): RedirectResponse
    {
        $this->authorizeOwner($request, $offer);

        if ($offer->languages()->count() === 0) {
            return back()->withErrors(['language_ids' => __('ui.teacher_offers.languages_required')]);
        }

        $offer->forceFill([
            'is_public' => true,
            'is_active' => true,
            'published_at' => $offer->published_at ?? now(),
        ])->save();

        return back()->with('status', __('ui.teacher_offers.published'));
    }

    public function unpublish(Request $request, TeachingOffer $offer): RedirectResponse
    {
        $this->authorizeOwner($request, $offer);

        $offer->forceFill([
            'is_public' => false,
            'is_active' => false,
            'is_accepting_applications' => false,
            'published_at' => null,
        ])->save();

        return back()->with('status', __('ui.teacher_offers.unpublished'));
    }

    public function pauseApplications(Request $request, TeachingOffer $offer): RedirectResponse
    {
        $this->authorizeOwner($request, $offer);

        $offer->forceFill(['is_accepting_applications' => false])->save();

        return back()->with('status', __('ui.teacher_offers.applications_paused'));
    }

    public function resumeApplications(Request $request, TeachingOffer $offer): RedirectResponse
    {
        $this->authorizeOwner($request, $offer);

        $offer->forceFill(['is_accepting_applications' => $offer->is_public && $offer->is_active])->save();

        return back()->with('status', __('ui.teacher_offers.applications_resumed'));
    }

    private function activeTeacherProfile(Request $request): ?TeacherProfile
    {
        $profile = $request->user()->teacherProfile;

        return $profile?->is_active ? $profile : null;
    }

    private function authorizeOwner(Request $request, TeachingOffer $offer): void
    {
        abort_unless($offer->user_id === $request->user()->id, 403);
    }

    /**
     * @return array<string, mixed>
     */
    private function formProps(Request $request): array
    {
        $teachingLanguageIds = $this->teachingLanguageIds($request);

        return [
            'categories' => TeachingCategory::query()
                ->where('is_active', true)
                ->with(['subjects' => fn ($query) => $query->where('is_active', true)->orderBy('sort_order')->orderBy('name')])
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(),
            'languages' => Language::query()
                ->where('is_active', true)
                ->whereIn('id', $teachingLanguageIds)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'code', 'name', 'native_name']),
            'levels' => TeachingOffer::LEVELS,
            'teachingModes' => TeachingOffer::MODES,
            'sessionTypes' => TeachingOffer::SESSION_TYPES,
            'meetingTools' => TeachingOffer::MEETING_TOOLS,
            'proposalSettings' => [
                'allow_category_proposals' => PlatformSetting::current()->allow_teacher_category_proposals,
                'allow_subject_proposals' => PlatformSetting::current()->allow_teacher_subject_proposals,
            ],
            'categoryProposals' => CategoryProposal::query()
                ->where('proposed_by_user_id', $request->user()->id)
                ->where('status', CategoryProposal::STATUS_PENDING)
                ->orderBy('name')
                ->get(['id', 'name', 'status']),
        ];
    }

    /**
     * @return Collection<int, int>
     */
    private function teachingLanguageIds(Request $request)
    {
        return UserLanguage::query()
            ->where('user_id', $request->user()->id)
            ->where('teaches', true)
            ->pluck('language_id');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedOfferData(Request $request, ?TeachingOffer $offer = null): array
    {
        $teachingLanguageIds = $this->teachingLanguageIds($request);

        $validator = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'teaching_category_id' => ['required', 'integer', Rule::exists('teaching_categories', 'id')->where('is_active', true)],
            'teaching_subject_id' => ['nullable', 'integer', Rule::exists('teaching_subjects', 'id')->where('is_active', true)],
            'summary' => ['required', 'string', 'max:500'],
            'description' => ['required', 'string', 'max:10000'],
            'level' => ['required', 'string', Rule::in(TeachingOffer::LEVELS)],
            'teaching_mode' => ['required', 'string', Rule::in(TeachingOffer::MODES)],
            'session_type' => ['required', 'string', Rule::in(TeachingOffer::SESSION_TYPES)],
            'max_students' => ['nullable', 'integer', 'min:1', 'max:500'],
            'duration_minutes' => ['required', 'integer', 'min:15', 'max:240'],
            'meeting_tool' => ['required', 'string', Rule::in(TeachingOffer::MEETING_TOOLS)],
            'meeting_url' => ['nullable', 'url', 'max:2048'],
            'timezone' => ['required', 'string', 'timezone'],
            'availability_summary' => ['nullable', 'string', 'max:2000'],
            'requirements' => ['nullable', 'string', 'max:2000'],
            'materials_summary' => ['nullable', 'string', 'max:2000'],
            'is_public' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
            'is_accepting_applications' => ['required', 'boolean'],
            'allow_waiting_list' => ['sometimes', 'boolean'],
            'waiting_list_limit' => ['nullable', 'integer', 'min:1', 'max:500'],
            'language_ids' => ['array'],
            'language_ids.*' => ['integer', Rule::exists('languages', 'id')->where('is_active', true)],
        ]);

        $validator->after(function ($validator) use ($request, $teachingLanguageIds): void {
            $sessionType = $request->string('session_type')->toString();
            $meetingTool = $request->string('meeting_tool')->toString();
            $publishing = $request->boolean('is_public') && $request->boolean('is_active');
            $languageIds = collect($request->input('language_ids', []))->map(fn ($id) => (int) $id)->values();

            if ($publishing && $languageIds->isEmpty()) {
                $validator->errors()->add('language_ids', __('ui.teacher_offers.languages_required'));
            }

            if ($languageIds->diff($teachingLanguageIds)->isNotEmpty()) {
                $validator->errors()->add('language_ids', __('ui.teacher_offers.languages_must_be_teachable'));
            }

            if ($sessionType !== TeachingOffer::SESSION_OPEN_PUBLIC && ! $request->filled('max_students')) {
                $validator->errors()->add('max_students', __('ui.teacher_offers.max_students_required'));
            }

            if (
                ($meetingTool === TeachingOffer::TOOL_CUSTOM)
                || ($sessionType === TeachingOffer::SESSION_OPEN_PUBLIC && $meetingTool !== TeachingOffer::TOOL_NOT_DECIDED)
            ) {
                if (! $request->filled('meeting_url')) {
                    $validator->errors()->add('meeting_url', __('ui.teacher_offers.meeting_url_required'));
                }
            }
        });

        $data = $validator->validate();
        $data['is_accepting_applications'] = $data['is_public'] && $data['is_active'] && $data['is_accepting_applications'];
        $data['allow_waiting_list'] = $data['allow_waiting_list'] ?? true;

        if ($data['session_type'] === TeachingOffer::SESSION_OPEN_PUBLIC && ! isset($data['max_students'])) {
            $data['max_students'] = null;
        }

        return $data;
    }

    private function uniqueSlug(string $value, ?TeachingOffer $offer = null): string
    {
        $base = Str::slug($value) ?: 'offer';
        $slug = $base;
        $counter = 2;

        while (
            TeachingOffer::query()
                ->where('slug', $slug)
                ->when($offer, fn ($query) => $query->whereKeyNot($offer->id))
                ->exists()
        ) {
            $slug = "{$base}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}
