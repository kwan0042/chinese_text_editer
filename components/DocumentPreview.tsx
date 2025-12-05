import React from 'react';
import Draggable from 'react-draggable';
import { DocumentState, SignatureState } from '../types';

interface DocumentPreviewProps {
  docState: DocumentState;
  signature: SignatureState;
  onSignatureDragStop: (e: any, data: { x: number; y: number }) => void;
  scale?: number; // For responsive scaling
  footerMode: 'normal' | 'bottom';
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ 
  docState, 
  signature,
  onSignatureDragStop,
  scale = 1,
  footerMode
}) => {
  // A4 dimensions in pixels at 96 DPI (approx)
  // Width: 210mm ~= 794px
  // Height: 297mm ~= 1123px
  // We use a container that scales using CSS transform
  
  const A4_WIDTH = 794;
  const A4_HEIGHT = 1123;

  return (
    <div className="relative flex justify-center bg-slate-200 p-4 overflow-hidden rounded-xl border border-slate-300">
       {/* Scale Wrapper */}
      <div 
        style={{ 
          width: A4_WIDTH, 
          height: A4_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          marginBottom: -(A4_HEIGHT - (A4_HEIGHT * scale)) // Compensate for vertical space loss due to scaling
        }}
        className="bg-white shadow-2xl relative shrink-0"
        id="pdf-content"
      >
        {/* Padding container inside the paper */}
        <div className="w-full h-full p-[60px] flex flex-col font-serif text-slate-900 relative z-0">
            
            {/* Header */}
            {docState.companyHeader.text && (
                <div className="mb-8 pb-4 border-b-2 border-slate-800" style={{ textAlign: docState.companyHeader.align }}>
                    <h1 className="text-2xl font-bold tracking-wide break-words whitespace-pre-wrap leading-tight">
                        {docState.companyHeader.text}
                    </h1>
                </div>
            )}

            {/* Subject/Title */}
            <div className="mb-6" style={{ textAlign: docState.subject.align }}>
                <h2 className="text-xl font-bold break-words whitespace-pre-wrap underline decoration-slate-400 decoration-1 underline-offset-4">
                    {docState.subject.text}
                </h2>
            </div>

            {/* Salutation */}
             <div className="mb-6" style={{ textAlign: docState.salutation.align }}>
                <p className="text-lg break-words whitespace-pre-wrap">{docState.salutation.text}</p>
            </div>

            {/* Content */}
            <div className="whitespace-pre-wrap leading-relaxed text-lg text-justify mb-8" style={{ textAlign: docState.content.align }}>
                {docState.content.text || <span className="text-slate-300 italic">在此輸入文件內容...</span>}
            </div>
            
            {/* Spacer for Bottom Alignment */}
            {footerMode === 'bottom' && <div className="flex-grow"></div>}

            {/* Footer Group */}
            <div>
                {/* Closing */}
                {docState.closing.text && (
                    <div className="mb-8" style={{ textAlign: docState.closing.align }}>
                        <p className="text-lg whitespace-pre-wrap">{docState.closing.text}</p>
                    </div>
                )}

                {/* Sign Off */}
                {docState.signOff.text && (
                    <div className="mb-2" style={{ textAlign: docState.signOff.align }}>
                        <p className="text-lg font-bold whitespace-pre-wrap">{docState.signOff.text}</p>
                    </div>
                )}

                {/* Date */}
                <div className="mb-12" style={{ textAlign: docState.date.align }}>
                    <p className="text-lg text-slate-600 font-sans">{docState.date.text}</p>
                </div>
            </div>

            {/* Signature Overlay - Absolute positioned relative to the A4 paper */}
            {/* We use a portal-like approach visually, but technically it's inside the div to be captured by html2canvas */}
            {signature.image && (
                <Draggable
                    bounds="parent"
                    position={{ x: signature.x, y: signature.y }}
                    onStop={onSignatureDragStop}
                >
                    <div 
                        className="absolute cursor-move z-10 group"
                        style={{ 
                            width: signature.width,
                            transform: `rotate(${signature.rotation}deg)`,
                            // When generating PDF, border should disappear.
                            // However, html2canvas captures what it sees.
                            // We rely on 'group-hover' to show border only during edit, 
                            // assuming html2canvas isn't run while hovering.
                        }}
                    >
                        <img 
                            src={signature.image} 
                            alt="Signature" 
                            className="w-full h-auto pointer-events-none select-none"
                            style={{ mixBlendMode: 'multiply' }} // multiply effect for realistic stamp/sig
                        />
                        <div className="absolute inset-0 border-2 border-blue-400 opacity-0 group-hover:opacity-100 transition-opacity rounded pointer-events-none"></div>
                    </div>
                </Draggable>
            )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;