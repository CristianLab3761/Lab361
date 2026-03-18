import {EventEmitter} from 'events';
import type {FirestorePermissionError} from './errors';

type Events = {
  'permission-error': (error: FirestorePermissionError) => void;
};

// Strongly type the EventEmitter
declare interface TypedEventEmitter<T extends Record<string, any>> {
  on<E extends keyof T>(event: E, listener: T[E]): this;
  off<E extends keyof T>(event: E, listener: T[E]): this;
  emit<E extends keyof T>(event: E, ...args: Parameters<T[E]>): boolean;
}

class TypedEventEmitter<
  T extends Record<string, any>,
> extends EventEmitter {}

export const errorEmitter = new TypedEventEmitter<Events>();
