import { ComponentPrototype } from './ComponentPrototype'
import { ParsedDataset } from './types/ParsedDataset'

export abstract class Component extends HTMLElement {
    #delegate: ComponentPrototype

    protected parsedDataset!: ParsedDataset

    constructor() {
        super()

        this.attachShadow({ mode: 'open' })

        this.#delegate = new ComponentPrototype(this)

        this.#delegate.setup = this.setup.bind(this)
        this.#delegate.build = this.build.bind(this)
        this.#delegate.css = this.css.bind(this)
        this.#delegate.afterBuild = this.afterBuild.bind(this)
        this.#delegate.afterPatch = this.afterPatch.bind(this)

        if (this.globalStylesheets) {
            this.#delegate.globalStylesheets = this.globalStylesheets
        }

        if ((this as any).listeners) {
            this.#delegate.listeners = (this as any).listeners
        }

        if ((this as any).externalListeners) {
            this.#delegate.externalListeners = (this as any).externalListeners
        }
    }

    protected connectedCallback(): void {
        if (this.isConnected) {
            void this.#delegate.connectedCallback()
        }
    }

    protected disconnectedCallback(): void {
        this.#delegate.disconnectedCallback()
    }

    protected patch(): void {
        this.#delegate.patch()
    }

    public findOne(query: string): HTMLElement | null {
        return this.#delegate.findOne(query)
    }

    public findAll(query: string): HTMLElement[] {
        return this.#delegate.findAll(query)
    }

    protected abstract build(): HTMLElement
    protected async setup(): Promise<void> { }
    protected afterBuild(): void { }
    protected afterPatch(): void { }
    protected css(): string {
        return ''
    }

    protected get globalStylesheets(): string[] | undefined {
        return undefined
    }
}
