import React, { useRef, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { DocumentState, SignatureState } from '../types';

interface DocumentPreviewProps {
  docState: DocumentState;
  signature: SignatureState;
  onSignatureChange: (newSig: SignatureState) => void;
  scale?: number; // For responsive scaling
  footerMode: 'normal' | 'bottom';
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ 
  docState, 
  signature,
  onSignatureChange,
  scale = 1,
  footerMode
}) => {
  // A4 dimensions in pixels at 96 DPI (approx)
  const A4_WIDTH = 794;
  const A4_HEIGHT = 1123;

  const nodeRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<HTMLDivElement>(null);

  // Helper to handle Resize and Rotate logic
  // We use window events to track dragging even if mouse leaves the handle
  const handleControlStart = (e: React.MouseEvent | React.TouchEvent, mode: 'resize' | 'rotate') => {
    e.stopPropagation(); // Prevent Draggable from activating
    // e.preventDefault(); // Do not prevent default to allow scrolling if needed, but here we likely want to lock
    
    const startX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const startY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const rect = signatureRef.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startWidth = signature.width;
    const startRotation = signature.rotation;
    
    // Initial distance for resizing (from center to mouse)
    const startDist = Math.hypot(startX - centerX, startY - centerY);
    // Initial angle for rotation
    const startAngle = Math.atan2(startY - centerY, startX - centerX) * 180 / Math.PI;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const moveX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : (moveEvent as MouseEvent).clientX;
      const moveY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : (moveEvent as MouseEvent).clientY;

      if (mode === 'resize') {
        const currentDist = Math.hypot(moveX - centerX, moveY - centerY);
        const scaleFactor = currentDist / startDist;
        const newWidth = Math.max(50, startWidth * scaleFactor);
        
        onSignatureChange({ ...signature, width: newWidth });
      } else if (mode === 'rotate') {
        const currentAngle = Math.atan2(moveY - centerY, moveX - centerX) * 180 / Math.PI;
        const deltaAngle = currentAngle - startAngle;
        onSignatureChange({ ...signature, rotation: startRotation + deltaAngle });
      }
    };

    const onEnd = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

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
        className="shadow-2xl relative shrink-0 bg-white"
        // ID removed from here to avoid capturing shadow
      >
        {/* Actual capture target - Pure white, no shadow */}
        <div 
            id="pdf-content" 
            className="w-full h-full p-[60px] flex flex-col font-serif text-slate-900 relative z-0 bg-white"
        >
            
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
                <h2 className="text-xl font-bold break-words whitespace-pre-wrap decoration-slate-400 decoration-1 ">
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

            {/* Signature Overlay */}
            {signature.image && (
                <Draggable
                    nodeRef={nodeRef}
                    bounds="parent"
                    position={{ x: signature.x, y: signature.y }}
                    onStop={(e, data) => onSignatureChange({ ...signature, x: data.x, y: data.y })}
                    cancel=".control-handle" // Prevent dragging when clicking handles
                    scale={scale} // Important for tracking cursor correctly when scaled
                >
                    {/* Outer div: Handles Position (Translate) via Draggable */}
                    <div 
                        ref={nodeRef}
                        className="absolute top-0 left-0 cursor-move z-20 group"
                        style={{ width: signature.width }}
                    >
                        {/* Inner wrapper for Rotation */}
                        <div 
                            ref={signatureRef}
                            className="relative"
                            style={{ transform: `rotate(${signature.rotation}deg)` }}
                        >
                            <img 
                                src={signature.image} 
                                alt="Signature" 
                                className="w-full h-auto pointer-events-none select-none"
                                style={{ mixBlendMode: 'multiply' }} 
                            />
                            
                            {/* Controls - Visible on Hover or Always visible on mobile/touch if needed. 
                                We use group-hover for desktop, but for mobile usefulness, we might want them slightly visible or relying on user knowing to tap.
                                Let's make them visible when hovering the signature area. 
                            */}
                            <div className="absolute inset-0 border-2 border-blue-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                            {/* Rotate Handle (Top Center) */}
                            <div 
                                className="control-handle absolute -top-8 left-1/2 transform -translate-x-1/2 w-8 h-8 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-300 rounded-full shadow-md z-30 touch-none"
                                onMouseDown={(e) => handleControlStart(e, 'rotate')}
                                onTouchStart={(e) => handleControlStart(e, 'rotate')}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                            </div>
                             {/* Connector line for rotate handle */}
                             <div className="absolute -top-4 left-1/2 w-0.5 h-4 bg-blue-400 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            {/* Resize Handle (Bottom Right) */}
                            <div 
                                className="control-handle absolute -bottom-3 -right-3 w-6 h-6 bg-white border-2 border-blue-500 rounded-full cursor-se-resize shadow-md z-30 opacity-0 group-hover:opacity-100 transition-opacity touch-none"
                                onMouseDown={(e) => handleControlStart(e, 'resize')}
                                onTouchStart={(e) => handleControlStart(e, 'resize')}
                            ></div>
                        </div>
                    </div>
                </Draggable>
            )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;