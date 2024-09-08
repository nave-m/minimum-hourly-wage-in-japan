export abstract class UseCaseError extends Error {
}

export type Violation = {
    property: string;
    message: string;
}

export class InvalidArgumentError extends UseCaseError {
    readonly violations: Violation[];
    constructor(props: {
        violations: Violation[];
    }) {
        super();
        this.violations = props.violations;
    }
}

export class UnexpectedError extends UseCaseError {
    readonly original: Error;
    constructor(props: {
        original: Error;
    }) {
        super();
        this.original = props.original;
    }
}