
export async function wait (ms: number): Promise<void> {
  return await new Promise(resolve => setTimeout(resolve, ms))
}

export function shuffleArray<T extends any> (array: T[]): T[] {
  const newArr = []
  const source = array.slice()
  while (source.length > 0) {
    const randomIndex = Math.floor(Math.random() * source.length)
    const element = source.splice(randomIndex, 1)
    newArr.push(element[0])
  }
  return newArr
}
