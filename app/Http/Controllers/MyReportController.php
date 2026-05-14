<?php

namespace App\Http\Controllers;

use App\Models\ConversationReport;
use App\Models\Incident;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MyReportController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'status' => ['nullable', 'string', Rule::in(array_merge(['all'], Incident::STATUSES))],
        ]);
        $status = $filters['status'] ?? 'all';
        $userId = $request->user()->id;

        $incidents = Incident::query()
            ->where('reporter_user_id', $userId)
            ->with(['reportedUser:id,name', 'teachingOffer:id,title,slug', 'application:id,status', 'classSession:id,title,status'])
            ->when($status !== 'all', fn ($query) => $query->where('status', $status))
            ->latest('updated_at')
            ->get();

        $conversationReports = ConversationReport::query()
            ->where('reporter_user_id', $userId)
            ->with([
                'conversation:id,subject,type,teaching_offer_id,class_session_id',
                'conversation.teachingOffer:id,title,slug',
                'conversation.classSession:id,title,status',
                'message:id,body,conversation_id',
            ])
            ->when($status !== 'all', fn ($query) => $query->where('status', $status))
            ->latest('updated_at')
            ->get();

        return Inertia::render('my-reports/index', [
            'filters' => ['status' => $status],
            'statuses' => Incident::STATUSES,
            'incidents' => $incidents->map(fn (Incident $incident): array => $this->incidentSummary($incident))->values(),
            'conversationReports' => $conversationReports->map(fn (ConversationReport $report): array => $this->conversationReportSummary($report))->values(),
            'summary' => [
                'open_reports_count' => $this->openReportCount($userId),
                'reports_with_response_count' => $this->reportsWithResponseCount($userId),
            ],
        ]);
    }

    public function showIncident(Request $request, Incident $incident): Response
    {
        abort_unless((int) $incident->reporter_user_id === $request->user()->id, 403);

        $incident->load([
            'teachingOffer:id,title,slug',
            'reportedUser:id,name',
            'application:id,status',
            'classSession:id,title,status',
            'publicResponder:id,name',
        ]);

        return Inertia::render('my-reports/show', [
            'report' => $this->incidentDetail($incident),
        ]);
    }

    public function showConversationReport(Request $request, ConversationReport $report): Response
    {
        abort_unless((int) $report->reporter_user_id === $request->user()->id, 403);

        $report->load([
            'conversation:id,subject,type,teaching_offer_id,class_session_id',
            'conversation.teachingOffer:id,title,slug',
            'conversation.classSession:id,title,status',
            'message:id,body,conversation_id',
            'publicResponder:id,name',
        ]);

        return Inertia::render('my-reports/show', [
            'report' => $this->conversationReportDetail($report),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function incidentSummary(Incident $incident): array
    {
        return [
            'kind' => 'incident',
            'id' => $incident->id,
            'subject' => $incident->subject,
            'type' => $incident->type,
            'type_key_prefix' => 'incident_types',
            'status' => $incident->status,
            'status_key_prefix' => 'incident_statuses',
            'context' => $this->incidentContext($incident),
            'created_at' => $incident->created_at,
            'updated_at' => $incident->updated_at,
            'has_public_response' => filled($incident->public_response),
            'public_response_sent_at' => $incident->public_response_sent_at,
            'detail_url' => route('my-reports.incidents.show', $incident),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function incidentDetail(Incident $incident): array
    {
        return [
            ...$this->incidentSummary($incident),
            'description' => $incident->description,
            'public_response' => $incident->public_response,
            'public_response_sent_at' => $incident->public_response_sent_at,
            'public_responder_name' => $incident->publicResponder?->name,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function conversationReportSummary(ConversationReport $report): array
    {
        return [
            'kind' => 'conversation_report',
            'id' => $report->id,
            'subject' => $report->conversation?->subject ?: __('ui.messages.untitled_conversation', [], 'en'),
            'type' => $report->type,
            'type_key_prefix' => 'conversation_report_types',
            'status' => $report->status,
            'status_key_prefix' => 'conversation_report_statuses',
            'context' => $this->conversationReportContext($report),
            'message_excerpt' => $report->message ? str($report->message->body)->limit(180)->toString() : null,
            'created_at' => $report->created_at,
            'updated_at' => $report->updated_at,
            'has_public_response' => filled($report->public_response),
            'public_response_sent_at' => $report->public_response_sent_at,
            'detail_url' => route('my-reports.conversation-reports.show', $report),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function conversationReportDetail(ConversationReport $report): array
    {
        return [
            ...$this->conversationReportSummary($report),
            'description' => $report->description,
            'public_response' => $report->public_response,
            'public_response_sent_at' => $report->public_response_sent_at,
            'public_responder_name' => $report->publicResponder?->name,
        ];
    }

    /**
     * @return array{label: string, value: string|null, url: string|null}
     */
    private function incidentContext(Incident $incident): array
    {
        if ($incident->teachingOffer) {
            return [
                'label' => 'my_reports.context_teaching_offer',
                'value' => $incident->teachingOffer->title,
                'url' => route('offers.show', $incident->teachingOffer),
            ];
        }

        if ($incident->application) {
            return [
                'label' => 'my_reports.context_application',
                'value' => '#'.$incident->application->id,
                'url' => route('my-applications.index'),
            ];
        }

        if ($incident->classSession) {
            return [
                'label' => 'my_reports.context_session',
                'value' => $incident->classSession->title,
                'url' => route('my-sessions.index'),
            ];
        }

        if ($incident->reportedUser) {
            return [
                'label' => 'my_reports.context_user',
                'value' => $incident->reportedUser->name,
                'url' => null,
            ];
        }

        return [
            'label' => 'my_reports.context_general',
            'value' => null,
            'url' => null,
        ];
    }

    /**
     * @return array{label: string, value: string|null, url: string|null}
     */
    private function conversationReportContext(ConversationReport $report): array
    {
        if ($report->conversation?->teachingOffer) {
            return [
                'label' => 'my_reports.context_teaching_offer',
                'value' => $report->conversation->teachingOffer->title,
                'url' => route('offers.show', $report->conversation->teachingOffer),
            ];
        }

        if ($report->conversation?->classSession) {
            return [
                'label' => 'my_reports.context_session',
                'value' => $report->conversation->classSession->title,
                'url' => route('my-sessions.index'),
            ];
        }

        return [
            'label' => 'my_reports.context_conversation',
            'value' => $report->conversation?->subject,
            'url' => $report->conversation ? route('messages.show', $report->conversation) : null,
        ];
    }

    private function openReportCount(int $userId): int
    {
        return Incident::query()
            ->where('reporter_user_id', $userId)
            ->whereIn('status', [Incident::STATUS_OPEN, Incident::STATUS_IN_REVIEW])
            ->count()
            + ConversationReport::query()
                ->where('reporter_user_id', $userId)
                ->whereIn('status', [ConversationReport::STATUS_OPEN, ConversationReport::STATUS_IN_REVIEW])
                ->count();
    }

    private function reportsWithResponseCount(int $userId): int
    {
        return Incident::query()
            ->where('reporter_user_id', $userId)
            ->whereNotNull('public_response')
            ->count()
            + ConversationReport::query()
                ->where('reporter_user_id', $userId)
                ->whereNotNull('public_response')
                ->count();
    }
}
