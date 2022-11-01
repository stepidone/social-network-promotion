
type TOutput<T> = {
  status: boolean
  result?: T
}

export const output = <T>(result?: T): TOutput<T> => {
  return result ? {
    status: true,
    result,
  } : { status: true }
}