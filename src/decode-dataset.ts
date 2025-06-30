import { isJSON } from './is-json'

function parseJson(input: string) {
    if (isJSON(input)) {
        return JSON.parse(input)
    }

    return input
}

export function decode(input: string) {

    try {
        const decoded = decodeURIComponent(input)

        return parseJson(decoded)
    } catch {
        return parseJson(input)
    }
}