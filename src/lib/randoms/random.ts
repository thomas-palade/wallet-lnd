export const UUID_REGEXP =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export const isValidDateString = (dateString: string): boolean =>
  !isNaN(Date.parse(dateString));
export const randomDate = (beforeTimestamp: number = Date.now()) =>
  new Date(Math.random() * beforeTimestamp);
export const randomIdString = () => randomInteger().toString();
export const randomInteger = (max = Number.MAX_SAFE_INTEGER) =>
  Math.floor(Math.random() * max);
export const randomUUID = () => uuidv4();