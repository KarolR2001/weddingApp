export const PDF_FILE_NAME = "lista_gosci.pdf";
export const DOCUMENT_TITLE = "LISTA GOŚCI";

// Funkcja do formatowania daty
export const getFormattedDate = (): string => {
  const now = new Date();
  return now.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
