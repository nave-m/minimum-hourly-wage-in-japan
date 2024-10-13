export enum PrefectureCode {
    Hokkaido = '01',
    Aomori = '02',
    Iwate = '03',
    Miyagi = '04',
    Akita = '05',
    Yamagata = '06',
    Fukushima = '07',
    Ibaraki = '08',
    Tochigi = '09',
    Gunnma = '10',
    Saitama = '11',
    Chiba = '12',
    Tokyo = '13',
    Kanagawa = '14',
    Niigata = '15',
    Toyama = '16',
    Ishikawa = '17',
    Fukui = '18',
    Yamanashi = '19',
    Nagano = '20',
    Gifu = '21',
    Shizuoka = '22',
    Aichi = '23',
    Mie = '24',
    Shiga = '25',
    Kyoto = '26',
    Osaka = '27',
    Hyogo = '28',
    Nara = '29',
    Wakayama = '30',
    Tottori = '31',
    Shimane = '32',
    Okayama = '33',
    Hiroshima = '34',
    Yamaguchi = '35',
    Tokushima = '36',
    Kagawa = '37',
    Ehime = '38',
    Kochi = '39',
    Fukuoka = '40',
    Saga = '41',
    Nagasaki = '42',
    Kumamoto = '43',
    Oita = '44',
    Miyazaki = '45',
    Kagoshima = '46',
    Okinawa = '47',
} // JIS X 0401

export const prefectureCodeFromText = (code: string): PrefectureCode => {
    switch(code) {
        case '01': return PrefectureCode.Hokkaido;
        case '02': return PrefectureCode.Aomori;
        case '03': return PrefectureCode.Iwate;
        case '04': return PrefectureCode.Miyagi;
        case '05': return PrefectureCode.Akita;
        case '06': return PrefectureCode.Yamagata;
        case '07': return PrefectureCode.Fukushima;
        case '08': return PrefectureCode.Ibaraki;
        case '09': return PrefectureCode.Tochigi;
        case '10': return PrefectureCode.Gunnma;
        case '11': return PrefectureCode.Saitama;
        case '12': return PrefectureCode.Chiba;
        case '13': return PrefectureCode.Tokyo;
        case '14': return PrefectureCode.Kanagawa;
        case '15': return PrefectureCode.Niigata;
        case '16': return PrefectureCode.Toyama;
        case '17': return PrefectureCode.Ishikawa;
        case '18': return PrefectureCode.Fukui;
        case '19': return PrefectureCode.Yamanashi;
        case '20': return PrefectureCode.Nagano;
        case '21': return PrefectureCode.Gifu;
        case '22': return PrefectureCode.Shizuoka;
        case '23': return PrefectureCode.Aichi;
        case '24': return PrefectureCode.Mie;
        case '25': return PrefectureCode.Shiga;
        case '26': return PrefectureCode.Kyoto;
        case '27': return PrefectureCode.Osaka;
        case '28': return PrefectureCode.Hyogo;
        case '29': return PrefectureCode.Nara;
        case '30': return PrefectureCode.Wakayama;
        case '31': return PrefectureCode.Tottori;
        case '32': return PrefectureCode.Shimane;
        case '33': return PrefectureCode.Okayama;
        case '34': return PrefectureCode.Hiroshima;
        case '35': return PrefectureCode.Yamaguchi;
        case '36': return PrefectureCode.Tokushima;
        case '37': return PrefectureCode.Kagawa;
        case '38': return PrefectureCode.Ehime;
        case '39': return PrefectureCode.Kochi;
        case '40': return PrefectureCode.Fukuoka;
        case '41': return PrefectureCode.Saga;
        case '42': return PrefectureCode.Nagasaki;
        case '43': return PrefectureCode.Kumamoto;
        case '44': return PrefectureCode.Oita;
        case '45': return PrefectureCode.Miyazaki;
        case '46': return PrefectureCode.Kagoshima;
        case '47': return PrefectureCode.Okinawa;
        default: 
            throw new Error(``);
    }
}