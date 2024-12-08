import { Injectable } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable()
export class AppPageTitleStrategy extends TitleStrategy {
  override updateTitle(routerState: RouterStateSnapshot): void {
    let pageTitle = this.buildTitle(routerState);
    if (!pageTitle) {
      pageTitle = 'Demo J Hipster Keycloack 2';
    }
    document.title = pageTitle;
  }
}
