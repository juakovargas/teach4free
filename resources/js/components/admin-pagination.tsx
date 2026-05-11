import { Link } from '@inertiajs/react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export function AdminPagination({ links }: { links?: PaginationLink[] }) {
    const { t } = useTranslation();

    if (!links || links.length <= 3) {
        return null;
    }

    return (
        <nav className="flex flex-wrap justify-end gap-2">
            {links.map((link, index) => {
                const label = cleanLabel(link.label, t);

                if (!link.url) {
                    return (
                        <span
                            key={`${label}-${index}`}
                            className="rounded-md border border-slate-200 px-3 py-2 text-sm text-muted-foreground dark:border-slate-800"
                        >
                            {label}
                        </span>
                    );
                }

                return (
                    <Link
                        key={`${label}-${index}`}
                        href={link.url}
                        className={cn(
                            'rounded-md border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900',
                            link.active && 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-50',
                        )}
                    >
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}

function cleanLabel(label: string, t: (key: string) => string): string {
    if (label.includes('Previous')) {
        return `‹ ${t('common.previous')}`;
    }

    if (label.includes('Next')) {
        return `${t('common.next')} ›`;
    }

    return label
        .replace('&laquo;', '‹')
        .replace('&raquo;', '›');
}
