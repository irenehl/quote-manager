export const formatLimaDate = (date: string) =>
  new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
    timeZone: "America/El_Salvador",
  }).format(new Date(date));
export const formatLimaTime = (date: string) =>
  new Intl.DateTimeFormat("es-SV", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/El_Salvador",
  }).format(new Date(date));
