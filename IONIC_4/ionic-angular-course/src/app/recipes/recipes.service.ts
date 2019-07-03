import { Injectable } from '@angular/core';

import { Recipe } from './recipe.model';
@Injectable({
  providedIn: 'root'
})
export class RecipesService {
  private recipes: Recipe[] = [
    {
      id: 'r1',
      title: 'Schnitzel',
      imagUrl: 'https://image.shutterstock.com/image-photo/chicken-schnitzel-on-plate-over-600w-777098467.jpg',
      ingredients: ['French Fries', 'Pork Meat', 'Salad']
    },
    {
      id: 'r2',
      title: 'Spaghetti',
      imagUrl: 'https://image.shutterstock.com/image-photo/tasty-appetizing-classic-italian-spaghetti-600w-1119580967.jpg',
      ingredients: ['Spaghetti', 'Meat', 'Tomatoes']
    }
  ];
  constructor() { }

  getAllRecipes() {
    return [...this.recipes]; // clone of an array using spread operator 
  }

  getRecipe(recipeId: string) {
    return {
      ...this.recipes.find(recipe => {
        return recipe.id === recipeId;
      })
    };
  }

  deleteRecipe(recipeId: string) {
    console.log('RECIEP ID', recipeId);
    this.recipes = this.recipes.filter((item) => {
      return item.id !== recipeId
    });
  }

}
