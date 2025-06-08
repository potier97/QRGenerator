import { logEvent } from 'firebase/analytics';
import { analytics } from './firebase';

// Tipos para los eventos
interface QRGenerationEvent {
  type: string;
  contentLength: number;
  colors: {
    qr: string;
    background: string;
  };
  size: number;
  hasLogo: boolean;
  logoMetadata?: {
    format: string;
    size: number;
  };
}

interface ColorSelectionEvent {
  colorType: 'qr' | 'background';
  colorValue: string;
}

interface LogoUploadEvent {
  format: string;
  size: number;
}

// Funciones para registrar eventos
export const logQRGeneration = (data: QRGenerationEvent) => {
  if (analytics) {
    logEvent(analytics, 'qr_generated', {
      qr_type: data.type,
      content_length: data.contentLength,
      qr_color: data.colors.qr,
      bg_color: data.colors.background,
      size: data.size,
      has_logo: data.hasLogo,
      ...(data.logoMetadata && {
        logo_format: data.logoMetadata.format,
        logo_size: data.logoMetadata.size
      })
    });
  }
};

export const logColorSelection = (data: ColorSelectionEvent) => {
  if (analytics) {
    logEvent(analytics, 'color_selected', {
      color_type: data.colorType,
      color_value: data.colorValue
    });
  }
};

export const logLogoUpload = (data: LogoUploadEvent) => {
  if (analytics) {
    logEvent(analytics, 'logo_uploaded', {
      format: data.format,
      size: data.size
    });
  }
};

// Eventos de interacción del usuario
export const logUserInteraction = (
  action: string,
  details?: Record<string, string | number | boolean>
) => {
  if (analytics) {
    logEvent(analytics, 'user_interaction', {
      action,
      ...details
    });
  }
}; 