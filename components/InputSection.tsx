import React from 'react';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { DocumentSection, TextAlign } from '../types';

interface InputSectionProps {
  label: string;
  value: DocumentSection;
  onChange: (newSection: DocumentSection) => void;
  multiline?: boolean;
  placeholder?: string;
  rows?: number;
}

const InputSection: React.FC<InputSectionProps> = ({ 
  label, 
  value, 
  onChange, 
  multiline = false,
  placeholder,
  rows = 4
}) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange({ ...value, text: e.target.value });
  };

  const handleAlignChange = (align: TextAlign) => {
    onChange({ ...value, align });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4 transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-bold text-slate-700">{label}</label>
        <div className="flex bg-slate-100 rounded-lg p-1 space-x-1">
          <button
            onClick={() => handleAlignChange('left')}
            className={`p-1.5 rounded-md transition-colors ${value.align === 'left' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            title="靠左"
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() => handleAlignChange('center')}
            className={`p-1.5 rounded-md transition-colors ${value.align === 'center' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            title="置中"
          >
            <AlignCenter size={16} />
          </button>
          <button
            onClick={() => handleAlignChange('right')}
            className={`p-1.5 rounded-md transition-colors ${value.align === 'right' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            title="靠右"
          >
            <AlignRight size={16} />
          </button>
        </div>
      </div>
      
      {multiline ? (
        <textarea
          value={value.text}
          onChange={handleTextChange}
          placeholder={placeholder}
          rows={rows}
          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y text-slate-700"
        />
      ) : (
        <input
          type="text"
          value={value.text}
          onChange={handleTextChange}
          placeholder={placeholder}
          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-700"
        />
      )}
    </div>
  );
};

export default InputSection;