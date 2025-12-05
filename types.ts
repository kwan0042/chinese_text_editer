export type TextAlign = 'left' | 'center' | 'right';

export interface DocumentSection {
  text: string;
  align: TextAlign;
}

export interface DocumentState {
  companyHeader: DocumentSection;
  subject: DocumentSection;
  salutation: DocumentSection;
  content: DocumentSection;
  closing: DocumentSection;
  signOff: DocumentSection;
  date: DocumentSection;
}

export interface SignatureState {
  image: string | null; // Base64 or URL
  x: number;
  y: number;
  width: number; // pixels
  rotation: number; // degrees
}