<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id',
    'teacher_profile_id',
    'teaching_category_id',
    'teaching_subject_id',
    'title',
    'slug',
    'summary',
    'description',
    'level',
    'teaching_mode',
    'session_type',
    'max_students',
    'duration_minutes',
    'meeting_tool',
    'meeting_url',
    'timezone',
    'availability_summary',
    'requirements',
    'materials_summary',
    'is_public',
    'is_active',
    'is_accepting_applications',
    'allow_waiting_list',
    'waiting_list_limit',
    'published_at',
])]
class TeachingOffer extends Model
{
    public const LEVEL_BEGINNER = 'beginner';

    public const LEVEL_INTERMEDIATE = 'intermediate';

    public const LEVEL_ADVANCED = 'advanced';

    public const LEVEL_MIXED = 'mixed';

    public const LEVELS = [
        self::LEVEL_BEGINNER,
        self::LEVEL_INTERMEDIATE,
        self::LEVEL_ADVANCED,
        self::LEVEL_MIXED,
    ];

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

    public const SESSION_PRIVATE_REQUEST = 'private_request';

    public const SESSION_SCHEDULED_GROUP = 'scheduled_group';

    public const SESSION_OPEN_PUBLIC = 'open_public';

    public const SESSION_TYPES = [
        self::SESSION_PRIVATE_REQUEST,
        self::SESSION_SCHEDULED_GROUP,
        self::SESSION_OPEN_PUBLIC,
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

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * @param  Builder<TeachingOffer>  $query
     * @return Builder<TeachingOffer>
     */
    public function scopePubliclyVisible(Builder $query): Builder
    {
        return $query
            ->where('is_public', true)
            ->where('is_active', true)
            ->whereNotNull('published_at');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<TeacherProfile, $this>
     */
    public function teacherProfile(): BelongsTo
    {
        return $this->belongsTo(TeacherProfile::class);
    }

    /**
     * @return BelongsTo<TeachingCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(TeachingCategory::class, 'teaching_category_id');
    }

    /**
     * @return BelongsTo<TeachingSubject, $this>
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(TeachingSubject::class, 'teaching_subject_id');
    }

    /**
     * @return BelongsToMany<Language, $this>
     */
    public function languages(): BelongsToMany
    {
        return $this->belongsToMany(Language::class, 'teaching_offer_languages')->withTimestamps();
    }

    /**
     * @return HasMany<TeachingOfferApplication, $this>
     */
    public function applications(): HasMany
    {
        return $this->hasMany(TeachingOfferApplication::class);
    }

    /**
     * @return HasMany<ClassSession, $this>
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(ClassSession::class);
    }

    /**
     * @return HasMany<TeacherReview, $this>
     */
    public function teacherReviews(): HasMany
    {
        return $this->hasMany(TeacherReview::class);
    }

    public function acceptedApplicationsCount(): int
    {
        return $this->applications()
            ->where('status', TeachingOfferApplication::STATUS_ACCEPTED)
            ->count();
    }

    public function waitlistedApplicationsCount(): int
    {
        return $this->applications()
            ->where('status', TeachingOfferApplication::STATUS_WAITLISTED)
            ->count();
    }

    public function availableSeats(): ?int
    {
        if ($this->max_students === null) {
            return null;
        }

        return max(0, $this->max_students - $this->acceptedApplicationsCount());
    }

    public function hasSeatAvailable(): bool
    {
        return $this->max_students === null || $this->acceptedApplicationsCount() < $this->max_students;
    }

    public function waitingListHasRoom(): bool
    {
        return $this->allow_waiting_list
            && ($this->waiting_list_limit === null || $this->waitlistedApplicationsCount() < $this->waiting_list_limit);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
            'is_active' => 'boolean',
            'is_accepting_applications' => 'boolean',
            'allow_waiting_list' => 'boolean',
            'waiting_list_limit' => 'integer',
            'max_students' => 'integer',
            'duration_minutes' => 'integer',
            'published_at' => 'datetime',
        ];
    }
}
