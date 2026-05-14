import { Head, useForm, usePage } from '@inertiajs/react';
import { BellRing } from 'lucide-react';
import type { FormEvent } from 'react';
import { ContextualHelp } from '@/components/contextual-help';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from '@/hooks/use-translation';

type PreferenceKey =
    | 'email_session_scheduled_enabled'
    | 'email_session_cancelled_enabled'
    | 'email_session_completed_enabled'
    | 'email_session_reminder_24h_enabled'
    | 'email_session_reminder_1h_enabled'
    | 'email_application_received_enabled'
    | 'email_application_accepted_enabled'
    | 'email_application_rejected_enabled'
    | 'email_application_cancelled_enabled'
    | 'email_waiting_list_enabled'
    | 'email_new_message_enabled'
    | 'email_platform_updates_enabled';

type Preferences = Record<PreferenceKey, boolean>;

type Props = {
    preferences: Preferences;
};

const groups: { title: string; description: string; fields: PreferenceKey[] }[] = [
    {
        title: 'notification_preferences.sessions',
        description: 'notification_preferences.sessions_help',
        fields: ['email_session_scheduled_enabled', 'email_session_cancelled_enabled', 'email_session_completed_enabled'],
    },
    {
        title: 'notification_preferences.reminders',
        description: 'notification_preferences.reminders_help',
        fields: ['email_session_reminder_24h_enabled', 'email_session_reminder_1h_enabled'],
    },
    {
        title: 'notification_preferences.applications',
        description: 'notification_preferences.applications_help',
        fields: [
            'email_application_received_enabled',
            'email_application_accepted_enabled',
            'email_application_rejected_enabled',
            'email_application_cancelled_enabled',
            'email_waiting_list_enabled',
        ],
    },
    {
        title: 'notification_preferences.messages',
        description: 'notification_preferences.messages_help',
        fields: ['email_new_message_enabled'],
    },
    {
        title: 'notification_preferences.platform',
        description: 'notification_preferences.platform_help',
        fields: ['email_platform_updates_enabled'],
    },
];

export default function NotificationPreferences({ preferences }: Props) {
    const { t } = useTranslation();
    const { flash } = usePage().props as { flash: { status?: string } };
    const form = useForm<Preferences>({
        email_session_scheduled_enabled: preferences.email_session_scheduled_enabled,
        email_session_cancelled_enabled: preferences.email_session_cancelled_enabled,
        email_session_completed_enabled: preferences.email_session_completed_enabled,
        email_session_reminder_24h_enabled: preferences.email_session_reminder_24h_enabled,
        email_session_reminder_1h_enabled: preferences.email_session_reminder_1h_enabled,
        email_application_received_enabled: preferences.email_application_received_enabled,
        email_application_accepted_enabled: preferences.email_application_accepted_enabled,
        email_application_rejected_enabled: preferences.email_application_rejected_enabled,
        email_application_cancelled_enabled: preferences.email_application_cancelled_enabled,
        email_waiting_list_enabled: preferences.email_waiting_list_enabled,
        email_new_message_enabled: preferences.email_new_message_enabled,
        email_platform_updates_enabled: preferences.email_platform_updates_enabled,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.put('/profile/notification-preferences', { preserveScroll: true });
    };

    return (
        <>
            <Head title={t('notification_preferences.meta_title')} />
            <div className="space-y-6 p-4 sm:p-6">
                <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start gap-4">
                        <BellRing className="mt-1 size-6 text-emerald-700 dark:text-emerald-300" />
                        <div>
                            <h1 className="text-2xl font-semibold tracking-normal">{t('notification_preferences.title')}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{t('notification_preferences.intro')}</p>
                        </div>
                    </div>
                </section>

                {flash.status && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
                        {flash.status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    {groups.map((group) => (
                        <section key={group.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            <h2 className="text-lg font-semibold">{t(group.title)}</h2>
                            <p className="mt-2 text-sm text-muted-foreground">{t(group.description)}</p>
                            <div className="mt-4 grid gap-3">
                                {group.fields.map((field) => (
                                    <label key={field} className="flex items-start gap-3 rounded-md border border-slate-200 p-3 text-sm dark:border-slate-800">
                                        <Checkbox checked={form.data[field]} onCheckedChange={(checked) => form.setData(field, Boolean(checked))} />
                                        <span>{t(`notification_preferences.fields.${field}`)}</span>
                                    </label>
                                ))}
                            </div>
                        </section>
                    ))}
                    <Button disabled={form.processing}>{t('actions.save')}</Button>
                </form>

                <ContextualHelp title={t('notification_preferences.help_title')}>
                    {t('notification_preferences.help_body')}
                </ContextualHelp>
            </div>
        </>
    );
}

NotificationPreferences.layout = {
    breadcrumbs: [
        {
            title: 'navigation.notification_preferences',
            href: '/profile/notification-preferences',
        },
    ],
};
