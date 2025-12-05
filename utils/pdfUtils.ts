import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface PDFOptions {
  returnBlob?: boolean;
}

export const generatePDF = async (
  elementId: string,
  fileName: string = "document.pdf",
  options?: PDFOptions
): Promise<Blob | void> => {
  const originalElement = document.getElementById(elementId);
  if (!originalElement) {
    console.error("Element not found");
    return;
  }

  // Create a fixed-size container to simulate desktop A4 view off-screen
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "-10000px";
  container.style.left = "-10000px";
  container.style.width = "794px";
  container.style.height = "1123px"; // Fixed A4 Height
  container.style.backgroundColor = "#ffffff";
  container.style.zIndex = "-1000";
  document.body.appendChild(container);

  try {
    // Clone the original content
    const clone = originalElement.cloneNode(true) as HTMLElement;

    // Reset transforms and formatting
    clone.style.transform = "none";
    clone.style.margin = "0";
    clone.style.width = "100%";
    clone.style.height = "1123px";
    clone.style.boxShadow = "none";

    clone.removeAttribute("id");

    container.appendChild(clone);

    // Wait for layout
    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
      windowHeight: 1123,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

    // Modification: Check if we should return the blob for sharing
    if (options?.returnBlob) {
      return pdf.output("blob");
    }

    // Default behavior: Download directly
    pdf.save(fileName);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("PDF生成失敗，請稍後再試");
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};
