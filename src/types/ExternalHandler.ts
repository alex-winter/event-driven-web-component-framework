import { EventFn } from './EventFn'

export type ExternalHandler = {
    key: symbol
    handler: EventFn
}