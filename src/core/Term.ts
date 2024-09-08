import { LocalDate } from "./LocalDate";

export abstract class Term {
    abstract within(value: LocalDate): boolean;
}

export class TermSince extends Term {
    readonly since: LocalDate;
    constructor(props: {since: LocalDate;}) {
        super();
        this.since = props.since;
    }
    within(value: LocalDate): boolean {
        return value.getComparableNumber() >= this.since.getComparableNumber();
    }
}

export class TermUntil extends Term {
    readonly until: LocalDate;
    constructor(props: {until: LocalDate;}) {
        super();
        this.until = props.until;
    }
    within(value: LocalDate): boolean {
        return value.getComparableNumber() <= this.until.getComparableNumber();
    }
}

export class TermBetween extends Term {
    readonly since: LocalDate;
    readonly until: LocalDate;
    constructor(props: {since: LocalDate; until: LocalDate;}) {
        super();
        this.since = props.since;
        this.until = props.until;
    }
    within(value: LocalDate): boolean {
        return value.getComparableNumber() >= this.since.getComparableNumber() && value.getComparableNumber() <= this.until.getComparableNumber();
    }
}