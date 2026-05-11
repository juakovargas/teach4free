import { CircleHelp } from 'lucide-react';

type Props = {
    title: string;
    children: React.ReactNode;
};

export function ContextualHelp({ title, children }: Props) {
    return (
        <aside className="rounded-lg border border-cyan-200 bg-cyan-50/80 p-4 text-sm text-cyan-950 shadow-xs dark:border-cyan-900/70 dark:bg-cyan-950/30 dark:text-cyan-50">
            <div className="mb-2 flex items-center gap-2 font-semibold">
                <CircleHelp className="size-4" />
                <span>{title}</span>
            </div>
            <div className="leading-6 text-cyan-900 dark:text-cyan-100">
                {children}
            </div>
        </aside>
    );
}
