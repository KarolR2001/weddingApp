import { jsPDF } from "jspdf";
import { Table, Guest } from "../redux/slices/tablePlanSlice"; // Import typów, jeśli istnieją

export const generateTablePlanPDF = (tables: Table[], logoUrl: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10; // Margines ogólny

  tables.forEach((table, index) => {
    // Dodanie logo w prawym górnym rogu
    const logoHeight = 15;
    const logoWidth =
      (logoHeight * doc.getImageProperties(logoUrl).width) /
      doc.getImageProperties(logoUrl).height;

    doc.addImage(
      logoUrl,
      "PNG",
      pageWidth - margin - logoWidth,
      margin,
      logoWidth,
      logoHeight
    );

    // Tytuł stołu - wyśrodkowany pod logiem
    doc.setFont("Montserrat", "normal");
    doc.setFontSize(24);
    doc.setTextColor("#C3937C");
    const tableTitle = table.tableName.toUpperCase();
    const titleY = margin + logoHeight + 5; // Wysokość poniżej loga
    doc.text(tableTitle, pageWidth / 2, titleY, { align: "center" });

    // Linia pozioma pod tytułem
    const lineY = titleY + 5; // Pozycja linii poniżej tytułu
    doc.setDrawColor(195, 147, 124); // Kolor linii (pasujący do stylu)
    doc.setLineWidth(0.1); // Grubość linii
    doc.line(margin, lineY, pageWidth - margin, lineY);

    // Lista gości - bliżej tytułu
    doc.setFont("Montserrat", "normal");
    doc.setFontSize(12);
    doc.setTextColor("#787878");
    const listStartY = lineY + 30; // Punkt początkowy dla listy
    let yPosition = listStartY;

    table.guests.forEach((guest: Guest) => {
      // Sprawdzenie, czy trzeba dodać nową stronę
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin + 10; // Reset pozycji na nowej stronie
      }

      const guestText = `${guest.guestName}`;
      doc.text(guestText, pageWidth / 2, yPosition, { align: "center" }); // Wyśrodkowanie listy
      yPosition += 10; // Odstęp między kolejnymi liniami
    });

    // Dodanie nowej strony, jeśli to nie ostatni stół
    if (index < tables.length - 1) {
      doc.addPage();
    }
  });

  // Pobranie pliku PDF
  doc.save("plan_stolow.pdf");
};