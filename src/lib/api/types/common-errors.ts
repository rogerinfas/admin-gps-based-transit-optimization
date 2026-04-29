export type FetchErrorResponse = {
  statusCode: number;
  message: string;
  error?: unknown;
  id?: string;
  category?: string;
  severity?: string;
  timestamp?: string;
  path?: string;
  method?: string;
};
