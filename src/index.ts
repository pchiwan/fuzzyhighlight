interface IIndex {
  start: number,
  end: number
}

interface IResult {
  result: boolean,
  indexes: IIndex[]
}

export function isFuzzyMatch (needle: string, haystack: string) : boolean {
  const result = search(needle, haystack)
  return result.result
}

export function search (needle: string, haystack: string) : IResult {
  const hlen = haystack.length
  const nlen = needle.length

  if (nlen > hlen) {
    return {
      result: false,
      indexes: []
    }
  }

  if (nlen === hlen) {
    return {
      result: needle === haystack,
      indexes: [
        {
          start: 0,
          end: nlen
        }
      ]
    }
  }

  const indexes: IIndex[] = []
  let start = null
  let end = null

  outer: for (let i = 0, j = 0; i < nlen; i++) { // eslint-disable-line
    const nch = needle.charCodeAt(i)

    while (j < hlen) {
      if (haystack.charCodeAt(j) === nch) {
        if (start === null) {
          start = j
        }
        end = ++j
        continue outer // eslint-disable-line
      }

      if (start !== null) {
        indexes.push({ start, end })
        start = null
      }
      j++
    }

    return {
      result: false,
      indexes
    }
  }

  if (start !== null) {
    indexes.push({ start, end })
  }

  return {
    result: indexes.length > 0,
    indexes
  }
}

export function fuzzyHighlight (needle: string, haystack: string, tag?: string): string {
  const result = search(needle, haystack)
  return highlight(haystack, result.indexes, tag)
}

export function highlight (label: string, indexes: IIndex[], tag: string = 'strong'): string {
  const ilen = indexes.length

  if (!ilen) {
    return label
  }

  const parts: string[] = []
  let start = 0

  for (let i = 0; i < ilen; i++) {
    parts.push(
      label.substring(start, indexes[i].start),
      `<${tag}>`,
      label.substring(indexes[i].start, indexes[i].end),
      `</${tag}>`
    )
    start = indexes[i].end
  }
  parts.push(label.substring(start))

  return parts.join('')
}
