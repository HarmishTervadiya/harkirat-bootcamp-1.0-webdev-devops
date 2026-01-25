export class ApiError {
  error: string | null;
  statusCode: number;
  timestamp: string;

  constructor(error: string | null, statusCode: number) {
    this.error = error;
    this.statusCode = statusCode;
    this.timestamp = new Date().getTime().toString();
  }
}
