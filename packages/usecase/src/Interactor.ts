export interface Interactor <Input, Output> {
    invoke(input: Input): Promise<Output>;
}