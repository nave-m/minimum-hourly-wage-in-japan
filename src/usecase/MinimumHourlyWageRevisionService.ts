import { MinimumHourlyWageRevision } from "../core/MinimumHourlyWageRevision"
import { NonEmptyList } from "../core/NonEmptyList";
import { PrefectureCode } from "../core/PrefectureCode";
import { Term } from "../core/Term";

export type ListProps = {
    effectiveDate: Term;
    prefectureCodes: NonEmptyList<PrefectureCode> | null;
}

export interface MinimumHourlyWageRevisionService {
    list(props: ListProps): Promise<MinimumHourlyWageRevision[]>;
}