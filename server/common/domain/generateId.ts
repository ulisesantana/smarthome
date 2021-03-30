import { v4 } from 'uuid'

export type Id = string
export const generateId = (): Id => {
  return v4()
}
