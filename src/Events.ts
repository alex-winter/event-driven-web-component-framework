import { EventFn } from 'types/EventFn'

export class Events {
    constructor() {
        throw new Error('This service is static only, can not be constructed')
    }

    private static listenersMap: Map<string, Set<EventListener>> = new Map()

    public static emit<T>(
        key: string,
        detail: T | undefined = undefined,
    ): void {
        document.dispatchEvent(
            new CustomEvent<T>(
                key,
                {
                    detail,
                    bubbles: false,
                    composed: true,
                }
            )
        )
    }

    public static listen<T>(
        key: string,
        callback: EventFn<T>,
    ): void {
        const eventListener = callback as EventListener

        this.addListener(key, eventListener)

        if (!this.listenersMap.has(key)) {
            this.listenersMap.set(
                key,
                new Set(),
            )
        }

        this.listenersMap.get(key)!.add(eventListener)
    }

    private static addListener<T>(
        key: string,
        callback: EventFn<T>,
    ): void {
        document.addEventListener(
            key,
            callback as EventListener,
        )
    }

    public static unlisten<T>(
        key: string,
        callback: EventFn<T>,
    ): void {
        const eventListener = callback as EventListener

        document.removeEventListener(key, eventListener)

        this.listenersMap.get(key)?.delete(eventListener)
    }
}