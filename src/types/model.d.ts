export type Model = {
  fallbackSchema?: object
  schema: () => Promise<string | null>
  key: string
}
