export const isValidDateString = (dateString: string): boolean =>
  !isNaN(Date.parse(dateString));
export const randomDate = (beforeTimestamp: number = Date.now()) =>
  new Date(Math.random() * beforeTimestamp);
export const randomIdString = () => randomInteger().toString();
export const randomInteger = (max = Number.MAX_SAFE_INTEGER) =>
  Math.floor(Math.random() * max);