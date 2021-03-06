import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatListModule} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import {MatLineModule} from "@angular/material/core";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatTabsModule} from "@angular/material/tabs";
import {NoRecordComponent} from "./components/no-record/no-record.component";
import {AvatarComponent} from "./components/avatar/avatar.component";
import {FromNowPipe} from "./pipes/from-now.pipe";
import {MatMenuModule} from "@angular/material/menu";
import {MatDialogModule} from "@angular/material/dialog";
import {ImagePreviewComponent} from "./components/image-preview/image-preview.component";
import {ReadFilePipe} from './pipes/read-file.pipe';

@NgModule({
  exports: [
    CommonModule,
    MatCardModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatListModule,
    MatIconModule,
    MatLineModule,
    MatSidenavModule,
    MatTabsModule,
    NoRecordComponent,
    FormsModule,
    AvatarComponent,
    FromNowPipe,
    MatMenuModule,
    MatDialogModule,
    ReadFilePipe
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatToolbarModule
  ],
  declarations: [
    NoRecordComponent,
    AvatarComponent,
    FromNowPipe,
    ImagePreviewComponent,
    ReadFilePipe
  ],
  entryComponents: [ImagePreviewComponent]
})
export class SharedModule {}
