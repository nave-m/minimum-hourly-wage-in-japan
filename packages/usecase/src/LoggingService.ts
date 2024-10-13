export interface LoggingService {
    info(message: unknown): void;
    error(message: unknown): void;
}