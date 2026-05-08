export const DEFAULT_PIN_WIDTH = 1000;
export const DEFAULT_PIN_HEIGHT = 1500;
export const DEFAULT_PIN_ASPECT_RATIO = "2:3";

export function getPinDimensions(width?: number | null, height?: number | null) {
  return {
    width: width ?? DEFAULT_PIN_WIDTH,
    height: height ?? DEFAULT_PIN_HEIGHT,
    aspectRatio: DEFAULT_PIN_ASPECT_RATIO,
  };
}
