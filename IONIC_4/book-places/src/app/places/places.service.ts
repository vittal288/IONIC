import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { take, map, tap, switchMap } from 'rxjs/operators';
import { BehaviorSubject, of, pipe } from 'rxjs';

import { Place } from './places.model';
import { AuthService } from '../auth/auth.service';
import { PlaceLocation } from './location.model';

interface PlaceDataModel {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: 'root'
})

export class PlacesService {
  constructor(private authService: AuthService, private readonly http: HttpClient) {

  }
  private _places = new BehaviorSubject<Place[]>([]);
  private fireBaseURL = 'https://ionic-angular-f34a9.firebaseio.com/offered-places';

  get places() {
    return this._places.asObservable();
  }


  uploadImage(image: File) {
    // formData is JS object, which we can use for to merge different kind of data like file and text and send to http request 
    const uploadData = new FormData();
    uploadData.append('image', image);
    return this.authService.token.pipe(take(1), switchMap(token => {
      const fireBaseImageUploadURL = 'https://us-central1-ionic-angular-f34a9.cloudfunctions.net/storeImage';
      return this.http.post<{ imageUrl: string, imagePath: string }>(fireBaseImageUploadURL, 
        uploadData, {
          headers: {
            Authorization : 'Bearer ' + token
          }
        }
      );
    }));
  }

  addPlace(title: string,
           description: string,
           price: number,
           dateFrom: Date,
           dateTo: Date,
           location: PlaceLocation,
           imageUrl: string) {
    let generatedId: string;
    let newPlace: Place;
    let fetchedUserId: string;
    
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        if (!userId) {
          throw new Error('User id is not found !!');
        }
        fetchedUserId = userId;
        // returning new observable 
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
        if (!token) {
          throw new Error('User is not valid !!');
        }
        newPlace = new Place(
          Math.random().toString(),
          title,
          description,
          imageUrl,
          price,
          dateFrom,
          dateTo,
          fetchedUserId,
          location
        );
        return this.http.post<{ name: string }>(
          `${this.fireBaseURL}.json?auth=${token}`, { ...newPlace, id: null });
      }), // switchMap operates on existing observable{which is returns from http.post method} and returns new observable 
    switchMap(resultData => {
        generatedId = resultData.name;
        return this.places;
      }),
    take(1),
      // tap is operating on observable which is returns from switchMap
    tap(places => {
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace));
      }));
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    let fetchedToken:string;
    return this.authService.token.pipe(
      take(1),
      switchMap( token => {
        fetchedToken = token;
        return this.places;
      }),
      // take operator take latest snapshot of places array
      take(1),
      // if there are no places on load
      switchMap(places => {
        if (places && places.length <= 0) {
          return this.fetchPlaces();
        } else {
          // of operator, takes any value like places and returns immediate observable
          return of(places);
        }
      }),
      switchMap(places => {
        const index = places.findIndex(pl => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[index];
        updatedPlaces[index] = new Place(placeId,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          new Date(oldPlace.availableFrom),
          new Date(oldPlace.availableTo),
          oldPlace.userId,
          oldPlace.location
        );
        return this.http.put(
            `${this.fireBaseURL}/${placeId}.json?auth=${fetchedToken}`, { ...updatedPlaces[index], id: null });
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }

  fetchPlaces() {
    // updating get method with generic return type
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.get<{ [key: string]: PlaceDataModel }>(
          `${this.fireBaseURL}.json?auth=${token}`
          );
      }),
      // map operator operates on existing observable data and returns the same observable with restructured response data 
      map(resData => {
        const places = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            places.push(
              new Place(
                key,
                resData[key].title,
                resData[key].description,
                resData[key].imageUrl,
                resData[key].price,
                new Date(resData[key].availableFrom),
                new Date(resData[key].availableTo),
                resData[key].userId,
                resData[key].location
              )
            );
          }
        }
        return places;
      }),
      tap(places => {
        this._places.next(places);
      })
    );
  }

  getPlace(id: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap( token => {
        return this.http.get<PlaceDataModel>(`
          ${this.fireBaseURL}/${id}.json?auth=${token}`);
      }),
      map(resData => {
        return new Place(
          id,
          resData.title,
          resData.description,
          resData.imageUrl,
          resData.price,
          new Date(resData.availableFrom),
          new Date(resData.availableTo),
          resData.userId,
          resData.location
        );
      })
    );
  }

}
