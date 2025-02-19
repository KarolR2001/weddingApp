import { jsPDF } from "jspdf";

export const generateReportPDF = (report: any, logoUrl: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;

  // Dodanie logo po prawej stronie
  const logoHeight = 15;
  const logoWidth =
    (logoHeight * doc.getImageProperties(logoUrl).width) /
    doc.getImageProperties(logoUrl).height;

  const logoX = pageWidth - 5 - logoWidth; // Pozycja X dla logo

  doc.addImage(
    logoUrl,
    "PNG",
    logoX,
    margin,
    logoWidth,
    logoHeight
  );

  // Nagłówek raportu z logo, tytuł wyśrodkowany
  doc.setFont("Montserrat", "normal");
  doc.setFontSize(16);
  doc.setTextColor("#C3937C");
  const title = `Raport: ${report.reportName}`;
  const textWidth = doc.getTextWidth(title);
  const titleX = (pageWidth - textWidth) / 2; // Wyśrodkowanie tytułu
  doc.text(title, titleX, margin + 10);

  // Informacje ogólne
  doc.setFontSize(12);
  doc.setFont("Montserrat", "normal");
  doc.setTextColor("#787878");
  doc.text(`Typ: ${report.reportType}`, margin, margin + 30);
  doc.text(
    `Data utworzenia: ${new Date(report.created_at).toLocaleDateString()}`,
    margin,
    margin + 40
  );

  // Linie separujące
  doc.setDrawColor(195, 147, 124);
  doc.line(margin, margin + 45, pageWidth - margin, margin + 45);

  // Sekcja danych ogólnych
  let yPosition = margin + 60;
  doc.setFontSize(14);
  doc.setTextColor("#3e3e3e");
  doc.text("Dane ogólne:", margin, yPosition);

  doc.setFontSize(12);
  doc.text(
    `Całkowita liczba użytkowników: ${report.reportData.totalUsers}`,
    margin,
    (yPosition += 10)
  );
  doc.text(`Nowi użytkownicy: ${report.reportData.newUsers}`, margin, (yPosition += 10));
  doc.text(`Nowe ogłoszenia: ${report.reportData.newListings}`, margin, (yPosition += 10));
  doc.text(`Wiadomości wysłane: ${report.reportData.totalMessages}`, margin, (yPosition += 10));
  doc.text(
    `Powiadomienia wysłane: ${report.reportData.totalNotifications}`,
    margin,
    (yPosition += 10)
  );

  // Linie separujące
  doc.line(margin, yPosition + 5, pageWidth - margin, yPosition + 5);

  // Sekcja danych systemowych
  yPosition += 20;
  doc.setFontSize(14);
  doc.text("Statystyki systemowe:", margin, yPosition);

  doc.setFontSize(12);
  const systemStats = report.reportData.systemStats;
  doc.text(`Aktywni użytkownicy: ${systemStats.activeUsers}`, margin, (yPosition += 10));
  doc.text(`Pary młode: ${systemStats.couplesCount}`, margin, (yPosition += 10));
  doc.text(`Usługodawcy: ${systemStats.vendorsCount}`, margin, (yPosition += 10));
  doc.text(
    `Średnia liczba wyświetleń ogłoszeń: ${systemStats.avgListingViews}`,
    margin,
    (yPosition += 10)
  );
  doc.text(`Najpopularniejsza kategoria: ${systemStats.mostActiveCategory}`, margin, (yPosition += 10));
  doc.text(`Łączna liczba zapytań: ${systemStats.totalInquiries}`, margin, (yPosition += 10));
  doc.text(`Najbardziej aktywny dzień: ${systemStats.mostActiveDay}`, margin, (yPosition += 10));
  doc.text(`Najbardziej aktywna godzina: ${systemStats.mostActiveHour}`, margin, (yPosition += 10));

  // Linie separujące
  doc.line(margin, yPosition + 5, pageWidth - margin, yPosition + 5);

  // Wykres urządzeń
  yPosition += 20;
  doc.setFontSize(14);
  doc.text("Urządzenia:", margin, yPosition);

  const { mobile, desktop } = systemStats.deviceTypeDistribution;
  doc.setFontSize(12);
  doc.text(`Mobilne: ${mobile}`, margin, (yPosition += 10));
  doc.text(`Komputery: ${desktop}`, margin, (yPosition += 10));

  // Linie separujące
  doc.line(margin, yPosition + 5, pageWidth - margin, yPosition + 5);

  // Pobranie pliku PDF
  doc.save(`${report.reportName}.pdf`);
};
