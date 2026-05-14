<?php

namespace App\Http\Controllers;

use App\Models\Incident;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SupportReportController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('support/report', [
            'type' => $request->query('type', Incident::TYPE_OTHER),
            'teachingOfferId' => $request->query('teaching_offer_id'),
            'reportedUserId' => $request->query('reported_user_id'),
            'classSessionId' => $request->query('class_session_id'),
            'types' => Incident::TYPES,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'type' => ['required', 'string', Rule::in(Incident::TYPES)],
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:4000'],
            'reported_user_id' => ['nullable', 'integer', Rule::exists('users', 'id')],
            'teaching_offer_id' => ['nullable', 'integer', Rule::exists('teaching_offers', 'id')],
            'class_session_id' => ['nullable', 'integer', Rule::exists('class_sessions', 'id')],
        ]);

        $incident = Incident::create([
            'reporter_user_id' => $request->user()?->id,
            'reported_user_id' => $data['reported_user_id'] ?? null,
            'teaching_offer_id' => $data['teaching_offer_id'] ?? null,
            'class_session_id' => $data['class_session_id'] ?? null,
            'type' => $data['type'],
            'status' => Incident::STATUS_OPEN,
            'priority' => Incident::PRIORITY_NORMAL,
            'subject' => $data['subject'],
            'description' => $data['description'],
        ]);

        if ($request->user()) {
            return redirect()->route('my-reports.incidents.show', $incident)->with('status', __('ui.support_report.created'));
        }

        return redirect()->route('support.report.create')->with('status', __('ui.support_report.created'));
    }
}
