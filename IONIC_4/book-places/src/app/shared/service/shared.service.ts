import { Injectable } from '@angular/core';

import {  environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private googleMapJsSDKUrl = 'https://maps.googleapis.com/maps/api/js?';
  private googleGeoCodingAPI = 'https://maps.googleapis.com/maps/api/geocode/json?';
  constructor() { }



  getGoogleMapSDK(): string {
    return `${this.googleMapJsSDKUrl}key=${environment.googleMapsAPIKey}`;
  }

  getGeoCodingAPIUrl(lat: number, lng: number): string {
    return `${this.googleGeoCodingAPI}latlng=${lat},${lng}&key=${environment.googleMapsAPIKey}`;
  }

  getMapImage(lat: number, lng: number, zoom: number): string {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
    &markers=color:red%7Clabel:Place%7C${lat},${lng}&key=${environment.googleMapsAPIKey}`;
  }
}
