import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePDF = async (elementId: string, fileName: string = 'document.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  try {
    // 1. Capture the element
    // We increase scale for better quality
    const canvas = await html2canvas(element, {
      scale: 2, 
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // 2. Initialize PDF (A4 size: 210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // 3. Add image to PDF
    // We want the image to fill the PDF width, and scale height accordingly
    // Ideally, the captured element usually has A4 aspect ratio, but we force fit width.
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
    
    // 4. Save
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('PDF生成失敗，請稍後再試');
  }
};