import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding } from '@ionic/angular';

import { OffersService } from '../offers.service';
import { Offers } from '../offers.model';
import { Place } from '../places.model';
import { PlacesService } from '../places.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {
  isLoading = true;
  offers: Place[] = [];
  private placesSub: Subscription;
  constructor(private OfferService: OffersService, private router: Router, private placeService: PlacesService) { }

  ngOnInit() {
    this.placesSub = this.placeService.places.subscribe((places) => {
      this.offers = places;
    });
  }
  
  // ionic life cycle hooks
  ionViewWillEnter() {
    this.isLoading = true;
    this.placeService.fetchPlaces().subscribe((places) =>{
      this.isLoading = false;
    });
  }

  onEditItem(offerId: string, slidingItem: IonItemSliding) {
    this.router.navigateByUrl('/places/tabs/offers/edit/' + offerId);
    slidingItem.close();
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }

}



