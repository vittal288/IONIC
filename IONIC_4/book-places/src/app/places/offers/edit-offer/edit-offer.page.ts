import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';

import { PlacesService } from '../../places.service';
import { Place } from '../../places.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit {
  place: Place;
  newOfferEditForm: FormGroup;
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

      this.newOfferEditForm = new FormGroup({
        title: new FormControl(this.place.title, {
          updateOn: 'blur',
          validators: [Validators.required]
        }),
        description: new FormControl(this.place.description, {
          updateOn: 'blur',
          validators: [Validators.required, Validators.maxLength(180)]
        })
      });
    });
  }

  onUpdateOffer() {
    if(!this.newOfferEditForm.valid){
      return;
    }
    console.log('creting offer page', this.newOfferEditForm);
  }
}
