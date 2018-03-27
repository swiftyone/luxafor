import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable()
export class StorageProvider {

  constructor(public storage: Storage) {}

  setStorageUid(uid) {
    this.storage.set('uid', uid);
  }
  getStorageUid() {
    return this.storage.get('uid');
  }
  setStorageActiveColor(num: number) {
    return this.storage.set('activeColor', num);
  }
  getStorageActiveColor() {
    return this.storage.get('activeColor');
  }

}
