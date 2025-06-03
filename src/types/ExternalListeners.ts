import { EventFn } from './EventFn'

export type ExternalListeners = {
    [key: string]: EventFn
}