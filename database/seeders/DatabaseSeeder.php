<?php

namespace Database\Seeders;

use App\Models\Incident;
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
            'Possible spam profile', 'Offer needs review', 'Application support request', 'Technical issue on profile page',
            'Abusive message report', 'Duplicate teaching offer', 'Open session link problem', 'Student safety concern',
            'Teacher verification question', 'Blocked content review', 'General support issue', 'Suspicious account activity',
            'Language mismatch in offer', 'Repeated no-show concern', 'Accessibility help request',
        ];

        foreach ($incidentSubjects as $index => $subject) {
            $status = Incident::STATUSES[$index % count(Incident::STATUSES)];
            $resolved = in_array($status, [Incident::STATUS_RESOLVED, Incident::STATUS_DISMISSED], true);
            $reporter = $allLearners[$index % $allLearners->count()];
            $reported = $allTeachers[$index % $allTeachers->count()];
            $offer = $offers[$index % $offers->count()];

            Incident::updateOrCreate(
                ['subject' => $subject],
                [
                    'reporter_user_id' => $reporter->id,
                    'reported_user_id' => $reported->id,
                    'teaching_offer_id' => $index % 2 === 0 ? $offer->id : null,
                    'application_id' => null,
                    'type' => Incident::TYPES[$index % count(Incident::TYPES)],
                    'status' => $status,
                    'priority' => Incident::PRIORITIES[$index % count(Incident::PRIORITIES)],
                    'description' => 'Demo incident created for admin moderation workflows.',
                    'admin_notes' => $resolved ? 'Resolved in demo data.' : null,
                    'resolved_by' => $resolved ? $admin->id : null,
                    'resolved_at' => $resolved ? now()->subDays(1) : null,
                ],
            );
        }
    }
}
