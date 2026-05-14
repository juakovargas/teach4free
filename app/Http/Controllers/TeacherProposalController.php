<?php

namespace App\Http\Controllers;

use App\Models\CategoryProposal;
use App\Models\PlatformSetting;
use App\Models\SubjectProposal;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TeacherProposalController extends Controller
{
    public function storeCategory(Request $request): RedirectResponse
    {
        abort_unless(PlatformSetting::current()->allow_teacher_category_proposals, 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
            'suggested_color' => ['nullable', 'string', 'max:20', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);

        CategoryProposal::create([
            ...$data,
            'proposed_by_user_id' => $request->user()->id,
            'status' => CategoryProposal::STATUS_PENDING,
        ]);

        return back()->with('status', __('ui.teacher_proposals.category_submitted'));
    }

    public function storeSubject(Request $request): RedirectResponse
    {
        abort_unless(PlatformSetting::current()->allow_teacher_subject_proposals, 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
            'teaching_category_id' => ['nullable', 'required_without:category_proposal_id', 'integer', Rule::exists('teaching_categories', 'id')->where('is_active', true)],
            'category_proposal_id' => ['nullable', 'required_without:teaching_category_id', 'integer', Rule::exists('category_proposals', 'id')
                ->where('proposed_by_user_id', $request->user()->id)
                ->where('status', CategoryProposal::STATUS_PENDING)],
        ]);

        SubjectProposal::create([
            ...$data,
            'proposed_by_user_id' => $request->user()->id,
            'status' => SubjectProposal::STATUS_PENDING,
        ]);

        return back()->with('status', __('ui.teacher_proposals.subject_submitted'));
    }
}
