import { Injectable } from '@angular/core';

@Injectable()
export class DataCachingService {
  cacheObj = {};

  addToCache(branch: string,
             key: string,
             data: any,
             maxCacheSize: number = 50) {
    if (!this.cacheObj[branch]) {
      this.cacheObj[branch] = {};
    }

    const branchObj = this.cacheObj[branch];

    let countKeys = 0;
    for (const x in branchObj) {
      if (branchObj.hasOwnProperty(x)) {
        countKeys++;
      }
    }

    if (countKeys >= maxCacheSize) {
      const dataToRemove = [];
      for (const x in branchObj) {
        if (branchObj.hasOwnProperty(x)) {
          dataToRemove.push({key: x, time: branchObj[x].time});
        }
      }
      dataToRemove.sort((item1, item2) => item1.time - item2.time);

      const itemsToRemove = Math.min(2, maxCacheSize / 5, dataToRemove.length);
      for (let i = 0; i < itemsToRemove; i++) {
        delete branchObj[dataToRemove[i].key];
      }
    }

    branchObj[key] = {data: data, time: new Date().getTime()};
  }

  getCachedData(branch: string,
                key: string): any {
    if (this.cacheObj[branch] && this.cacheObj[branch][key]) {
      return this.cacheObj[branch][key].data;
    }
  }

  removeCachedData(branch: string,
                   key: string): any {
    if (this.cacheObj[branch] && this.cacheObj[branch][key]) {
      delete this.cacheObj[branch][key];
    }
  }
}
