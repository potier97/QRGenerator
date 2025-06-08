import { formatQRContent, hexToRgb, rgbToHex } from "@/utils/qr"


describe('Utilidades de QRGenerator', () => {
  describe('hexToRgb', () => {
    it('convierte correctamente colores hexadecimales a RGB', () => {
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 })
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 })
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 })
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 })
    })

    it('maneja valores inválidos', () => {
      expect(hexToRgb('invalid')).toBeNull()
      expect(hexToRgb('#12345')).toBeNull()
      expect(hexToRgb('#GGGGGG')).toBeNull()
    })
  })

  describe('rgbToHex', () => {
    it('convierte correctamente valores RGB a hexadecimal', () => {
      expect(rgbToHex(0, 0, 0)).toBe('#000000')
      expect(rgbToHex(255, 255, 255)).toBe('#ffffff')
      expect(rgbToHex(255, 0, 0)).toBe('#ff0000')
      expect(rgbToHex(0, 255, 0)).toBe('#00ff00')
      expect(rgbToHex(0, 0, 255)).toBe('#0000ff')
    })

    it('maneja valores fuera de rango', () => {
      expect(rgbToHex(-10, 0, 0)).toBe('#000000')
      expect(rgbToHex(0, 300, 0)).toBe('#00ff00')
      expect(rgbToHex(0, 0, 1000)).toBe('#0000ff')
    })
  })

  describe('formatQRContent', () => {
    it('formatea correctamente URLs', () => {
      expect(formatQRContent('url', 'example.com')).toBe('https://example.com')
      expect(formatQRContent('url', 'https://example.com')).toBe('https://example.com')
    })

    it('formatea correctamente emails', () => {
      expect(formatQRContent('email', 'test@example.com')).toBe('mailto:test@example.com')
    })

    it('formatea correctamente números de teléfono', () => {
      expect(formatQRContent('phone', '+34123456789')).toBe('tel:+34123456789')
    })

    it('formatea correctamente ubicaciones', () => {
      expect(formatQRContent('location', 'Madrid, España'))
        .toBe('geo:0,0?q=Madrid%2C%20Espa%C3%B1a')
    })

    it('formatea correctamente configuraciones WiFi', () => {
      expect(formatQRContent('wifi', 'Mi Red WiFi'))
        .toBe('WIFI:T:WPA;S:Mi Red WiFi;P:;;')
    })

    it('mantiene el texto plano sin cambios', () => {
      expect(formatQRContent('text', 'Hola Mundo')).toBe('Hola Mundo')
    })
  })
}) 