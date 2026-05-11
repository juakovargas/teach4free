<?php

namespace Database\Seeders;

use App\Models\Language;
use App\Models\StudentProfile;
use App\Models\TeacherProfile;
use App\Models\TeachingCategory;
use App\Models\TeachingOffer;
use App\Models\TeachingOfferApplication;
use App\Models\TeachingSubject;
use App\Models\User;
use App\Models\UserLanguage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $languages = collect([
            ['code' => 'en', 'name' => 'English', 'native_name' => 'English', 'sort_order' => 1],
            ['code' => 'es', 'name' => 'Spanish', 'native_name' => 'Español', 'sort_order' => 2],
            ['code' => 'fr', 'name' => 'French', 'native_name' => 'Français', 'sort_order' => 3],
        ])->mapWithKeys(function (array $language): array {
            $model = Language::updateOrCreate(
                ['code' => $language['code']],
                [
                    'name' => $language['name'],
                    'native_name' => $language['native_name'],
                    'is_active' => true,
                    'sort_order' => $language['sort_order'],
                ],
            );

            return [$model->code => $model];
        });

        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Teach4Free Admin',
                'password' => Hash::make('password'),
                'preferred_locale' => 'en',
                'timezone' => 'Europe/Madrid',
                'is_public' => false,
                'role' => User::ROLE_ADMIN,
                'email_verified_at' => now(),
            ],
        );

        $user = User::updateOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Teach4Free User',
                'password' => Hash::make('password'),
                'preferred_locale' => 'en',
                'timezone' => 'Europe/Madrid',
                'bio' => 'Local development learner preparing to use Teach4Free.',
                'is_public' => true,
                'learning_interests' => 'Programming, languages and mentoring.',
                'teaching_interests' => 'Introductory web development.',
                'role' => User::ROLE_USER,
                'email_verified_at' => now(),
            ],
        );

        $demoTeacher = User::updateOrCreate(
            ['email' => 'teacher@example.com'],
            [
                'name' => 'Demo Teacher Learner',
                'password' => Hash::make('password'),
                'preferred_locale' => 'en',
                'timezone' => 'Europe/Madrid',
                'bio' => 'Local demo user who can teach and also apply as a student.',
                'is_public' => true,
                'learning_interests' => 'Language practice and mentoring.',
                'teaching_interests' => 'Conversation practice.',
                'role' => User::ROLE_USER,
                'email_verified_at' => now(),
            ],
        );

        $demoStudent = User::updateOrCreate(
            ['email' => 'student@example.com'],
            [
                'name' => 'Demo Student',
                'password' => Hash::make('password'),
                'preferred_locale' => 'en',
                'timezone' => 'Europe/Madrid',
                'bio' => 'Local demo student for application flows.',
                'is_public' => true,
                'learning_interests' => 'Programming basics and conversation practice.',
                'teaching_interests' => null,
                'role' => User::ROLE_USER,
                'email_verified_at' => now(),
            ],
        );

        StudentProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'learning_goals' => 'Find free mentoring sessions and practice consistently.',
                'current_level' => StudentProfile::LEVEL_MIXED,
                'preferred_learning_mode' => StudentProfile::MODE_MENTORING,
                'availability_notes' => 'Weekday evenings are usually best.',
                'is_active' => true,
            ],
        );

        $teacherProfile = TeacherProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'headline' => 'Friendly web development helper',
                'teaching_bio' => 'Available to help beginners understand Laravel and React basics.',
                'experience_summary' => 'Practice profile for local development only.',
                'preferred_teaching_mode' => TeacherProfile::MODE_SMALL_GROUP,
                'max_students_per_session' => 5,
                'default_session_duration_minutes' => 60,
                'meeting_tool' => TeacherProfile::TOOL_NOT_DECIDED,
                'meeting_url' => null,
                'is_active' => true,
                'is_accepting_requests' => true,
                'is_verified' => false,
                'activated_at' => now(),
                'paused_at' => null,
            ],
        );

        TeacherProfile::updateOrCreate(
            ['user_id' => $demoTeacher->id],
            [
                'headline' => 'Conversation practice helper',
                'teaching_bio' => 'Demo profile for testing a user who can teach and learn.',
                'experience_summary' => 'Local development account.',
                'preferred_teaching_mode' => TeacherProfile::MODE_OPEN_GROUP,
                'max_students_per_session' => 8,
                'default_session_duration_minutes' => 45,
                'meeting_tool' => TeacherProfile::TOOL_NOT_DECIDED,
                'meeting_url' => null,
                'is_active' => true,
                'is_accepting_requests' => true,
                'is_verified' => false,
                'activated_at' => now(),
                'paused_at' => null,
            ],
        );

        StudentProfile::updateOrCreate(
            ['user_id' => $demoTeacher->id],
            [
                'learning_goals' => 'Keep learning while also offering free help.',
                'current_level' => StudentProfile::LEVEL_MIXED,
                'preferred_learning_mode' => StudentProfile::MODE_ANY,
                'availability_notes' => 'Flexible demo availability.',
                'is_active' => true,
            ],
        );

        StudentProfile::updateOrCreate(
            ['user_id' => $demoStudent->id],
            [
                'learning_goals' => 'Practice applying to free teaching offers.',
                'current_level' => StudentProfile::LEVEL_BEGINNER,
                'preferred_learning_mode' => StudentProfile::MODE_SMALL_GROUP,
                'availability_notes' => 'Weekday evenings for demo testing.',
                'is_active' => true,
            ],
        );

        foreach ($languages as $language) {
            UserLanguage::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'language_id' => $language->id,
                ],
                [
                    'understands' => true,
                    'speaks' => $language->code !== 'fr',
                    'teaches' => in_array($language->code, ['en', 'es'], true),
                    'level' => $language->code === 'en'
                        ? UserLanguage::LEVEL_ADVANCED
                        : UserLanguage::LEVEL_INTERMEDIATE,
                ],
            );
        }

        foreach ([$demoTeacher, $demoStudent] as $demoLearner) {
            foreach ($languages as $language) {
                UserLanguage::updateOrCreate(
                    [
                        'user_id' => $demoLearner->id,
                        'language_id' => $language->id,
                    ],
                    [
                        'understands' => true,
                        'speaks' => $language->code === 'en',
                        'teaches' => $demoLearner->is($demoTeacher) && $language->code === 'en',
                        'level' => $language->code === 'en'
                            ? UserLanguage::LEVEL_ADVANCED
                            : UserLanguage::LEVEL_BASIC,
                    ],
                );
            }
        }

        $categories = collect([
            ['name' => 'Programming', 'slug' => 'programming', 'description' => 'Free software, web and coding help.', 'color' => '#0f766e', 'icon' => 'code', 'sort_order' => 1],
            ['name' => 'Languages', 'slug' => 'languages', 'description' => 'Conversation practice and language support.', 'color' => '#2563eb', 'icon' => 'languages', 'sort_order' => 2],
            ['name' => 'Mathematics', 'slug' => 'mathematics', 'description' => 'Math foundations and problem solving.', 'color' => '#7c3aed', 'icon' => 'calculator', 'sort_order' => 3],
            ['name' => 'Science', 'slug' => 'science', 'description' => 'Science learning and explanations.', 'color' => '#0891b2', 'icon' => 'flask', 'sort_order' => 4],
            ['name' => 'Music', 'slug' => 'music', 'description' => 'Music theory, practice and creative help.', 'color' => '#db2777', 'icon' => 'music', 'sort_order' => 5],
            ['name' => 'Design', 'slug' => 'design', 'description' => 'Design tools, UI and creative workflows.', 'color' => '#ea580c', 'icon' => 'palette', 'sort_order' => 6],
            ['name' => 'Business', 'slug' => 'business', 'description' => 'Free help with business basics and planning.', 'color' => '#475569', 'icon' => 'briefcase', 'sort_order' => 7],
            ['name' => 'Personal development', 'slug' => 'personal-development', 'description' => 'Mentoring, study habits and personal growth.', 'color' => '#16a34a', 'icon' => 'sparkles', 'sort_order' => 8],
        ])->mapWithKeys(function (array $category): array {
            $model = TeachingCategory::updateOrCreate(
                ['slug' => $category['slug']],
                [
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'color' => $category['color'],
                    'icon' => $category['icon'],
                    'is_active' => true,
                    'sort_order' => $category['sort_order'],
                ],
            );

            return [$model->slug => $model];
        });

        $subjects = collect([
            ['category' => 'programming', 'name' => 'Laravel', 'slug' => 'laravel', 'description' => 'Laravel basics, MVC and practical web development.', 'sort_order' => 1],
            ['category' => 'programming', 'name' => 'PHP', 'slug' => 'php', 'description' => 'PHP language fundamentals and backend practice.', 'sort_order' => 2],
            ['category' => 'programming', 'name' => 'JavaScript', 'slug' => 'javascript', 'description' => 'JavaScript fundamentals for the web.', 'sort_order' => 3],
            ['category' => 'programming', 'name' => 'React', 'slug' => 'react', 'description' => 'React components, state and frontend workflows.', 'sort_order' => 4],
            ['category' => 'programming', 'name' => 'Python', 'slug' => 'python', 'description' => 'Python basics and learning support.', 'sort_order' => 5],
            ['category' => 'programming', 'name' => 'Git', 'slug' => 'git', 'description' => 'Version control basics for new developers.', 'sort_order' => 6],
            ['category' => 'languages', 'name' => 'English conversation', 'slug' => 'english-conversation', 'description' => 'Practice English conversation for free.', 'sort_order' => 1],
            ['category' => 'languages', 'name' => 'Spanish conversation', 'slug' => 'spanish-conversation', 'description' => 'Practice Spanish conversation for free.', 'sort_order' => 2],
            ['category' => 'languages', 'name' => 'French conversation', 'slug' => 'french-conversation', 'description' => 'Practice French conversation for free.', 'sort_order' => 3],
            ['category' => 'mathematics', 'name' => 'Basic mathematics', 'slug' => 'basic-mathematics', 'description' => 'Arithmetic and math fundamentals.', 'sort_order' => 1],
            ['category' => 'mathematics', 'name' => 'Algebra', 'slug' => 'algebra', 'description' => 'Algebra help and practice.', 'sort_order' => 2],
            ['category' => 'design', 'name' => 'UI design', 'slug' => 'ui-design', 'description' => 'Interface design foundations.', 'sort_order' => 1],
            ['category' => 'design', 'name' => 'Figma', 'slug' => 'figma', 'description' => 'Figma basics and design workflows.', 'sort_order' => 2],
        ])->mapWithKeys(function (array $subject) use ($categories): array {
            $model = TeachingSubject::updateOrCreate(
                ['slug' => $subject['slug']],
                [
                    'teaching_category_id' => $categories[$subject['category']]->id,
                    'name' => $subject['name'],
                    'description' => $subject['description'],
                    'is_active' => true,
                    'sort_order' => $subject['sort_order'],
                ],
            );

            return [$model->slug => $model];
        });

        $demoOffers = [
            [
                'title' => 'Laravel for beginners',
                'slug' => 'laravel-for-beginners',
                'category' => 'programming',
                'subject' => 'laravel',
                'summary' => 'A free small-group introduction to Laravel routing, controllers and Blade/Inertia basics.',
                'description' => 'We will walk through Laravel fundamentals with beginner-friendly explanations and practical examples. This offer is completely free.',
                'level' => TeachingOffer::LEVEL_BEGINNER,
                'teaching_mode' => TeachingOffer::MODE_SMALL_GROUP,
                'session_type' => TeachingOffer::SESSION_SCHEDULED_GROUP,
                'duration_minutes' => 60,
                'max_students' => 5,
                'meeting_tool' => TeachingOffer::TOOL_NOT_DECIDED,
                'meeting_url' => null,
                'availability_summary' => 'Weekday evenings, Europe/Madrid timezone.',
                'requirements' => 'Basic PHP knowledge is helpful but not required.',
                'materials_summary' => 'Free documentation links and example snippets.',
                'languages' => ['en', 'es'],
            ],
            [
                'title' => 'English conversation practice',
                'slug' => 'english-conversation-practice',
                'category' => 'languages',
                'subject' => 'english-conversation',
                'summary' => 'An open free conversation practice session for intermediate learners.',
                'description' => 'Join an open public conversation session using an external free meeting link. The session is free and community-focused.',
                'level' => TeachingOffer::LEVEL_INTERMEDIATE,
                'teaching_mode' => TeachingOffer::MODE_OPEN_GROUP,
                'session_type' => TeachingOffer::SESSION_OPEN_PUBLIC,
                'duration_minutes' => 45,
                'max_students' => 100,
                'meeting_tool' => TeachingOffer::TOOL_JITSI,
                'meeting_url' => 'https://meet.jit.si/teach4free-english-practice-demo',
                'availability_summary' => 'Saturday mornings, open community session.',
                'requirements' => 'Intermediate English level recommended.',
                'materials_summary' => 'Free conversation prompts shared during the session.',
                'languages' => ['en'],
            ],
            [
                'title' => 'Git basics for new developers',
                'slug' => 'git-basics-for-new-developers',
                'category' => 'programming',
                'subject' => 'git',
                'summary' => 'Free one-to-one mentoring for your first Git commands and workflows.',
                'description' => 'Ask questions about repositories, commits, branches and common Git mistakes. This is a free private request offer.',
                'level' => TeachingOffer::LEVEL_BEGINNER,
                'teaching_mode' => TeachingOffer::MODE_MENTORING,
                'session_type' => TeachingOffer::SESSION_PRIVATE_REQUEST,
                'duration_minutes' => 60,
                'max_students' => 1,
                'meeting_tool' => TeachingOffer::TOOL_NOT_DECIDED,
                'meeting_url' => null,
                'availability_summary' => 'Flexible weekday evenings.',
                'requirements' => 'Install Git before the session if possible.',
                'materials_summary' => 'Free Git documentation and practice commands.',
                'languages' => ['es'],
            ],
        ];

        foreach ($demoOffers as $offerData) {
            $offer = TeachingOffer::updateOrCreate(
                ['slug' => $offerData['slug']],
                [
                    'user_id' => $user->id,
                    'teacher_profile_id' => $teacherProfile->id,
                    'teaching_category_id' => $categories[$offerData['category']]->id,
                    'teaching_subject_id' => $subjects[$offerData['subject']]->id,
                    'title' => $offerData['title'],
                    'summary' => $offerData['summary'],
                    'description' => $offerData['description'],
                    'level' => $offerData['level'],
                    'teaching_mode' => $offerData['teaching_mode'],
                    'session_type' => $offerData['session_type'],
                    'max_students' => $offerData['max_students'],
                    'duration_minutes' => $offerData['duration_minutes'],
                    'meeting_tool' => $offerData['meeting_tool'],
                    'meeting_url' => $offerData['meeting_url'],
                    'timezone' => 'Europe/Madrid',
                    'availability_summary' => $offerData['availability_summary'],
                    'requirements' => $offerData['requirements'],
                    'materials_summary' => $offerData['materials_summary'],
                    'is_public' => true,
                    'is_active' => true,
                    'is_accepting_applications' => true,
                    'allow_waiting_list' => true,
                    'waiting_list_limit' => 20,
                    'published_at' => now(),
                ],
            );

            $offer->languages()->sync(
                $languages
                    ->only($offerData['languages'])
                    ->pluck('id')
                    ->values()
                    ->all()
            );
        }

        $laravelOffer = TeachingOffer::query()->where('slug', 'laravel-for-beginners')->first();
        $gitOffer = TeachingOffer::query()->where('slug', 'git-basics-for-new-developers')->first();

        if ($laravelOffer) {
            TeachingOfferApplication::updateOrCreate(
                [
                    'teaching_offer_id' => $laravelOffer->id,
                    'student_user_id' => $demoStudent->id,
                ],
                [
                    'teacher_user_id' => $user->id,
                    'preferred_language_id' => $languages['en']->id,
                    'status' => TeachingOfferApplication::STATUS_PENDING,
                    'message' => 'I would like help getting started with Laravel routes and controllers.',
                    'availability_note' => 'Evenings are best for this demo student.',
                    'teacher_response' => null,
                    'requested_at' => now()->subDays(3),
                    'accepted_at' => null,
                    'rejected_at' => null,
                    'cancelled_at' => null,
                ],
            );
        }

        if ($gitOffer) {
            TeachingOfferApplication::updateOrCreate(
                [
                    'teaching_offer_id' => $gitOffer->id,
                    'student_user_id' => $demoStudent->id,
                ],
                [
                    'teacher_user_id' => $user->id,
                    'preferred_language_id' => $languages['es']->id,
                    'status' => TeachingOfferApplication::STATUS_ACCEPTED,
                    'message' => 'I need help understanding commits and branches.',
                    'availability_note' => 'Flexible for the accepted demo request.',
                    'teacher_response' => 'Accepted for local demo testing.',
                    'requested_at' => now()->subDays(4),
                    'accepted_at' => now()->subDays(2),
                    'rejected_at' => null,
                    'cancelled_at' => null,
                ],
            );

            TeachingOfferApplication::updateOrCreate(
                [
                    'teaching_offer_id' => $gitOffer->id,
                    'student_user_id' => $demoTeacher->id,
                ],
                [
                    'teacher_user_id' => $user->id,
                    'preferred_language_id' => $languages['es']->id,
                    'status' => TeachingOfferApplication::STATUS_WAITLISTED,
                    'message' => 'I teach too, but I want to learn Git basics as a student.',
                    'availability_note' => 'Any evening works for the waitlist demo.',
                    'teacher_response' => null,
                    'requested_at' => now()->subDay(),
                    'accepted_at' => null,
                    'rejected_at' => null,
                    'cancelled_at' => null,
                ],
            );
        }
    }
}
