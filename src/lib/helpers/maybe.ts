export const maybeApply = <T, U>(
  func: (t: T) => U,
  val: T | undefined
): U | undefined => (val ? func(val) : undefined);