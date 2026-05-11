<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['code', 'name', 'native_name', 'is_active', 'sort_order'])]
class Language extends Model
{
    /**
     * @return HasMany<UserLanguage, $this>
     */
    public function userLanguages(): HasMany
    {
        return $this->hasMany(UserLanguage::class);
    }
}
