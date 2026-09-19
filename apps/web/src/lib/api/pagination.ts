export interface CursorPageInfo {
  next_cursor: string | null;
  previous_cursor: string | null;
  has_next_page: boolean;
  has_previous_page: boolean;
  page_size: number;
}

export interface CursorPage<T> {
  items: T[];
  page_info: CursorPageInfo;
}
