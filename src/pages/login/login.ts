import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { ToastController } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import { StorageProvider } from '../../providers/storage/storage';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public angularFireAuth: AngularFireAuth, private toastCtrl: ToastController, public fb: FirebaseProvider, public storage: StorageProvider) {
    this.angularFireAuth.authState.subscribe(user => {
      if (user) {
        navCtrl.setRoot(TabsPage);
      }
    })
  }

  login(username, password) {
    this.angularFireAuth.auth.signInWithEmailAndPassword(username, password).then((user) => {
      if (user.emailVerified) {
        this.fb.userExists(user.uid).catch(() => {
          this.fb.addUserByEmail(user.email, user.uid);
        }).then(()=>{
          this.storage.setStorageUid(user.uid);
          this.navCtrl.setRoot(TabsPage);
        });
      } else {
        this.showToast('Email is not verified');
      }
    }).catch(err => {
      this.showToast(err);
    });
  }

  register(email, password, passwordRepeat) {
    this.angularFireAuth.auth.createUserWithEmailAndPassword(email, password).then((res) => {
      this.showToast('register');
      this.sendEmailVerification();
    }).catch((err)=> {
      this.showToast(err);
    });
  }

  sendPassword(email) {
    this.angularFireAuth.auth.sendPasswordResetEmail(email).then(() => {
      this.showToast('Email sent.');
    })
  }

  sendEmailVerification() {
    this.angularFireAuth.authState.subscribe(user => {
      user.sendEmailVerification().then(() => {
        this.showToast('Verification email sent.');
      })
    });
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
    document.getElementById('forgotPassword').style.opacity = '0';
    document.getElementById('forgotPassword').style.visibility = 'hidden';
  }

  goForgotPassword() {
    document.getElementById('forgotPassword').style.opacity = '1';
    document.getElementById('forgotPassword').style.visibility = 'visible';
    document.getElementById('login').style.opacity = '0';
    document.getElementById('login').style.visibility = 'hidden';
  }

  showToast(message) {
    this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    }).present();
  }
}
