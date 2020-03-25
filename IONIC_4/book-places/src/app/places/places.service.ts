import { Injectable } from '@angular/core';

import { Place } from './places.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  constructor(private authService: AuthService) {

  }
  private _places = new BehaviorSubject<Place[]>(

    [
      new Place(
        'p1',
        'Manahattan Mansion',
        'In the heart of Newyork City',
        'https://picsum.photos/id/536/354/354',
        149.99,
        new Date('2019-01-01'),
        new Date('2019-12-31'),
        'abc'
      ),

      new Place('p2',
        'L\'Amour Toujours',
        'Romantic City in Paris',
        'https://picsum.photos/id/536/354/356',
        189.99,
        new Date('2019-01-01'),
        new Date('2019-12-31'),
        'abc'
      ),
      new Place('p3',
        'The Foggy Palace',
        'Not your average city trip',
        'https://picsum.photos/id/536/355/354',
        99.9,
        new Date('2019-01-01'),
        new Date('2019-12-31'),
        'abc'
      )
    ]
  );



  get places() {
    return this._places.asObservable();
  }

  getPlace(id: string) {
    return this.places.pipe(take(1), map((places) => {
      return { ...places.find(place => place.id === id) };
    }));
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
    const newPlace = new Place(
      Math.random().toString(),
      title,
      description,
      'https://picsum.photos/id/536/354/354',
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );

    return this.places.pipe(take(1), delay(1000), tap((places) => {
      this._places.next(places.concat(newPlace));
    }));
  }

  updatePlace(placeId: string, title: string, description: string) {
    return this.places.pipe(
      take(1),
      delay(1000),
      tap((places) => {
      const index = places.findIndex(pl => pl.id === placeId);
      const updatedPlaces = [...places];
      const oldPlace = updatedPlaces[index];
      updatedPlaces[index] = new Place(placeId,
        title,
        description,
        oldPlace.imageUrl,
        oldPlace.price,
        oldPlace.availableFrom,
        oldPlace.availableTo,
        oldPlace.userId
      );
      this._places.next(updatedPlaces);
    }));
  }



}
