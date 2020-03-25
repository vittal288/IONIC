import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';


import { PlacesService } from '../../places.service';
import { Place } from '../../places.model';

@Component({
  selector: 'app-offer-bookings',
  templateUrl: './offer-bookings.page.html',
  styleUrls: ['./offer-bookings.page.scss'],
})
export class OfferBookingsPage implements OnInit, OnDestroy {
  place: Place;
  placeSub: Subscription;
  constructor(private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private placeService: PlacesService) {
    //
  }

  ngOnInit() {
    // subscribe will always produces the latest value of route params , even though ngOnInt method did not invoked 
    this.activatedRoute.params.subscribe((paramMap) => {
      console.log('PARAMS', paramMap);
      if (!paramMap.hasOwnProperty('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
      this.placeSub = this.placeService.getPlace(this.activatedRoute.snapshot.paramMap.get('placeId')).subscribe((place) => {
        this.place = place;
      });
    });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }

}
