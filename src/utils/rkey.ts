import { decodeCqParameter, encodeCqParameter } from './cqImage'

export interface RKeyPayload {
  private_rkey?: string
  group_rkey?: string
  expired_time?: number
}

const legacyImageHost = 'gchat.qpic.cn'
const newImageHost = 'multimedia.nt.qq.com.cn'

function isNewMediaAppID(appid: string) {
  return appid === '1406' || appid === '1407'
}

function selectRKey(payload: RKeyPayload, appid: string) {
  const privateKey = payload.private_rkey || ''
  const groupKey = payload.group_rkey || ''
  if (appid === '1407') {
    return groupKey || privateKey
  }
  return privateKey || groupKey
}

function updateURL(rawURL: string, payload: RKeyPayload) {
  try {
    const parsed = new URL(rawURL)
    const appid = parsed.searchParams.get('appid') || ''
    parsed.searchParams.delete('rkey')

    let needsRKey = false
    const host = parsed.hostname.toLowerCase()
    if (host === newImageHost) {
      needsRKey = true
    } else if (host === legacyImageHost && isNewMediaAppID(appid)) {
      parsed.hostname = newImageHost
      parsed.protocol = 'https:'
      needsRKey = true
    }

    if (!needsRKey) return rawURL

    const rkey = selectRKey(payload, appid)
    if (!rkey) return rawURL

    parsed.searchParams.set('rkey', rkey)
    return parsed.toString()
  } catch {
    return rawURL
  }
}

function replaceMessage(message: string, payload: RKeyPayload) {
  let updated = message

  const cqURLRe = /(url=|file=)(https?:\/\/(?:multimedia\.nt\.qq\.com\.cn|gchat\.qpic\.cn)[^,\]\s]+)/g
  updated = updated.replace(cqURLRe, (_m, prefix: string, url: string) => {
    const decoded = decodeCqParameter(url)
    const next = updateURL(decoded, payload)
    return `${prefix}${next === decoded ? url : encodeCqParameter(next)}`
  })

  const bracketRe = /(\[(?:image|图):)(https?:\/\/(?:multimedia\.nt\.qq\.com\.cn|gchat\.qpic\.cn)[^\]\s]+)(\])/g
  updated = updated.replace(bracketRe, (_m, prefix: string, url: string, suffix: string) => {
    return `${prefix}${updateURL(url, payload)}${suffix}`
  })

  return updated
}

export function shouldApplyQQImageRKeyReplacement(text: string) {
  return text.includes(newImageHost) || text.includes('appid=1406') || text.includes('appid=1407')
}

export function applyQQImageRKeyReplacement(text: string, payload: RKeyPayload) {
  if (!payload || (!payload.private_rkey && !payload.group_rkey)) {
    return text
  }

  try {
    const parsed = JSON.parse(text)
    if (!parsed || !Array.isArray(parsed.items)) {
      return text
    }

    let changed = false
    for (const item of parsed.items) {
      if (!item || typeof item !== 'object') continue
      if (typeof item.message !== 'string') continue

      const nextMessage = replaceMessage(item.message, payload)
      if (nextMessage !== item.message) {
        item.message = nextMessage
        changed = true
      }
    }

    return changed ? JSON.stringify(parsed) : text
  } catch {
    return text
  }
}
