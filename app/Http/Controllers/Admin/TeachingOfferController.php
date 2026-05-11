<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeachingOffer;
use App\Notifications\TeachingOfferStatusNotification;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TeachingOfferController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/teaching-offers/index', [
            'offers' => TeachingOffer::query()
                ->with([
                    'user:id,name,email,avatar_path,avatar_url',
                    'category:id,name,slug,color',
                    'subject:id,name,slug',
                    'languages:id,code,name,native_name',
                ])
                ->latest()
                ->get(),
        ]);
    }

    public function show(TeachingOffer $offer): Response
    {
        return Inertia::render('admin/teaching-offers/show', [
            'offer' => $offer->load([
                'user:id,name,email,avatar_path,avatar_url',
                'category:id,name,slug,color',
                'subject:id,name,slug',
                'languages:id,code,name,native_name',
            ]),
        ]);
    }

    public function toggleActive(TeachingOffer $offer): RedirectResponse
    {
        $wasActive = $offer->is_active;

        $offer->forceFill([
            'is_active' => ! $offer->is_active,
            'is_accepting_applications' => $offer->is_active ? false : $offer->is_accepting_applications,
        ])->save();

        if ($wasActive && ! $offer->is_active) {
            $offer->user->notify(new TeachingOfferStatusNotification(
                $offer,
                TeachingOfferStatusNotification::EVENT_DEACTIVATED,
            ));
        }

        return back()->with('status', __('ui.admin_teaching_offers.status_updated'));
    }
}
