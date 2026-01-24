export class ApiError {
  error: string | null;
  statusCode: number;
  timestamp: string;

  constructor(error: string | null, statusCode: number, timestamp: string) {
    this.error = error;
    this.statusCode = statusCode;
    this.timestamp = timestamp;
  }
}
