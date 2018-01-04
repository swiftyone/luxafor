import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble';
import { ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Injectable()
export class LuxaforProvider {
  opts = new Uint8Array(8);
  constructor(private ble: BLE, private toastCtrl: ToastController, private storage: Storage) {
    this.opts[0] = 0xa1;
    this.opts[1] = 0xff;
    this.opts[2] = 0xff; // r
    this.opts[3] = 0xff; // g
    this.opts[4] = 0xff; // b
    this.opts[5] = 0x10;
    this.opts[6] = 0x10;
    this.opts[7] = 0x10;
  }

  setColor(rgb, brightness): Promise<any> {
    return new Promise((resolve, reject) => {
      this.storage.get('deviceid').then(deviceid => {
        this.ble.isConnected(deviceid).then(data => {
          rgb.forEach((elem, index) => {
            switch (elem) {
              case true:
              this.opts[index + 2] = brightness;
              break;
              case false:
              this.opts[index + 2] = 0;
            }
          });
          this.ble.writeWithoutResponse(deviceid, '1234', '1235', this.opts.buffer).then(()=> {
            resolve();
          }).catch(data => {
            reject();
          });
        }).catch(data => {
          reject();
        });
      });
    });
  }

  setLuxname(name) {
    this.storage.set('luxname', name);
  }
  getLuxname() {
    return this.storage.get('luxname');
  }

  isConnected() {
    return this.storage.get('deviceid').then(deviceid => {
      return this.ble.isConnected(deviceid);
    });
  }

  connectLuxafor(name): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this.ble.scan([], 5).subscribe(device => {
          if (device.name == name) {
            this.ble.connect(device.id).subscribe(data => {
              console.log('Connected');
              this.storage.set('deviceid', device.id);
              resolve(data);
            });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnectLuxafor() {
    return this.storage.get('deviceid').then(deviceid => {
      return this.ble.disconnect(deviceid);
    });
  }

  checkBluetooth(): Promise<any> {
    return this.ble.isEnabled()
    .then(data => {
      // this.showToast(String(data));
    }).catch(data => {
      return this.ble.enable().then(data => {
        this.showToast(String(data));
      }).catch(data => {
        this.showToast(String(data));
        return Promise.reject(data);
      });
    });
  }

  showToast(message) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }
}