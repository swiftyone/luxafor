import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  goRegister() {
    document.getElementById('register').style.opacity = '1';
    document.getElementById('register').style.visibility = 'visible';
    document.getElementById('login').style.opacity = '0';
    document.getElementById('login').style.visibility = 'hidden';
  }

  goLogin() {
    document.getElementById('login').style.opacity = '1';
    document.getElementById('login').style.visibility = 'visible';
    document.getElementById('register').style.opacity = '0';
    document.getElementById('register').style.visibility = 'hidden';
  }
}
