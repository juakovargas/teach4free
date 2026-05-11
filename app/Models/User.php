<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable([
    'name',
    'email',
    'password',
    'preferred_locale',
    'timezone',
    'bio',
    'is_public',
    'learning_interests',
    'teaching_interests',
    'role',
    'google_id',
    'avatar_url',
    'avatar_path',
])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    public const ROLE_ADMIN = 'admin';

    public const ROLE_USER = 'user';

    /**
     * @var list<string>
     */
    protected $appends = ['avatar', 'initials'];

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function getAvatarAttribute(): ?string
    {
        if ($this->avatar_path) {
            return Storage::disk('public')->url($this->avatar_path);
        }

        return $this->avatar_url;
    }

    public function getInitialsAttribute(): string
    {
        $displayName = trim($this->name !== '' ? $this->name : $this->email);
        $names = preg_split('/\s+/', $displayName) ?: [];

        if ($names === []) {
            return '';
        }

        if (count($names) === 1) {
            return strtoupper(substr($names[0], 0, 1));
        }

        return strtoupper(substr($names[0], 0, 1).substr($names[count($names) - 1], 0, 1));
    }

    /**
     * @return HasMany<UserLanguage, $this>
     */
    public function userLanguages(): HasMany
    {
        return $this->hasMany(UserLanguage::class);
    }

    /**
     * @return HasOne<StudentProfile, $this>
     */
    public function studentProfile(): HasOne
    {
        return $this->hasOne(StudentProfile::class);
    }

    /**
     * @return HasOne<TeacherProfile, $this>
     */
    public function teacherProfile(): HasOne
    {
        return $this->hasOne(TeacherProfile::class);
    }

    /**
     * @return HasMany<TeachingOffer, $this>
     */
    public function teachingOffers(): HasMany
    {
        return $this->hasMany(TeachingOffer::class);
    }

    /**
     * @return HasMany<TeachingOfferApplication, $this>
     */
    public function learningApplications(): HasMany
    {
        return $this->hasMany(TeachingOfferApplication::class, 'student_user_id');
    }

    /**
     * @return HasMany<TeachingOfferApplication, $this>
     */
    public function teachingApplications(): HasMany
    {
        return $this->hasMany(TeachingOfferApplication::class, 'teacher_user_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_public' => 'boolean',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
}
