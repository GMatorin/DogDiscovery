import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Account } from 'src/shared/models/account.model';
import { IExploreTile } from 'src/shared/models/explore-tile.model';
import { AccountService } from '../services/account.service';
import { DogApiService } from '../services/dog-api.service';

@Component({
  selector: 'account',
  templateUrl: 'account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  public account$: Observable<Account | null> =
    this.accountService.getAccount();
  public exploreTiles$: Observable<IExploreTile[] | undefined> =
    new Observable();

  constructor(
    private accountService: AccountService,
    private dogApiService: DogApiService,
    private router: Router
  ) {}

  public ngOnInit() {
    this.exploreTiles$ = this.account$.pipe(
      map((acc) => acc?.savedBreeds ?? null),
      switchMap((breeds) => {
        const breedUrls = breeds?.map((breed) =>
          this.dogApiService.getDogPhoto(breed + ' dog')
        );
        return combineLatest([forkJoin(breedUrls), of(breeds)]);
      }),
      map(([photoUrls, breeds]) => {
        const urls = photoUrls;
        return breeds?.map((breed, index) => {
          return {
            breedName: breed,
            imageUrl: urls?.[index] ?? '',
          };
        });
      })
    );
  }

  toBreedDetails(tile: IExploreTile): void {
    this.router.navigate(['/dog-breed', { breedName: tile.breedName }]);
  }
}
