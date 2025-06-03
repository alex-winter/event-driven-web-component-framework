import { Events } from './Events'
import { isJSON } from './is-json'
import { patchDOM } from './patch-dom'
import { config } from '../config'
import { Listeners } from './types/Listeners'
import { ExternalListeners } from './types/ExternalListeners'
import { ExternalHandler } from './types/ExternalHandler'
import { Listener } from './types/Listener'
import { ParsedDataset } from './types/ParsedDataset'

export abstract class Component extends HTMLElement {
    protected readonly globalStylesheets: string[] | undefined = undefined

    protected readonly parsedDataset: ParsedDataset = {}
    protected readonly listeners: Listeners = {}
    protected readonly externalListeners: ExternalListeners = {}

    private readonly shadow: ShadowRoot
    private externalHandlers: ExternalHandler[] = []
    private attachedListeners: Listener[] = []

    constructor() {
        super()

        this.shadow = this.attachShadow({ mode: 'open' })
    }

    protected abstract build(): HTMLElement

    protected async setup(): Promise<void> {
        console.log('base setup')
    }

    protected afterBuild(): void { }

    protected afterPatch(): void { }

    protected css(): string {
        return ''
    }

    public destroy() {
        this.shadow.host.remove()
    }

    protected connectedCallback(): void {
        const datasetKeys = Object.keys(this.dataset)

        for (let key of datasetKeys) {
            const value = this.dataset[key]

            this.parsedDataset[key] = isJSON(value)
                ? JSON.parse(value as string)
                : value
        }

        const build = async () => {
            console.log('start build function')
            if (this.globalStylesheets) {
                for (let href of this.globalStylesheets) {
                    const link = document.createElement('link')

                    link.rel = 'stylesheet'
                    link.href = href

                    this.shadow.append(link)
                }
            }

            console.log('start setup', this.setup)

            await this.setup()

            console.log('end setup')


            const css = this.css().trim()
            if (css.length) {
                const sheet = new CSSStyleSheet()
                sheet.replaceSync(css)
                this.shadow.adoptedStyleSheets = [sheet]
            }
            console.log('start build and append')

            this.shadow.appendChild(
                this.build()
            )

            this.setListeners()
            this.setExternalListeners()
            this.afterBuild()
        }

        build()
    }

    protected patch(): void {
        const firstChild = Array.from(this.shadow.children)
            .filter(child => child.tagName !== 'LINK')

        if (firstChild.length > 1) {
            throw new Error('There should only be one root child of the shadow dom')
        }

        patchDOM(firstChild[0], this.build())

        this.setListeners()
        this.setExternalListeners()

        this.afterPatch()
    }

    protected async setListeners(): Promise<void> {
        this.attachedListeners.forEach(({ element, type, handler }) => {
            element.removeEventListener(type, handler)
        })
        this.attachedListeners = []

        console.log('removed listeners')


        const listeners = (this as any).listeners as Listeners | undefined
        console.log(listeners)

        if (listeners) {
            const listenerKeys = Object.keys(listeners)

            for (let key of listenerKeys) {
                const eventFn = listeners[key]
                const [selector, eventType] = key.split(':')
                const elements = this.findAll(selector)

                console.log(elements)


                for (let element of elements) {
                    const boundHandler = eventFn.bind(this)

                    element.addEventListener(eventType, boundHandler)

                    this.attachedListeners.push({
                        element,
                        type: eventType,
                        handler: boundHandler,
                    })
                    console.log({
                        element,
                        type: eventType,
                        handler: boundHandler,
                    })
                }
            }
        }
    }

    protected async setExternalListeners(): Promise<void> {
        for (let handler of this.externalHandlers) {
            Events.unlisten(handler.key, handler.handler)
        }

        this.externalHandlers = []

        const listeners = (this as any).externalListeners as ExternalListeners | undefined
        if (listeners) {
            const listenerKeys = Object.keys(listeners)

            for (let key of listenerKeys) {
                const eventFn = listeners[key]
                const boundHandler = eventFn.bind(this) as EventListener

                Events.listen(key, boundHandler)

                this.externalHandlers.push({
                    key,
                    handler: boundHandler,
                })
            }
        }
    }

    protected findOne<T = HTMLElement>(query: string): T | null {
        return this.shadow.querySelector(query) as T | null
    }

    protected findAll<T = HTMLElement[]>(query: string): T {
        return Array.from(
            this.shadow.querySelectorAll(query)
        ) as T
    }
}