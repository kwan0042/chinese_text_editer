import React, { useRef } from 'react';
import { Upload, X, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { SignatureState } from '../types';

interface SignatureUploaderProps {
  signature: SignatureState;
  onChange: (sig: SignatureState) => void;
}

const SignatureUploader: React.FC<SignatureUploaderProps> = ({ signature, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange({
            ...signature,
            image: event.target.result as string,
            width: 150, // Reset width on new upload
            rotation: 0 // Reset rotation
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    onChange({ ...signature, image: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const adjustSize = (delta: number) => {
    onChange({ ...signature, width: Math.max(50, signature.width + delta) });
  };

  const adjustRotation = () => {
    onChange({ ...signature, rotation: (signature.rotation + 90) % 360 });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4">
      <div className="flex justify-between items-center mb-4">
        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
          簽名 / 圖章
          {signature.image && <span className="text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded">已上傳</span>}
        </label>
        
        {signature.image && (
             <button onClick={handleRemove} className="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded">
               移除
             </button>
        )}
      </div>

      {!signature.image ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors h-32"
        >
          <Upload className="text-slate-400 mb-2" size={24} />
          <span className="text-sm text-slate-500">點擊上傳圖片 (去背PNG為佳)</span>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
           <button 
            onClick={() => adjustSize(-10)}
            className="flex-1 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm"
          >
            <ZoomOut size={16} /> 縮小
          </button>
          <button 
            onClick={() => adjustSize(10)}
            className="flex-1 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm"
          >
            <ZoomIn size={16} /> 放大
          </button>
           <button 
            onClick={adjustRotation}
            className="flex-1 flex items-center justify-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm"
          >
            <RotateCw size={16} /> 旋轉
          </button>
        </div>
      )}
      {signature.image && (
          <p className="text-xs text-slate-400 mt-2 text-center">
            提示：在下方預覽區中可直接拖曳簽名移動位置
          </p>
      )}
    </div>
  );
};

export default SignatureUploader;