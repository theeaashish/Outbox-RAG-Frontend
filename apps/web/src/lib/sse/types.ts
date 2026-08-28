export interface ServerSentEvent<T = string> {
  id?: string;
  event?: string;
  data: T;
  retry?: number;
}
