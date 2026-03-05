import { useTranslation } from "react-i18next";

interface Props {
  onDone: () => void;
}

const Confirmation = ({ onDone }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="animate-fade-slide-in flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="text-6xl mb-6">🌷</div>

      <h1 className="font-display text-3xl font-bold text-foreground tracking-tight mb-4">
        {t("vibeLogged")}
      </h1>

      <p className="text-muted-foreground text-base leading-relaxed max-w-xs mb-12">
        {t("thankYou")}
      </p>

      <button className="vibe-button max-w-sm w-full" onClick={onDone}>
        {t("done")}
      </button>
    </div>
  );
};

export default Confirmation;

