import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { FormEntryModule } from './form-entry/form-entry.module';
// import { removeNgStyles, createNewHosts } from '@angularclass/hmr';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    ReactiveFormsModule,
    FormsModule,
    FormEntryModule
    // Note: do not import any module needed by form-entry!!!
     // instead import it in {{ src/app/form-entry/form-entry.module.ts}}
  ],
  declarations: [
    AppComponent
  ],
  providers: [
     // please do not import any form-entry service here!!!
     // instead import it in {{ src/app/form-entry/form-entry.module.ts}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(public appRef: ApplicationRef) { }
  // hmrOnInit(store) {
  //   console.log('HMR store', store);
  // }
  // hmrOnDestroy(store) {
  //   let cmpLocation = this.appRef.components.map(cmp => cmp.location.nativeElement);
  //   // recreate elements
  //   store.disposeOldHosts = createNewHosts(cmpLocation);
  //   // remove styles
  //   removeNgStyles();
  // }
  // hmrAfterDestroy(store) {
  //   // display new elements
  //   store.disposeOldHosts();
  //   delete store.disposeOldHosts;
  // }
}
