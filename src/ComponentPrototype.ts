import { Events } from './Events'
import { isJSON } from './is-json'
import { patchDOM } from './patch-dom'
import { ExternalHandler } from './types/ExternalHandler'
import { ExternalListeners } from './types/ExternalListeners'
import { Listener } from './types/Listener'
import { Listeners } from './types/Listeners'
import { ParsedDataset } from './types/ParsedDataset'

export class ComponentPrototype {
    private readonly anchor: HTMLElement
    private readonly shadow: ShadowRoot

    public parsedDataset: ParsedDataset = {}
    public listeners: Listeners = {}
    public externalListeners: ExternalListeners = {}

    private externalHandlers: ExternalHandler[] = []
    private attachedListeners: Listener[] = []

    public globalStylesheets?: string[]

    constructor(anchor: HTMLElement) {
        this.anchor = anchor
        const shadowRoot = anchor.shadowRoot
        if (!shadowRoot) {
            throw new Error('ComponentPrototype requires a shadowRoot')
        }
        this.shadow = shadowRoot
    }

    public setup: () => Promise<void> = async () => { }
    public build: () => HTMLElement = () => {
        throw new Error('You must override the build() method')
    }
    public css: () => string = () => ''
    public afterBuild: () => void = () => { }
    public afterPatch: () => void = () => { }

    public async connectedCallback(): Promise<void> {
        for (const key of Object.keys(this.anchor.dataset)) {
            const value = this.anchor.dataset[key] as string
            this.parsedDataset[key] = isJSON(value)
                ? JSON.parse(value as string)
                : value
        }

        if (this.globalStylesheets) {
            for (const href of this.globalStylesheets) {
                if (!this.shadow.querySelector(`link[href="${href}"]`)) {
                    const link = document.createElement('link')
                    link.rel = 'stylesheet'
                    link.href = href
                    this.shadow.appendChild(link)
                }
            }
        }

        await this.setup()

        const cssText = this.css().trim()
        if (cssText.length > 0) {
            const sheet = new CSSStyleSheet()
            sheet.replaceSync(cssText)
            this.shadow.adoptedStyleSheets = [sheet]
        }

        this.shadow.appendChild(this.build())

        this.setListeners()
        this.setExternalListeners()
        this.afterBuild()
    }

    public disconnectedCallback(): void {
        this.anchor.remove()
    }

    public patch(): void {
        const nonLinkChildren = Array.from(this.shadow.children)
            .filter(child => child.tagName !== 'LINK')

        if (nonLinkChildren.length !== 1) {
            throw new Error('Shadow root must contain exactly one non-link root element')
        }

        patchDOM(nonLinkChildren[0], this.build())

        this.setListeners()
        this.setExternalListeners()
        this.afterPatch()
    }

    private setListeners(): void {
        for (const listener of this.attachedListeners) {
            listener.element.removeEventListener(listener.type, listener.handler)
        }

        this.attachedListeners = []

        for (const key of Object.keys(this.listeners)) {
            const [selector, eventType] = key.split(':')
            const handler = this.listeners[key]

            const elements = this.findAll(selector)
            for (const el of elements) {
                const boundHandler = handler.bind(this.anchor)
                el.addEventListener(eventType, boundHandler)

                this.attachedListeners.push({
                    element: el,
                    type: eventType,
                    handler: boundHandler,
                })
            }
        }
    }

    private setExternalListeners(): void {
        for (const handler of this.externalHandlers) {
            Events.unlisten(handler.key, handler.handler)
        }

        this.externalHandlers = []

        for (const key of Object.keys(this.externalListeners)) {
            const boundHandler = this.externalListeners[key].bind(this.anchor)

            Events.listen(key, boundHandler)

            this.externalHandlers.push({
                key,
                handler: boundHandler,
            })
        }
    }

    public findOne<T extends HTMLElement = HTMLElement>(query: string): T | null {
        return this.shadow.querySelector<T>(query)
    }

    public findAll<T extends HTMLElement = HTMLElement>(query: string): T[] {
        return Array.from(this.shadow.querySelectorAll<T>(query))
    }
}
