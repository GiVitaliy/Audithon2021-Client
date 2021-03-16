import { AppConstants } from '../app-constants';

export class StringHelper {
  private static readonly escapeChars = ['<', '>', '"', '\'', '&'];
  private static readonly escapeStringPairs = ['&lt;', '&gt;', '&quot;', '&apos;', '&amp;'];

  static readonly incorrectSeriesFormatExceptionText = 'Некорректный формат серии документа';
  static readonly romanDigits = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
  static readonly romanTens = ['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'];

  static strToSnils(snilsStr: string): number {
    snilsStr = snilsStr.replace(/-/g, '');
    snilsStr = snilsStr.replace(/ /g, '');
    if (snilsStr.length !== 11 || StringHelper.hasNonDigitLiterals(snilsStr)) {
      throw new Error('Некорректный формат. СНИЛС должен состоять из 11 цифр (могут быть разделены символом \'-\')');
    }
    const snils = parseInt(snilsStr.substr(0, 9), 10);
    const control = parseInt(snilsStr.substr(9, 2), 10);
    if (snils > 1001998 && StringHelper.getControlSum(snils) !== control) {
      throw new Error('Некорректный формат. В СНИЛС не совпадает контрольная сумма.');
    }
    return parseInt(snilsStr, 10);
  }

  static snilsToStr(snils: number): string {
    return `${StringHelper.padStr(Math.floor(snils / 100000000), 3)}-` +
      `${StringHelper.padStr(Math.floor(snils / 100000) % 1000, 3)}-` +
      `${StringHelper.padStr(Math.floor(snils / 100) % 1000, 3)} ` +
      `${StringHelper.padStr(Math.floor(snils) % 100, 2)}`;
  }

  static padStr(num, size) {
    if ((!num && num !== 0) || num.toString().length >= size) {
      return (num || '').toString();
    }
    const s = '0000000000000000000000000000000000' + num;
    return s.substr(s.length - size);
  }


  static hasNonDigitLiterals(p: string): boolean {

    for (let i = 0; i < p.length; i++) {
      const isDigit = !isNaN(parseInt(p[i], 10));
      if (!isDigit) {
        return true;
      }
    }

    return false;
  }

  static getControlSum(snils: number): number {
    let control = Math.floor(snils / 100000000) * 9 +
      Math.floor(snils / 10000000) % 10 * 8 +
      Math.floor(snils / 1000000) % 10 * 7 +
      Math.floor(snils / 100000) % 10 * 6 +
      Math.floor(snils / 10000) % 10 * 5 +
      Math.floor(snils / 1000) % 10 * 4 +
      Math.floor(snils / 100) % 10 * 3 +
      Math.floor(snils / 10) % 10 * 2 +
      Math.floor(snils / 1) % 10 * 1;

    if (control > 101) {
      control = control % 101;
    }

    if (control === 100 || control === 101) {
      return 0;
    }

    return control % 101;
  }

  static strToInnPerson(innStr: string) {

    innStr = innStr.replace(/-/g, '');
    innStr = innStr.replace(/ /g, '');

    if (innStr.length !== 12 || StringHelper.hasNonDigitLiterals(innStr)) {
      throw new Error('Некорректный формат. ИНН должен состоять из 12 цифр (могут быть разделены символом \'-\')');
    }

    if (!this.checkControlSumInnPerson(innStr)) {
      throw new Error('Некорректный формат. В ИНН не совпадает контрольная сумма.');
    }

    return parseInt(innStr, 10);
  }

  static checkControlSumInnPerson(inn: string) {
    const controlNum11 = this.getControlDigitInnPerson(inn, [7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);
    const controlNum12 = this.getControlDigitInnPerson(inn, [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]);

    return parseInt(inn[10], 10) === controlNum11 && parseInt(inn[11], 10) === controlNum12;
  }

  static getControlDigitInnPerson(inn: string, arrForCalculateControlSum: any[]) {
    let controlNum = 0;

    arrForCalculateControlSum.forEach((num, index) => {
      controlNum += parseInt(inn[index], 10) * num;
    });

    return controlNum % 11 % 10;
  }

  static normalizeSeries(series: string, seriesFormat: string): string {
    series = series.replace(' ', '').toUpperCase();

    if (!StringHelper.isValidSeries(series, seriesFormat)) {
      throw new Error(StringHelper.incorrectSeriesFormatExceptionText);
    }

    switch (seriesFormat) {
      case 'RR-ББ': // Римские - тире - буквы
      {
        const ix = series.indexOf('-');

        // русскими буквами тоже допускается писать серию - заменяем её на латинские
        let roman =
          series.substr(0, ix)
            .toUpperCase()
            .replace(' ', '')
            .replace('Y', 'V')
            .replace('У', 'V')
            .replace('Х', 'X')
            .replace('Л', 'L')
            .replace('С', 'C');
        let letters = series.substr(ix + 1, series.length - ix - 1);

        letters = letters.toUpperCase();

        const iRoman = parseInt(roman, 10);
        if (!isNaN(iRoman)) {
          // если распознали числовую часть как арабское число, преобразуем его в римское
          switch (iRoman) {
            case 11:
              roman = 'II';
              break;
            case 111:
              roman = 'III';
              break;
            default:
              roman = StringHelper.romanTens[Math.floor(iRoman / 10)] + StringHelper.romanDigits[iRoman % 10];
              break;
          }
        } else {
          // если не распознали - считаем его римским, просто приведём к верхнему регистру и заменим 1 на I
          roman = roman.replace('1', 'I').toUpperCase();
        }

        return roman + '-' + letters;
      }

      case 'RR-ББ/ББ': // Римские - тире - буквы (например, серия свид-ва о рождении) или просто 2 буквы
      {
        const ix = series.indexOf('-');

        if (ix >= 0) {
          // русскими буквами тоже допускается писать серию - заменяем её на латинские
          let roman =
            series.substr(0, ix)
              .toUpperCase()
              .replace(' ', '')
              .replace('Y', 'V')
              .replace('У', 'V')
              .replace('Х', 'X')
              .replace('Л', 'L')
              .replace('С', 'C');
          let letters = series.substr(ix + 1, series.length - ix - 1);

          letters = letters.toUpperCase();

          const iRoman = parseInt(roman, 10);
          if (!isNaN((iRoman))) {
            // если распознали числовую часть как арабское число, преобразуем его в римское
            switch (iRoman) {
              case 11:
                roman = 'II';
                break;
              case 111:
                roman = 'III';
                break;
              default:
                roman = StringHelper.romanTens[Math.floor(iRoman / 10)] + StringHelper.romanDigits[iRoman % 10];
                break;
            }
          } else {
            // если не распознали - считаем его римским, просто приведём к верхнему регистру и заменим 1 на I
            roman = roman.replace('1', 'I').toUpperCase();
          }

          return roman + '-' + letters;
        }
      }

        break;
    }

    return series;
  }

  static isValidSeries(series: string, seriesFormat: string): boolean {
    switch (seriesFormat) {
      case '9999': // Четыре арабские цифры (например, серия паспорта)
        series = series.replace(' ', '');

        if (series.length !== 4 || isNaN(parseInt(series, 10))) {
          return false;
        }

        break;
      case 'RR-ББ': // Римские - тире - буквы (например, серия свид-ва о рождении)
        const ix = series.indexOf('-');
        if (ix < 0 || !StringHelper.isValidRrBbSeries(series, ix)) {
          return false;
        }

        break;
      case 'RR-ББ/ББ': // Римские - тире - буквы (например, серия свид-ва о рождении) или просто 2 буквы
        const ix2 = series.indexOf('-');
        if (ix2 < 0) {
          const letters = series.replace(' ', '');
          return letters.length === 2 && StringHelper.isRussianChar(letters[0]) && StringHelper.isRussianChar(letters[1]);
        }
        return StringHelper.isValidRrBbSeries(series, ix2);
      case '':
        break;
      default:
        throw new Error('Неизвестный формат серии документа');
    }

    return true;
  }

  static isValidRrBbSeries(series: string, ix: number): boolean {
    // русскими буквами тоже допускается писать серию - заменяем её на латинские
    let roman =
      series.substr(0, ix)
        .toUpperCase()
        .replace(' ', '')
        .replace('Y', 'V')
        .replace('У', 'V')
        .replace('Х', 'X')
        .replace('Л', 'L')
        .replace('С', 'C');

    const letters = series.substr(ix + 1, series.length - ix - 1);

    if ((roman || '').trim() === '') {
      return false;
    }

    if (letters.length !== 2) {
      return false;
    }

    if (!StringHelper.isRussianChar(letters[0]) || !StringHelper.isRussianChar(letters[1])) {
      return false;
    }

    const iRoman = parseInt(roman, 10);
    if (isNaN(iRoman)) {
      // если не распознали числовую часть как арабское число, пробуем распознать его как римское
      roman = roman.replace('1', 'I').toUpperCase();
      for (let i = 0; i < roman.length; i++) {
        const ch = roman[i];
        if (ch !== 'V' && ch !== 'X' && ch !== 'I' && ch !== 'M' && ch !== 'L' && ch !== 'C' && ch !== 'D') {
          return false;
        }
      }
    } else {
      if (iRoman >= 100 && iRoman !== 111) {
        return false;
      }
    }

    return true;
  }

  static isRussianChar(ch: string): boolean {
    return ch >= 'а' && ch <= 'я' || ch >= 'А' && ch <= 'Я' || ch === 'ё' || ch === 'Ё';
  }

  static parseRussianDate(dateStr: string): Date {

    if (!dateStr) {
      return undefined;
    }

    const matches = dateStr.match(/([0-9]{1,2})[\.\,\\]{1}([0-9]{1,2})[\.\,\\]{1}([0-9]{2,4})/);
    if (matches && matches.length === 4) {
      return new Date(Date.UTC(parseInt(matches[3], 10), parseInt(matches[2], 10) - 1, parseInt(matches[1], 10)));
    } else {
      return undefined;
    }
  }

  static getPersonTitle(person: any): string {
    return person.lastName !== AppConstants.HIDDEN_FIELD_TEXT ? `${person.lastName} ${person.firstName} ${person.middleName || ''} ` +
      `${person.birthDate ? StringHelper.getRuDate(new Date(person.birthDate)) : '[Без Д/Р]'}`
      : `${person.lastName} ${person.firstName} ${person.middleName || ''} ` +
      `${person.birthDate ? new Date(person.birthDate).getFullYear() + ' г/р.' : '[Без Д/Р]'}`;
  }

  static getPersonShortTitle(person: any): string {
    return `${person.lastName} ${person.firstName.substr(0, 1)}.${person.middleName ? person.middleName.substr(0, 1) + '.' : ''}`;
  }

  static getISODate(date: Date): string {
    if (!date) {
      return undefined;
    }

    return date.getFullYear().toString().padStart(4, '0') +
      '-' + (date.getMonth() + 1).toString().padStart(2, '0') +
      '-' + date.getDate().toString().padStart(2, '0');
  }

  static getISODateWithHourMinute(date: Date): string {
    if (!date) {
      return undefined;
    }

    return date.getFullYear().toString().padStart(4, '0') +
      '-' + (date.getMonth() + 1).toString().padStart(2, '0') +
      '-' + date.getDate().toString().padStart(2, '0') +
      'T' + date.getHours().toString().padStart(2, '0') +
      ':' + date.getMinutes().toString().padStart(2, '0');
  }

  static getDatePortionOfISODate(dateStr: string): string {
    if (!dateStr) {
      return '';
    }
    const ps = dateStr.indexOf('T');
    if (ps >= 0) {
      return dateStr.substring(0, ps);
    } else {
      return dateStr;
    }
  }

  static getTimePortionOfISODate(dateStr: string): string {
    if (!dateStr) {
      return '';
    }
    const ps = dateStr.indexOf('T');
    if (ps >= 0) {
      return dateStr.substring(ps + 1);
    } else {
      return '00:00';
    }
  }

  static getRuDate(date: Date): string {
    if (!date) {
      return undefined;
    }

    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    return date.getDate().toString().padStart(2, '0') +
      '.' + (date.getMonth() + 1).toString().padStart(2, '0') +
      '.' + date.getFullYear().toString().padStart(4, '0');
  }

  static getRuTime(date: Date): string {
    if (!date) {
      return undefined;
    }

    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    return date.getDate().toString().padStart(2, '0') +
      '.' + (date.getMonth() + 1).toString().padStart(2, '0') +
      '.' + date.getFullYear().toString().padStart(4, '0') +
      ' ' + date.getHours().toString().padStart(2, '0') +
      ':' + date.getMinutes().toString().padStart(2, '0');
  }

  static getRuTimeWithSeconds(date: Date): string {
    if (!date) {
      return undefined;
    }

    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    return date.getDate().toString().padStart(2, '0') +
      '.' + (date.getMonth() + 1).toString().padStart(2, '0') +
      '.' + date.getFullYear().toString().padStart(4, '0') +
      ' ' + date.getHours().toString().padStart(2, '0') +
      ':' + date.getMinutes().toString().padStart(2, '0') +
      ':' + date.getSeconds().toString().padStart(2, '0');
  }

  static getRuTimeWithMilliseconds(date: Date): string {
    if (!date) {
      return undefined;
    }

    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    return date.getDate().toString().padStart(2, '0') +
      '.' + (date.getMonth() + 1).toString().padStart(2, '0') +
      '.' + date.getFullYear().toString().padStart(4, '0') +
      ' ' + date.getHours().toString().padStart(2, '0') +
      ':' + date.getMinutes().toString().padStart(2, '0') +
      ':' + date.getSeconds().toString().padStart(2, '0') +
      '.' + date.getMilliseconds().toString().padStart(3, '0');
  }

  static formatNomenclatureNumber(numberTemplate: string, no: number, dateX: Date, institutionId: number): string {
    dateX = new Date(dateX || new Date());

    if (!numberTemplate) {
      return no ? no.toString() : '';
    }

    return numberTemplate.replace(/\{учреждение\}/g, (institutionId || '').toString())
      .replace(/\{номер\}/g, (no || '').toString())
      .replace(/\{год\}/g, dateX.getFullYear().toString())
      .replace(/\{месяц\}/g, (dateX.getMonth() + 1).toString())
      .replace(/\{день\}/g, dateX.getDate().toString());
  }

  static getQueryParam(name: string): string {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);
    if (!results) {
      return null;
    }
    if (!results[2]) {
      return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  public static formatCurrency(val: number): string {
    if (!val) {
      return undefined;
    } else {
      const parts = val.toFixed(2).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return parts.join('.').replace('.', ',');
    }
  }

  public static extractParamFromSmevDemandXml(xml: string, paramName: string): string {
    if (!xml) {
      return undefined;
    }

    const regex = new RegExp('<' + paramName + '>(.*)</' + paramName + '>');
    const matches = regex.exec(xml);
    if (matches && matches.length > 1) {
      return matches[1];
    }
  }

  public static updateParamInSmevDemandXml(xml: string, paramName: string, paramValue: string): string {
    if (!xml) {
      return undefined;
    }

    if (!paramValue) {
      paramValue = '';
    }

    const regex = new RegExp('<' + paramName + '>(.*)</' + paramName + '>');

    return xml.replace(regex, '<' + paramName + '>' + paramValue + '</' + paramName + '>');
  }

  public static capitalizeFirst(str: string) {
    if (!str) {
      return str;
    } else {
      return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
  }

  // Экранирует xml-символы
  public static escape(str: string) {
    if (!str) {
      return str;
    }

    let res = '';
    let startIndex = 0;
    while (true) {
      const index = this.indexOfAnyChar(str, this.escapeChars, startIndex);
      if (index === -1) {
        break;
      }
      res += str.substr(startIndex, index - startIndex);
      res += this.escapeStringPairs[this.escapeChars.indexOf(str[index])];
      startIndex = index + 1;
    }

    res += str.substr(startIndex, str.length - startIndex);
    return res;
  }

  public static parseEscaped(escapedStr: string): string {
    if (!escapedStr || escapedStr.length === 0) {
      return escapedStr;
    }

    let res = '';
    let startIndex = 0;
    while (true) {
      const x = this.indexOfAny(escapedStr, this.escapeStringPairs, startIndex);
      if (x.i === -1) {
        break;
      }
      res += escapedStr.substr(startIndex, x.i - startIndex);
      res += this.escapeChars[this.escapeStringPairs.indexOf(x.s)];
      startIndex = x.i + x.s.length;
    }

    res += escapedStr.substr(startIndex, escapedStr.length - startIndex);
    return res;
  }

  public static indexOfAnyChar(str: string, charArr: string[], position?: number): number {
    if (!str || !charArr || charArr.length === 0) {
      return -1;
    }

    const startIndex = position || 0;
    for (let i = startIndex; i < str.length; i++) {
      if (charArr.indexOf(str[i]) > -1) {
        return i;
      }
    }

    return -1;
  }

  public static indexOfAny(str: string, strArr: string[], position?: number): { i: number, s: string } {
    if (!str || !strArr || strArr.length === 0) {
      return {i: -1, s: null};
    }

    let index = -1;
    let strFound: string = null;

    strArr.forEach(x => {
      const i = str.indexOf(x, position);
      if (i > -1 && (index === -1 || i < index)) {
        index = i;
        strFound = x;
      }
    });

    return {i: index, s: strFound};
  }

  public static escapeHtml(unsafe: String): String {
    if (!unsafe) {
      return '';
    }

    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  public static textToHtml(text: String): String {
    if (!text) {
      return '';
    }

    text = this.escapeHtml(text);
    text = text.replace(/\n/g, '<br/>');
    text = text.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
    return text;
  }

  public static tryParseJSON (jsonString) {
    try {
      const o = JSON.parse(jsonString);
      // Handle non-exception-throwing cases:
      // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
      // but... JSON.parse(null) returns null, and typeof null === "object",
      // so we must check for that, too. Thankfully, null is falsey, so this suffices:
      if (o && typeof o === 'object') {
        return o;
      }
    } catch (e) { }

    return false;
  }
}
