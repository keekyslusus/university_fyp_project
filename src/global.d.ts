declare module "*.js";

interface Window {
  VibeClownRipple?: {
    handleDelegatedRipple: (event: PointerEvent) => void;
  };
  scandium?: {
    onLanguageChanged: (callback: (language: string) => void) => () => void;
  };
}
