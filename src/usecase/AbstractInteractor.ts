export abstract class AbstractInteractor <Input, Output> {
    abstract invoke(input: Input): Promise<Output>;
}