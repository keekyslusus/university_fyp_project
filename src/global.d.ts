declare module "*.js";

interface Window {
  VibeClownRipple?: {
    handleDelegatedRipple: (event: PointerEvent) => void;
  };
}
