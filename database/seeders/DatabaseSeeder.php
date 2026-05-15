<?php

namespace Database\Seeders;

use App\Models\CategoryProposal;
use App\Models\ClassSession;
use App\Models\ClassSessionAttendee;
use App\Models\Conversation;
use App\Models\ConversationMessage;
use App\Models\ConversationParticipant;
use App\Models\ConversationReport;
use App\Models\CookieSetting;
use App\Models\Incident;
use App\Models\Language;
use App\Models\PlatformSetting;
use App\Models\PlatformTrackingSetting;
use App\Models\ReviewReport;
use App\Models\StudentProfile;
use App\Models\SubjectProposal;
use App\Models\TeacherAvailability;
use App\Models\TeacherAvailabilityException;
use App\Models\TeacherProfile;
use App\Models\TeacherReview;
use App\Models\TeachingCategory;
use App\Models\TeachingOffer;
use App\Models\TeachingOfferApplication;
use App\Models\TeachingSubject;
use App\Models\User;
use App\Models\UserLanguage;
use App\Models\UserNotificationPreference;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $password = Hash::make('password');
        $countries = [
            ['code' => 'ES', 'city' => 'Madrid'],
            ['code' => 'FR', 'city' => 'Paris'],
            ['code' => 'US', 'city' => 'Austin'],
            ['code' => 'GB', 'city' => 'Manchester'],
            ['code' => 'DE', 'city' => 'Berlin'],
            ['code' => 'IT', 'city' => 'Milan'],
            ['code' => 'PT', 'city' => 'Porto'],
            ['code' => 'MX', 'city' => 'Mexico City'],
            ['code' => 'AR', 'city' => 'Buenos Aires'],
            ['code' => 'CO', 'city' => 'Bogota'],
            ['code' => 'CL', 'city' => 'Santiago'],
            ['code' => 'BR', 'city' => 'Sao Paulo'],
        ];

        $languages = collect([
            ['code' => 'en', 'name' => 'English', 'native_name' => 'English', 'is_active' => true, 'sort_order' => 1],
            ['code' => 'es', 'name' => 'Spanish', 'native_name' => 'Espanol', 'is_active' => true, 'sort_order' => 2],
            ['code' => 'fr', 'name' => 'French', 'native_name' => 'Francais', 'is_active' => true, 'sort_order' => 3],
            ['code' => 'de', 'name' => 'German', 'native_name' => 'Deutsch', 'is_active' => false, 'sort_order' => 4],
            ['code' => 'pt', 'name' => 'Portuguese', 'native_name' => 'Portugues', 'is_active' => false, 'sort_order' => 5],
            ['code' => 'it', 'name' => 'Italian', 'native_name' => 'Italiano', 'is_active' => false, 'sort_order' => 6],
        ])->mapWithKeys(function (array $language): array {
            $model = Language::updateOrCreate(
                ['code' => $language['code']],
                [
                    'name' => $language['name'],
                    'native_name' => $language['native_name'],
                    'is_active' => $language['is_active'],
                    'sort_order' => $language['sort_order'],
                ],
            );

            return [$model->code => $model];
        });

        $createUser = function (string $email, string $name, int $countryIndex, array $extra = []) use ($password, $countries): User {
            $country = $countries[$countryIndex % count($countries)];

            return User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'password' => $password,
                    'preferred_locale' => $extra['preferred_locale'] ?? ['en', 'es', 'fr'][$countryIndex % 3],
                    'timezone' => $extra['timezone'] ?? 'Europe/Madrid',
                    'country_code' => $country['code'],
                    'city' => $country['city'],
                    'bio' => $extra['bio'] ?? "Demo profile for {$name}.",
                    'is_public' => $extra['is_public'] ?? true,
                    'learning_interests' => $extra['learning_interests'] ?? 'Free learning, mentoring and community practice.',
                    'teaching_interests' => $extra['teaching_interests'] ?? null,
                    'role' => $extra['role'] ?? User::ROLE_USER,
                    'google_id' => $extra['google_id'] ?? null,
                    'avatar_url' => $extra['avatar_url'] ?? null,
                    'banned_at' => $extra['banned_at'] ?? null,
                    'banned_reason' => $extra['banned_reason'] ?? null,
                    'blocked_at' => $extra['blocked_at'] ?? null,
                    'blocked_reason' => $extra['blocked_reason'] ?? null,
                    'email_verified_at' => $extra['email_verified_at'] ?? now(),
                ],
            );
        };

        $admin = $createUser('admin@example.com', 'Teach4Free Admin', 0, [
            'role' => User::ROLE_ADMIN,
            'is_public' => false,
            'bio' => 'Platform administrator for local development.',
            'learning_interests' => null,
            'teaching_interests' => null,
        ]);

        PlatformSetting::current()->forceFill([
            'platform_name' => 'Teach4Free',
            'support_email' => 'support@example.com',
            'default_locale' => 'en',
            'allow_teacher_category_proposals' => true,
            'allow_teacher_subject_proposals' => true,
            'require_email_verification' => true,
            'allow_public_teacher_profiles' => true,
            'allow_open_public_sessions' => true,
            'maintenance_notice' => null,
            'updated_by' => $admin->id,
        ])->save();

        PlatformTrackingSetting::current()->forceFill([
            'tracking_enabled' => false,
            'cookie_consent_required' => true,
            'plausible_domain' => 'teach4free.local',
            'updated_by' => $admin->id,
        ])->save();

        CookieSetting::current()->forceFill([
            ...CookieSetting::defaults(),
            'updated_by' => $admin->id,
        ])->save();

        $devUser = $createUser('user@example.com', 'Teach4Free User', 1, [
            'bio' => 'Local development learner and teacher.',
            'learning_interests' => 'Programming, languages and mentoring.',
            'teaching_interests' => 'Introductory web development.',
        ]);

        $demoTeacher = $createUser('teacher@example.com', 'Demo Teacher Learner', 2, [
            'bio' => 'Demo user who teaches and learns.',
            'teaching_interests' => 'Conversation practice and study habits.',
        ]);

        $demoStudent = $createUser('student@example.com', 'Demo Student', 3, [
            'bio' => 'Demo student for application flows.',
            'teaching_interests' => null,
        ]);

        $studentNames = [
            'Ava Martinez', 'Liam Wilson', 'Mia Chen', 'Noah Garcia', 'Sofia Martin',
            'Ethan Brown', 'Emma Lopez', 'Oliver Smith', 'Lucia Perez', 'Lucas Rossi',
            'Grace Johnson', 'Hugo Bernard', 'Isabella King', 'Mateo Silva', 'Nora Dubois',
            'Leo Thompson', 'Camila Torres', 'Oscar Miller', 'Lina Moreno', 'Theo Laurent',
            'Valentina Rojas', 'Tom Becker', 'Ana Carvalho', 'Maxime Leroy', 'Julia Santos',
        ];

        $teacherNames = [
            'Clara Bennett', 'Daniel Ruiz', 'Elena Fischer', 'Marc Dupont', 'Sara Romano',
            'Victor Santos', 'Nadia Khan', 'Paul Anderson', 'Irene Costa', 'Jonas Weber',
            'Marie Petit', 'Alex Carter', 'Laura Gomez', 'Rafael Oliveira', 'Amelie Moreau',
            'Bruno Almeida', 'Patricia Silva', 'Samuel Green', 'Helena Novak', 'Miguel Torres',
        ];

        $bothNames = [
            'Andrea Flores', 'Ben Walker', 'Carmen Vidal', 'Diego Navarro',
            'Eva Novak', 'Felix Meyer', 'Gabriela Cruz', 'Henry Brooks',
            'Isabel Costa', 'Julien Morel',
        ];

        $students = collect([$devUser, $demoStudent]);
        foreach ($studentNames as $index => $name) {
            $students->push($createUser(
                'student'.($index + 1).'@example.com',
                $name,
                $index + 4,
                ['teaching_interests' => null],
            ));
        }

        $teachers = collect([$devUser, $demoTeacher]);
        foreach ($teacherNames as $index => $name) {
            $teachers->push($createUser(
                'teacher'.($index + 1).'@example.com',
                $name,
                $index + 2,
                ['teaching_interests' => 'Free mentoring in '.['programming', 'languages', 'math', 'design'][$index % 4].'.'],
            ));
        }

        $bothUsers = collect([$devUser, $demoTeacher]);
        foreach ($bothNames as $index => $name) {
            $user = $createUser(
                'both'.($index + 1).'@example.com',
                $name,
                $index + 7,
                [
                    'learning_interests' => 'Learning new skills while helping others.',
                    'teaching_interests' => 'Community teaching and peer mentoring.',
                    'google_id' => $index % 4 === 0 ? 'demo-google-'.$index : null,
                    'avatar_url' => $index % 4 === 0 ? 'https://i.pravatar.cc/160?u=teach4free-'.$index : null,
                ],
            );
            $students->push($user);
            $teachers->push($user);
            $bothUsers->push($user);
        }

        $allLearners = $students->unique('id')->values();
        $allTeachers = $teachers->unique('id')->values();

        $seedStudentProfile = function (User $user, int $index): void {
            StudentProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'learning_goals' => 'Improve practical skills through free community sessions.',
                    'current_level' => StudentProfile::LEVELS[$index % count(StudentProfile::LEVELS)],
                    'preferred_learning_mode' => StudentProfile::MODES[$index % count(StudentProfile::MODES)],
                    'availability_notes' => ['Weekday evenings.', 'Weekend mornings.', 'Flexible afternoons.', 'One session per week.'][$index % 4],
                    'is_active' => true,
                ],
            );
        };

        $seedTeacherProfile = function (User $user, int $index): TeacherProfile {
            return TeacherProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'headline' => ['Patient mentor', 'Friendly practice partner', 'Project-based helper', 'Community teacher'][$index % 4],
                    'teaching_bio' => 'Offers free help to learners through Teach4Free demo data.',
                    'experience_summary' => 'Local demo profile with realistic teaching preferences.',
                    'preferred_teaching_mode' => TeacherProfile::MODES[$index % count(TeacherProfile::MODES)],
                    'max_students_per_session' => [1, 4, 6, 10][$index % 4],
                    'default_session_duration_minutes' => [30, 45, 60, 90][$index % 4],
                    'meeting_tool' => [TeacherProfile::TOOL_NOT_DECIDED, TeacherProfile::TOOL_JITSI, TeacherProfile::TOOL_GOOGLE_MEET][$index % 3],
                    'meeting_url' => $index % 3 === 1 ? 'https://meet.jit.si/teach4free-demo-'.$user->id : null,
                    'is_active' => true,
                    'is_accepting_requests' => $index % 6 !== 0,
                    'is_verified' => $index % 3 === 0,
                    'activated_at' => now()->subDays($index + 1),
                    'paused_at' => null,
                ],
            );
        };

        foreach ($allLearners as $index => $learner) {
            $seedStudentProfile($learner, $index);
        }

        $teacherProfiles = collect();
        foreach ($allTeachers as $index => $teacher) {
            $teacherProfiles->put($teacher->id, $seedTeacherProfile($teacher, $index));
        }

        foreach ($allLearners->merge($allTeachers)->unique('id')->values() as $index => $user) {
            foreach ($languages->where('is_active', true)->values() as $languageIndex => $language) {
                UserLanguage::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'language_id' => $language->id,
                    ],
                    [
                        'understands' => true,
                        'speaks' => $languageIndex === 0 || $index % 2 === 0,
                        'teaches' => $allTeachers->contains('id', $user->id) && ($languageIndex === 0 || $index % 3 === 0),
                        'level' => UserLanguage::LEVELS[($index + $languageIndex) % count(UserLanguage::LEVELS)],
                    ],
                );
            }
        }

        foreach ($allLearners->merge($allTeachers)->push($admin)->unique('id')->values() as $index => $user) {
            UserNotificationPreference::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'email_session_scheduled_enabled' => true,
                    'email_session_cancelled_enabled' => true,
                    'email_session_completed_enabled' => true,
                    'email_session_reminder_24h_enabled' => true,
                    'email_session_reminder_1h_enabled' => true,
                    'email_application_received_enabled' => true,
                    'email_application_accepted_enabled' => true,
                    'email_application_rejected_enabled' => true,
                    'email_application_cancelled_enabled' => true,
                    'email_waiting_list_enabled' => true,
                    'email_new_message_enabled' => true,
                    'email_platform_updates_enabled' => $index % 5 === 0,
                ],
            );
        }

        foreach ($allTeachers as $index => $teacher) {
            $teacherProfile = $teacherProfiles[$teacher->id];
            $firstDay = ($index % 5) + 1;
            $secondDay = (($index + 2) % 5) + 1;

            foreach ([[$firstDay, '17:00', '19:00'], [$secondDay, '10:00', '12:00']] as [$day, $startsAt, $endsAt]) {
                TeacherAvailability::updateOrCreate(
                    [
                        'user_id' => $teacher->id,
                        'day_of_week' => $day,
                        'starts_at' => $startsAt,
                    ],
                    [
                        'teacher_profile_id' => $teacherProfile->id,
                        'ends_at' => $endsAt,
                        'timezone' => $teacher->timezone ?? 'Europe/Madrid',
                        'default_duration_minutes' => $teacherProfile->default_session_duration_minutes,
                        'default_capacity' => $teacherProfile->max_students_per_session,
                        'is_active' => true,
                        'notes' => 'Demo weekly availability block.',
                    ],
                );
            }

            if ($index < 12) {
                TeacherAvailabilityException::updateOrCreate(
                    [
                        'user_id' => $teacher->id,
                        'date' => now()->addDays($index + 3)->toDateString(),
                        'type' => $index % 2 === 0
                            ? TeacherAvailabilityException::TYPE_UNAVAILABLE
                            : TeacherAvailabilityException::TYPE_EXTRA_AVAILABLE,
                    ],
                    [
                        'teacher_profile_id' => $teacherProfile->id,
                        'starts_at' => $index % 2 === 0 ? null : '16:00',
                        'ends_at' => $index % 2 === 0 ? null : '18:00',
                        'reason' => $index % 2 === 0 ? 'Demo unavailable day.' : 'Demo extra teaching window.',
                        'is_full_day' => $index % 2 === 0,
                    ],
                );
            }
        }

        $categories = collect([
            ['name' => 'Programming', 'slug' => 'programming', 'description' => 'Free software, web and coding help.', 'color' => '#0f766e', 'icon' => 'code', 'sort_order' => 1],
            ['name' => 'Languages', 'slug' => 'languages', 'description' => 'Conversation practice and language support.', 'color' => '#2563eb', 'icon' => 'languages', 'sort_order' => 2],
            ['name' => 'Mathematics', 'slug' => 'mathematics', 'description' => 'Math foundations and problem solving.', 'color' => '#7c3aed', 'icon' => 'calculator', 'sort_order' => 3],
            ['name' => 'Design', 'slug' => 'design', 'description' => 'Design tools, UI and creative workflows.', 'color' => '#ea580c', 'icon' => 'palette', 'sort_order' => 4],
            ['name' => 'Music', 'slug' => 'music', 'description' => 'Music theory, practice and creative help.', 'color' => '#db2777', 'icon' => 'music', 'sort_order' => 5],
            ['name' => 'Science', 'slug' => 'science', 'description' => 'Science learning and explanations.', 'color' => '#0891b2', 'icon' => 'flask', 'sort_order' => 6],
            ['name' => 'Business', 'slug' => 'business', 'description' => 'Business basics, communication and planning.', 'color' => '#475569', 'icon' => 'briefcase', 'sort_order' => 7],
            ['name' => 'Personal development', 'slug' => 'personal-development', 'description' => 'Study habits, confidence and mentoring.', 'color' => '#16a34a', 'icon' => 'sparkles', 'sort_order' => 8],
            ['name' => 'Writing', 'slug' => 'writing', 'description' => 'Writing, editing and storytelling practice.', 'color' => '#9333ea', 'icon' => 'pen-tool', 'sort_order' => 9],
            ['name' => 'Career mentoring', 'slug' => 'career-mentoring', 'description' => 'Career direction, portfolios and interview preparation.', 'color' => '#0d9488', 'icon' => 'briefcase-business', 'sort_order' => 10],
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

        $subjectSeed = [
            ['programming', 'Laravel', 'laravel'], ['programming', 'PHP', 'php'], ['programming', 'JavaScript', 'javascript'], ['programming', 'React', 'react'], ['programming', 'Python', 'python'], ['programming', 'Git', 'git'], ['programming', 'SQL', 'sql'],
            ['languages', 'English conversation', 'english-conversation'], ['languages', 'Spanish conversation', 'spanish-conversation'], ['languages', 'French conversation', 'french-conversation'], ['languages', 'Portuguese conversation', 'portuguese-conversation'],
            ['mathematics', 'Basic mathematics', 'basic-mathematics'], ['mathematics', 'Algebra', 'algebra'], ['mathematics', 'Statistics', 'statistics'],
            ['design', 'UI design', 'ui-design'], ['design', 'Figma', 'figma'], ['music', 'Guitar basics', 'guitar-basics'], ['science', 'Biology basics', 'biology-basics'],
            ['business', 'Business planning', 'business-planning'], ['business', 'Entrepreneurship', 'entrepreneurship'], ['business', 'Freelancing basics', 'freelancing-basics'],
            ['personal-development', 'Study habits', 'study-habits'], ['writing', 'Creative writing', 'creative-writing'], ['career-mentoring', 'Portfolio review', 'portfolio-review'],
        ];

        $subjects = collect($subjectSeed)->mapWithKeys(function (array $subject, int $index) use ($categories): array {
            $model = TeachingSubject::updateOrCreate(
                ['slug' => $subject[2]],
                [
                    'teaching_category_id' => $categories[$subject[0]]->id,
                    'name' => $subject[1],
                    'description' => 'Free help and practice for '.$subject[1].'.',
                    'is_active' => true,
                    'sort_order' => $index + 1,
                ],
            );

            return [$model->slug => $model];
        });

        $proposalStatuses = [
            CategoryProposal::STATUS_PENDING,
            CategoryProposal::STATUS_APPROVED,
            CategoryProposal::STATUS_REJECTED,
            CategoryProposal::STATUS_MERGED,
        ];

        $categoryProposalSeeds = [
            ['Data literacy', 'Help learners understand datasets and charts.', '#3B82F6', 'bar-chart', 'programming'],
            ['Digital wellbeing', 'Free support around healthy technology habits.', '#10B981', 'heart-handshake', 'personal-development'],
            ['Public speaking', 'Practice clear talks, interviews and presentations.', '#8B5CF6', 'mic', 'business'],
            ['Open source contribution', 'Mentoring for first open source contributions.', '#F97316', 'git-pull-request', 'programming'],
            ['Study coaching', 'Support for planning learning routines.', '#EC4899', 'calendar-check', 'personal-development'],
            ['Community art', 'Creative peer feedback without paid promotion.', '#14B8A6', 'palette', 'design'],
            ['Climate basics', 'Accessible science discussions for beginners.', '#EF4444', 'leaf', 'science'],
            ['Accessibility', 'Inclusive design and assistive technology basics.', '#6366F1', 'accessibility', 'design'],
        ];

        $categoryProposals = collect();
        foreach ($categoryProposalSeeds as $index => [$name, $description, $color, $icon, $linkedSlug]) {
            $status = $proposalStatuses[$index % count($proposalStatuses)];
            $linkedCategory = in_array($status, [CategoryProposal::STATUS_APPROVED, CategoryProposal::STATUS_MERGED], true)
                ? $categories[$linkedSlug]
                : null;

            $categoryProposals->push(CategoryProposal::updateOrCreate(
                ['name' => $name, 'proposed_by_user_id' => $allTeachers[$index % $allTeachers->count()]->id],
                [
                    'description' => $description,
                    'suggested_color' => $color,
                    'suggested_icon' => $icon,
                    'status' => $status,
                    'admin_notes' => $status === CategoryProposal::STATUS_REJECTED
                        ? 'Demo proposal rejected because it overlaps an existing topic.'
                        : ($status === CategoryProposal::STATUS_PENDING ? null : 'Demo proposal reviewed.'),
                    'reviewed_by' => $status === CategoryProposal::STATUS_PENDING ? null : $admin->id,
                    'reviewed_at' => $status === CategoryProposal::STATUS_PENDING ? null : now()->subDays($index + 1),
                    'approved_category_id' => $linkedCategory?->id,
                ],
            ));
        }

        $subjectProposalSeeds = [
            ['Beginner data charts', 'Charts for people new to data.', 'programming', 'sql'],
            ['Accessible forms', 'Form design and validation accessibility.', 'design', 'ui-design'],
            ['Interview storytelling', 'Practice telling project stories clearly.', 'career-mentoring', 'portfolio-review'],
            ['Open source first issue', 'How to find and prepare a first issue.', 'programming', 'git'],
            ['French small talk', 'Everyday friendly conversation practice.', 'languages', 'french-conversation'],
            ['Spanish pronunciation drills', 'Gentle speaking drills.', 'languages', 'spanish-conversation'],
            ['Study planning for adults', 'Build realistic weekly study habits.', 'personal-development', 'study-habits'],
            ['Math for budgeting', 'Practical arithmetic and percentages.', 'mathematics', 'basic-mathematics'],
            ['Portfolio accessibility review', 'Review portfolios with accessibility basics.', 'career-mentoring', 'portfolio-review'],
            ['Creative editing circle', 'Peer feedback for short writing.', 'writing', 'creative-writing'],
            ['Meeting link safety', 'Help new users use external tools safely.', 'business', 'business-planning'],
            ['Climate discussion basics', 'Simple climate science vocabulary.', 'science', 'biology-basics'],
        ];

        foreach ($subjectProposalSeeds as $index => [$name, $description, $categorySlug, $subjectSlug]) {
            $status = $proposalStatuses[$index % count($proposalStatuses)];
            $linkedSubject = in_array($status, [SubjectProposal::STATUS_APPROVED, SubjectProposal::STATUS_MERGED], true)
                ? $subjects[$subjectSlug]
                : null;

            SubjectProposal::updateOrCreate(
                ['name' => $name, 'proposed_by_user_id' => $allTeachers[($index + 3) % $allTeachers->count()]->id],
                [
                    'teaching_category_id' => $index % 3 === 0 ? null : $categories[$categorySlug]->id,
                    'category_proposal_id' => $index % 3 === 0 ? $categoryProposals[$index % $categoryProposals->count()]->id : null,
                    'description' => $description,
                    'status' => $status,
                    'admin_notes' => $status === SubjectProposal::STATUS_REJECTED
                        ? 'Demo proposal rejected because it was too broad for a subject.'
                        : ($status === SubjectProposal::STATUS_PENDING ? null : 'Demo proposal reviewed.'),
                    'reviewed_by' => $status === SubjectProposal::STATUS_PENDING ? null : $admin->id,
                    'reviewed_at' => $status === SubjectProposal::STATUS_PENDING ? null : now()->subDays($index + 1),
                    'approved_subject_id' => $linkedSubject?->id,
                ],
            );
        }

        $offerTopics = [
            ['Laravel routing for beginners', 'laravel'], ['Build your first React component', 'react'], ['JavaScript practice hour', 'javascript'], ['Python problem solving', 'python'],
            ['Git confidence clinic', 'git'], ['PHP fundamentals Q and A', 'php'], ['English speaking circle', 'english-conversation'], ['Spanish conversation for travelers', 'spanish-conversation'],
            ['French pronunciation practice', 'french-conversation'], ['Algebra step by step', 'algebra'], ['Statistics without fear', 'statistics'], ['Basic mathematics refresh', 'basic-mathematics'],
            ['Figma interface critique', 'figma'], ['UI layout fundamentals', 'ui-design'], ['Guitar chords for beginners', 'guitar-basics'], ['Biology concepts explained', 'biology-basics'],
            ['Business plan review', 'business-planning'], ['Study habits reset', 'study-habits'], ['Laravel models and migrations', 'laravel'], ['React state basics', 'react'],
            ['JavaScript DOM workshop', 'javascript'], ['Python data practice', 'python'], ['Git branches and pull requests', 'git'], ['PHP forms and validation', 'php'],
            ['English interview practice', 'english-conversation'], ['Spanish grammar clinic', 'spanish-conversation'], ['French conversation cafe', 'french-conversation'], ['Algebra word problems', 'algebra'],
            ['Statistics for everyday decisions', 'statistics'], ['Math foundations for adults', 'basic-mathematics'], ['Figma components session', 'figma'], ['Accessible UI patterns', 'ui-design'],
            ['Guitar rhythm practice', 'guitar-basics'], ['Intro to genetics', 'biology-basics'], ['Free business pitch rehearsal', 'business-planning'], ['Focus and planning session', 'study-habits'],
            ['Laravel Inertia walkthrough', 'laravel'], ['React forms practice', 'react'], ['JavaScript debugging basics', 'javascript'], ['Python automation starter', 'python'],
            ['SQL query practice', 'sql'], ['Database design basics', 'sql'], ['Portuguese beginner conversation', 'portuguese-conversation'], ['Entrepreneurship idea clinic', 'entrepreneurship'],
            ['Freelancing profile review', 'freelancing-basics'], ['Creative writing prompts', 'creative-writing'], ['Portfolio review circle', 'portfolio-review'], ['React accessibility review', 'react'],
            ['Python scripts for daily tasks', 'python'], ['Git collaboration practice', 'git'],
        ];

        $offers = collect();
        foreach ($offerTopics as $index => [$title, $subjectSlug]) {
            $teacher = $allTeachers[$index % $allTeachers->count()];
            $teacherProfile = $teacherProfiles[$teacher->id];
            $subject = $subjects[$subjectSlug];
            $languageCodes = match ($index % 4) {
                0 => ['en'],
                1 => ['es'],
                2 => ['fr'],
                default => ['en', 'es'],
            };

            $offer = TeachingOffer::updateOrCreate(
                ['slug' => Str::slug($title)],
                [
                    'user_id' => $teacher->id,
                    'teacher_profile_id' => $teacherProfile->id,
                    'teaching_category_id' => $subject->teaching_category_id,
                    'teaching_subject_id' => $subject->id,
                    'title' => $title,
                    'summary' => 'A free Teach4Free demo session about '.$subject->name.'.',
                    'description' => 'This realistic demo offer helps local development pages show platform activity. Teach4Free remains completely free.',
                    'level' => TeachingOffer::LEVELS[$index % count(TeachingOffer::LEVELS)],
                    'teaching_mode' => TeachingOffer::MODES[$index % count(TeachingOffer::MODES)],
                    'session_type' => TeachingOffer::SESSION_TYPES[$index % count(TeachingOffer::SESSION_TYPES)],
                    'max_students' => $index % 3 === 2 ? null : [1, 4, 6, 10][$index % 4],
                    'duration_minutes' => [30, 45, 60, 90][$index % 4],
                    'meeting_tool' => [TeachingOffer::TOOL_NOT_DECIDED, TeachingOffer::TOOL_JITSI, TeachingOffer::TOOL_GOOGLE_MEET][$index % 3],
                    'meeting_url' => $index % 3 === 1 ? 'https://meet.jit.si/teach4free-offer-'.$index : null,
                    'timezone' => 'Europe/Madrid',
                    'availability_summary' => ['Weekday evenings.', 'Saturday mornings.', 'Flexible afternoons.', 'Monthly open session.'][$index % 4],
                    'requirements' => 'Curiosity and a free Teach4Free account.',
                    'materials_summary' => 'Free notes and public documentation links.',
                    'is_public' => true,
                    'is_active' => $index % 13 !== 0,
                    'is_accepting_applications' => $index % 7 !== 0,
                    'allow_waiting_list' => true,
                    'waiting_list_limit' => 12,
                    'published_at' => now()->subDays($index % 20),
                ],
            );

            $offer->languages()->sync(
                $languages
                    ->only($languageCodes)
                    ->pluck('id')
                    ->values()
                    ->all()
            );
            $offers->push($offer);
        }

        $statuses = TeachingOfferApplication::STATUSES;
        foreach ($offers as $offerIndex => $offer) {
            for ($slot = 0; $slot < 2; $slot++) {
                $student = $allLearners[($offerIndex + $slot + 3) % $allLearners->count()];
                if ($student->id === $offer->user_id) {
                    $student = $allLearners[($offerIndex + $slot + 4) % $allLearners->count()];
                }

                $status = $statuses[($offerIndex + $slot) % count($statuses)];

                TeachingOfferApplication::updateOrCreate(
                    [
                        'teaching_offer_id' => $offer->id,
                        'student_user_id' => $student->id,
                    ],
                    [
                        'teacher_user_id' => $offer->user_id,
                        'preferred_language_id' => $offer->languages()->first()?->id ?? $languages['en']->id,
                        'preferred_starts_at' => now()->addDays(($offerIndex % 14) + 1)->setTime(17 + $slot, 0),
                        'preferred_timezone' => $student->timezone ?? 'Europe/Madrid',
                        'status' => $status,
                        'message' => 'I would like to join this free demo learning session.',
                        'availability_note' => ['Evenings work best.', 'Weekend preferred.', 'Flexible this month.'][$slot],
                        'teacher_response' => in_array($status, [TeachingOfferApplication::STATUS_ACCEPTED, TeachingOfferApplication::STATUS_REJECTED], true)
                            ? 'Demo teacher response for local data.'
                            : null,
                        'requested_at' => now()->subDays(($offerIndex % 12) + $slot),
                        'accepted_at' => $status === TeachingOfferApplication::STATUS_ACCEPTED ? now()->subDays($slot + 1) : null,
                        'rejected_at' => $status === TeachingOfferApplication::STATUS_REJECTED ? now()->subDays($slot + 1) : null,
                        'cancelled_at' => $status === TeachingOfferApplication::STATUS_CANCELLED ? now()->subDays($slot + 1) : null,
                        'completed_at' => null,
                    ],
                );
            }
        }

        $sessionStatuses = [
            ClassSession::STATUS_SCHEDULED,
            ClassSession::STATUS_COMPLETED,
            ClassSession::STATUS_CANCELLED,
            ClassSession::STATUS_NO_SHOW,
        ];

        $sessionApplications = TeachingOfferApplication::query()
            ->whereIn('teaching_offer_id', $offers->pluck('id'))
            ->where('status', TeachingOfferApplication::STATUS_ACCEPTED)
            ->with(['offer', 'student'])
            ->limit(28)
            ->get();

        foreach ($sessionApplications as $index => $application) {
            $status = $sessionStatuses[$index % count($sessionStatuses)];
            $startsAt = $status === ClassSession::STATUS_SCHEDULED
                ? now()->addDays(($index % 14) + 1)->setTime(17 + ($index % 3), 0)
                : now()->subDays(($index % 20) + 1)->setTime(17 + ($index % 3), 0);
            $endsAt = (clone $startsAt)->addMinutes($application->offer->duration_minutes);

            $session = ClassSession::updateOrCreate(
                ['application_id' => $application->id],
                [
                    'teaching_offer_id' => $application->teaching_offer_id,
                    'teacher_user_id' => $application->teacher_user_id,
                    'title' => $application->offer->title,
                    'description' => 'Demo class session generated from an accepted application.',
                    'starts_at' => $startsAt,
                    'ends_at' => $endsAt,
                    'timezone' => $application->preferred_timezone ?? $application->offer->timezone,
                    'capacity' => $application->offer->max_students ?? 6,
                    'meeting_tool' => $application->offer->meeting_tool,
                    'meeting_url' => $application->offer->meeting_url,
                    'status' => $status,
                    'cancellation_reason' => $status === ClassSession::STATUS_CANCELLED ? 'Demo cancellation reason.' : null,
                    'completed_at' => $status === ClassSession::STATUS_COMPLETED ? now()->subDays($index % 5) : null,
                    'cancelled_at' => $status === ClassSession::STATUS_CANCELLED ? now()->subDays($index % 5) : null,
                    'no_show_marked_at' => $status === ClassSession::STATUS_NO_SHOW ? now()->subDays($index % 5) : null,
                ],
            );

            $attendeeStatus = match ($status) {
                ClassSession::STATUS_COMPLETED => ClassSessionAttendee::STATUS_ATTENDED,
                ClassSession::STATUS_CANCELLED => ClassSessionAttendee::STATUS_CANCELLED,
                ClassSession::STATUS_NO_SHOW => ClassSessionAttendee::STATUS_NO_SHOW,
                default => ClassSessionAttendee::STATUS_ENROLLED,
            };

            ClassSessionAttendee::updateOrCreate(
                [
                    'class_session_id' => $session->id,
                    'user_id' => $application->student_user_id,
                ],
                [
                    'application_id' => $application->id,
                    'status' => $attendeeStatus,
                    'joined_at' => $application->accepted_at ?? now(),
                    'cancelled_at' => $attendeeStatus === ClassSessionAttendee::STATUS_CANCELLED ? $session->cancelled_at : null,
                    'no_show_at' => $attendeeStatus === ClassSessionAttendee::STATUS_NO_SHOW ? $session->no_show_marked_at : null,
                ],
            );

            if ($application->offer->session_type !== TeachingOffer::SESSION_PRIVATE_REQUEST && $status === ClassSession::STATUS_SCHEDULED) {
                foreach ($allLearners->reject(fn (User $learner): bool => $learner->id === $application->student_user_id)->take(2) as $extraLearner) {
                    ClassSessionAttendee::updateOrCreate(
                        [
                            'class_session_id' => $session->id,
                            'user_id' => $extraLearner->id,
                        ],
                        [
                            'application_id' => null,
                            'status' => ClassSessionAttendee::STATUS_ENROLLED,
                            'joined_at' => now()->subDays($index % 3),
                            'cancelled_at' => null,
                            'no_show_at' => null,
                        ],
                    );
                }
            }
        }

        if (Schema::hasTable('teacher_reviews')) {
            if (Schema::hasTable('review_reports')) {
                DB::table('review_reports')->delete();
            }
            DB::table('teacher_reviews')->delete();

            $reviewRatings = [5, 5, 4, 5, 4, 1, 5, 4, 3, 5, 4, 2];
            $reviewTitles = [
                'Helpful and generous session',
                'Clear explanations',
                'Great practice time',
                'Patient teacher',
                'Useful free class',
                'Needs clearer preparation',
                'Encouraging and kind',
                'Practical examples',
            ];
            $reviewComments = [
                'The session stayed free, respectful and practical. I understood the topic much better afterwards.',
                'The teacher explained each step clearly and gave enough time for questions.',
                'Good learning pace and helpful examples. I would attend another free class.',
                'Very patient and supportive during the session.',
                'A useful community learning experience without any commercial pressure.',
                'The topic was useful, but the structure could be clearer next time.',
                'The teacher was generous with time and kept the class welcoming.',
                'The examples were practical and easy to reuse after class.',
            ];
            $lowReviewers = $allLearners->take(2)->values();
            $createdReviews = collect();

            for ($index = 0; $index < 84; $index++) {
                $offer = $offers[$index % $offers->count()];
                $teacher = $allTeachers->firstWhere('id', $offer->user_id) ?? $allTeachers[$index % $allTeachers->count()];
                $rating = $reviewRatings[$index % count($reviewRatings)];
                $student = in_array($rating, [1, 2], true) && $lowReviewers->isNotEmpty()
                    ? $lowReviewers[$index % $lowReviewers->count()]
                    : $allLearners[($index + 5) % $allLearners->count()];

                if ($student->id === $teacher->id) {
                    $student = $allLearners[($index + 6) % $allLearners->count()];
                }

                $startsAt = now()->subDays(($index % 70) + 3)->setTime(16 + ($index % 4), 0);
                $session = ClassSession::updateOrCreate(
                    [
                        'title' => 'Demo completed review session '.($index + 1),
                        'teacher_user_id' => $teacher->id,
                    ],
                    [
                        'teaching_offer_id' => $offer->id,
                        'application_id' => null,
                        'description' => 'Completed demo session used for review and rating workflows.',
                        'starts_at' => $startsAt,
                        'ends_at' => (clone $startsAt)->addMinutes($offer->duration_minutes),
                        'timezone' => $offer->timezone,
                        'capacity' => $offer->max_students ?? 6,
                        'meeting_tool' => $offer->meeting_tool,
                        'meeting_url' => $offer->meeting_url,
                        'status' => ClassSession::STATUS_COMPLETED,
                        'cancellation_reason' => null,
                        'completed_at' => (clone $startsAt)->addMinutes($offer->duration_minutes),
                        'cancelled_at' => null,
                        'no_show_marked_at' => null,
                    ],
                );

                ClassSessionAttendee::updateOrCreate(
                    [
                        'class_session_id' => $session->id,
                        'user_id' => $student->id,
                    ],
                    [
                        'application_id' => null,
                        'status' => ClassSessionAttendee::STATUS_ATTENDED,
                        'joined_at' => $startsAt,
                        'cancelled_at' => null,
                        'no_show_at' => null,
                    ],
                );

                $status = match (true) {
                    $index < 5 => TeacherReview::STATUS_HIDDEN,
                    $index >= 5 && $index < 8 => TeacherReview::STATUS_FLAGGED,
                    default => TeacherReview::STATUS_PUBLISHED,
                };

                $review = TeacherReview::create([
                    'teacher_user_id' => $teacher->id,
                    'student_user_id' => $student->id,
                    'class_session_id' => $session->id,
                    'teaching_offer_id' => $offer->id,
                    'rating' => $rating,
                    'title' => $reviewTitles[$index % count($reviewTitles)],
                    'comment' => $rating <= 2
                        ? 'The session happened, but this review records a concrete issue for moderation and quality testing.'
                        : $reviewComments[$index % count($reviewComments)],
                    'teacher_response' => $index % 4 === 0 ? 'Thank you for the thoughtful feedback. I will keep improving the free sessions.' : null,
                    'teacher_responded_at' => $index % 4 === 0 ? now()->subDays($index % 15) : null,
                    'status' => $status,
                    'hidden_at' => $status === TeacherReview::STATUS_HIDDEN ? now()->subDays($index + 1) : null,
                    'hidden_by' => $status === TeacherReview::STATUS_HIDDEN ? $admin->id : null,
                    'hidden_reason' => $status === TeacherReview::STATUS_HIDDEN ? 'Demo hidden review for moderation testing.' : null,
                    'admin_notes' => $index < 8 ? 'Demo moderation note for review workflows.' : null,
                    'created_at' => now()->subDays($index % 50),
                    'updated_at' => now()->subDays($index % 50),
                ]);

                $createdReviews->push($review);
            }

            if (Schema::hasTable('review_reports')) {
                $reviewReportTypes = [
                    ReviewReport::TYPE_ABUSIVE_LANGUAGE,
                    ReviewReport::TYPE_FALSE_INFORMATION,
                    ReviewReport::TYPE_HARASSMENT,
                    ReviewReport::TYPE_SPAM,
                    ReviewReport::TYPE_MALICIOUS_REVIEW,
                    ReviewReport::TYPE_PRIVACY_ISSUE,
                    ReviewReport::TYPE_OTHER,
                    ReviewReport::TYPE_FALSE_INFORMATION,
                    ReviewReport::TYPE_MALICIOUS_REVIEW,
                    ReviewReport::TYPE_ABUSIVE_LANGUAGE,
                ];

                foreach ($createdReviews->take(10)->values() as $index => $review) {
                    $reporter = $allLearners[($index + 9) % $allLearners->count()];
                    if ($reporter->id === $review->student_user_id) {
                        $reporter = $allLearners[($index + 10) % $allLearners->count()];
                    }

                    $type = $reviewReportTypes[$index];
                    $status = ReviewReport::STATUSES[$index % count(ReviewReport::STATUSES)];
                    $resolved = in_array($status, [ReviewReport::STATUS_RESOLVED, ReviewReport::STATUS_DISMISSED], true);

                    ReviewReport::create([
                        'teacher_review_id' => $review->id,
                        'reporter_user_id' => $reporter->id,
                        'type' => $type,
                        'description' => 'Demo review report for moderation queue testing.',
                        'status' => $status,
                        'priority' => ReviewReport::defaultPriorityFor($type),
                        'admin_notes' => $index % 3 === 0 ? 'Demo admin note for review report.' : null,
                        'resolved_by' => $resolved ? $admin->id : null,
                        'resolved_at' => $resolved ? now()->subDays(1) : null,
                        'created_at' => now()->subDays($index),
                        'updated_at' => now()->subDays($index),
                    ]);

                    $review->forceFill([
                        'reported_count' => $review->reports()->count(),
                    ])->save();
                }
            }
        }

        $this->seedReputationDemoData($password, $admin, $allLearners, $languages, $subjects);

        if (Schema::hasTable('notifications')) {
            DB::table('notifications')->where('type', 'demo.admin_seed')->delete();
            foreach ($allLearners->take(8) as $index => $notifiable) {
                DB::table('notifications')->insert([
                    'id' => (string) Str::uuid(),
                    'type' => 'demo.admin_seed',
                    'notifiable_type' => User::class,
                    'notifiable_id' => $notifiable->id,
                    'data' => json_encode([
                        'title' => 'Demo platform notification',
                        'message' => 'Seeded notification for local admin dashboard activity.',
                        'action_url' => route('notifications.index'),
                        'event' => 'demo_seed',
                    ], JSON_THROW_ON_ERROR),
                    'read_at' => $index % 3 === 0 ? now() : null,
                    'created_at' => now()->subDays($index),
                    'updated_at' => now()->subDays($index),
                ]);
            }
        }

        $incidentSubjects = [
            ['Teacher asked for payment outside the platform', Incident::TYPE_PAYMENT_REQUEST, Incident::PRIORITY_URGENT],
            ['Offer appears to promote a paid course', Incident::TYPE_COMMERCIAL_PRESSURE, Incident::PRIORITY_HIGH],
            ['User shared spam link', Incident::TYPE_SPAM, Incident::PRIORITY_NORMAL],
            ['Student did not attend several sessions', Incident::TYPE_SESSION, Incident::PRIORITY_NORMAL],
            ['Technical issue with meeting link', Incident::TYPE_TECHNICAL, Incident::PRIORITY_LOW],
            ['Abusive message report', Incident::TYPE_ABUSE, Incident::PRIORITY_HIGH],
            ['Suspicious commercial pressure', Incident::TYPE_COMMERCIAL_PRESSURE, Incident::PRIORITY_HIGH],
            ['Duplicate fake profile', Incident::TYPE_USER, Incident::PRIORITY_NORMAL],
            ['Possible spam profile', Incident::TYPE_SPAM, Incident::PRIORITY_NORMAL],
            ['Application support request', Incident::TYPE_APPLICATION, Incident::PRIORITY_LOW],
            ['Open session link problem', Incident::TYPE_SESSION, Incident::PRIORITY_NORMAL],
            ['Student safety concern', Incident::TYPE_ABUSE, Incident::PRIORITY_URGENT],
            ['Teacher verification question', Incident::TYPE_USER, Incident::PRIORITY_LOW],
            ['Blocked content review', Incident::TYPE_TEACHING_OFFER, Incident::PRIORITY_NORMAL],
            ['General support issue', Incident::TYPE_OTHER, Incident::PRIORITY_LOW],
            ['Suspicious account activity', Incident::TYPE_USER, Incident::PRIORITY_HIGH],
            ['Language mismatch in offer', Incident::TYPE_TEACHING_OFFER, Incident::PRIORITY_LOW],
            ['Repeated no-show concern', Incident::TYPE_SESSION, Incident::PRIORITY_NORMAL],
            ['Accessibility help request', Incident::TYPE_TECHNICAL, Incident::PRIORITY_LOW],
            ['Teacher demanded a tip before sharing link', Incident::TYPE_PAYMENT_REQUEST, Incident::PRIORITY_URGENT],
        ];

        $sessionIds = ClassSession::query()->pluck('id')->values();

        foreach ($incidentSubjects as $index => [$subject, $type, $priority]) {
            $status = Incident::STATUSES[$index % count(Incident::STATUSES)];
            $resolved = in_array($status, [Incident::STATUS_RESOLVED, Incident::STATUS_DISMISSED], true);
            $publicResponse = $resolved
                ? 'Demo public response: the moderation team reviewed this report and recorded the outcome for the reporter.'
                : null;
            $reporter = $allLearners[$index % $allLearners->count()];
            $reported = $allTeachers[$index % $allTeachers->count()];
            $offer = $offers[$index % $offers->count()];
            $application = TeachingOfferApplication::query()
                ->where('teaching_offer_id', $offer->id)
                ->first();

            Incident::updateOrCreate(
                ['subject' => $subject],
                [
                    'reporter_user_id' => $reporter->id,
                    'reported_user_id' => $reported->id,
                    'teaching_offer_id' => $index % 2 === 0 ? $offer->id : null,
                    'application_id' => in_array($type, [Incident::TYPE_APPLICATION, Incident::TYPE_SESSION], true) ? $application?->id : null,
                    'class_session_id' => $type === Incident::TYPE_SESSION && $sessionIds->isNotEmpty() ? $sessionIds[$index % $sessionIds->count()] : null,
                    'type' => $type,
                    'status' => $status,
                    'priority' => $priority,
                    'description' => 'Demo incident created for admin moderation workflows. Teach4Free remains free and commercial pressure is forbidden.',
                    'admin_notes' => $resolved ? 'Resolved in demo data.' : null,
                    'public_response' => $publicResponse,
                    'public_response_by' => $publicResponse ? $admin->id : null,
                    'public_response_sent_at' => $publicResponse ? now()->subHours($index + 2) : null,
                    'resolved_by' => $resolved ? $admin->id : null,
                    'resolved_at' => $resolved ? now()->subDays(1) : null,
                ],
            );
        }

        if (Schema::hasTable('conversations')) {
            DB::table('conversation_reports')->delete();
            DB::table('conversation_messages')->delete();
            DB::table('conversation_participants')->delete();
            DB::table('conversations')->delete();

            $createdConversations = collect();
            $messageBodies = [
                'Thanks for applying. Teach4Free sessions always stay free.',
                'Happy to coordinate a time here before the class.',
                'That schedule works for me. I can prepare a few free examples.',
                'Please keep all payment or commercial offers outside this conversation.',
                'I will bring questions and keep the meeting link private.',
                'Great, see you in the scheduled free session.',
            ];

            $applicationConversations = TeachingOfferApplication::query()
                ->with(['offer', 'student', 'teacher'])
                ->limit(18)
                ->get();

            foreach ($applicationConversations as $index => $application) {
                $conversation = Conversation::create([
                    'type' => Conversation::TYPE_APPLICATION,
                    'teaching_offer_id' => $application->teaching_offer_id,
                    'teaching_offer_application_id' => $application->id,
                    'subject' => 'Application: '.$application->offer->title,
                    'status' => $index % 8 === 0 ? Conversation::STATUS_REPORTED : Conversation::STATUS_OPEN,
                    'created_by_user_id' => $application->student_user_id,
                    'last_message_at' => now()->subHours($index),
                ]);
                $this->seedParticipant($conversation, $application->student, ConversationParticipant::ROLE_LEARNER, $index % 4 === 0, $index % 9 === 0);
                $this->seedParticipant($conversation, $application->teacher, ConversationParticipant::ROLE_TEACHER, false, false);
                $this->seedMessages($conversation, [$application->student, $application->teacher], $messageBodies, 4, $index);
                $createdConversations->push($conversation);
            }

            $sessionConversations = ClassSession::query()
                ->with(['teacher', 'attendees.user'])
                ->limit(7)
                ->get();

            foreach ($sessionConversations as $index => $session) {
                $conversation = Conversation::create([
                    'type' => Conversation::TYPE_SESSION,
                    'teaching_offer_id' => $session->teaching_offer_id,
                    'teaching_offer_application_id' => $session->application_id,
                    'class_session_id' => $session->id,
                    'subject' => 'Session: '.$session->title,
                    'status' => $index % 5 === 0 ? Conversation::STATUS_REPORTED : Conversation::STATUS_OPEN,
                    'created_by_user_id' => $session->teacher_user_id,
                    'last_message_at' => now()->subHours($index + 20),
                ]);
                $this->seedParticipant($conversation, $session->teacher, ConversationParticipant::ROLE_TEACHER, false, false);
                $sessionUsers = collect([$session->teacher]);
                foreach ($session->attendees as $attendeeIndex => $attendance) {
                    if ($attendance->user) {
                        $this->seedParticipant($conversation, $attendance->user, ConversationParticipant::ROLE_LEARNER, $attendeeIndex === 0, $index % 4 === 0);
                        $sessionUsers->push($attendance->user);
                    }
                }
                $this->seedMessages($conversation, $sessionUsers->unique('id')->values()->all(), $messageBodies, 5, $index + 20);
                $createdConversations->push($conversation);
            }

            $studentOne = User::query()->where('email', 'student1@example.com')->first();
            $teacherOne = User::query()->where('email', 'teacher1@example.com')->first();
            $supportUsers = collect([$studentOne, $teacherOne, $devUser])->filter()->values();

            for ($index = 0; $index < 3; $index++) {
                $first = $supportUsers[$index % $supportUsers->count()];
                $second = $allTeachers[($index + 4) % $allTeachers->count()];
                $conversation = Conversation::create([
                    'type' => $index === 0 ? Conversation::TYPE_SUPPORT : Conversation::TYPE_DIRECT,
                    'subject' => $index === 0 ? 'Support: keeping coordination on Teach4Free' : 'Direct demo conversation '.($index + 1),
                    'status' => $index === 1 ? Conversation::STATUS_REPORTED : Conversation::STATUS_OPEN,
                    'created_by_user_id' => $first->id,
                    'last_message_at' => now()->subHours($index + 40),
                ]);
                $this->seedParticipant($conversation, $first, ConversationParticipant::ROLE_PARTICIPANT, true, false);
                $this->seedParticipant($conversation, $second, ConversationParticipant::ROLE_PARTICIPANT, false, false);
                $this->seedMessages($conversation, [$first, $second], $messageBodies, 5, $index + 40);
                $createdConversations->push($conversation);
            }

            $reportTypes = [
                ConversationReport::TYPE_PAYMENT_REQUEST,
                ConversationReport::TYPE_COMMERCIAL_PRESSURE,
                ConversationReport::TYPE_SPAM,
                ConversationReport::TYPE_ABUSE,
                ConversationReport::TYPE_UNSAFE_LINK,
                ConversationReport::TYPE_OTHER,
                ConversationReport::TYPE_HARASSMENT,
                ConversationReport::TYPE_PRIVACY_ISSUE,
                ConversationReport::TYPE_PAYMENT_REQUEST,
                ConversationReport::TYPE_COMMERCIAL_PRESSURE,
            ];

            foreach ($createdConversations->take(10)->values() as $index => $conversation) {
                $message = ConversationMessage::query()
                    ->where('conversation_id', $conversation->id)
                    ->where('system_message', false)
                    ->latest()
                    ->first();
                $reporter = $conversation->participants()->with('user')->first()?->user ?? $allLearners[$index % $allLearners->count()];
                $reportedUser = $message?->sender_user_id === $reporter->id
                    ? $conversation->participants()->where('user_id', '!=', $reporter->id)->first()?->user
                    : $message?->sender;
                $type = $reportTypes[$index];
                $reportStatus = [ConversationReport::STATUS_OPEN, ConversationReport::STATUS_IN_REVIEW, ConversationReport::STATUS_RESOLVED, ConversationReport::STATUS_DISMISSED][$index % 4];
                $publicResponse = $index % 4 >= 1
                    ? 'Demo public response: moderation reviewed this conversation report and shared a visible update with the reporter.'
                    : null;

                ConversationReport::create([
                    'conversation_id' => $conversation->id,
                    'message_id' => $message?->id,
                    'reporter_user_id' => $reporter->id,
                    'reported_user_id' => $reportedUser?->id,
                    'type' => $type,
                    'status' => $reportStatus,
                    'priority' => ConversationReport::defaultPriorityFor($type),
                    'description' => 'Demo conversation report for messaging moderation.',
                    'admin_notes' => $index % 3 === 0 ? 'Demo admin note for reviewed report.' : null,
                    'public_response' => $publicResponse,
                    'public_response_by' => $publicResponse ? $admin->id : null,
                    'public_response_sent_at' => $publicResponse ? now()->subHours($index + 3) : null,
                    'resolved_by' => $index % 4 >= 2 ? $admin->id : null,
                    'resolved_at' => $index % 4 >= 2 ? now()->subDays(1) : null,
                    'created_at' => now()->subDays($index),
                    'updated_at' => now()->subDays($index),
                ]);

                $conversation->forceFill(['status' => Conversation::STATUS_REPORTED])->save();
            }
        }
    }

    private function seedReputationDemoData(string $password, User $admin, $allLearners, $languages, $subjects): void
    {
        if (! Schema::hasTable('teacher_reviews')) {
            return;
        }

        $scenarios = [
            'excellent' => [
                'email' => 'reputation.excellent@example.com',
                'name' => 'Reputation Excellent Teacher',
                'city' => 'Madrid',
                'country_code' => 'ES',
                'headline' => 'Consistently excellent free sessions',
                'ratings' => [5, 5, 5, 5, 5, 5, 5, 4],
                'cancelled' => 0,
                'no_show' => 0,
            ],
            'reliable' => [
                'email' => 'reputation.reliable@example.com',
                'name' => 'Reputation Reliable Teacher',
                'city' => 'Lyon',
                'country_code' => 'FR',
                'headline' => 'Reliable community mentor',
                'ratings' => [4, 4, 5, 4, 4, 4],
                'cancelled' => 1,
                'no_show' => 0,
            ],
            'new' => [
                'email' => 'reputation.new@example.com',
                'name' => 'Reputation New Teacher',
                'city' => 'Austin',
                'country_code' => 'US',
                'headline' => 'New teacher building a history',
                'ratings' => [5],
                'cancelled' => 0,
                'no_show' => 0,
            ],
            'attention' => [
                'email' => 'reputation.attention@example.com',
                'name' => 'Reputation Attention Teacher',
                'city' => 'Berlin',
                'country_code' => 'DE',
                'headline' => 'Demo profile for admin reliability review',
                'ratings' => [3, 3, 2, 4],
                'cancelled' => 2,
                'no_show' => 2,
                'hidden_rating' => 1,
            ],
        ];

        $scenarioUsers = User::query()
            ->whereIn('email', collect($scenarios)->pluck('email'))
            ->get();
        $scenarioIds = $scenarioUsers->pluck('id');

        if ($scenarioIds->isNotEmpty()) {
            if (Schema::hasTable('review_reports')) {
                ReviewReport::query()
                    ->whereHas('review', fn ($query) => $query->whereIn('teacher_user_id', $scenarioIds))
                    ->delete();
            }

            TeacherReview::query()->whereIn('teacher_user_id', $scenarioIds)->delete();
            ClassSessionAttendee::query()
                ->whereHas('session', fn ($query) => $query->whereIn('teacher_user_id', $scenarioIds))
                ->delete();
            ClassSession::query()->whereIn('teacher_user_id', $scenarioIds)->delete();
            TeachingOfferApplication::query()->whereIn('teacher_user_id', $scenarioIds)->delete();
        }

        $subject = $subjects['laravel'] ?? $subjects->first();

        foreach ($scenarios as $key => $scenario) {
            $teacher = User::updateOrCreate(
                ['email' => $scenario['email']],
                [
                    'name' => $scenario['name'],
                    'password' => $password,
                    'preferred_locale' => 'en',
                    'timezone' => 'Europe/Madrid',
                    'country_code' => $scenario['country_code'],
                    'city' => $scenario['city'],
                    'bio' => 'Demo teacher profile for the reputation overview.',
                    'is_public' => true,
                    'learning_interests' => null,
                    'teaching_interests' => 'Free teaching reputation demo.',
                    'role' => User::ROLE_USER,
                    'email_verified_at' => now(),
                ],
            );

            $profile = TeacherProfile::updateOrCreate(
                ['user_id' => $teacher->id],
                [
                    'headline' => $scenario['headline'],
                    'teaching_bio' => 'This demo teacher exists so local seed data shows clear reputation states.',
                    'experience_summary' => 'Reputation demo profile with realistic completed, cancelled and no-show sessions.',
                    'preferred_teaching_mode' => TeacherProfile::MODE_SMALL_GROUP,
                    'max_students_per_session' => 6,
                    'default_session_duration_minutes' => 60,
                    'meeting_tool' => TeacherProfile::TOOL_JITSI,
                    'meeting_url' => 'https://meet.jit.si/teach4free-reputation-'.$key,
                    'is_active' => true,
                    'is_accepting_requests' => true,
                    'is_verified' => $key === 'excellent',
                    'activated_at' => now()->subDays($key === 'new' ? 2 : 40),
                    'paused_at' => null,
                ],
            );

            UserLanguage::updateOrCreate(
                [
                    'user_id' => $teacher->id,
                    'language_id' => $languages['en']->id,
                ],
                [
                    'understands' => true,
                    'speaks' => true,
                    'teaches' => true,
                    'level' => UserLanguage::LEVEL_ADVANCED,
                ],
            );

            $offer = TeachingOffer::updateOrCreate(
                ['slug' => 'reputation-demo-'.$key],
                [
                    'user_id' => $teacher->id,
                    'teacher_profile_id' => $profile->id,
                    'teaching_category_id' => $subject->teaching_category_id,
                    'teaching_subject_id' => $subject->id,
                    'title' => 'Reputation demo '.ucfirst($key).' free session',
                    'summary' => 'A free seeded offer used to demonstrate teacher reputation.',
                    'description' => 'This offer keeps demo reputation data visible while respecting the no-payment rule.',
                    'level' => TeachingOffer::LEVEL_BEGINNER,
                    'teaching_mode' => TeachingOffer::MODE_SMALL_GROUP,
                    'session_type' => TeachingOffer::SESSION_SCHEDULED_GROUP,
                    'max_students' => 6,
                    'duration_minutes' => 60,
                    'meeting_tool' => TeachingOffer::TOOL_JITSI,
                    'meeting_url' => 'https://meet.jit.si/teach4free-reputation-'.$key,
                    'timezone' => 'Europe/Madrid',
                    'availability_summary' => 'Weekday evenings.',
                    'requirements' => 'A free Teach4Free account.',
                    'materials_summary' => 'Free notes only.',
                    'is_public' => true,
                    'is_active' => true,
                    'is_accepting_applications' => true,
                    'allow_waiting_list' => true,
                    'waiting_list_limit' => 12,
                    'published_at' => now()->subDays(3),
                ],
            );
            $offer->languages()->sync([$languages['en']->id]);

            $this->seedReputationScenarioSessions($teacher, $offer, $allLearners, $scenario, $key, $admin);
        }

        $attentionTeacher = User::query()->where('email', $scenarios['attention']['email'])->first();
        if ($attentionTeacher) {
            Incident::updateOrCreate(
                ['subject' => 'Reputation demo reliability concern'],
                [
                    'reporter_user_id' => $allLearners->first()?->id,
                    'reported_user_id' => $attentionTeacher->id,
                    'type' => Incident::TYPE_SESSION,
                    'status' => Incident::STATUS_OPEN,
                    'priority' => Incident::PRIORITY_NORMAL,
                    'description' => 'Demo incident connected to a teacher with reliability signals that need admin review.',
                    'admin_notes' => null,
                    'public_response' => null,
                    'public_response_by' => null,
                    'public_response_sent_at' => null,
                    'resolved_by' => null,
                    'resolved_at' => null,
                ],
            );
        }
    }

    private function seedReputationScenarioSessions(User $teacher, TeachingOffer $offer, $learners, array $scenario, string $key, User $admin): void
    {
        $createdReviews = collect();

        foreach ($scenario['ratings'] as $index => $rating) {
            $student = $learners[($index + strlen($key)) % $learners->count()];
            if ((int) $student->id === (int) $teacher->id) {
                $student = $learners[($index + strlen($key) + 1) % $learners->count()];
            }

            $startsAt = now()->subDays(60 - $index)->setTime(18, 0);
            $session = ClassSession::create([
                'teaching_offer_id' => $offer->id,
                'teacher_user_id' => $teacher->id,
                'application_id' => null,
                'title' => 'Reputation demo '.$key.' completed '.($index + 1),
                'description' => 'Completed session for reputation demo data.',
                'starts_at' => $startsAt,
                'ends_at' => (clone $startsAt)->addMinutes(60),
                'timezone' => 'Europe/Madrid',
                'capacity' => 6,
                'meeting_tool' => $offer->meeting_tool,
                'meeting_url' => $offer->meeting_url,
                'status' => ClassSession::STATUS_COMPLETED,
                'completed_at' => (clone $startsAt)->addMinutes(60),
            ]);

            ClassSessionAttendee::create([
                'class_session_id' => $session->id,
                'user_id' => $student->id,
                'application_id' => null,
                'status' => ClassSessionAttendee::STATUS_ATTENDED,
                'joined_at' => $startsAt,
            ]);

            $createdReviews->push(TeacherReview::create([
                'teacher_user_id' => $teacher->id,
                'student_user_id' => $student->id,
                'class_session_id' => $session->id,
                'teaching_offer_id' => $offer->id,
                'rating' => $rating,
                'title' => 'Reputation demo review',
                'comment' => $rating <= 2
                    ? 'The completed free session had reliability problems that are useful for admin testing.'
                    : 'The completed free session was helpful and stayed fully free.',
                'teacher_response' => $rating >= 4 ? 'Thank you for helping build trust on Teach4Free.' : null,
                'teacher_responded_at' => $rating >= 4 ? now()->subDays(2) : null,
                'status' => TeacherReview::STATUS_PUBLISHED,
                'created_at' => now()->subDays(30 - $index),
                'updated_at' => now()->subDays(30 - $index),
            ]));
        }

        if (isset($scenario['hidden_rating'])) {
            $student = $learners[(strlen($key) + 9) % $learners->count()];
            $startsAt = now()->subDays(18)->setTime(18, 0);
            $session = ClassSession::create([
                'teaching_offer_id' => $offer->id,
                'teacher_user_id' => $teacher->id,
                'application_id' => null,
                'title' => 'Reputation demo '.$key.' hidden review session',
                'description' => 'Completed session with hidden review for moderation testing.',
                'starts_at' => $startsAt,
                'ends_at' => (clone $startsAt)->addMinutes(60),
                'timezone' => 'Europe/Madrid',
                'capacity' => 6,
                'meeting_tool' => $offer->meeting_tool,
                'meeting_url' => $offer->meeting_url,
                'status' => ClassSession::STATUS_COMPLETED,
                'completed_at' => (clone $startsAt)->addMinutes(60),
            ]);

            ClassSessionAttendee::create([
                'class_session_id' => $session->id,
                'user_id' => $student->id,
                'status' => ClassSessionAttendee::STATUS_ATTENDED,
                'joined_at' => $startsAt,
            ]);

            TeacherReview::create([
                'teacher_user_id' => $teacher->id,
                'student_user_id' => $student->id,
                'class_session_id' => $session->id,
                'teaching_offer_id' => $offer->id,
                'rating' => $scenario['hidden_rating'],
                'title' => 'Hidden reputation demo review',
                'comment' => 'Hidden demo review that should not count publicly.',
                'status' => TeacherReview::STATUS_HIDDEN,
                'hidden_at' => now()->subDays(3),
                'hidden_by' => $admin->id,
                'hidden_reason' => 'Demo hidden review for reputation calculations.',
            ]);
        }

        for ($index = 0; $index < $scenario['cancelled']; $index++) {
            $startsAt = now()->subDays(12 - $index)->setTime(18, 0);
            ClassSession::create([
                'teaching_offer_id' => $offer->id,
                'teacher_user_id' => $teacher->id,
                'application_id' => null,
                'title' => 'Reputation demo '.$key.' cancelled '.($index + 1),
                'description' => 'Cancelled session for reputation demo data.',
                'starts_at' => $startsAt,
                'ends_at' => (clone $startsAt)->addMinutes(60),
                'timezone' => 'Europe/Madrid',
                'capacity' => 6,
                'meeting_tool' => $offer->meeting_tool,
                'meeting_url' => $offer->meeting_url,
                'status' => ClassSession::STATUS_CANCELLED,
                'cancellation_reason' => 'Demo cancellation for reputation metrics.',
                'cancelled_at' => now()->subDays(10 - $index),
            ]);
        }

        for ($index = 0; $index < $scenario['no_show']; $index++) {
            $student = $learners[($index + strlen($key) + 15) % $learners->count()];
            $startsAt = now()->subDays(8 - $index)->setTime(18, 0);
            $session = ClassSession::create([
                'teaching_offer_id' => $offer->id,
                'teacher_user_id' => $teacher->id,
                'application_id' => null,
                'title' => 'Reputation demo '.$key.' no-show '.($index + 1),
                'description' => 'No-show session for reputation demo data.',
                'starts_at' => $startsAt,
                'ends_at' => (clone $startsAt)->addMinutes(60),
                'timezone' => 'Europe/Madrid',
                'capacity' => 6,
                'meeting_tool' => $offer->meeting_tool,
                'meeting_url' => $offer->meeting_url,
                'status' => ClassSession::STATUS_NO_SHOW,
                'no_show_marked_at' => now()->subDays(6 - $index),
            ]);

            ClassSessionAttendee::create([
                'class_session_id' => $session->id,
                'user_id' => $student->id,
                'application_id' => null,
                'status' => ClassSessionAttendee::STATUS_NO_SHOW,
                'joined_at' => $startsAt,
                'no_show_at' => $session->no_show_marked_at,
            ]);
        }

        if ($key === 'attention' && Schema::hasTable('review_reports')) {
            foreach ($createdReviews->take(2) as $reviewIndex => $review) {
                $reporter = $learners[($reviewIndex + 20) % $learners->count()];
                ReviewReport::create([
                    'teacher_review_id' => $review->id,
                    'reporter_user_id' => $reporter->id,
                    'type' => ReviewReport::TYPE_FALSE_INFORMATION,
                    'description' => 'Demo report connected to reputation attention state.',
                    'status' => ReviewReport::STATUS_OPEN,
                    'priority' => ReviewReport::PRIORITY_NORMAL,
                ]);

                $review->forceFill([
                    'reported_count' => $review->reports()->count(),
                ])->save();
            }
        }
    }

    private function seedParticipant(Conversation $conversation, User $user, string $role, bool $unread, bool $archived): void
    {
        ConversationParticipant::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'role' => $role,
            'last_read_at' => $unread ? now()->subDays(2) : now(),
            'archived_at' => $archived ? now()->subDay() : null,
        ]);
    }

    /**
     * @param  array<int, User>  $participants
     * @param  array<int, string>  $messageBodies
     */
    private function seedMessages(Conversation $conversation, array $participants, array $messageBodies, int $count, int $offset): void
    {
        ConversationMessage::create([
            'conversation_id' => $conversation->id,
            'sender_user_id' => null,
            'body' => 'Demo system note: keep learning coordination free and inside Teach4Free.',
            'system_message' => true,
            'created_at' => now()->subDays(3)->addMinutes($offset),
            'updated_at' => now()->subDays(3)->addMinutes($offset),
        ]);

        for ($index = 0; $index < $count; $index++) {
            $sender = $participants[($index + $offset) % count($participants)];
            $createdAt = now()->subHours(max(1, $offset + $count - $index));

            ConversationMessage::create([
                'conversation_id' => $conversation->id,
                'sender_user_id' => $sender->id,
                'body' => $messageBodies[($index + $offset) % count($messageBodies)],
                'system_message' => false,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }

        $conversation->forceFill([
            'last_message_at' => $conversation->messages()->latest()->value('created_at'),
        ])->save();
    }
}
