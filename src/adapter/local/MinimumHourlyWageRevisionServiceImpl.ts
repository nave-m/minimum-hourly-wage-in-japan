import { MinimumHourlyWageRevision } from "../../core/MinimumHourlyWageRevision";
import { ListProps, MinimumHourlyWageRevisionService } from "../../usecase/MinimumHourlyWageRevisionService";

export class MinimumHourlyWageRevisionServiceImpl implements MinimumHourlyWageRevisionService {
    private revisions: MinimumHourlyWageRevision[];
    constructor(props: {revisions: MinimumHourlyWageRevision[]}) {
        this.revisions = props.revisions;
    }
    async list(props: ListProps): Promise<MinimumHourlyWageRevision[]> {
        return this.revisions.filter((revision) => {
            return (props.effectiveDate.within(revision.effectiveDate))
                && (props.prefectureCodes ? props.prefectureCodes.includes(revision.prefectureCode) : true);
        })
    }
}