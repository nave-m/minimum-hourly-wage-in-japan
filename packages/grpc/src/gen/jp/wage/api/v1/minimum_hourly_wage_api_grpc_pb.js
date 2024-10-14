// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var jp_wage_api_v1_minimum_hourly_wage_api_pb = require('../../../../jp/wage/api/v1/minimum_hourly_wage_api_pb.js');
var google_type_date_pb = require('../../../../google/type/date_pb.js');
var jp_wage_api_v1_minimum_hourly_wage_view_pb = require('../../../../jp/wage/api/v1/minimum_hourly_wage_view_pb.js');

function serialize_jp_wage_api_v1_ListViewsRequest(arg) {
  if (!(arg instanceof jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsRequest)) {
    throw new Error('Expected argument of type jp.wage.api.v1.ListViewsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_jp_wage_api_v1_ListViewsRequest(buffer_arg) {
  return jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_jp_wage_api_v1_ListViewsResponse(arg) {
  if (!(arg instanceof jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsResponse)) {
    throw new Error('Expected argument of type jp.wage.api.v1.ListViewsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_jp_wage_api_v1_ListViewsResponse(buffer_arg) {
  return jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var MinimumHourlyWageService = exports.MinimumHourlyWageService = {
  listViews: {
    path: '/jp.wage.api.v1.MinimumHourlyWage/ListViews',
    requestStream: false,
    responseStream: false,
    requestType: jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsRequest,
    responseType: jp_wage_api_v1_minimum_hourly_wage_api_pb.ListViewsResponse,
    requestSerialize: serialize_jp_wage_api_v1_ListViewsRequest,
    requestDeserialize: deserialize_jp_wage_api_v1_ListViewsRequest,
    responseSerialize: serialize_jp_wage_api_v1_ListViewsResponse,
    responseDeserialize: deserialize_jp_wage_api_v1_ListViewsResponse,
  },
};

exports.MinimumHourlyWageClient = grpc.makeGenericClientConstructor(MinimumHourlyWageService);
