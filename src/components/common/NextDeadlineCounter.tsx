import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';

interface NextDeadline {
    date: Date;
    daysUntil: number;
}

export function NextDeadlineCounter() {
    const [nextDeadline, setNextDeadline] = useState<NextDeadline | null>(null);

    useEffect(() => {
        // Calculate next Texas lien filing deadline
        // Texas law: 15th day of 3rd month after last work (for original contractors on residential projects)
        // This is the most common critical deadline
        const now = new Date();

        // Assume work completed today for demonstration
        // In production, this would come from user's actual project data
        const lastWorkDate = now;

        // Calculate 15th day of 3rd month after last work
        const month3 = new Date(lastWorkDate.getFullYear(), lastWorkDate.getMonth() + 2, 15);

        // If we're already past that date, calculate for next theoretical project
        let deadlineDate = month3;
        if (deadlineDate < now) {
            // Show next month's 15th as a general reminder
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
            deadlineDate = nextMonth;
        }

        const daysUntil = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        setNextDeadline({
            date: deadlineDate,
            daysUntil: Math.max(daysUntil, 0)
        });
    }, []);

    if (!nextDeadline) return null;

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getUrgencyColor = (days: number) => {
        if (days <= 7) return 'border-red-300/50 bg-red-50/90 text-red-900 dark:bg-red-950/40 dark:border-red-800/50 dark:text-red-200';
        if (days <= 14) return 'border-orange-300/50 bg-orange-50/90 text-orange-900 dark:bg-orange-950/40 dark:border-orange-800/50 dark:text-orange-200';
        return 'border-brand-300/50 bg-brand-50/90 text-brand-900 dark:bg-brand-950/40 dark:border-brand-800/50 dark:text-brand-200';
    };

    const getIconColor = (days: number) => {
        if (days <= 7) return 'text-red-600 dark:text-red-400';
        if (days <= 14) return 'text-orange-600 dark:text-orange-400';
        return 'text-brand-600 dark:text-brand-400';
    };

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-sm ${getUrgencyColor(nextDeadline.daysUntil)} shadow-sm hover:shadow-md transition-all duration-200`}>
            <Calendar className={`h-3.5 w-3.5 flex-shrink-0 ${getIconColor(nextDeadline.daysUntil)}`} />
            <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold whitespace-nowrap">
                    Next Deadline: {formatDate(nextDeadline.date)}
                </span>
                <span className="text-xs font-bold whitespace-nowrap">
                    ({nextDeadline.daysUntil}d)
                </span>
            </div>
        </div>
    );
}
