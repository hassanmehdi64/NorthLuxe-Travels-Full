export const generateBookingCode = () => {
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `BK-${random}`;
};
