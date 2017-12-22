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
  brightness: number = 200;
  activeColor: string;
  rgb: Array<boolean> = [true, true, true];
  colors = [{
    id: 'white',
    rgb: [true, true, true]
  },{
    id: 'green',
    rgb: [false, true, false]
  },{
    id: 'yellow',
    rgb: [true, true, false]
  },{
    id: 'red',
    rgb: [true, false, false]
  },{
    id: 'purple',
    rgb: [true, false, true]
  },{
    id: 'blue',
    rgb: [false, false, true]
  },{
    id: 'cyan',
    rgb: [false, true, true]
  },{
    id: 'none',
    rgb: [false, false, false]
  }]
  constructor(public navCtrl: NavController, private luxaforProvider: LuxaforProvider) {
    // set luxname
    this.luxaforProvider.getLuxname().then((name) => {
      this.luxname = name;
    }).catch((err) => {
      this.luxaforProvider.showToast(err);
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

  setColor(rgb, colorid) {
    this.rgb = rgb;
    this.activeColor = colorid;
    this.luxaforProvider.setColor(rgb, this.brightness);
  }

  changeBrightness() {
    this.luxaforProvider.setColor(this.rgb, this.brightness);
  }
}
