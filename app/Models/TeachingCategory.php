<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'slug',
    'description',
    'color',
    'icon',
    'is_active',
    'sort_order',
])]
class TeachingCategory extends Model
{
    /**
     * @return HasMany<TeachingSubject, $this>
     */
    public function subjects(): HasMany
    {
        return $this->hasMany(TeachingSubject::class);
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
