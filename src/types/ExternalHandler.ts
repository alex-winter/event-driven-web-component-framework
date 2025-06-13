import { ExternalEventFn } from './ExternalEventFn'

export type ExternalHandler = {
    key: string
    handler: ExternalEventFn<any>
}