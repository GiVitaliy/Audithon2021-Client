export class AgGridLocalization {

  static localizationObj = {
    // for filter panel
    page: 'Страница',
    more: 'Еще',
    to: 'по',
    of: 'из',
    next: 'далее',
    last: 'в конец',
    first: 'в начало',
    previous: 'назад',
    loadingOoo: 'Загрузка...',

    // for set filter
    selectAll: 'Выбрать все',
    searchOoo: 'Поиск...',
    blanks: 'Пусто',

    // for number filter and text filter
    filterOoo: 'Фильтр...',
    applyFilter: 'Применить фильтр...',
    equals: 'равно',
    notEquals: 'не равно',

    // for number filter
    lessThan: 'меньше',
    greaterThan: 'больше',
    lessThanOrEqual: 'меньше или равно',
    greaterThanOrEqual: 'больше или равно',
    inRange: 'в диапазоне',

    // for text filter
    contains: 'включает',
    notContains: 'не включает',
    startsWith: 'начинается с',
    endsWith: 'заканчивается на',

    // the header of the default group column
    group: 'Группа',

    // tool panel
    columns: 'Колонки',
    filters: 'Фильтры',
    rowGroupColumns: 'Группировка по строкам',
    rowGroupColumnsEmptyMessage: 'Перетащите для группировки',
    valueColumns: 'Значения',
    pivotMode: 'Pivot-режим',
    groups: 'Группы',
    values: 'Значения',
    pivots: 'Pivot-таблицы',
    valueColumnsEmptyMessage: 'Перетащите колонки для группировки',
    pivotColumnsEmptyMessage: 'Перетащите для Pivot',
    toolPanelButton: 'Кнопка панели инструментов',

    // other
    noRowsToShow: 'Строки отсутствуют',

    // enterprise menu
    pinColumn: 'Закрепить колонку',
    valueAggregation: 'Группировать значения',
    autosizeThiscolumn: 'Авторазмер колонки',
    autosizeAllColumns: 'Авторазмер всех колонок',
    groupBy: 'Группировать',
    ungroupBy: 'Разгруппировать',
    resetColumns: 'Очистить формат',
    expandAll: 'Распахнуть все',
    collapseAll: 'Схлопнуть все',
    toolPanel: 'Панель инструментов',
    export: 'Экспорт',
    csvExport: 'Экспорт в csv',
    excelExport: 'Экспорт в Excel',

    // enterprise menu pinning
    pinLeft: 'Прикрепить слева',
    pinRight: 'Прикрепить справа',
    noPin: 'Открепить',

    // enterprise menu aggregation and status bar
    sum: 'Сумма',
    min: 'Мин',
    max: 'Макс',
    none: 'Нет',
    count: 'Количество',
    average: 'Среднее',

    // standard menu
    copy: 'Копировать',
    copyWithHeaders: 'Копировать с заголовками',
    ctrlC: 'Ctrl-C',
    paste: 'Вставить',
    ctrlV: 'Ctrl-V'
  };

  public static getLocalization(key: any, defaultVal: any) {
    return AgGridLocalization.localizationObj[key] || defaultVal;
  }
}
