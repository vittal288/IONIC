import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

import { PlacesService } from '../../places.service';
import { Place } from '../../places.model';
@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit {
  place: Place;
  constructor(private activatedRoute: ActivatedRoute, private placeService: PlacesService, private navCtrl: NavController) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(paramMap => {
      // if(!paramMap.hasOwnProperty('placeId')){
      //   this.selectedPlaceId = paramMap.get('placeId');
      //   this.navCtrl.navigateBack(`/places/tabs/offers/${this.selectedPlaceId}`);
      //   return;
      // }
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack(`/places/tabs/offers`);
        return;
      }
     
      this.place = this.placeService.getPlace( paramMap.get('placeId'));
    });
  }

}
