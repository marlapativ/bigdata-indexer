import bcrypt from 'bcryptjs'

const salt = bcrypt.genSaltSync(10)

const hashPassword = async (password: string) => {
  return bcrypt.hash(password, salt)
}

const comparePassword = async (password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword)
}

const crypto: ICrypto = {
  hashPassword,
  comparePassword
}

export interface ICrypto {
  hashPassword: (password: string) => Promise<string>
  comparePassword: (password: string, hashedPassword: string) => Promise<boolean>
}

export default crypto
