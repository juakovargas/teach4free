<?php

namespace App\Services;

use App\Models\Badge;
use App\Models\ClassSession;
use App\Models\TeachingOffer;
use App\Models\User;
use App\Models\UserBadge;
use App\Notifications\BadgeAwardedNotification;
use Illuminate\Support\Collection;

class BadgeAwardingService
{
    public function __construct(private readonly TeacherReputationService $reputations) {}

    /**
     * @return array<string, array<string, mixed>>
     */
    public function defaultBadgeDefinitions(): array
    {
        return [
            Badge::KEY_FIRST_CLASS_COMPLETED => [
                'name' => 'First class completed',
                'description' => 'Completed the first free class session on Teach4Free.',
                'icon' => 'GraduationCap',
                'color' => '#0F766E',
                'category' => Badge::CATEGORY_MILESTONE,
                'rule_type' => 'completed_sessions',
                'threshold' => 1,
                'sort_order' => 10,
            ],
            Badge::KEY_TEN_STUDENTS_HELPED => [
                'name' => '10 students helped',
                'description' => 'Helped at least 10 unique learners through completed sessions.',
                'icon' => 'Users',
                'color' => '#2563EB',
                'category' => Badge::CATEGORY_TEACHING,
                'rule_type' => 'students_helped',
                'threshold' => 10,
                'sort_order' => 20,
            ],
            Badge::KEY_FIFTY_TEACHING_HOURS => [
                'name' => '50 teaching hours',
                'description' => 'Reached 50 completed teaching hours.',
                'icon' => 'Clock',
                'color' => '#7C3AED',
                'category' => Badge::CATEGORY_MILESTONE,
                'rule_type' => 'teaching_hours',
                'threshold' => 50,
                'sort_order' => 30,
            ],
            Badge::KEY_RELIABLE_TEACHER => [
                'name' => 'Reliable teacher',
                'description' => 'Completed enough sessions with low cancellation and no-show rates.',
                'icon' => 'ShieldCheck',
                'color' => '#059669',
                'category' => Badge::CATEGORY_RELIABILITY,
                'rule_type' => 'reliability',
                'threshold' => 10,
                'sort_order' => 40,
            ],
            Badge::KEY_EXCELLENT_REVIEWS => [
                'name' => 'Excellent reviews',
                'description' => 'Earned strong public reviews from learners.',
                'icon' => 'Star',
                'color' => '#D97706',
                'category' => Badge::CATEGORY_REVIEWS,
                'rule_type' => 'reviews',
                'threshold' => 10,
                'sort_order' => 50,
            ],
            Badge::KEY_OPEN_KNOWLEDGE_CONTRIBUTOR => [
                'name' => 'Open knowledge contributor',
                'description' => 'Published several free offers or open public learning opportunities.',
                'icon' => 'BookOpen',
                'color' => '#0891B2',
                'category' => Badge::CATEGORY_COMMUNITY,
                'rule_type' => 'open_knowledge',
                'threshold' => 5,
                'sort_order' => 60,
            ],
            Badge::KEY_PROGRAMMING_MENTOR => [
                'name' => 'Programming mentor',
                'description' => 'Shared free programming help through offers or completed sessions.',
                'icon' => 'Code2',
                'color' => '#4F46E5',
                'category' => Badge::CATEGORY_SUBJECT,
                'rule_type' => 'category_programming',
                'threshold' => 5,
                'sort_order' => 70,
            ],
            Badge::KEY_LANGUAGE_MENTOR => [
                'name' => 'Language mentor',
                'description' => 'Shared free language help through offers or completed sessions.',
                'icon' => 'Languages',
                'color' => '#DB2777',
                'category' => Badge::CATEGORY_SUBJECT,
                'rule_type' => 'category_languages',
                'threshold' => 5,
                'sort_order' => 80,
            ],
            Badge::KEY_COMMUNITY_HELPER => [
                'name' => 'Community helper',
                'description' => 'Helped several learners and participates in open public learning.',
                'icon' => 'HeartHandshake',
                'color' => '#EA580C',
                'category' => Badge::CATEGORY_COMMUNITY,
                'rule_type' => 'community_help',
                'threshold' => 5,
                'sort_order' => 90,
            ],
            Badge::KEY_NEW_TEACHER => [
                'name' => 'New teacher',
                'description' => 'Started building a public teaching history on Teach4Free.',
                'icon' => 'Sparkles',
                'color' => '#64748B',
                'category' => Badge::CATEGORY_MILESTONE,
                'rule_type' => 'new_teacher',
                'threshold' => 1,
                'sort_order' => 100,
            ],
        ];
    }

    public function seedDefaultBadges(bool $overwrite = false): void
    {
        foreach ($this->defaultBadgeDefinitions() as $key => $definition) {
            $badge = Badge::query()->firstOrNew(['key' => $key]);

            if (! $badge->exists || $overwrite) {
                $badge->fill([
                    ...$definition,
                    'key' => $key,
                    'is_active' => true,
                    'is_public' => true,
                ])->save();
            }
        }
    }

    public function awardForAllTeachers(bool $notify = true): int
    {
        $this->seedDefaultBadges();
        $awarded = 0;

        User::query()
            ->whereHas('teacherProfile', fn ($query) => $query->where('is_active', true))
            ->with('teacherProfile')
            ->get()
            ->each(function (User $teacher) use (&$awarded, $notify): void {
                $awarded += $this->awardForTeacher($teacher, $notify)->count();
            });

        return $awarded;
    }

    /**
     * @return Collection<int, UserBadge>
     */
    public function awardForTeacher(User|int $teacher, bool $notify = true): Collection
    {
        $this->seedDefaultBadges();

        $teacher = $teacher instanceof User
            ? $teacher->loadMissing('teacherProfile')
            : User::query()->with('teacherProfile')->find($teacher);

        if (! $teacher || ! $teacher->teacherProfile?->is_active) {
            return collect();
        }

        $badges = Badge::query()
            ->active()
            ->whereIn('key', array_keys($this->defaultBadgeDefinitions()))
            ->get()
            ->keyBy('key');
        $eligible = $this->eligibleBadgeReasons($teacher);
        $awarded = collect();

        foreach ($eligible as $badgeKey => $reason) {
            $badge = $badges->get($badgeKey);

            if (! $badge) {
                continue;
            }

            $userBadge = UserBadge::query()->firstOrNew([
                'user_id' => $teacher->id,
                'badge_id' => $badge->id,
            ]);

            if ($userBadge->exists) {
                continue;
            }

            $userBadge->fill([
                'awarded_at' => now(),
                'awarded_reason' => $reason,
                'source_type' => 'badge_rule',
                'source_id' => null,
                'is_visible' => true,
                'is_featured' => false,
                'featured_sort_order' => 0,
            ])->save();
            $userBadge->load('badge');

            if ($notify) {
                $teacher->notify(new BadgeAwardedNotification($userBadge));
            }

            $awarded->push($userBadge);
        }

        return $awarded;
    }

    /**
     * @return array<string, string>
     */
    private function eligibleBadgeReasons(User $teacher): array
    {
        $summary = $this->reputations->forTeacher($teacher);
        $activePublicOffers = TeachingOffer::query()
            ->publiclyVisible()
            ->where('user_id', $teacher->id)
            ->count();
        $openPublicOffers = TeachingOffer::query()
            ->publiclyVisible()
            ->where('user_id', $teacher->id)
            ->where('session_type', TeachingOffer::SESSION_OPEN_PUBLIC)
            ->count();
        $openPublicSessions = ClassSession::query()
            ->where('teacher_user_id', $teacher->id)
            ->whereIn('status', [ClassSession::STATUS_SCHEDULED, ClassSession::STATUS_COMPLETED])
            ->whereHas('offer', fn ($query) => $query->where('session_type', TeachingOffer::SESSION_OPEN_PUBLIC))
            ->count();
        $programmingActivity = $this->categoryActivity($teacher, 'programming', 'Programming');
        $languageActivity = $this->categoryActivity($teacher, 'languages', 'Languages');

        return collect([
            Badge::KEY_FIRST_CLASS_COMPLETED => $summary['completed_sessions_count'] >= 1,
            Badge::KEY_TEN_STUDENTS_HELPED => $summary['students_helped_count'] >= 10,
            Badge::KEY_FIFTY_TEACHING_HOURS => $summary['teaching_hours'] >= 50,
            Badge::KEY_RELIABLE_TEACHER => $summary['completed_sessions_count'] >= 10
                && $summary['cancellation_rate'] <= 5
                && $summary['no_show_rate'] <= 3,
            Badge::KEY_EXCELLENT_REVIEWS => $summary['published_review_count'] >= 10
                && $summary['average_rating'] !== null
                && $summary['average_rating'] >= 4.7,
            Badge::KEY_OPEN_KNOWLEDGE_CONTRIBUTOR => $activePublicOffers >= 5 || ($openPublicOffers + $openPublicSessions) >= 3,
            Badge::KEY_PROGRAMMING_MENTOR => $programmingActivity >= 5,
            Badge::KEY_LANGUAGE_MENTOR => $languageActivity >= 5,
            Badge::KEY_COMMUNITY_HELPER => $summary['students_helped_count'] >= 5 && ($openPublicOffers + $openPublicSessions) >= 1,
            Badge::KEY_NEW_TEACHER => $summary['completed_sessions_count'] < 3 && $summary['published_review_count'] < 3,
        ])
            ->filter()
            ->mapWithKeys(fn (bool $eligible, string $key): array => [
                $key => 'badges.award_reasons.'.$key,
            ])
            ->all();
    }

    private function categoryActivity(User $teacher, string $slug, string $name): int
    {
        $completedSessions = ClassSession::query()
            ->where('teacher_user_id', $teacher->id)
            ->where('status', ClassSession::STATUS_COMPLETED)
            ->whereHas('offer.category', fn ($query) => $query
                ->where('slug', $slug)
                ->orWhere('name', $name))
            ->count();
        $activeOffers = TeachingOffer::query()
            ->publiclyVisible()
            ->where('user_id', $teacher->id)
            ->whereHas('category', fn ($query) => $query
                ->where('slug', $slug)
                ->orWhere('name', $name))
            ->count();

        return $completedSessions + $activeOffers;
    }
}
