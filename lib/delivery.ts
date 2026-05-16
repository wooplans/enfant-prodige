import "server-only";

export function getDeliveryDateLabel(baseDate = new Date(), leadHours = 48) {
  const deliveryDate = new Date(baseDate);
  deliveryDate.setHours(deliveryDate.getHours() + leadHours);

  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Africa/Douala",
  }).format(deliveryDate);
}

export function buildDeliverySentence(baseDate = new Date(), leadHours = 48) {
  return `En payant maintenant, on vous livre ${getDeliveryDateLabel(baseDate, leadHours)}.`;
}
