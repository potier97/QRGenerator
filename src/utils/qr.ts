export type QRType = 'url' | 'email' | 'phone' | 'location' | 'wifi' | 'text';

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, n)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const formatQRContent = (type: QRType, content: string): string => {
  switch (type) {
    case 'url':
      return content.startsWith('http') ? content : `https://${content}`;
    case 'email':
      return `mailto:${content}`;
    case 'phone':
      return `tel:${content}`;
    case 'location':
      return `geo:0,0?q=${encodeURIComponent(content)}`;
    case 'wifi':
      return `WIFI:T:WPA;S:${content};P:;;`;
    default:
      return content;
  }
}; 