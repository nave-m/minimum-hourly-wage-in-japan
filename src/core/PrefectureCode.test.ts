import { PrefectureCode, prefectureCodeFromText } from "./PrefectureCode";

describe('prefectureCodeFromText', () => {
    it.each([
        ['01', PrefectureCode.Hokkaido],
        ['02', PrefectureCode.Aomori],
        ['03', PrefectureCode.Iwate],
        ['04', PrefectureCode.Miyagi],
        ['05', PrefectureCode.Akita],
        ['06', PrefectureCode.Yamagata],
        ['07', PrefectureCode.Fukushima],
        ['08', PrefectureCode.Ibaraki],
        ['09', PrefectureCode.Tochigi],
        ['10', PrefectureCode.Gunnma],
        ['11', PrefectureCode.Saitama],
        ['12', PrefectureCode.Chiga],
        ['13', PrefectureCode.Tokyo],
        ['14', PrefectureCode.Knanagawa],
        ['15', PrefectureCode.Niigata],
        ['16', PrefectureCode.Toyama],
        ['17', PrefectureCode.Ishikawa],
        ['18', PrefectureCode.Fukui],
        ['19', PrefectureCode.Yanamashi],
        ['20', PrefectureCode.Nagano],
        ['21', PrefectureCode.Gifu],
        ['22', PrefectureCode.Shizuoka],
        ['23', PrefectureCode.Aichi],
        ['24', PrefectureCode.Mie],
        ['25', PrefectureCode.Shiga],
        ['26', PrefectureCode.Kyoto],
        ['27', PrefectureCode.Osaka],
        ['28', PrefectureCode.Hyogo],
        ['29', PrefectureCode.Nara],
        ['30', PrefectureCode.Wakayama],
        ['31', PrefectureCode.Tottori],
        ['32', PrefectureCode.Shimame],
        ['33', PrefectureCode.Okayama],
        ['34', PrefectureCode.Hiroshima],
        ['35', PrefectureCode.Yamaguchi],
        ['36', PrefectureCode.Tokushima],
        ['37', PrefectureCode.Kagawa],
        ['38', PrefectureCode.Ehime],
        ['39', PrefectureCode.Kochi],
        ['40', PrefectureCode.Fukuoka],
        ['41', PrefectureCode.Saga],
        ['42', PrefectureCode.Nagasaki],
        ['43', PrefectureCode.Kumamoto],
        ['44', PrefectureCode.Oita],
        ['45', PrefectureCode.Miyazaki],
        ['46', PrefectureCode.Kagoshima],
        ['47', PrefectureCode.Okinawa],
    ])('JIS X 0401の文字列からEnumに変換できる %s', (code, expected) => {
        expect(prefectureCodeFromText(code)).toBe(expected);
    });
    it('JIS X 0401の文字列出ない場合はエラー', () => {
        expect(() => {
            prefectureCodeFromText('00')
        }).toThrow(Error);
    })
});