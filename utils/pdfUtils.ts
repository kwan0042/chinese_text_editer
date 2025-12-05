import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePDF = async (elementId: string, fileName: string = 'document.pdf') => {
  const originalElement = document.getElementById(elementId);
  if (!originalElement) {
    console.error('Element not found');
    return;
  }

  // Create a fixed-size container to simulate desktop A4 view off-screen
  // This ensures the layout is calculated at the correct A4 dimensions (approx 794px width at 96 DPI)
  // regardless of the current device screen size or scale.
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-10000px';
  container.style.left = '-10000px';
  container.style.width = '794px'; 
  container.style.height = '1123px'; // Fixed A4 Height
  container.style.backgroundColor = '#ffffff';
  container.style.zIndex = '-1000';
  document.body.appendChild(container);

  try {
    // Clone the original content
    // We use deep clone to copy all text, styles, and the signature structure
    const clone = originalElement.cloneNode(true) as HTMLElement;
    
    // Reset any potential transforms or sizing constraints on the clone root
    clone.style.transform = 'none';
    clone.style.margin = '0';
    clone.style.width = '100%'; 
    // FORCE Fixed Height: This allows flex-grow to work properly for the "footer at bottom" feature.
    // If set to 'auto', the container collapses to content height, and the spacer disappears.
    clone.style.height = '1123px'; 
    clone.style.boxShadow = 'none'; // Remove shadows for the print version
    
    // Remove the ID to avoid duplicates in DOM (though technically off-screen)
    clone.removeAttribute('id');

    container.appendChild(clone);

    // Wait a brief moment to ensure the browser calculates the layout for the new nodes
    // and loads any image resources (signatures) in the clone.
    await new Promise(resolve => setTimeout(resolve, 100));

    const canvas = await html2canvas(container, {
      scale: 2, // High resolution for clear text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794, 
      windowHeight: 1123,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Fill the page exactly
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('PDF生成失敗，請稍後再試');
  } finally {
    // Cleanup the off-screen container
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};