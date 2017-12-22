import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';
import { LuxaforProvider } from '../../providers/luxafor/luxafor';

@Component({
    selector: 'page-luxafor',
    templateUrl: 'luxafor.html'
})
export class LuxaforPage {
  devices = new Array;
  connectColor: string = '#555';
  luxname: string;
  constructor(public navCtrl: NavController, private luxaforProvider: LuxaforProvider) {
    // set luxname
    this.luxaforProvider.getLuxname().then((name) => {
      this.luxname = name;
    }).catch((err) => {
      this.luxaforProvider.showToast(err)
    });
    // set buttoncolor, check bluetooth
    this.luxaforProvider.checkBluetooth().then(() => {
      this.connectColor = '#488aff';
    }).catch(() => {
      this.connectColor = '#f53d3d';
    });
  }

  connect() {
    this.luxaforProvider.checkBluetooth().then(() => {
      this.connectColor = '#488aff';
    }).catch(() => {
      this.connectColor = '#f53d3d';
    });

    this.luxaforProvider.getLuxname().then(name => {
      if (name != this.luxname && this.luxname != '') {
        this.luxaforProvider.setLuxname(this.luxname);
        this.luxaforProvider.connectLuxafor(name);
      }
      else
        this.luxaforProvider.connectLuxafor(name);
    }).catch(() => {
      this.luxaforProvider.setLuxname(this.luxname);
      this.luxaforProvider.connectLuxafor(name);
    });
  }

  setColor(r,g,b) {
    this.luxaforProvider.setColor(r,g,b);
  }
}
