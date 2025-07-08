const globalSheets = new Map<string, CSSStyleSheet>()

export async function getGlobalStyleSheet(file: string): Promise<CSSStyleSheet> {
    const response = await fetch(file)
    const css = await response.text()
    if (!globalSheets.has(file)) {
        const sheet = new CSSStyleSheet()
        sheet.replaceSync(css)
        globalSheets.set(file, sheet)
    }

    return globalSheets.get(file)!
}