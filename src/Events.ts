import { ExternalEventFn } from './types/ExternalEventFn'

export class Events {
    private static listenersMap: Map<string, Set<Function>> = new Map()

    static emit<T>(key: string, payload: T): void {
        const listeners = this.listenersMap.get(key)
        if (listeners) {
            for (const listener of listeners) {
                console.log(`[Events.emit] Executing listener for "${key}"`);
                (listener as ExternalEventFn<T>)(payload)
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
