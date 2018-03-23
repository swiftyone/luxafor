import { Injectable } from '@angular/core';
import { BLE } from '@ionic-native/ble';
import { ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

@Injectable()
export class LuxaforProvider {
  opts = new Uint8Array(8);
  colors = [
    [true, true, true],
    [false, true, false],
    [true, true, false],
    [true, false, false],
    [true, false, true],
    [false, false, true],
    [false, true, true],
    [false, false, false]
  ]
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

  setColor(index, brightness): Promise<any> {
    return this.storage.get('deviceid').then(deviceid => {
      return this.ble.isConnected(deviceid).then(data => {
        let rgb = this.colors[index];
        rgb.forEach((elem, index) => {
          switch (elem) {
            case true:
            this.opts[index + 2] = brightness;
            break;
            case false:
            this.opts[index + 2] = 0;
          }
        });
        return this.ble.write(deviceid, '1234', '1235', this.opts.buffer);
      });
    });
  }

  read() {
    return this.storage.get('deviceid').then(deviceid => {
      return this.ble.read(deviceid, '1800', '2A00');
    });
  }

  notification() {
    return this.storage.get('deviceid').then(deviceid => {
      return this.ble.isConnected(deviceid).then(data => {
        return this.ble.startNotification(deviceid, '1234', '1236');
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

  connectLuxafor(name: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this.ble.startScanWithOptions(['1234'], {name: name}).subscribe(device => {
          this.ble.connect(device.id).subscribe(data => {
            this.storage.set('deviceid', device.id);
            resolve(data);
            this.ble.stopScan();
          }, err => {
            this.ble.stopScan();            
            this.showToast('Verbindung nicht möglich oder unterbrochen');
            reject(err);
          });
        });
        setTimeout(() => {
          this.ble.stopScan();
          this.isConnected().catch(err => {
            this.showToast('Gerät nicht gefunden');
            reject(err);
          });
        }, 5000);
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
    return this.ble.isEnabled();
  }

  enableBluetooth(): Promise<any> {
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
      position: 'bottom'
    });
    toast.present();
  }

  storeShowColors(data) {
    this.storage.set('showColors', data);
  }
  getShowColors() {
    return this.storage.get('showColors');
  }
}
