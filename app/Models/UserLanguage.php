<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'language_id', 'understands', 'speaks', 'teaches', 'level'])]
class UserLanguage extends Model
{
    public const LEVEL_NATIVE = 'native';

    public const LEVEL_ADVANCED = 'advanced';

    public const LEVEL_INTERMEDIATE = 'intermediate';

    public const LEVEL_BASIC = 'basic';

    public const LEVELS = [
        self::LEVEL_NATIVE,
        self::LEVEL_ADVANCED,
        self::LEVEL_INTERMEDIATE,
        self::LEVEL_BASIC,
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Language, $this>
     */
    public function language(): BelongsTo
    {
        return $this->belongsTo(Language::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'understands' => 'boolean',
            'speaks' => 'boolean',
            'teaches' => 'boolean',
        ];
    }
}
