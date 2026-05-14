<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'banner_enabled',
    'consent_required_regions',
    'custom_required_country_codes',
    'consent_duration_days',
    'consent_version',
    'show_reject_button',
    'show_configure_button',
    'block_analytics_until_consent',
    'block_marketing_until_consent',
    'block_external_content_until_consent',
    'banner_style',
    'updated_by',
])]
class CookieSetting extends Model
{
    public const REGION_ALL = 'all';

    public const REGION_EU_EEA_UK_CH = 'eu_eea_uk_ch';

    public const REGION_CUSTOM = 'custom';

    public const STYLE_MODAL_CENTER = 'modal_center';

    public const STYLE_BOTTOM_BANNER = 'bottom_banner';

    public static function current(): self
    {
        return self::query()->firstOrCreate([], self::defaults());
    }

    /**
     * @return array<string, mixed>
     */
    public static function defaults(): array
    {
        return [
            'banner_enabled' => true,
            'consent_required_regions' => self::REGION_EU_EEA_UK_CH,
            'custom_required_country_codes' => null,
            'consent_duration_days' => 180,
            'consent_version' => '1.0',
            'show_reject_button' => true,
            'show_configure_button' => true,
            'block_analytics_until_consent' => true,
            'block_marketing_until_consent' => true,
            'block_external_content_until_consent' => true,
            'banner_style' => self::STYLE_MODAL_CENTER,
        ];
    }

    /**
     * @return array<int, int>
     */
    public static function allowedDurations(): array
    {
        return [30, 90, 180, 365];
    }

    /**
     * @return array<int, string>
     */
    public static function regionModes(): array
    {
        return [
            self::REGION_ALL,
            self::REGION_EU_EEA_UK_CH,
            self::REGION_CUSTOM,
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function bannerStyles(): array
    {
        return [
            self::STYLE_MODAL_CENTER,
            self::STYLE_BOTTOM_BANNER,
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function consentRequiredCountryCodes(): array
    {
        return [
            'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
            'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
            'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO',
            'GB', 'CH',
        ];
    }

    /**
     * @return array<int, string>
     */
    public function customCountryCodes(): array
    {
        if (! $this->custom_required_country_codes) {
            return [];
        }

        return collect(preg_split('/[\s,;]+/', $this->custom_required_country_codes) ?: [])
            ->map(fn (string $code): string => strtoupper(trim($code)))
            ->filter(fn (string $code): bool => preg_match('/^[A-Z]{2}$/', $code) === 1)
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'banner_enabled' => 'boolean',
            'consent_duration_days' => 'integer',
            'show_reject_button' => 'boolean',
            'show_configure_button' => 'boolean',
            'block_analytics_until_consent' => 'boolean',
            'block_marketing_until_consent' => 'boolean',
            'block_external_content_until_consent' => 'boolean',
        ];
    }
}
