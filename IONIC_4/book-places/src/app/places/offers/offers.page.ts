import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonItemSliding } from '@ionic/angular';

import { OffersService } from '../offers.service';
import { Offers } from '../offers.model';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit {
  loadedOffers: Offers[] = [];
  constructor(private OfferService: OffersService, private router:Router) { }

  ngOnInit() {
    this.loadedOffers = this.OfferService.offers;
  }

  onEditItem(offerId: string , slidingItem: IonItemSliding) {
      console.log('ID', offerId);
      this.router.navigateByUrl('/places/tabs/offers/edit/' + offerId);
      slidingItem.close();
  }

}



