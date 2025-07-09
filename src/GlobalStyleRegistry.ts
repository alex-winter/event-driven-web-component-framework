const globalSheets: Map<string, Promise<CSSStyleSheet>> = new Map()

export async function getGlobalStyleSheet(file: string): Promise<CSSStyleSheet> {
    if (!globalSheets.has(file)) {
        const sheetPromise = fetch(file)
            .then(res => res.text())
            .then(css => {
                const sheet = new CSSStyleSheet()
                sheet.replaceSync(css)
                return sheet
            })
        globalSheets.set(file, sheetPromise)
    }

    return globalSheets.get(file)!
}