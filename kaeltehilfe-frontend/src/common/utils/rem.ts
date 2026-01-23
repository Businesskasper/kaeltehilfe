/**
 * Convert px to rem
 * 
 * @param pixels
 * @param base - base font size in pixels, defaults to 16
 * @returns the rem value as a string
 */
export const rem = (pixels: number, base: number = 16) => {
  return `${pixels / base}rem`;
};
