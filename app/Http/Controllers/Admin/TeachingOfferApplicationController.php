<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TeachingOfferApplication;
use Inertia\Inertia;
use Inertia\Response;

class TeachingOfferApplicationController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/applications/index', [
            'applications' => TeachingOfferApplication::query()
                ->with([
                    'student:id,name,email,avatar_path,avatar_url',
                    'teacher:id,name,email,avatar_path,avatar_url',
                    'preferredLanguage:id,code,name,native_name',
                    'offer:id,title,slug,teaching_category_id,teaching_subject_id',
                    'offer.category:id,name,slug,color',
                    'offer.subject:id,name,slug',
                ])
                ->latest('requested_at')
                ->get(),
        ]);
    }
}
