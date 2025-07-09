const globalSheets: Map<string, Promise<CSSStyleSheet>> = new Map()

export async function getGlobalStyleSheet(file: string): Promise<CSSStyleSheet> {
    if (!globalSheets.has(file)) {
        const sheetPromise = fetch(file)
            .then(async res => {
                const baseUrl = new URL(file, window.location.origin).toString()
                const cssText = await res.text()

                // Replace relative url(...) paths with absolute URLs
                const fixedCss = cssText.replace(/url\(([^)]+)\)/g, (match, urlPath) => {
                    // Remove quotes if present
                    const unquoted = urlPath.trim().replace(/^['"]|['"]$/g, '')

                    // Skip data: and absolute URLs
                    if (/^(data:|https?:|\/)/.test(unquoted)) return `url(${unquoted})`

                    const absUrl = new URL(unquoted, baseUrl).toString()
                    return `url(${absUrl})`
                })

                const sheet = new CSSStyleSheet()
                sheet.replaceSync(fixedCss)
                return sheet
            })

        globalSheets.set(file, sheetPromise)
    }

    return globalSheets.get(file)!
}
