<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'proposed_by_user_id',
    'name',
    'description',
    'suggested_color',
    'suggested_icon',
    'status',
    'admin_notes',
    'reviewed_by',
    'reviewed_at',
    'approved_category_id',
])]
class CategoryProposal extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_MERGED = 'merged';

    public const STATUSES = [
        self::STATUS_PENDING,
        self::STATUS_APPROVED,
        self::STATUS_REJECTED,
        self::STATUS_MERGED,
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function proposer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'proposed_by_user_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * @return BelongsTo<TeachingCategory, $this>
     */
    public function approvedCategory(): BelongsTo
    {
        return $this->belongsTo(TeachingCategory::class, 'approved_category_id');
    }

    /**
     * @return HasMany<SubjectProposal, $this>
     */
    public function subjectProposals(): HasMany
    {
        return $this->hasMany(SubjectProposal::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }
}
