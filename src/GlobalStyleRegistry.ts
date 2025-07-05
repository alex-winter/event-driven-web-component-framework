const globalSheets = new Map<string, CSSStyleSheet>()

export function getGlobalStyleSheet(css: string): CSSStyleSheet {
    if (!globalSheets.has(css)) {
        const sheet = new CSSStyleSheet()
        sheet.replaceSync(css)
        globalSheets.set(css, sheet)
    }

    return globalSheets.get(css)!
}