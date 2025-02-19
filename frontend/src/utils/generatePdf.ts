import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Guest } from "../redux/slices/guestListSlice";
import { PDF_FILE_NAME, DOCUMENT_TITLE } from "./constants";
import { getFormattedDate } from "./constants";
import "../assets/fonts/Cormorant-Bold";
import "../assets/fonts/Cormorant-Regular";
import "../assets/fonts/Montserrat-Bold";
import "../assets/fonts/Montserrat-Regular";

export const generatePDF = (
  guests: Guest[],
  groups: { groupId: number; groupName: string }[],
  logoUrl: string
): void => {
  const doc = new jsPDF();

  const logoHeight = 15;
  const margin = 10;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const logoY = margin;

  // Logo po prawej stronie
  doc.addImage(
    logoUrl,
    "PNG",
    pageWidth - margin - (logoHeight * doc.getImageProperties(logoUrl).width) / doc.getImageProperties(logoUrl).height,
    logoY,
    0,
    logoHeight
  );

  // Obliczenie szerokości loga po dodaniu
  const logoWidth = (logoHeight * doc.getImageProperties(logoUrl).width) / doc.getImageProperties(logoUrl).height;

  // Tytuł dokumentu - wyśrodkowany względem strony z czcionką Cormorant
  doc.setFont("Cormorant", "bold");
  doc.setFontSize(24);
  doc.setTextColor("#C3937C"); // Ustawienie koloru tekstu

  const textWidth = (doc.getStringUnitWidth(DOCUMENT_TITLE) * doc.getFontSize()) / doc.internal.scaleFactor;

  // Pozycjonowanie tekstu na środku strony, uwzględniając margines dla loga
  const textX = (pageWidth - textWidth) / 2;
  const textY = logoY + logoHeight / 2 + doc.getFontSize() / 3 - 2;

  doc.text(DOCUMENT_TITLE, textX, textY);

  // Subtelny pasek pod tytułem
  doc.setDrawColor(195, 147, 124);
  doc.setLineWidth(0.1);
  doc.line(margin, textY + 5, pageWidth - margin, textY + 5);

  // Ustawienie globalnej wysokości linii
  doc.setLineHeightFactor(1.5);

  // Przetłumaczenie statusów i zamiana ID grupy na nazwę grupy
  const translatedGuests = guests.map((guest) => {
    const statusTranslation = {
      invited: "Zaproszony",
      confirmed: "Potwierdzony",
      declined: "Odmówił",
    };

    const groupName =
      groups.find((group) => group.groupId === guest.groupId)?.groupName || "-";

    return {
      ...guest,
      guestStatus: statusTranslation[guest.guestStatus],
      groupName,
    };
  });

  // Tabela gości
  autoTable(doc, {
    startY: textY + 10,
    head: [["Imię i nazwisko", "Status", "Grupa", "Notatki"]],
    body: translatedGuests.map((guest) => [
      guest.guestName,
      guest.guestStatus,
      guest.groupName,
      guest.notes || "-",
    ]),
    margin: { top: 10 },
    theme: "grid",
    styles: {
      font: "Montserrat",
      fontSize: 10,
      valign: "middle", // Wyśrodkowanie w pionie
      halign: "left", // Wyśrodkowanie w poziomie
    },
    headStyles: {
      fillColor: "#EAD9C9",
      textColor: "#787878",
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: "#fbf8f1" },
  });
  doc.setTextColor("#787878");
  // Numeracja stron w prawym dolnym rogu
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("Montserrat", "normal");
    doc.setFontSize(8);
    doc.text(
      `${i}`,
      pageWidth - margin,
      pageHeight - margin,
      { align: "right" }
    );
  }

// Stopka
doc.setFont("Montserrat", "normal");
doc.setFontSize(5);
doc.setTextColor("#787878");

// Tekst stopki
const footerText = "Wygenerowano automatycznie przez aplikację Weselny Zakątek.";
const footerDate = `Data wygenerowania: ${getFormattedDate()}`;

// Pozycja dla stopki
const footerY = pageHeight - 7; // Więcej miejsca na dwie linie tekstu

// Wstawienie tekstu stopki w dwóch liniach
doc.text(footerText, margin, footerY);
doc.text(footerDate, margin, footerY + 3); 

  // Zapisanie pliku
  doc.save(PDF_FILE_NAME);
};
