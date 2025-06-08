import { render, screen, fireEvent } from '@testing-library/react'
import QRGenerator from '../QRGenerator'
import '@testing-library/jest-dom'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock de las funciones de analytics
jest.mock('@/lib/analytics/events', () => ({
  logQRGeneration: jest.fn(),
  logColorSelection: jest.fn(),
  logLogoUpload: jest.fn(),
  logUserInteraction: jest.fn(),
}))

// Mock de qrcode.react
jest.mock('qrcode.react', () => ({
  QRCodeCanvas: jest.fn(() => <canvas data-testid="qr-canvas" />),
}))

describe('QRGenerator', () => {
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks()
  })

  it('renderiza correctamente con los valores iniciales', () => {
    render(<QRGenerator />)
    
    // Verificar que los elementos principales estén presentes
    expect(screen.getByPlaceholderText('https://ejemplo.com')).toBeInTheDocument()
    expect(screen.getByText('URL')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Teléfono')).toBeInTheDocument()
  })

  it('cambia el tipo de QR correctamente', () => {
    render(<QRGenerator />)
    
    // Cambiar a tipo Email
    fireEvent.click(screen.getByText('Email'))
    expect(screen.getByPlaceholderText('tucorreo@ejemplo.com')).toBeInTheDocument()
    
    // Cambiar a tipo Teléfono
    fireEvent.click(screen.getByText('Teléfono'))
    expect(screen.getByPlaceholderText('+34123456789')).toBeInTheDocument()
  })

  it('maneja la entrada de contenido correctamente', () => {
    render(<QRGenerator />)
    
    const input = screen.getByPlaceholderText('https://ejemplo.com') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'https://test.com' } })
    expect(input.value).toBe('https://test.com')
  })

  it('valida URLs correctamente', () => {
    render(<QRGenerator />)
    
    const input = screen.getByPlaceholderText('https://ejemplo.com')
    
    // URL sin protocolo
    fireEvent.change(input, { target: { value: 'test.com' } })
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
    
    // URL con protocolo
    fireEvent.change(input, { target: { value: 'https://test.com' } })
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
  })

  it('maneja la subida de logos correctamente', () => {
    render(<QRGenerator />)
    
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' })
    const input = screen.getByLabelText(/subir logo/i) as HTMLInputElement
    
    Object.defineProperty(input, 'files', {
      value: [file]
    })
    
    fireEvent.change(input)
    
    // Verificar que no hay mensajes de error
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
  })

  it('rechaza archivos que no son PNG', () => {
    render(<QRGenerator />)
    
    const file = new File(['dummy content'], 'test.jpg', { type: 'image/jpeg' })
    const input = screen.getByLabelText(/subir logo/i) as HTMLInputElement
    
    Object.defineProperty(input, 'files', {
      value: [file]
    })
    
    fireEvent.change(input)
    
    // Verificar mensaje de error
    expect(screen.getByText('Solo se permiten imágenes PNG')).toBeInTheDocument()
  })

  it('maneja los cambios de color correctamente', () => {
    render(<QRGenerator />)
    
    // Abrir el selector de color del QR
    const qrColorButton = screen.getByLabelText(/color del qr/i)
    fireEvent.click(qrColorButton)
    
    // Verificar que el picker está visible
    expect(screen.getByRole('slider')).toBeInTheDocument()
  })

  it('permite descargar el QR generado', () => {
    // Mock de canvas.toDataURL
    const mockToDataURL = jest.fn(() => 'data:image/png;base64,fake')
    HTMLCanvasElement.prototype.toDataURL = mockToDataURL
    
    // Mock de createElement para el link de descarga
    const mockClick = jest.fn()
    const mockCreateElement = jest.spyOn(document, 'createElement')
    mockCreateElement.mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return { click: mockClick } as unknown as HTMLElement
      }
      return document.createElement(tagName)
    })
    
    render(<QRGenerator />)
    
    // Simular generación de QR
    const input = screen.getByPlaceholderText('https://ejemplo.com') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'https://test.com' } })
    
    const downloadButton = screen.getByText(/descargar/i)
    fireEvent.click(downloadButton)
    
    // Verificar que se intentó descargar
    expect(mockClick).toHaveBeenCalled()
    
    // Limpiar mocks
    mockCreateElement.mockRestore()
  })
}) 