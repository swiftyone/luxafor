import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { HttpClientModule } from '@angular/common/http';
import { LuxaforPage } from '../pages/luxafor/luxafor';
import { TimePage } from '../pages/time/time';
import { TeamPage } from '../pages/team/team';
import { TabsPage } from '../pages/tabs/tabs';
import { LoginPage } from '../pages/login/login';
import { ProfilePage } from '../pages/profile/profile';
import { SettingsPage } from '../pages/settings/settings';
import { NotificationsPage } from '../pages/notifications/notifications';
import { BLE } from '@ionic-native/ble';
import { IonicStorageModule } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LuxaforProvider } from '../providers/luxafor/luxafor';
import { FirebaseProvider } from '../providers/firebase/firebase';
import { GravatarPipe } from './pipes/gravatarPipe';
import { MinuteSecondPipe } from './pipes/minuteSecondPipe';
import { Firebase } from '@ionic-native/firebase';
import { AnalyticsProvider } from '../providers/analytics/analytics';
import { PushProvider } from '../providers/push/push';
import { StorageProvider } from '../providers/storage/storage';
import { config } from './environment/config';

@NgModule({
  declarations: [
    MyApp,
    LuxaforPage,
    TimePage,
    TeamPage,
    TabsPage,
    LoginPage,
    SettingsPage,
    ProfilePage,
    NotificationsPage,
    GravatarPipe,
    MinuteSecondPipe,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      tabsHideOnSubPages: true,
    }),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(config.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LuxaforPage,
    TimePage,
    TeamPage,
    TabsPage,
    LoginPage,
    SettingsPage,
    ProfilePage,
    NotificationsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    BLE,
    LuxaforProvider,
    FirebaseProvider,
    Firebase,
    AnalyticsProvider,
    PushProvider,
    StorageProvider
  ]
})
export class AppModule {}
