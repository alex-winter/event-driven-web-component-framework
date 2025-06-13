type EventFn<T = any> = (payload: T) => void
type EventKey = symbol

export class Events {
    private static listenersMap: Map<EventKey, Set<EventFn<any>>> = new Map()

    static emit<T>(key: EventKey, payload: T): void {
        const listeners = this.listenersMap.get(key)
        if (listeners) {
            for (const listener of listeners) {
                try {
                    listener(payload)
                } catch { }
            }
        }
    }

    static listen<T>(key: EventKey, callback: EventFn<T>): void {
        if (!this.listenersMap.has(key)) {
            this.listenersMap.set(key, new Set())
        }
        this.listenersMap.get(key)!.add(callback as EventFn<any>)
    }

    static unlisten<T>(key: EventKey, callback: EventFn<T>): void {
        this.listenersMap.get(key)?.delete(callback as EventFn<any>)
    }
}
