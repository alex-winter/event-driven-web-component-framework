import { EventFn } from 'types/EventFn'

export type ExternalListeners = {
    [key: string]: EventFn
}