import React, { useState, useEffect, useRef } from 'react';
import { Download, FileText, Smartphone, PenTool } from 'lucide-react';
import { DocumentState, SignatureState } from './types';
import InputSection from './components/InputSection';
import SignatureUploader from './components/SignatureUploader';
import DocumentPreview from './components/DocumentPreview';
import { generatePDF } from './utils/pdfUtils';

const DEFAULT_DOC_STATE: DocumentState = {
  companyHeader: { text: '範例有限公司\nExample Company Ltd.', align: 'center' },
  subject: { text: '主旨：關於文件自動化生成的測試', align: 'center' },
  salutation: { text: '敬啟者：', align: 'left' },
  content: { text: '這是一份測試文件。\n\n您可以在左側（或上方）的編輯區域修改所有文字內容。支援自動排版與簽名拖曳功能。\n\n請嘗試上傳您的簽名檔，並將其拖曳至此處下方。', align: 'left' },
  closing: { text: '謹啟', align: 'right' },
  signOff: { text: '行政部經理\n陳大文', align: 'right' },
  date: { text: new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }), align: 'right' }
};

const DEFAULT_SIG_STATE: SignatureState = {
  image: null,
  x: 400, // Central X
  y: 700, // Lower half Y
  width: 150,
  rotation: 0
};

const App: React.FC = () => {
  const [docState, setDocState] = useState<DocumentState>(DEFAULT_DOC_STATE);
  const [signature, setSignature] = useState<SignatureState>(DEFAULT_SIG_STATE);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [previewScale, setPreviewScale] = useState(0.45); // Scale for mobile view
  const [footerMode, setFooterMode] = useState<'normal' | 'bottom'>('normal');

  // Calculate appropriate scale based on window width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setPreviewScale(width / 850); // Mobile
      } else if (width < 1024) {
        setPreviewScale(0.6); // Tablet
      } else {
        setPreviewScale(0.7); // Desktop
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSignatureChange = (newSig: SignatureState) => {
    setSignature(newSig);
  };

  const handleDownload = () => {
    // With the new cloning strategy in pdfUtils, we don't need to force switch tabs.
    // The background process creates a full A4 clone regardless of visibility.
    generatePDF('pdf-content', `${docState.subject.text || '文件'}.pdf`);
  };

  return (
    <div className="min-h-screen flex flex-col max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-700">
                <FileText className="w-6 h-6" />
                <h1 className="font-bold text-lg md:text-xl">PDF 編輯器</h1>
            </div>
            
            <button 
                onClick={handleDownload}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
                <Download size={18} />
                <span>輸出 PDF</span>
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 lg:gap-8 overflow-hidden">
        
        {/* Mobile Tabs */}
        <div className="lg:hidden flex bg-slate-200 p-1 rounded-lg mb-4">
            <button
                onClick={() => setActiveTab('edit')}
                className={`flex-1 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'edit' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                }`}
            >
                <PenTool size={16} /> 編輯內容
            </button>
            <button
                onClick={() => setActiveTab('preview')}
                className={`flex-1 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'preview' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
                }`}
            >
                <Smartphone size={16} /> 預覽與簽名
            </button>
        </div>

        {/* Editor Column - Hidden on mobile if preview tab active */}
        <div className={`lg:w-1/3 lg:min-w-[400px] flex-col gap-4 overflow-y-auto pb-20 ${activeTab === 'preview' ? 'hidden lg:flex' : 'flex'}`}>
            <h2 className="text-xl font-bold text-slate-800 mb-2 hidden lg:block">內容編輯</h2>
            
            <InputSection 
                label="公司 / 機構名稱 (頁首)" 
                value={docState.companyHeader} 
                onChange={v => setDocState({...docState, companyHeader: v})} 
                placeholder="輸入公司名稱..."
                multiline={true}
                rows={3}
            />
            
            <InputSection 
                label="主旨 / 專稱" 
                value={docState.subject} 
                onChange={v => setDocState({...docState, subject: v})} 
                placeholder="例如：關於..."
            />

            <InputSection 
                label="稱謂 / 開頭" 
                value={docState.salutation} 
                onChange={v => setDocState({...docState, salutation: v})} 
                placeholder="例如：敬啟者..."
            />

            <InputSection 
                label="內文" 
                value={docState.content} 
                onChange={v => setDocState({...docState, content: v})} 
                multiline
                rows={8}
                placeholder="輸入主要內容..."
            />

            {/* Layout Control */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-4 transition-all hover:shadow-md">
                <label className="text-sm font-bold text-slate-700 mb-2 block">下款位置</label>
                <div className="flex bg-slate-100 rounded-lg p-1">
                    <button 
                        onClick={() => setFooterMode('normal')}
                        className={`flex-1 py-2 text-sm rounded-md transition-all ${footerMode === 'normal' ? 'bg-white shadow text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        緊貼內文
                    </button>
                    <button 
                        onClick={() => setFooterMode('bottom')}
                        className={`flex-1 py-2 text-sm rounded-md transition-all ${footerMode === 'bottom' ? 'bg-white shadow text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        置於頁底
                    </button>
                </div>
            </div>

            <InputSection 
                label="結尾敬語" 
                value={docState.closing} 
                onChange={v => setDocState({...docState, closing: v})} 
                placeholder="例如：謹啟..."
            />

            <InputSection 
                label="署名 / 職銜" 
                value={docState.signOff} 
                onChange={v => setDocState({...docState, signOff: v})} 
                multiline={true}
                rows={3}
                placeholder="例如：陳大文 經理..."
            />

            <InputSection 
                label="日期" 
                value={docState.date} 
                onChange={v => setDocState({...docState, date: v})} 
                placeholder="例如：2023年10月1日"
            />

            <div className="border-t border-slate-200 my-2 pt-4">
                 <SignatureUploader signature={signature} onChange={setSignature} />
            </div>
        </div>

        {/* Preview Column - Hidden on mobile if edit tab active */}
        <div className={`lg:flex-1 bg-slate-100 rounded-2xl flex flex-col items-center justify-start pt-4 lg:pt-8 overflow-y-auto border-2 border-dashed border-slate-200 ${activeTab === 'edit' ? 'hidden lg:flex' : 'flex'}`}>
            <div className="mb-4 flex items-center gap-2 text-slate-500 text-sm">
                <Smartphone size={16} />
                <span>預覽模式 • 請拖曳簽名至正確位置</span>
            </div>
            
            {/* The A4 Container */}
            <DocumentPreview 
                docState={docState}
                signature={signature}
                onSignatureChange={handleSignatureChange}
                scale={previewScale}
                footerMode={footerMode}
            />
            
            <div className="h-12 w-full shrink-0"></div> {/* Bottom spacer */}
        </div>

      </main>
    </div>
  );
};

export default App;