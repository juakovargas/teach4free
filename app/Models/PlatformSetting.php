<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'platform_name',
    'support_email',
    'default_locale',
    'allow_teacher_category_proposals',
    'allow_teacher_subject_proposals',
    'require_email_verification',
    'allow_public_teacher_profiles',
    'allow_open_public_sessions',
    'maintenance_notice',
    'updated_by',
])]
class PlatformSetting extends Model
{
    public static function current(): self
    {
        return self::query()->firstOrCreate([], [
            'platform_name' => 'Teach4Free',
            'support_email' => 'support@example.com',
            'default_locale' => 'en',
            'allow_teacher_category_proposals' => true,
            'allow_teacher_subject_proposals' => true,
            'require_email_verification' => true,
            'allow_public_teacher_profiles' => true,
            'allow_open_public_sessions' => true,
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
            'allow_teacher_category_proposals' => 'boolean',
            'allow_teacher_subject_proposals' => 'boolean',
            'require_email_verification' => 'boolean',
            'allow_public_teacher_profiles' => 'boolean',
            'allow_open_public_sessions' => 'boolean',
        ];
    }
}
