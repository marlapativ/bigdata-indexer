export const TEST_DB_NOT_EXIST_CONNECTION_STRING = 'postgres://test:test@localhost:5432/Test'
export const TEST_DB_CONNECTION_STRING = 'postgres://cloud:cloud@localhost:5432/Cloud'
export const TEST_DB_INVALID_CONNECTION_STRING = 'error'

export const TEST_DB_CONNECTION_STRING_VARIABLES: { [key: string]: string } = {
  DB_CONN_STRING: 'postgres://test:test@localhost:5432/Test'
}

export const TEST_DB_ERROR_CONNECTION_STRING_VARIABLES: { [key: string]: string } = {
  DB_CONN_STRING: 'error'
}

export const TEST_DB_VARIABLES: { [key: string]: string } = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USER: 'cloud',
  DB_PASSWORD: 'cloud',
  DB_NAME: 'Cloud'
}

export const setEnvironmentVariables = (variables: { [key: string]: string }) => {
  for (const key in variables) {
    process.env[key] = variables[key]
  }
}

export const resetEnvironmentVariables = (variables: { [key: string]: string }) => {
  for (const key in variables) {
    delete process.env[key]
  }
}
