// package: jp.wage.api.v1
// file: jp/wage/api/v1/minimum_hourly_wage_view.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_type_date_pb from "../../../../google/type/date_pb";

export class MinimumHourlyWageView extends jspb.Message { 
    getHourlyWage(): number;
    setHourlyWage(value: number): MinimumHourlyWageView;
    getPrefectureCode(): string;
    setPrefectureCode(value: string): MinimumHourlyWageView;

    hasNext(): boolean;
    clearNext(): void;
    getNext(): NextMinimumHourlyWageView | undefined;
    setNext(value?: NextMinimumHourlyWageView): MinimumHourlyWageView;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MinimumHourlyWageView.AsObject;
    static toObject(includeInstance: boolean, msg: MinimumHourlyWageView): MinimumHourlyWageView.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MinimumHourlyWageView, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MinimumHourlyWageView;
    static deserializeBinaryFromReader(message: MinimumHourlyWageView, reader: jspb.BinaryReader): MinimumHourlyWageView;
}

export namespace MinimumHourlyWageView {
    export type AsObject = {
        hourlyWage: number,
        prefectureCode: string,
        next?: NextMinimumHourlyWageView.AsObject,
    }
}

export class NextMinimumHourlyWageView extends jspb.Message { 
    getHourlyWage(): number;
    setHourlyWage(value: number): NextMinimumHourlyWageView;

    hasEffectiveDate(): boolean;
    clearEffectiveDate(): void;
    getEffectiveDate(): google_type_date_pb.Date | undefined;
    setEffectiveDate(value?: google_type_date_pb.Date): NextMinimumHourlyWageView;

    hasPublicationDate(): boolean;
    clearPublicationDate(): void;
    getPublicationDate(): google_type_date_pb.Date | undefined;
    setPublicationDate(value?: google_type_date_pb.Date): NextMinimumHourlyWageView;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): NextMinimumHourlyWageView.AsObject;
    static toObject(includeInstance: boolean, msg: NextMinimumHourlyWageView): NextMinimumHourlyWageView.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: NextMinimumHourlyWageView, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): NextMinimumHourlyWageView;
    static deserializeBinaryFromReader(message: NextMinimumHourlyWageView, reader: jspb.BinaryReader): NextMinimumHourlyWageView;
}

export namespace NextMinimumHourlyWageView {
    export type AsObject = {
        hourlyWage: number,
        effectiveDate?: google_type_date_pb.Date.AsObject,
        publicationDate?: google_type_date_pb.Date.AsObject,
    }
}
