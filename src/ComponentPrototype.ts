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

    // Debug mode flag
    private _debug: boolean = false

    public get debug(): boolean {
        return this._debug
    }

    public set debug(value: boolean) {
        this._debug = value
    }

    private log(...args: any[]): void {
        if (this._debug) {
            console.log('[ComponentPrototype]', ...args)
        }
    }

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
        this.log('connectedCallback called')

        for (const key of Object.keys(this.anchor.dataset)) {
            const value = this.anchor.dataset[key] as string
            this.parsedDataset[key] = isJSON(value)
                ? JSON.parse(value as string)
                : value
            this.log(`Parsed dataset key="${key}":`, this.parsedDataset[key])
        }

        if (this.globalStylesheets) {
            for (const href of this.globalStylesheets) {
                if (!this.shadow.querySelector(`link[href="${href}"]`)) {
                    const link = document.createElement('link')
                    link.rel = 'stylesheet'
                    link.href = href
                    this.shadow.appendChild(link)
                    this.log(`Appended global stylesheet: ${href}`)
                }
            }
        }

        this.log('Setup starting...')
        await this.setup()
        this.log('Setup complete')

        const cssText = this.css().trim()
        if (cssText.length > 0) {
            const sheet = new CSSStyleSheet()
            sheet.replaceSync(cssText)
            this.shadow.adoptedStyleSheets = [sheet]
            this.log('Adopted stylesheets set')
        }

        this.shadow.appendChild(this.build())
        this.log('Component built and appended')

        this.setListeners()
        this.setExternalListeners()
        this.afterBuild()

        this.log('connectedCallback complete')
    }

    public disconnectedCallback(): void {
        this.log('disconnectedCallback called')
        this.anchor.remove()
        this.log('Anchor element removed from DOM')
    }

    public patch(): void {
        this.log('patch() called')

        const nonLinkChildren = Array.from(this.shadow.children)
            .filter(child => child.tagName !== 'LINK')

        if (nonLinkChildren.length !== 1) {
            const errMsg = 'Shadow root must contain exactly one non-link root element'
            this.log(errMsg)
            throw new Error(errMsg)
        }

        patchDOM(nonLinkChildren[0], this.build())
        this.log('DOM patched')

        this.setListeners()
        this.setExternalListeners()
        this.afterPatch()

        this.log('patch() completed')
    }

    private setListeners(): void {
        this.log('Setting listeners...')

        for (const listener of this.attachedListeners) {
            listener.element.removeEventListener(listener.type, listener.handler)
            this.log(`Removed listener for event "${listener.type}" from element`, listener.element)
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
                this.log(`Attached listener for event "${eventType}" on selector "${selector}"`, el)
            }
        }

        this.log('Listeners set')
    }

    private setExternalListeners(): void {
        this.log('Setting external listeners')

        for (const handler of this.externalHandlers) {
            Events.unlisten(handler.key, handler.handler)
            this.log(`Removed external listener for event "${handler.key}"`)
        }

        this.externalHandlers = []

        for (const key of Object.keys(this.externalListeners)) {
            const boundHandler = this.externalListeners[key].bind(this.anchor)

            Events.listen(key, boundHandler)
            this.externalHandlers.push({
                key,
                handler: boundHandler,
            })
            this.log(`Attached external listener for event "${key}"`)
        }

        this.log('External listeners set')
    }

    public findOne<T extends HTMLElement = HTMLElement>(query: string): T | null {
        return this.shadow.querySelector<T>(query)
    }

    public findAll<T extends HTMLElement = HTMLElement>(query: string): T[] {
        return Array.from(this.shadow.querySelectorAll<T>(query))
    }
}
