<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'badge_id',
    'awarded_at',
    'awarded_reason',
    'source_type',
    'source_id',
    'is_visible',
    'is_featured',
    'featured_sort_order',
    'hidden_at',
    'hidden_by_user',
    'revoked_at',
    'revoked_by',
    'revoked_reason',
])]
class UserBadge extends Model
{
    public const FEATURED_LIMIT = 3;

    /**
     * @param  Builder<UserBadge>  $query
     * @return Builder<UserBadge>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNull('revoked_at');
    }

    /**
     * @param  Builder<UserBadge>  $query
     * @return Builder<UserBadge>
     */
    public function scopePubliclyVisible(Builder $query): Builder
    {
        return $query
            ->active()
            ->where('is_visible', true)
            ->whereHas('badge', fn (Builder $query) => $query->publiclyVisible());
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Badge, $this>
     */
    public function badge(): BelongsTo
    {
        return $this->belongsTo(Badge::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function revokedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'revoked_by');
    }

    /**
     * @return array<string, mixed>
     */
    public function publicPayload(): array
    {
        return [
            'id' => $this->id,
            'key' => $this->badge?->key,
            'name' => $this->badge?->name,
            'description' => $this->badge?->description,
            'icon' => $this->badge?->icon,
            'color' => $this->badge?->color,
            'category' => $this->badge?->category,
            'awarded_at' => $this->awarded_at?->toISOString(),
            'awarded_reason' => $this->awarded_reason,
            'is_visible' => $this->is_visible,
            'is_featured' => $this->is_featured,
            'revoked_at' => $this->revoked_at?->toISOString(),
        ];
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'awarded_at' => 'datetime',
            'is_visible' => 'boolean',
            'is_featured' => 'boolean',
            'featured_sort_order' => 'integer',
            'hidden_at' => 'datetime',
            'hidden_by_user' => 'boolean',
            'revoked_at' => 'datetime',
        ];
    }
}
