type EventKey = symbol
type EventFn<T> = (payload: T) => void

export class Events {
    private static listenersMap: Map<EventKey, Set<Function>> = new Map()

    static emit<T>(key: EventKey, payload: T): void {
        const listeners = this.listenersMap.get(key)
        if (listeners) {
            for (const listener of listeners) {
                (listener as EventFn<T>)(payload)
            }
        }
    }

    static listen<T>(key: EventKey, callback: EventFn<T>): void {
        if (!this.listenersMap.has(key)) {
            this.listenersMap.set(key, new Set())
        }

        this.listenersMap.get(key)!.add(callback)
    }

    static unlisten<T>(key: EventKey, callback: EventFn<T>): void {
        this.listenersMap.get(key)?.delete(callback)
    }
}
