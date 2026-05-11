<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'learning_goals', 'current_level', 'preferred_learning_mode', 'availability_notes', 'is_active'])]
class StudentProfile extends Model
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

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
