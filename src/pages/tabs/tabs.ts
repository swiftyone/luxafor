import { Component } from '@angular/core';

import { LuxaforPage } from '../luxafor/luxafor';
import { TimePage } from '../time/time';
import { TeamPage } from '../team/team';
import { NotificationsPage } from '../notifications/notifications';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = TeamPage;
  tab2Root = LuxaforPage;
  tab3Root = TimePage;
  tab4Root = NotificationsPage;

  constructor() {

  }
}
