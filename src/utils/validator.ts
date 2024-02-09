const isNullOrUndefined = (data: unknown) => {
  return data === null || data === undefined
}

const isInvalidString = (data: unknown) => {
  return isNullOrUndefined(data) || typeof data !== 'string'
}

const isValidString = (data: unknown) => {
  return !isInvalidString(data) && (data as string).trim().length > 0
}

const isValidEmail = (data: string) => {
  return isValidString(data) && /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(data)
}

const validator = {
  isNullOrUndefined,
  isValidEmail,
  isValidString
}

export default validator
