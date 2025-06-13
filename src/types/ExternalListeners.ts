import { EventFn } from './EventFn'

export type ExternalListeners = Record<symbol, EventFn>