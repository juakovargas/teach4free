<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'proposed_by_user_id',
    'teaching_category_id',
    'category_proposal_id',
    'name',
    'description',
    'status',
    'admin_notes',
    'reviewed_by',
    'reviewed_at',
    'approved_subject_id',
])]
class SubjectProposal extends Model
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
     * @return BelongsTo<TeachingCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(TeachingCategory::class, 'teaching_category_id');
    }

    /**
     * @return BelongsTo<CategoryProposal, $this>
     */
    public function categoryProposal(): BelongsTo
    {
        return $this->belongsTo(CategoryProposal::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * @return BelongsTo<TeachingSubject, $this>
     */
    public function approvedSubject(): BelongsTo
    {
        return $this->belongsTo(TeachingSubject::class, 'approved_subject_id');
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
