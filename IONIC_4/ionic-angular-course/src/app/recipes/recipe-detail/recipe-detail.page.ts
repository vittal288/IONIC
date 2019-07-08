import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';


import { RecipesService } from '../recipes.service';
import { Recipe } from '../recipe.model';



@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.page.html',
  styleUrls: ['./recipe-detail.page.scss'],
})
export class RecipeDetailPage implements OnInit, OnDestroy {
  loadedRecipe: Recipe;

  constructor(private activatedRoute: ActivatedRoute,
    private recipeService: RecipesService,
    private router: Router,
    private alertControl: AlertController) {
    //
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe((paramMap) => {
      if (!paramMap.has('recipeId')) {
        this.router.navigate(['/recipes']);
        return;
      }
      const recipeId = paramMap.get('recipeId');// recipedId which is defined in app-routing.module
      // console.log('RECIPE', this.recipeService.getRecipe(recipeId));
      this.loadedRecipe = this.recipeService.getRecipe(recipeId)
    });
  }

  onDeleteRecipeHandler() {
    this.alertControl.create({
      header: 'Are You Sure ?',
      message: 'Do you really want to delete the recipe ?',
      buttons: [{
        text: 'Cancel',
        role: 'cancel'
      }, {
        text: 'Delete',
        handler: () => {
          this.recipeService.deleteRecipe(this.loadedRecipe.id);
          this.router.navigate(['/recipes']);
        }
      }]
    }).then((alertElement) => {
      alertElement.present();
    });
  }



  // ionic life cycles
  ionViewWillEnter() {
    console.log('ionViewWillEnter');
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
