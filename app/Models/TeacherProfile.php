<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'user_id',
    'headline',
    'teaching_bio',
    'experience_summary',
    'preferred_teaching_mode',
    'max_students_per_session',
    'default_session_duration_minutes',
    'meeting_tool',
    'meeting_url',
    'banner_path',
    'is_active',
    'is_accepting_requests',
    'is_verified',
    'activated_at',
    'paused_at',
])]
class TeacherProfile extends Model
{
    /**
     * @var list<string>
     */
    protected $appends = ['banner'];

    public const MODE_ONE_TO_ONE = 'one_to_one';

    public const MODE_SMALL_GROUP = 'small_group';

    public const MODE_OPEN_GROUP = 'open_group';

    public const MODE_MENTORING = 'mentoring';

    public const MODE_ANY = 'any';

    public const MODES = [
        self::MODE_ONE_TO_ONE,
        self::MODE_SMALL_GROUP,
        self::MODE_OPEN_GROUP,
        self::MODE_MENTORING,
        self::MODE_ANY,
    ];

    public const TOOL_GOOGLE_MEET = 'google_meet';

    public const TOOL_JITSI = 'jitsi';

    public const TOOL_ZOOM = 'zoom';

    public const TOOL_DISCORD = 'discord';

    public const TOOL_MICROSOFT_TEAMS = 'microsoft_teams';

    public const TOOL_CUSTOM = 'custom';

    public const TOOL_NOT_DECIDED = 'not_decided';

    public const MEETING_TOOLS = [
        self::TOOL_GOOGLE_MEET,
        self::TOOL_JITSI,
        self::TOOL_ZOOM,
        self::TOOL_DISCORD,
        self::TOOL_MICROSOFT_TEAMS,
        self::TOOL_CUSTOM,
        self::TOOL_NOT_DECIDED,
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<TeacherAvailability, $this>
     */
    public function availabilities(): HasMany
    {
        return $this->hasMany(TeacherAvailability::class);
    }

    /**
     * @return HasMany<TeacherAvailabilityException, $this>
     */
    public function availabilityExceptions(): HasMany
    {
        return $this->hasMany(TeacherAvailabilityException::class);
    }

    public function getBannerAttribute(): ?string
    {
        if (! $this->banner_path) {
            return null;
        }

        return Storage::disk('public')->url($this->banner_path);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_accepting_requests' => 'boolean',
            'is_verified' => 'boolean',
            'activated_at' => 'datetime',
            'paused_at' => 'datetime',
        ];
    }
}
