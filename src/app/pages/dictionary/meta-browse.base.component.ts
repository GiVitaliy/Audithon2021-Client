import { OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '../../ui/infrastructure/alert.service';
import { GlobalWaitingOverlayService } from '../../ui/infrastructure/global-waiting-overlay.service';
import { MetadataService } from '../../logic/services/metadata.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormHelper } from '../../ui/controls/form-helper';
import { Observable } from 'rxjs';
import { LookupSourceService } from '../../logic/services/lookup-source.service';

export abstract class MetaBrowseBaseComponent implements OnInit {

  _searchResults: any[] = [];

  currentFormGroup: FormGroup;
  currentOriginalId: number;
  currentIsNew = false;
  editModalOpened = false;

  isInvalid = FormHelper.isInvalid;

  constructor(protected route: ActivatedRoute,
              protected metadataService: MetadataService,
              protected alertService: AlertService,
              protected globalWaitingOverlayService: GlobalWaitingOverlayService,
              protected lookupService: LookupSourceService,
              protected fb: FormBuilder) {
  }

  abstract getMetaName(): string;

  abstract getMetaTitle(): string;

  abstract getGroupDef(row: any): any;

  getId(formGroup: FormGroup): any {
    return formGroup.get('id').value;
  }

  refreshResults() {
    this.globalWaitingOverlayService.StartWaiting();

    this.metadataService.getMetadata(this.getMetaName()).subscribe({
      next: data => {
        this._searchResults = data;
        this.lookupService.invalidateLookup(this.getMetaName());
        this.globalWaitingOverlayService.EndWaiting();
      }, error: () => {
        this.globalWaitingOverlayService.EndWaiting();
      }
    });
  }

  ngOnInit() {

    this.route.paramMap
      .subscribe(() => {

        this._searchResults = [];

        this.refreshResults();
      });
  }

  editRow(row: any) {
    this.currentFormGroup = this.fb.group(this.getGroupDef(row));
    const id = this.getId(this.currentFormGroup);

    // Запоминаем изначальный id для обработки такого сценария: открыли, поменяли id, нажали удалить/сохранить,
    // и сервер попытается удалить/обновить запись уже с этим новым id, хотя в базе запись еще со старым id.
    // А так мы серверу передадим изначальный id, а новый id будет лежать в dto.
    this.currentOriginalId = id;

    this.currentIsNew = !id && id !== 0;

    if (!this.currentIsNew) {
      this.metadataService.getMetadataSingle(this.getMetaName(), id).subscribe(detailedRec => {
        this.currentFormGroup = this.fb.group(this.getGroupDef(detailedRec));
        this.editModalOpened = true;
      });
    } else {
      this.editModalOpened = true;
    }
  }

  addEditCompleted() {

    FormHelper.markAsSubmitted(this.currentFormGroup);

    if (!this.currentFormGroup.valid) {
      return;
    }

    this.editModalOpened = false;

    const storingObs: Observable<any> = this.currentIsNew
      ? this.metadataService.createMeta(this.getMetaName(), this.currentFormGroup.value)
      : this.metadataService.updateMeta(this.getMetaName(), this.currentFormGroup.value, this.currentOriginalId);

    storingObs.subscribe(() => {
      this.refreshResults();
    });
  }

  delete(row: any) {

    this.alertService.confirmModal('Удалить выбранную запись?').subscribe(val => {
      if (val) {
        this.metadataService.deleteMeta(this.getMetaName(), this.currentOriginalId)
          .subscribe(() => {
            this.editModalOpened = false;
            this.refreshResults();
          });
      }
    });
  }
}
