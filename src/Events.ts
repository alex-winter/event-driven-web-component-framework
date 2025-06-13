import { ExternalEventFn } from './types/ExternalEventFn'

export class Events {
    private static listenersMap: Map<string, Set<Function>> = new Map()
    private static activeEvents: Set<string> = new Set()

    static emit<T>(key: string, payload: T): void {
        if (this.activeEvents.has(key)) return

        const listeners = this.listenersMap.get(key)
        console.log(listeners)
        if (listeners) {
            this.activeEvents.add(key)
            try {
                for (const listener of listeners) {
                    console.log(`[Events.emit] Executing listener for  "${key}"`, listener.toString().slice(0, 100))
                    try {
                        (listener as ExternalEventFn<T>)(payload)
                    } catch (err) {
                        console.error(`[Events.emit] Error in listener for "${key}":`, err)
                    }
                }
            } finally {
                this.activeEvents.delete(key)
            }
        }
    }

    static listen<T>(key: string, callback: ExternalEventFn<T>): void {
        if (!this.listenersMap.has(key)) {
            this.listenersMap.set(key, new Set())
        }

        this.listenersMap.get(key)!.add(callback)
    }

    static unlisten<T>(key: string, callback: ExternalEventFn<T>): void {
        this.listenersMap.get(key)?.delete(callback)
    }
}