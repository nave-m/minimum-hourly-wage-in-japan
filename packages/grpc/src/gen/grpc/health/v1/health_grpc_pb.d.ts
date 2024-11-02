// package: grpc.health.v1
// file: grpc/health/v1/health.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as grpc_health_v1_health_pb from "../../../grpc/health/v1/health_pb";

interface IHealthService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    check: IHealthService_ICheck;
    watch: IHealthService_IWatch;
}

interface IHealthService_ICheck extends grpc.MethodDefinition<grpc_health_v1_health_pb.HealthCheckRequest, grpc_health_v1_health_pb.HealthCheckResponse> {
    path: "/grpc.health.v1.Health/Check";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<grpc_health_v1_health_pb.HealthCheckRequest>;
    requestDeserialize: grpc.deserialize<grpc_health_v1_health_pb.HealthCheckRequest>;
    responseSerialize: grpc.serialize<grpc_health_v1_health_pb.HealthCheckResponse>;
    responseDeserialize: grpc.deserialize<grpc_health_v1_health_pb.HealthCheckResponse>;
}
interface IHealthService_IWatch extends grpc.MethodDefinition<grpc_health_v1_health_pb.HealthCheckRequest, grpc_health_v1_health_pb.HealthCheckResponse> {
    path: "/grpc.health.v1.Health/Watch";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<grpc_health_v1_health_pb.HealthCheckRequest>;
    requestDeserialize: grpc.deserialize<grpc_health_v1_health_pb.HealthCheckRequest>;
    responseSerialize: grpc.serialize<grpc_health_v1_health_pb.HealthCheckResponse>;
    responseDeserialize: grpc.deserialize<grpc_health_v1_health_pb.HealthCheckResponse>;
}

export const HealthService: IHealthService;

export interface IHealthServer extends grpc.UntypedServiceImplementation {
    check: grpc.handleUnaryCall<grpc_health_v1_health_pb.HealthCheckRequest, grpc_health_v1_health_pb.HealthCheckResponse>;
    watch: grpc.handleServerStreamingCall<grpc_health_v1_health_pb.HealthCheckRequest, grpc_health_v1_health_pb.HealthCheckResponse>;
}

export interface IHealthClient {
    check(request: grpc_health_v1_health_pb.HealthCheckRequest, callback: (error: grpc.ServiceError | null, response: grpc_health_v1_health_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
    check(request: grpc_health_v1_health_pb.HealthCheckRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: grpc_health_v1_health_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
    check(request: grpc_health_v1_health_pb.HealthCheckRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: grpc_health_v1_health_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
    watch(request: grpc_health_v1_health_pb.HealthCheckRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<grpc_health_v1_health_pb.HealthCheckResponse>;
    watch(request: grpc_health_v1_health_pb.HealthCheckRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<grpc_health_v1_health_pb.HealthCheckResponse>;
}

export class HealthClient extends grpc.Client implements IHealthClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public check(request: grpc_health_v1_health_pb.HealthCheckRequest, callback: (error: grpc.ServiceError | null, response: grpc_health_v1_health_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
    public check(request: grpc_health_v1_health_pb.HealthCheckRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: grpc_health_v1_health_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
    public check(request: grpc_health_v1_health_pb.HealthCheckRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: grpc_health_v1_health_pb.HealthCheckResponse) => void): grpc.ClientUnaryCall;
    public watch(request: grpc_health_v1_health_pb.HealthCheckRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<grpc_health_v1_health_pb.HealthCheckResponse>;
    public watch(request: grpc_health_v1_health_pb.HealthCheckRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<grpc_health_v1_health_pb.HealthCheckResponse>;
}
