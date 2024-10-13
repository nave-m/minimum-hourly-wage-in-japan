import request from 'supertest';
import express from 'express';
import { configure } from './app';
import { LoggingService } from '@minimum-hourly-wage-in-japan/usecase/src/LoggingService';

describe('RESTfulAPI', () => {
    const loggingService: LoggingService = {
        info: jest.fn(),
        error: jest.fn(),
    }
    const app = configure({app: express(), loggingService});

    describe('GET /api/v1/minimumHourlyWageViews', () => {
        it('正常系 日付を指定するとその時点における最低時給と将来の改定情報を返す', async () => {
            const response = await request(app).get('/api/v1/minimumHourlyWageViews?date=2024-10-05');
            expect(response.statusCode).toBe(200);
            expect(response.body.minimumHourlyWageViews).toHaveLength(47);
            expect(response.body.minimumHourlyWageViews[0]).toStrictEqual({
                prefectureCode: '01',
                hourlyWage: 1010, // 2024年の北海道の賃金改定の発効日が10月1日なので、10月5日現在では改定後の賃金
                next: null,
            });
            expect(response.body.minimumHourlyWageViews[46]).toStrictEqual({
                prefectureCode: '47',
                hourlyWage: 896, // 2024年の沖縄県の賃金改定の発効日が10月9日なので、10月5日現在では改定前の賃金
                next: {
                    hourlyWage: 952,
                    effectiveDate: '2024-10-09',
                    publicationDate: '2024-09-09',
                },
            });
        });
        it('正常系 日付とともに都道府県コードを指定して絞り込みができる', async () => {
            const response = await request(app).get('/api/v1/minimumHourlyWageViews?date=2024-10-05&prefectureCodes[]=13&prefectureCodes[]=14');
            expect(response.statusCode).toBe(200);
            expect(response.body.minimumHourlyWageViews).toHaveLength(2);
            expect(response.body.minimumHourlyWageViews[0].prefectureCode).toBe('13');
            expect(response.body.minimumHourlyWageViews[1].prefectureCode).toBe('14');
        });
        it('準正常系 日付の指定がされない場合は400応答', async () => {
            const response = await request(app).get('/api/v1/minimumHourlyWageViews');
            expect(response.statusCode).toBe(400);
            expect(response.body).toStrictEqual({
                violations: [
                    {property: 'date', message: '日付は必須です'}
                ]
            });
        });
        it('準正常系 日付が複数指定された場合は400応答', async () => {
            const response = await request(app).get('/api/v1/minimumHourlyWageViews?date[]=2024-10-05&date[]=2024-10-06');
            expect(response.statusCode).toBe(400);
            expect(response.body).toStrictEqual({
                violations: [
                    {property: 'date', message: '日付は文字列で指定してください'}
                ]
            });
        });
        it('準正常系 存在しない日付が指定された場合は400応答', async () => {
            const response = await request(app).get('/api/v1/minimumHourlyWageViews?date=2024-13-31');
            expect(response.statusCode).toBe(400);
            expect(response.body).toStrictEqual({
                violations: [
                    {property: 'date', message: '日付として解釈できません'}
                ]
            });
        });
        it('準正常系 都道府県コードが配列でない形式で指定された場合は400応答', async () => {
            const response = await request(app).get('/api/v1/minimumHourlyWageViews?date=2024-10-05&prefectureCodes=13');
            expect(response.statusCode).toBe(400);
            expect(response.body).toStrictEqual({
                violations: [
                    {property: 'prefectureCodes', message: '都道府県コードは配列で指定してください'}
                ]
            });
        });
        it('準正常系 存在しない都道府県コードが指定された場合は400応答', async () => {
            const response = await request(app).get('/api/v1/minimumHourlyWageViews?date=2024-10-05&prefectureCodes[]=13&prefectureCodes[]=48');
            expect(response.statusCode).toBe(400);
            expect(response.body).toStrictEqual({
                violations: [
                    {property: 'prefectureCodes[1]', message: '都道府県コードとして解釈できません'}
                ]
            });
        });
    });
});