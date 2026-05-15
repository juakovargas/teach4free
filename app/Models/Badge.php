<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'key',
    'name',
    'description',
    'icon',
    'color',
    'category',
    'rule_type',
    'threshold',
    'is_active',
    'is_public',
    'sort_order',
])]
class Badge extends Model
{
    public const CATEGORY_TEACHING = 'teaching';

    public const CATEGORY_RELIABILITY = 'reliability';

    public const CATEGORY_REVIEWS = 'reviews';

    public const CATEGORY_COMMUNITY = 'community';

    public const CATEGORY_SUBJECT = 'subject';

    public const CATEGORY_MILESTONE = 'milestone';

    public const CATEGORIES = [
        self::CATEGORY_TEACHING,
        self::CATEGORY_RELIABILITY,
        self::CATEGORY_REVIEWS,
        self::CATEGORY_COMMUNITY,
        self::CATEGORY_SUBJECT,
        self::CATEGORY_MILESTONE,
    ];

    public const KEY_FIRST_CLASS_COMPLETED = 'first_class_completed';

    public const KEY_TEN_STUDENTS_HELPED = 'ten_students_helped';

    public const KEY_FIFTY_TEACHING_HOURS = 'fifty_teaching_hours';

    public const KEY_RELIABLE_TEACHER = 'reliable_teacher';

    public const KEY_EXCELLENT_REVIEWS = 'excellent_reviews';

    public const KEY_OPEN_KNOWLEDGE_CONTRIBUTOR = 'open_knowledge_contributor';

    public const KEY_PROGRAMMING_MENTOR = 'programming_mentor';

    public const KEY_LANGUAGE_MENTOR = 'language_mentor';

    public const KEY_COMMUNITY_HELPER = 'community_helper';

    public const KEY_NEW_TEACHER = 'new_teacher';

    /**
     * @param  Builder<Badge>  $query
     * @return Builder<Badge>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * @param  Builder<Badge>  $query
     * @return Builder<Badge>
     */
    public function scopePubliclyVisible(Builder $query): Builder
    {
        return $query->where('is_active', true)->where('is_public', true);
    }

    /**
     * @return HasMany<UserBadge, $this>
     */
    public function userBadges(): HasMany
    {
        return $this->hasMany(UserBadge::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'threshold' => 'integer',
            'is_active' => 'boolean',
            'is_public' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
