export const hexToRgb = (hex: string): any => {
  const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return res ? { r: parseInt(res[1], 16), g: parseInt(res[2], 16), b: parseInt(res[3], 16) } : null;
};

export const decToHex = (c: number): string => {
  const hex = c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return `#${decToHex(r)}${decToHex(g)}${decToHex(b)}`;
};

export const getAverageColor = (hex1: string, hex2: string, pos: number): string => {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  const r = Math.floor((rgb2.r - rgb1.r) * pos + rgb1.r);
  const g = Math.floor((rgb2.g - rgb1.g) * pos + rgb1.g);
  const b = Math.floor((rgb2.b - rgb1.b) * pos + rgb1.b);

  return rgbToHex(r, g, b);
};
