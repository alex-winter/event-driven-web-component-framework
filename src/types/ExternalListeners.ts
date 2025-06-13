import { ExternalEventFn } from './ExternalEventFn'

export type ExternalListeners = Record<string, ExternalEventFn<any>>