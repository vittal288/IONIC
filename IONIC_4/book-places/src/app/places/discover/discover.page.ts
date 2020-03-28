import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';

import { PlacesService } from '../places.service';
import { Place } from '../places.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  relevantPlaces: Place[];
  listedLoadedPlaces: Place[];
  private placeSub: Subscription;
  isLoading = false;

  constructor(private placesService: PlacesService,
              private menuCtrl: MenuController,
              private readonly authService : AuthService) { }

  ngOnInit() {
    this.placeSub = this.placesService.places.subscribe((places) => {
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() =>{
      this.isLoading = false;
    });
  }

  // onMenuOpen(){
  //   this.menuCtrl.open();
  // }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    console.log('Event', event.detail);
    if (event.detail.value === 'all') {
      this.relevantPlaces = this.loadedPlaces;
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    } else {
      // load the place except which the same user is created 
      this.relevantPlaces = this.loadedPlaces.filter(place => place.userId !== this.authService.userId);
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);

    }
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }

}
