import { MinimumHourlyWageRevision } from "@minimum-hourly-wage-in-japan/core/src/MinimumHourlyWageRevision"
import { NonEmptyList } from "@minimum-hourly-wage-in-japan/core/src/NonEmptyList";
import { PrefectureCode } from "@minimum-hourly-wage-in-japan/core/src/PrefectureCode";
import { Term } from "@minimum-hourly-wage-in-japan/core/src/Term";

export type ListProps = {
    effectiveDate: Term;
    prefectureCodes: NonEmptyList<PrefectureCode> | null;
}

export interface MinimumHourlyWageRevisionService {
    list(props: ListProps): Promise<MinimumHourlyWageRevision[]>;
}