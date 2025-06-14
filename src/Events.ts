import { ExternalEventFn } from './types/ExternalEventFn'

export class Events {
    private static listeners: { [key: string]: ExternalEventFn<any>[] } = {};

    public static emit<T>(
        key: string,
        payload: T,
    ): void {
        const callbacks: ExternalEventFn<T>[] = this.listeners[key]
        if (callbacks) {
            for (const listener of callbacks) {
                console.log(key, listener)
                listener(payload)
            }
        }
    }

    public static listen<T>(
        key: string,
        callback: ExternalEventFn<T>,
    ): void {
        if (!this.listeners[key]) {
            this.listeners[key] = []
        }
        this.listeners[key].push(callback)
    }

    public static unlisten<T>(
        key: string,
        callback: ExternalEventFn<T>,
    ): void {
        const callbacks = this.listeners[key]

        if (!callbacks) {
            return
        }

        this.listeners[key] = callbacks.filter(fn => fn !== callback)
    }
}