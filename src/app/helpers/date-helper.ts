import {StringHelper} from './string-helper';

export class DateHelper {

  static millisInDay = 86400000;
  static millisInMinute = 60000;

  public static startOfTheWeek(d: any): Date {
    d = new Date(d);
    const day = d.getDay();
    const diff = -day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.getTime() + diff * DateHelper.millisInDay);
  }

  public static endOfTheWeek(d: any): any {
    return new Date(DateHelper.startOfTheWeek(d).getTime() + 6 * DateHelper.millisInDay);
  }

  public static endOfTheMonth(year: number, month: number): any {
    month = month + 1;
    if (month > 11) {
      month = 0;
      year = year + 1;
    }
    return DateHelper.endOfTheWeek(DateHelper.addDays(new Date(year, month, 1), -1));
  }

  public static endOfTheMonthByDate(d: any): any {
    d = new Date(d);
    const month = d.getMonth();
    const year = d.getFullYear();
    return DateHelper.endOfTheMonth(year, month);
  }

  public static addDays(date: Date, days: number): any {
    return new Date(date.getTime() + days * DateHelper.millisInDay);
  }

  public static addMonths(date: Date, months: number): any {
    const retVal = new Date(date.getTime());

    if (months) {
      months = +months;
      if (!isNaN(months)) {
        retVal.setMonth((date.getMonth() + months) % 12);
        retVal.setFullYear(date.getFullYear() + Math.floor((date.getMonth() + months) / 12));
      }
    }
    return retVal;
  }

  public static addMinutes(date: Date, minutes: number): any {
    return new Date(date.getTime() + minutes * DateHelper.millisInMinute);
  }

  public static daysBetween(date1: Date, date2: Date): number {
    return Math.floor((date2.getTime() - date1.getTime()) / DateHelper.millisInDay);
  }

  public static daysInMonth(year: number, month: number): number {
    const date = new Date(year, month, 1);
    return DateHelper.daysBetween(date, DateHelper.addMonths(date, 1));
  }

  public static dateOf(date: Date, timeStr: string): Date {
    const d = new Date(date);
    const time = timeStr.match(/(\d+)(?::(\d\d))?(?::(\d\d))?\s*(p?)/);
    d.setHours(parseInt(time[1], 10) + (time[3] ? 12 : 0));
    d.setMinutes(parseInt(time[2], 10) || 0);
    d.setSeconds(parseInt(time[3], 10) || 0, 0);

    return d;
  }

  public static roundDateToMinutes(date: any): Date {
    const d = new Date(date);
    d.setSeconds(0, 0);
    return d;
  }

  public static startOfTheQuarter(date: Date): Date {
    date = new Date(date);
    return new Date(Date.UTC(date.getFullYear(), date.getMonth() - (date.getMonth() % 3), 1));
  }

  public static startOfTheYear(date: Date): Date {
    date = new Date(date);
    return new Date(Date.UTC(date.getFullYear(), 0, 1));
  }

  public static startOfTheMonth(date: Date): Date {
    date = new Date(date);
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), 1));
  }

  public static startOfTheNextMonth(date: Date): Date {
    date = new Date(date);
    return new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 1));
  }

  public static toLocaleDateString(date: any): string {
    if (!date) { return ''; }
    if (typeof date === 'object') { return date.toLocaleDateString(); }
    return (new Date(date)).toLocaleDateString();
  }

  public static toDate(date: any): Date {
    if (!date) { return null; }
    if (typeof date === 'object') { return date as Date; }
    return (new Date(date));
  }

  public static dateToInt(date: Date): number {
    if (!date) { return null; }

    const fullDaysSinceEpoch = Math.floor(date.getTime() / 8.64e7);
    return fullDaysSinceEpoch;
  }

  public static intToDate(dateInt: number): string {
    if (!dateInt) { return null; }
    const date = new Date(dateInt * 8.64e7);
    return StringHelper.getISODate(date);
  }

  public static endDay(date: Date): Date {
    date = this.toDate(date);

    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
  }

  public static startDay(date: Date): Date {
    date = this.toDate(date);

    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  }

  public static isAfter(dateCurrent: Date, dateForCompare: Date): number {
    dateCurrent = this.toDate(dateCurrent);
    dateForCompare = this.toDate(dateForCompare);

    const result = dateCurrent.getTime() - dateForCompare.getTime();

    if (result > 0) {
      return 1;
    } else if (result < 0) {
      return -1;
    } else {
      return 0;
    }
  }

  public static minDate(dateOne: Date, dateTwo: Date): Date {
    return this.getMinOrMaxDate(dateOne, dateTwo, true);
  }

  public static maxDate(dateOne: Date, dateTwo: Date): Date {
    return this.getMinOrMaxDate(dateOne, dateTwo, false);
  }

  private static getMinOrMaxDate(dateOne: Date, dateTwo: Date, min: boolean): Date {
    dateOne = this.toDate(dateOne);
    dateTwo = this.toDate(dateTwo);

    if (!dateOne && !dateTwo) {
      return;
    }

    if (!dateOne) {
      return dateTwo;
    }

    if (!dateTwo) {
      return dateOne;
    }

    const compare = dateOne.getTime() - dateTwo.getTime();

    if (compare > 0) {
      return min ? dateTwo : dateOne;
    } else {
      return min ? dateOne : dateTwo;
    }
  }

  public static getDateToIncluded(dateToExcluded: Date): Date {
    if (!dateToExcluded) {
      return null;
    }

    if (StringHelper.getISODate(dateToExcluded) === '9999-12-31') {
      return dateToExcluded;
    } else {
      return DateHelper.addDays(dateToExcluded, -1);
    }
  }

  public static getDateToExcluded(dateToIncluded: Date): Date {
    if (!dateToIncluded) {
      return null;
    }

    if (StringHelper.getISODate(dateToIncluded) === '9999-12-31') {
      return dateToIncluded;
    } else {
      return DateHelper.addDays(dateToIncluded, 1);
    }
  }

  public static getAgeFullYearsOfPerson(birthDate: Date) {

    birthDate = this.toDate(birthDate);
    if (!birthDate) {
      return 0;
    }

    const dayOfYearBirthDate = (Date.UTC(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate()) -
                                Date.UTC(birthDate.getFullYear(), 0, 0))
                                / 24 / 60 / 60 / 1000;

    const currentDate = new Date();
    const dayOfYearCurrentDate = (Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) -
                                  Date.UTC(currentDate.getFullYear(), 0, 0))
                                  / 24 / 60 / 60 / 1000;

    return new Date().getFullYear() - birthDate.getFullYear() - (dayOfYearBirthDate > dayOfYearCurrentDate ? 1 : 0);
  }

  public static durationInDays(startDate: Date, endDate: Date, includeLastDay: boolean = false): number {
    startDate = this.toDate(startDate);
    endDate = this.toDate(endDate);

    if (!startDate || !endDate) {
      return null;
    }

    if (includeLastDay) {
      endDate = this.addDays(endDate, 1);
    }

    return Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
  }

  // формат возврата '1 мес. 10 дн.'
  public static durationInMonthsAndDays(startDate: Date, endDate: Date, includeLastDay: boolean = false): string {
    startDate = this.toDate(startDate);
    endDate = this.toDate(endDate);

    if (!startDate || !endDate) {
      return '';
    }

    let countMonth = 0;
    let tempDate = this.toDate(startDate);

    while (this.addMonths(tempDate, 1).getTime() - endDate.getTime() <= 0) {
      countMonth += 1;
      tempDate = this.addMonths(tempDate, 1);
    }

    const countDays = this.durationInDays(this.addMonths(startDate, countMonth), endDate, includeLastDay);

    return countMonth + ' мес. ' + countDays + ' дн.';
  }
}
