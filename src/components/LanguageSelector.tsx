import { useTranslation } from "react-i18next";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "pt", name: "Português" },
    { code: "de", name: "Deutsch" },
    { code: "ar", name: "العربية" },
    { code: "hi", name: "हिन्दी" },
    { code: "bn", name: "বাংলা" },
    { code: "zh", name: "简体中文" },
    { code: "ja", name: "日本語" },
    { code: "id", name: "Bahasa Indonesia" },
    { code: "tr", name: "Türkçe" },
    { code: "vi", name: "Tiếng Việt" },
    { code: "ko", name: "한국어" },
    { code: "ru", name: "Русский" },
    { code: "it", name: "Italiano" },
    { code: "pl", name: "Polski" },
    { code: "th", name: "ไทย" },
    { code: "tl", name: "Filipino" },
];

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const handleLanguageChange = (code: string) => {
        i18n.changeLanguage(code);
        // Update URL parameter
        const url = new URL(window.location.href);
        url.searchParams.set("lang", code);
        window.history.pushState({}, "", url.toString());
    };

    return (
        <div className="absolute top-4 right-4 z-50">
            <Select onValueChange={handleLanguageChange} value={i18n.language}>
                <SelectTrigger className="w-[140px] bg-background/50 backdrop-blur-md border-none focus:ring-0">
                    <Globe className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                    {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default LanguageSelector;
