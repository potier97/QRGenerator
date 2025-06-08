'use client';

import { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { HexColorPicker } from 'react-colorful';
import { 
  LinkIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  WifiIcon,
  DocumentTextIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { logQRGeneration, logColorSelection, logLogoUpload, logUserInteraction } from '@/lib/analytics/events';
import { QRType, hexToRgb, rgbToHex, formatQRContent } from '@/utils/qr';

interface QROption {
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  label: string;
  placeholder: string;
  type: QRType;
}

const QR_OPTIONS: QROption[] = [
  { icon: LinkIcon, label: 'URL', placeholder: 'https://ejemplo.com', type: 'url' },
  { icon: EnvelopeIcon, label: 'Email', placeholder: 'tucorreo@ejemplo.com', type: 'email' },
  { icon: PhoneIcon, label: 'Teléfono', placeholder: '+34123456789', type: 'phone' },
  { icon: MapPinIcon, label: 'Ubicación', placeholder: 'Madrid, España', type: 'location' },
  { icon: WifiIcon, label: 'WiFi', placeholder: 'Nombre de red', type: 'wifi' },
  { icon: DocumentTextIcon, label: 'Texto', placeholder: 'Escribe tu texto aquí', type: 'text' },
];

export default function QRGenerator() {
  const [selectedType, setSelectedType] = useState<QRType>('url');
  const [content, setContent] = useState('');
  const [contentError, setContentError] = useState<string>('');
  const [qrColor, setQrColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [showColorPicker, setShowColorPicker] = useState<'qr' | 'bg' | null>(null);
  const [size, setSize] = useState(256);
  const [logo, setLogo] = useState<string | null>(null);
  const [borderRadius, setBorderRadius] = useState(20);
  const [qrMargin, setQrMargin] = useState(5);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processedLogo, setProcessedLogo] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    const file = event.target.files?.[0];
    
    if (file) {
      if (!file.type.includes('png')) {
        setErrorMessage('Solo se permiten imágenes PNG');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Validar tamaño del archivo (5MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('El archivo es demasiado grande. El tamaño máximo permitido es 10MB');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Log logo upload
      logLogoUpload({
        format: file.type,
        size: Math.round(file.size / 1024)
      });

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setLogo(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = () => {
    // Log QR generation event
    logQRGeneration({
      type: selectedType,
      contentLength: content.length,
      colors: {
        qr: qrColor,
        background: bgColor
      },
      size,
      hasLogo: !!logo,
      logoMetadata: logo ? {
        format: 'png',
        size: Math.round(logo.length / 1024) // Size in KB
      } : undefined
    });

    const canvas = document.querySelector('canvas');
    if (canvas) {
      // Crear un canvas temporal para añadir el borde redondeado
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        const padding = Math.max(4, Math.min(size, 450) * 0.02); // 2% del tamaño del QR, mínimo 4px
        const finalSize = canvas.width + (padding * 2);
        tempCanvas.width = finalSize;
        tempCanvas.height = finalSize;
        
        // Hacer el fondo transparente inicialmente
        ctx.clearRect(0, 0, finalSize, finalSize);
        
        // Crear el path redondeado
        ctx.beginPath();
        const radius = Math.min(borderRadius, finalSize * 0.25); // Limitar el radio a 25% del tamaño
        ctx.roundRect(0, 0, finalSize, finalSize, radius);
        ctx.closePath();
        
        // Rellenar el fondo
        ctx.fillStyle = bgColor;
        ctx.fill();
        
        // Dibujar el QR centrado
        ctx.save();
        ctx.clip(); // Mantener el recorte redondeado
        ctx.drawImage(
          canvas,
          padding,
          padding,
          canvas.width,
          canvas.height
        );
        ctx.restore();
        
        // Convertir a PNG y descargar
        const url = tempCanvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `qr-code-${selectedType}.png`;
        link.href = url;
        link.click();
      }
    }
  };

  useEffect(() => {
    if (logo) {
      // Procesar el logo para hacerlo circular
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.max(img.width, img.height);
        // Hacer el canvas un poco más grande para añadir un borde blanco
        const canvasSize = size + 8; // 4px de borde en cada lado
        canvas.width = canvasSize;
        canvas.height = canvasSize;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Hacer el fondo transparente
          ctx.clearRect(0, 0, canvasSize, canvasSize);
          
          // Dibujar el círculo blanco de fondo
          ctx.beginPath();
          ctx.arc(canvasSize/2, canvasSize/2, size/2 + 2, 0, Math.PI * 2);
          ctx.fillStyle = 'white';
          ctx.fill();
          
          // Crear el recorte circular para la imagen
          ctx.beginPath();
          ctx.arc(canvasSize/2, canvasSize/2, size/2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          
          // Calcular dimensiones para centrar la imagen
          const scale = size / Math.max(img.width, img.height);
          const x = (canvasSize - img.width * scale) / 2;
          const y = (canvasSize - img.height * scale) / 2;
          
          // Dibujar la imagen
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          
          setProcessedLogo(canvas.toDataURL('image/png'));
        }
      };
      img.src = logo;
    } else {
      setProcessedLogo(null);
    }
  }, [logo]);

  const validateContent = (type: QRType, value: string): string => {
    if (!value) return '';
    
    switch (type) {
      case 'url':
        try {
          // Verificar si la URL ya tiene un protocolo
          const hasProtocol = /^[a-zA-Z]+:\/\//.test(value);
          const urlToTest = hasProtocol ? value : `https://${value}`;
          new URL(urlToTest);
          
          // Verificar que tenga un dominio válido
          const domainRegex = /^(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/|$)/;
          if (!domainRegex.test(urlToTest)) {
            return 'URL inválida. Debe incluir un dominio válido (ejemplo: ejemplo.com)';
          }
          
          return '';
        } catch {
          return 'URL inválida. Debe ser una dirección web válida (ejemplo: ejemplo.com)';
        }
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? '' : 'Correo electrónico inválido.';
      
      case 'phone':
        const phoneRegex = /^\+?[\d\s-]{6,}$/;
        return phoneRegex.test(value) ? '' : 'Número de teléfono inválido. Debe contener al menos 6 dígitos.';
      
      case 'wifi':
        return value.length < 2 ? 'El nombre de la red debe tener al menos 2 caracteres.' : '';
      
      case 'location':
        return value.length < 3 ? 'La ubicación debe tener al menos 3 caracteres.' : '';
      
      case 'text':
        return value.length < 1 ? 'El texto no puede estar vacío.' : '';
      
      default:
        return '';
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setContentError(validateContent(selectedType, value));
  };

  const handleTypeChange = (type: QRType) => {
    setSelectedType(type);
    setContentError(validateContent(type, content));
    // Log type selection
    logUserInteraction('type_selected', { type });
  };

  // Componente para el selector de color
  const ColorPicker = ({ type, color, onColorChange }: { 
    type: 'qr' | 'bg', 
    color: string, 
    onColorChange: (color: string) => void 
  }) => {
    const [hexInput, setHexInput] = useState(color);
    const [hexError, setHexError] = useState('');
    const [rgbError, setRgbError] = useState('');
    const [rgbInputs, setRgbInputs] = useState(() => {
      const rgb = hexToRgb(color) || { r: 0, g: 0, b: 0 };
      return rgb;
    });
    const [localColor, setLocalColor] = useState(color);

    // Efecto para manejar la actualización del color
    useEffect(() => {
      onColorChange(localColor);
    }, [localColor, onColorChange]);

    // Actualizar el color local cuando cambia el color externo
    useEffect(() => {
      setLocalColor(color);
    }, [color]);

    const validateHex = (value: string): boolean => {
      return /^#[0-9A-Fa-f]{6}$/.test(value);
    };

    const validateRgb = (value: number): boolean => {
      return !isNaN(value) && value >= 0 && value <= 255;
    };

    const handleHexKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const value = e.currentTarget.value;
        const formattedValue = value.startsWith('#') ? value : `#${value}`;
        
        if (validateHex(formattedValue)) {
          setHexError('');
          onColorChange(formattedValue);
          // Actualizar los inputs RGB con el nuevo valor hex
          const rgb = hexToRgb(formattedValue) || { r: 0, g: 0, b: 0 };
          setRgbInputs(rgb);
        } else {
          setHexError('Color hexadecimal inválido (ej: #FF0000)');
        }
      }
    };

    const handleRgbKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, component: 'r' | 'g' | 'b') => {
      if (e.key === 'Enter') {
        const value = parseInt(e.currentTarget.value);
        
        if (validateRgb(value)) {
          const newRgb = { ...rgbInputs, [component]: value };
          setRgbError('');
          const newHexColor = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
          onColorChange(newHexColor);
          // Actualizar el input hex con el nuevo valor RGB
          setHexInput(newHexColor);
          // Actualizar todos los inputs RGB
          setRgbInputs(newRgb);
        } else {
          setRgbError('Valor RGB inválido (0-255)');
        }
      }
    };

    // Actualizar todos los inputs cuando cambia el color desde la paleta
    useEffect(() => {
      setHexInput(color);
      const rgb = hexToRgb(color) || { r: 0, g: 0, b: 0 };
      setRgbInputs(rgb);
      // Limpiar errores cuando se actualiza desde la paleta
      setHexError('');
      setRgbError('');
    }, [color]);

    return (
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <HexColorPicker 
            color={localColor}
            onChange={setLocalColor}
          />
        </div>
        <div className="flex-grow space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Hexadecimal</label>
            <div className="space-y-1">
              <input
                type="text"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                onKeyDown={handleHexKeyDown}
                className={`w-full px-2 py-1.5 text-sm border rounded text-gray-700 focus:text-gray-900 ${
                  hexError ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={type === 'qr' ? '000000' : 'FFFFFF'}
                maxLength={7}
              />
              {hexError && (
                <p className="text-xs text-red-500">{hexError}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">RGB</label>
            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-2">
                {(['r', 'g', 'b'] as const).map((component) => (
                  <div key={component}>
                    <label className="block text-xs font-medium text-gray-700 mb-1 uppercase">{component}</label>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgbInputs[component]}
                      onChange={(e) => setRgbInputs(prev => ({
                        ...prev,
                        [component]: e.target.value
                      }))}
                      onKeyDown={(e) => handleRgbKeyDown(e, component)}
                      className={`w-full px-2 py-1.5 text-sm border rounded text-gray-700 focus:text-gray-900 ${
                        rgbError ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                ))}
              </div>
              {rgbError && (
                <p className="text-xs text-red-500">{rgbError}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {QR_OPTIONS.map((option) => (
            <button
              key={option.type}
              onClick={() => handleTypeChange(option.type)}
              className={`flex flex-col items-center p-4 rounded-xl transition-all ${
                selectedType === option.type
                  ? 'bg-[#395f72]/40 text-[#395f72] font-semibold shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700'
              }`}
            >
              <option.icon className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido
            </label>
            <input
              type="text"
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={QR_OPTIONS.find(opt => opt.type === selectedType)?.placeholder}
              className={`w-full px-4 py-2 text-gray-600 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:text-gray-700 placeholder-gray-400 ${
                contentError ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {contentError && (
              <p className="mt-1 text-sm text-red-600">
                {contentError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color del QR
              </label>
              <div className="relative space-y-2">
                <button
                  onClick={() => setShowColorPicker(showColorPicker === 'qr' ? null : 'qr')}
                  className="w-full h-10 rounded-lg border"
                  style={{ backgroundColor: qrColor }}
                />
                {showColorPicker === 'qr' && (
                  <div className="absolute z-10 mt-2">
                    <div className="relative bg-white p-4 rounded-lg shadow-lg" style={{ width: '460px' }}>
                      <button
                        onClick={() => setShowColorPicker(null)}
                        className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-800 rounded-full shadow-md transition-colors"
                        title="Cerrar selector de color"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                      <ColorPicker 
                        type="qr"
                        color={qrColor}
                        onColorChange={(newColor) => {
                          setQrColor(newColor);
                          logColorSelection({
                            colorType: 'qr',
                            colorValue: newColor
                          });
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color de fondo
              </label>
              <div className="relative space-y-2">
                <button
                  onClick={() => setShowColorPicker(showColorPicker === 'bg' ? null : 'bg')}
                  className="w-full h-10 rounded-lg border"
                  style={{ backgroundColor: bgColor }}
                />
                {showColorPicker === 'bg' && (
                  <div className="absolute z-10 mt-2">
                    <div className="relative bg-white p-4 rounded-lg shadow-lg" style={{ width: '460px' }}>
                      <button
                        onClick={() => setShowColorPicker(null)}
                        className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-800 rounded-full shadow-md transition-colors"
                        title="Cerrar selector de color"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                      <ColorPicker 
                        type="bg"
                        color={bgColor}
                        onColorChange={(newColor) => {
                          setBgColor(newColor);
                          logColorSelection({
                            colorType: 'background',
                            colorValue: newColor
                          });
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tamaño: {size}x{size}px
            </label>
            <input
              type="range"
              min="128"
              max="512"
              step="32"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Borde redondeado
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={borderRadius}
              onChange={(e) => setBorderRadius(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Margen del QR
            </label>
            <input
              type="range"
              min="2"
              max="12"
              value={qrMargin}
              onChange={(e) => setQrMargin(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo (opcional)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-3/4">
                <div className="relative w-full">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png"
                    onChange={handleLogoUpload}
                    disabled={!!logo}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    className={`w-full px-4 py-2 text-sm font-semibold rounded-full border
                      ${logo 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'bg-[#395f72]/10 text-[#395f72] hover:bg-[#395f72]/20'}`}
                    disabled={!!logo}
                  >
                    Seleccionar Imagen
                  </button>
                </div>
              </div>
              <div className="w-1/4 flex justify-center">
                {logo ? (
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-sm">
                      {(processedLogo || logo) && (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={processedLogo || logo} 
                            alt="Logo preview"
                            className="w-full h-full object-cover"
                          />
                        </>
                      )}
                    </div>
                    <button
                      onClick={removeLogo}
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors group"
                      title="Remover logo"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      <span className="absolute invisible group-hover:visible bg-gray-800 text-white text-xs py-1 px-2 rounded -mt-8 -ml-2 whitespace-nowrap">
                        Remover logo
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <PhotoIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            {errorMessage && (
              <p className="text-xs text-red-600 mt-1">
                {errorMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-xl p-8">
        <div className="relative w-full max-w-2xl aspect-square flex items-center justify-center" >
          <div 
            className="shadow-[0_8px_30px_rgb(0,0,0,0.12)] transform-gpu hover:shadow-[0_20px_50px_rgb(0,0,0,0.15)] transition-all duration-300 overflow-hidden"
            style={{ 
              borderRadius: `${borderRadius}px`,
              width: `${Math.min(size, 450)}px`,
              height: `${Math.min(size, 450)}px`,
              backgroundColor: bgColor,
            }}
          >
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ 
                padding: `${Math.max(4, borderRadius/7)}px`,
              }}
            >
              <QRCodeCanvas
                value={formatQRContent(selectedType, content) || ' '}
                size={Math.min(size, 450)}
                fgColor={qrColor}
                bgColor={bgColor}
                level="H"
                marginSize={qrMargin}
                imageSettings={processedLogo ? {
                  src: processedLogo,
                  height: Math.min(size, 450) * 0.2,
                  width: Math.min(size, 450) * 0.2,
                  excavate: true,
                } : undefined}
              />
            </div>
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={!content || !!contentError}
          className="mt-8 px-6 py-2.5 bg-[#395f72] text-white rounded-lg hover:bg-[#395f72]/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all duration-200"
        >
          Descargar QR
        </button>
      </div>
    </div>
  );
} 