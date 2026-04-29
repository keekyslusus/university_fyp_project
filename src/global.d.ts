declare module "*.js";

interface Window {
  VibeClownRipple?: {
    handleDelegatedRipple: (event: PointerEvent) => void;
  };
  scandium?: {
    setLanguage: (language: string) => void;
    onLanguageChanged: (callback: (language: string) => void) => () => void;
  };
}
