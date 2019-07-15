import { Component, OnInit } from '@angular/core';
import { OffersService } from '../offers.service';
import { Offers } from '../offers.model';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit {
  loadedOffers: Offers[] = [];
  constructor(private OfferService: OffersService) { }

  ngOnInit() {
    this.loadedOffers = this.OfferService.offers;
  }

}



