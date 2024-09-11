export type NonEmptyList<T> = [T, ...T[]];

export const asNonEmptyListOrNull = <T> (list: T[], emptyValue: undefined | null = null ): NonEmptyList<T> | null => {
    if (list.length == 0) {
        return emptyValue;
    } else {
        return list as NonEmptyList<T>;
    }
}

export const fromListUnsafe = <T> (list: T[]): NonEmptyList<T> => {
    if (list.length == 0) {
        throw new Error(`配列の要素数は1以上必要です`);
    } else {
        return list as NonEmptyList<T>;
    }
}