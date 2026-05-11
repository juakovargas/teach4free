import { usePage } from '@inertiajs/react';
import { Chrome } from 'lucide-react';
import { ContextualHelp } from '@/components/contextual-help';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

type Props = {
    helpText?: string;
};

export function GoogleLoginButton({ helpText }: Props) {
    const { errors } = usePage().props;
    const { t } = useTranslation();

    return (
        <div className="space-y-3">
            <Button variant="outline" className="w-full" asChild>
                <a href="/auth/google/redirect">
                    <Chrome />
                    {t('google.continue')}
                </a>
            </Button>
            {errors.google && (
                <p className="text-center text-sm text-destructive">
                    {errors.google}
                </p>
            )}
            {helpText && (
                <ContextualHelp title={t('google.help_title')}>
                    {helpText}
                </ContextualHelp>
            )}
        </div>
    );
}
