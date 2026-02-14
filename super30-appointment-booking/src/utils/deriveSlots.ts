export type AppointmentSlot = {
  slotId: string;
  startTime: string;
  endTime: string;
};

export const deriveSlots = (
  serviceId: string,
  date: string,
  startTime: string,
  endTime: string,
  durationMinutes: number,
): AppointmentSlot[] => {
  const [startHour, startMinute] = startTime.split(":");
  const [endHour, endMinute] = endTime.split(":");

  const startMinutes = Number(startHour) * 60 + Number(startMinute);
  const endMinutes = Number(endHour) * 60 + Number(endMinute);

  const slotCount = Math.floor((endMinutes - startMinutes) / durationMinutes);

  let slots: AppointmentSlot[] = [];
  for (let i = 0; i < slotCount; i++) {
    const baseDate = new Date();
    baseDate.setHours(Number(startHour), Number(startMinute), 0, 0);

    const startDate = new Date(
      baseDate.getTime() + i * durationMinutes * 60000,
    );

    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    slots.push({
      slotId: `${serviceId}_${date}_${startDate.getHours()}:${String(startDate.getMinutes()).padStart(2, "0")}`,
      startTime: `${startDate.getHours()}:${String(startDate.getMinutes()).padStart(2, "0")}`,
      endTime: `${endDate.getHours()}:${String(endDate.getMinutes()).padStart(2, "0")}`,
    });
  }
  return slots;
};
