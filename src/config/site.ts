// src/config/site.ts
export type NavAudience = 'all' | 'authenticated' | 'guest'

export type HeaderNavItem = {
    title: string
    href: string
    audience?: NavAudience
}

export const siteConfig = {
    name: "Lien Professor",
    description:
        "Lien Professor provides automated legal document preparation for construction professionals to secure their payment rights.",
    url: "https://lienprofessor.com",
    ogImage: "https://lienprofessor.com/og.jpg",
    links: {
        twitter: "https://twitter.com/lienprofessor",
        github: "https://github.com/lienprofessor/lien-professor-app",
    },
    headerNav: [
        {
            title: "Home",
            href: "/lien-professor",
            audience: "all",
        },
        {
            title: "Assessment",
            href: "/assessment",
            audience: "all",
        },
        {
            title: "Lien Kits",
            href: "/kits",
            audience: "all",
        },
        {
            title: "Bond Kits",
            href: "/bond-kits",
            audience: "all",
        },
        {
            title: "Learn",
            href: "/learn",
            audience: "all",
        },
        {
            title: "Dashboard",
            href: "/dashboard",
            audience: "authenticated",
        },
    ] as HeaderNavItem[],
}

export type SiteConfig = typeof siteConfig
