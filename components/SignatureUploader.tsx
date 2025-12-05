import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
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
        <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex items-start gap-2">
           <div className="mt-0.5">ℹ️</div>
           <div>
             <strong>操作說明：</strong>
             <ul className="list-disc ml-4 mt-1 space-y-1 text-xs">
               <li>拖曳簽名可移動位置。</li>
               <li>拖曳 <span className="inline-block w-4 h-4 bg-white border border-blue-500 rounded-full align-middle mx-1"></span> 圓點可調整大小。</li>
               <li>拖曳 <span className="inline-block w-4 h-4 bg-white border border-blue-500 rounded-full align-middle mx-1"></span> 上方圓點可旋轉角度。</li>
             </ul>
           </div>
        </div>
      )}
    </div>
  );
};

export default SignatureUploader;