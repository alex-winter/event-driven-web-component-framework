import { isJSON } from './is-json'

export function decode(input: string) {

    if (isJSON(input)) {
        try {
            const decoded = decodeURIComponent(input)

            return JSON.parse(decoded)
        } catch {
            return JSON.parse(input)
        }
    }

    return input
}