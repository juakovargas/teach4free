<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'teaching_category_id',
    'name',
    'slug',
    'description',
    'is_active',
    'sort_order',
])]
class TeachingSubject extends Model
{
    /**
     * @return BelongsTo<TeachingCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(TeachingCategory::class, 'teaching_category_id');
    }

    /**
     * @return HasMany<TeachingOffer, $this>
     */
    public function offers(): HasMany
    {
        return $this->hasMany(TeachingOffer::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
