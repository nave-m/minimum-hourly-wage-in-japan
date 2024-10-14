// package: jp.wage.api.v1
// file: jp/wage/api/v1/minimum_hourly_wage_api.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";
import * as google_type_date_pb from "../../../../google/type/date_pb";
import * as jp_wage_api_v1_minimum_hourly_wage_view_pb from "../../../../jp/wage/api/v1/minimum_hourly_wage_view_pb";

export class ListViewsRequest extends jspb.Message { 

    hasDate(): boolean;
    clearDate(): void;
    getDate(): google_type_date_pb.Date | undefined;
    setDate(value?: google_type_date_pb.Date): ListViewsRequest;
    clearPrefectureCodesList(): void;
    getPrefectureCodesList(): Array<string>;
    setPrefectureCodesList(value: Array<string>): ListViewsRequest;
    addPrefectureCodes(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListViewsRequest.AsObject;
    static toObject(includeInstance: boolean, msg: ListViewsRequest): ListViewsRequest.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListViewsRequest, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListViewsRequest;
    static deserializeBinaryFromReader(message: ListViewsRequest, reader: jspb.BinaryReader): ListViewsRequest;
}

export namespace ListViewsRequest {
    export type AsObject = {
        date?: google_type_date_pb.Date.AsObject,
        prefectureCodesList: Array<string>,
    }
}

export class ListViewsResponse extends jspb.Message { 
    clearViewsList(): void;
    getViewsList(): Array<jp_wage_api_v1_minimum_hourly_wage_view_pb.MinimumHourlyWageView>;
    setViewsList(value: Array<jp_wage_api_v1_minimum_hourly_wage_view_pb.MinimumHourlyWageView>): ListViewsResponse;
    addViews(value?: jp_wage_api_v1_minimum_hourly_wage_view_pb.MinimumHourlyWageView, index?: number): jp_wage_api_v1_minimum_hourly_wage_view_pb.MinimumHourlyWageView;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): ListViewsResponse.AsObject;
    static toObject(includeInstance: boolean, msg: ListViewsResponse): ListViewsResponse.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: ListViewsResponse, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): ListViewsResponse;
    static deserializeBinaryFromReader(message: ListViewsResponse, reader: jspb.BinaryReader): ListViewsResponse;
}

export namespace ListViewsResponse {
    export type AsObject = {
        viewsList: Array<jp_wage_api_v1_minimum_hourly_wage_view_pb.MinimumHourlyWageView.AsObject>,
    }
}
