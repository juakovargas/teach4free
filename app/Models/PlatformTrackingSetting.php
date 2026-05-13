<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'google_analytics_id',
    'google_tag_manager_id',
    'meta_pixel_id',
    'tiktok_pixel_id',
    'linkedin_partner_id',
    'microsoft_clarity_id',
    'plausible_domain',
    'custom_head_script',
    'custom_body_script',
    'tracking_enabled',
    'cookie_consent_required',
    'updated_by',
])]
class PlatformTrackingSetting extends Model
{
    public static function current(): self
    {
        return self::query()->firstOrCreate([], [
            'tracking_enabled' => false,
            'cookie_consent_required' => true,
        ]);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tracking_enabled' => 'boolean',
            'cookie_consent_required' => 'boolean',
        ];
    }
}
