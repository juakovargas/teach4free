import { Link, usePage } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

type Impersonation = {
    active: boolean;
    user?: {
        name: string;
        email: string;
    };
};

type PageProps = {
    impersonation?: Impersonation;
};

export function ImpersonationBanner() {
    const { t } = useTranslation();
    const { impersonation } = usePage().props as PageProps;

    if (!impersonation?.active || !impersonation.user) {
        return null;
    }

    const displayName = impersonation.user.name || impersonation.user.email;

    return (
        <div className="flex items-center justify-center gap-3 border-b border-amber-300 bg-amber-100 px-4 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
            <ShieldAlert className="size-4" />
            <span>{t('impersonation.banner', { user: displayName })}</span>
            <Button size="sm" variant="outline" asChild>
                <Link href="/admin/impersonation/stop" method="post" as="button">
                    {t('impersonation.stop')}
                </Link>
            </Button>
        </div>
    );
}
