// src/components/ui/Icons.tsx
import { LucideProps, Moon, Sun } from "lucide-react";

export const Icons = {
    sun: (props: LucideProps) => <Sun {...props} />,
    moon: (props: LucideProps) => <Moon {...props} />,
    logo: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
        <img
            src="https://uhmdffjniyugmcdaiedt.supabase.co/storage/v1/object/public/application-assets/lien-professor-icon.png"
            alt="Lien Professor"
            {...props}
        />
    ),
    logoFull: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
        <img
            src="https://uhmdffjniyugmcdaiedt.supabase.co/storage/v1/object/public/application-assets/lien-professor-full-logo.png"
            alt="Lien Professor"
            {...props}
        />
    ),
};
