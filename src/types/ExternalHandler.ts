import { EventFn } from './EventFn'

export type ExternalHandler = {
    key: string
    handler: EventFn
}