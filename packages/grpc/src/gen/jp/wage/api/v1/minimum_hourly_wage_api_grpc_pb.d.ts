// package: jp.wage.api.v1
// file: jp/wage/api/v1/minimum_hourly_wage_api.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as jp_wage_api_v1_minimum_hourly_wage_api_pb from "../../../../jp/wage/api/v1/minimum_hourly_wage_api_pb";
import * as google_type_date_pb from "../../../../google/type/date_pb";
import * as jp_wage_api_v1_minimum_hourly_wage_view_pb from "../../../../jp/wage/api/v1/minimum_hourly_wage_view_pb";

interface IMinimumHourlyWageService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    listViews: IMinimumHourlyWageService_IListViews;
}

interface IMinimumHourlyWageService_IListViews extends grpc.MethodDefinition<jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsRequest, jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsResponse> {
    path: "/jp.wage.api.v1.MinimumHourlyWage/ListViews";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsRequest>;
    requestDeserialize: grpc.deserialize<jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsRequest>;
    responseSerialize: grpc.serialize<jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsResponse>;
    responseDeserialize: grpc.deserialize<jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsResponse>;
}

export const MinimumHourlyWageService: IMinimumHourlyWageService;

export interface IMinimumHourlyWageServer extends grpc.UntypedServiceImplementation {
    listViews: grpc.handleUnaryCall<jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsRequest, jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsResponse>;
}

export interface IMinimumHourlyWageClient {
    listViews(request: jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsRequest, callback: (error: grpc.ServiceError | null, response: jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsResponse) => void): grpc.ClientUnaryCall;
    listViews(request: jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsResponse) => void): grpc.ClientUnaryCall;
    listViews(request: jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsResponse) => void): grpc.ClientUnaryCall;
}

export class MinimumHourlyWageClient extends grpc.Client implements IMinimumHourlyWageClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public listViews(request: jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsRequest, callback: (error: grpc.ServiceError | null, response: jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsResponse) => void): grpc.ClientUnaryCall;
    public listViews(request: jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsResponse) => void): grpc.ClientUnaryCall;
    public listViews(request: jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsResponse) => void): grpc.ClientUnaryCall;
}
