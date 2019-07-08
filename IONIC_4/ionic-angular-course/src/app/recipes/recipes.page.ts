import { Component, OnInit, OnDestroy } from '@angular/core';

import { Recipe } from './recipe.model';
import { RecipesService } from './recipes.service';
@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.page.html',
  styleUrls: ['./recipes.page.scss'],
})
export class RecipesPage implements OnInit, OnDestroy {
  public recipes: Recipe[];
  constructor(private recipeService: RecipesService) {
  }

  ngOnInit() {
    console.log('RECIPES', this.recipes);
  }

  // ionic life cycles
  ionViewWillEnter() {
    console.log('ionViewWillEnter');
    this.recipes = this.recipeService.getAllRecipes();
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter');
  }


  ionViewWillLeave() {
    console.log('ionViewWillLeave');
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave');
  }

  ngOnDestroy() {
    console.log('ngOnDestroy');
  }

}
