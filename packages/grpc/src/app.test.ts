import { ChannelCredentials, Metadata, Server, ServerCredentials, ServiceError} from "@grpc/grpc-js";
import { configure } from './app';
import { LoggingService } from '@minimum-hourly-wage-in-japan/usecase/src/LoggingService';
import { ListViewsRequest, ListViewsResponse } from "./gen/jp/wage/api/v1/minimum_hourly_wage_api_pb";
import { Date as GoogleDate } from "./gen/google/type/date_pb";
import { MinimumHourlyWageClient } from "./gen/jp/wage/api/v1/minimum_hourly_wage_api_grpc_pb";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { BadRequest } from "./gen/google/rpc/error_details_pb";
import { HealthCheckRequest, HealthCheckResponse } from "./gen/grpc/health/v1/health_pb";
import { HealthClient } from "./gen/grpc/health/v1/health_grpc_pb";

describe('gRPC API', () => {
    const loggingService: LoggingService = {
        info: jest.fn(),
        error: jest.fn(),
    };
    const host = 'localhost:3000';
    const server = new Server();
    beforeAll(() => {
        configure({server, loggingService});
        server.bindAsync(host, ServerCredentials.createInsecure(), (error) => {
            if (error) {
                throw error;
            }
        });
    });
    afterAll(() => {
        server.forceShutdown();
    })
    describe('service MinimumHourlyWage', () => {
        const client = new MinimumHourlyWageClient(host, ChannelCredentials.createInsecure());
        const createDate = (props: {
            year: number;
            month: number;
            day: number;
        }): GoogleDate => {
            const googleDate = new GoogleDate();
            googleDate.setYear(props.year);
            googleDate.setMonth(props.month);
            googleDate.setDay(props.day);
            return googleDate;
        };
        const extractBadRequest = (metadata: Metadata): BadRequest => {
            const metadataValues = metadata.get('google.rpc.BadRequest-bin');
            if (metadataValues.length === 0) {
                throw new Error('キー google.rpc.BadRequest-bin に対して何も入ってない');
            }
            const mayBeBuffer = metadataValues[0];
            if (mayBeBuffer instanceof Buffer) {
                return BadRequest.deserializeBinary(mayBeBuffer);
            } else {
                throw new Error('metadataからBadRequestが取り出せない')
            }   
        }
        describe('rpc ListViews', () => {
            it('正常系 日付を指定するとその時点における最低時給と将来の改定情報を返す', async () => {
                const response = await new Promise<ListViewsResponse>((resolve, reject) => {
                    const request = new ListViewsRequest();
                    request.setDate(createDate({year: 2024, month: 10, day: 5}));
                    client.listViews(request, (error, response) => {
                        if (response) {
                            resolve(response);
                        } else {
                            reject(error);
                        }
                    })
                });
                const actualViews = response.getViewsList();
                expect(actualViews).toHaveLength(47);
                expect(actualViews[0].getPrefectureCode()).toBe('01');
                expect(actualViews[0].getHourlyWage()).toBe(1010); // 2024年の北海道の賃金改定の発効日が10月1日なので、10月5日現在では改定後の賃金
                expect(actualViews[0].hasNext()).toBeFalsy();
                expect(actualViews[46].getPrefectureCode()).toBe('47');
                expect(actualViews[46].getHourlyWage()).toBe(896); // 2024年の沖縄県の賃金改定の発効日が10月9日なので、10月5日現在では改定前の賃金
                expect(actualViews[46].hasNext()).toBeTruthy();
                const nextViewOfOkinawa = actualViews[46].getNext()!;
                expect(nextViewOfOkinawa.getHourlyWage()).toBe(952);
                expect(nextViewOfOkinawa.getEffectiveDate()?.getYear()).toBe(2024);
                expect(nextViewOfOkinawa.getEffectiveDate()?.getMonth()).toBe(10);
                expect(nextViewOfOkinawa.getEffectiveDate()?.getDay()).toBe(9);
                expect(nextViewOfOkinawa.getPublicationDate()?.getYear()).toBe(2024);
                expect(nextViewOfOkinawa.getPublicationDate()?.getMonth()).toBe(9);
                expect(nextViewOfOkinawa.getPublicationDate()?.getDay()).toBe(9);
            });
            it('正常系 日付とともに都道府県コードを指定して絞り込みができる', async () => {
                const response = await new Promise<ListViewsResponse>((resolve, reject) => {
                    const request = new ListViewsRequest();
                    request.setDate(createDate({year: 2024, month: 10, day: 5}));
                    request.setPrefectureCodesList(['13', '14']);
                    client.listViews(request, (error, response) => {
                        if (response) {
                            resolve(response);
                        } else {
                            reject(error);
                        }
                    })
                });
                expect(response.getViewsList()).toHaveLength(2);
                expect(response.getViewsList()[0].getPrefectureCode()).toBe('13');
                expect(response.getViewsList()[1].getPrefectureCode()).toBe('14');
            });
            it('準正常系 日付の指定がされない場合はINVALID_ARGUMENT応答', async () => {
                const serviceError: ServiceError = await new Promise<ListViewsResponse>((resolve, reject) => {
                    const request = new ListViewsRequest();
                    client.listViews(request, (error, response) => {
                        if (response) {
                            resolve(response);
                        } else {
                            reject(error);
                        }
                    })
                }).catch((error) => error);
                expect(serviceError.code).toBe(Status.INVALID_ARGUMENT);
                const badRequest = extractBadRequest(serviceError.metadata);    
                expect(badRequest.getFieldViolationsList()).toHaveLength(1);
                expect(badRequest.getFieldViolationsList()[0].getField()).toBe('date');
                expect(badRequest.getFieldViolationsList()[0].getDescription()).toBe('日付は必須です');
            });
            it('準正常系 存在しない日付が指定された場合はINVALID_ARGUMENT応答', async () => {
                const serviceError: ServiceError = await new Promise<ListViewsResponse>((resolve, reject) => {
                    const request = new ListViewsRequest();
                    request.setDate(createDate({year: 2024, month: 13, day: 31}));
                    client.listViews(request, (error, response) => {
                        if (response) {
                            resolve(response);
                        } else {
                            reject(error);
                        }
                    })
                }).catch((error) => error);
                expect(serviceError.code).toBe(Status.INVALID_ARGUMENT);
                const badRequest = extractBadRequest(serviceError.metadata);    
                expect(badRequest.getFieldViolationsList()).toHaveLength(1);
                expect(badRequest.getFieldViolationsList()[0].getField()).toBe('date');
                expect(badRequest.getFieldViolationsList()[0].getDescription()).toBe('日付として解釈できません');
            });
            it('準正常系 存在しない都道府県コードが指定された場合はINVALID_ARGUMENT応答', async () => {
                const serviceError: ServiceError = await new Promise<ListViewsResponse>((resolve, reject) => {
                    const request = new ListViewsRequest();
                    request.setDate(createDate({year: 2024, month: 10, day: 5}));
                    request.setPrefectureCodesList(['13', '48']);
                    client.listViews(request, (error, response) => {
                        if (response) {
                            resolve(response);
                        } else {
                            reject(error);
                        }
                    })    
                }).catch((error) => error);
                expect(serviceError.code).toBe(Status.INVALID_ARGUMENT);
                const badRequest = extractBadRequest(serviceError.metadata);    
                expect(badRequest.getFieldViolationsList()).toHaveLength(1);
                expect(badRequest.getFieldViolationsList()[0].getField()).toBe('prefectureCodes[1]');
                expect(badRequest.getFieldViolationsList()[0].getDescription()).toBe('都道府県コードとして解釈できません');
            });
        });
    });
    describe('service Health', () => {
        const client = new HealthClient(host, ChannelCredentials.createInsecure());
        describe('rpc Check', () => {
            it('正常系 サービス名を指定してMinimumHourlyWageが稼働していることを確認できる', async () => {
                const response = await new Promise<HealthCheckResponse>((resolve, reject) => {
                    const request = new HealthCheckRequest();
                    request.setService('MinimumHourlyWage');
                    client.check(request, (error, response) => {
                        if(response) {
                            resolve(response)
                        } else {
                            reject(error);
                        }
                    });
                });
                expect(response.getStatus()).toBe(HealthCheckResponse.ServingStatus.SERVING);
            });
            it('準正常系 存在しないサービス名を指定するとNOT_FOUND応答', async () => {
                const serviceError: ServiceError = await new Promise<HealthCheckResponse>((resolve, reject) => {
                    const request = new HealthCheckRequest();
                    request.setService('Invalid');
                    client.check(request, (error, response) => {
                        if(response) {
                            resolve(response)
                        } else {
                            reject(error);
                        }
                    });
                }).catch((error) => error);
                expect(serviceError.code).toBe(Status.NOT_FOUND);
            });
        });
    });
});