// src/components/layout/MainNav.tsx
import { Link } from "react-router-dom";
import { Icons } from "@/components/ui/Icons";
import { type HeaderNavItem } from "@/config/site";
import { cn } from "@/lib/utils";

interface MainNavProps {
    items?: HeaderNavItem[];
    activePath?: string;
}

export function MainNav({ items = [], activePath }: MainNavProps) {
    const isActive = (href: string) => {
        if (!activePath) return false;
        if (href === "/") {
            return activePath === "/";
        }
        return activePath.startsWith(href);
    };

    return (
        <div className="flex items-center gap-6 md:gap-10">
            <Link to="/" className="flex items-center space-x-2">
                {/* Desktop: Full logo with text */}
                <Icons.logoFull className="hidden md:block h-12 w-auto" />
                {/* Mobile: Icon only */}
                <Icons.logo className="block md:hidden h-10 w-10" />
            </Link>

            {items.length > 0 && (
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "transition-colors text-muted-foreground hover:text-foreground",
                                isActive(item.href) && "text-foreground"
                            )}
                        >
                            {item.title}
                        </Link>
                    ))}
                </nav>
            )}
        </div>
    );
}
