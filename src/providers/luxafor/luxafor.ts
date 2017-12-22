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

  setColor(r, g, b) {
    this.storage.get('deviceid').then(deviceid => {
      this.ble.isConnected(deviceid).then(data => {
        this.opts[2] = parseInt(r, 16);
        this.opts[3] = parseInt(g, 16);
        this.opts[4] = parseInt(b, 16);
        this.ble.writeWithoutResponse(deviceid, '1234', '1235', this.opts.buffer).then(()=> {
          // success
        }).catch(data => {
          this.showToast('Didn\'t work');
        });
      }).catch(data => {
        this.showToast(data);
      });
    });
  }

  setLuxname(name) {
    this.storage.set('luxname', name);
  }
  getLuxname() {
    return this.storage.get('luxname');
  }

  connectLuxafor(name) {
    this.ble.scan([], 5).subscribe(device => {
      if (device.name == name) {
        this.ble.connect(device.id).subscribe(data => {
          this.storage.set('deviceid', device.id);
          this.showToast('Connected!');
          return Promise.resolve();
        });
      }
    });
  }

  checkBluetooth(): Promise<any> {
    return this.ble.isEnabled()
    .then(data => {
      this.showToast(String(data));
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
