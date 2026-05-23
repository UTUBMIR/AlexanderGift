export interface BlackHoleInstance {
  dispose: () => void;
}

export function createBlackHoleScene(
  container: HTMLElement,
  onReady?: () => void,
): Promise<BlackHoleInstance>;
