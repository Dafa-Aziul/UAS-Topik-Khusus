export type ApiMeta = {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
};

export type ApiEnvelope<T, TMeta = ApiMeta | null> = {
  success: boolean;
  message: string;
  data: T;
  meta?: TMeta;
  request_id?: string | null;
  timestamp?: string | null;
};

export type ApiErrorDetails = Record<string, string[] | string | number | boolean | null>;

export type ApiErrorEnvelope = {
  success: boolean;
  message: string;
  error?: {
    code: string;
    details?: ApiErrorDetails;
  };
  request_id?: string | null;
  timestamp?: string | null;
};
