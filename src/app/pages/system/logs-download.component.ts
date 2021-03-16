import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MetadataService} from '../../logic/services/metadata.service';
import {environment} from '../../../environments/environment';
import {DateHelper} from '../../helpers/date-helper';
import {StringHelper} from '../../helpers/string-helper';
import {FormHelper} from '../../ui/controls/form-helper';
import {serverSideErrorsValidator} from '../../logic/validators/server-side-errors-validator.directive';

@Component({
  templateUrl: './logs-download.component.html'
})
export class LogsDownloadComponent implements OnInit {

  contextFormGroup: FormGroup;
  processing = false;

  constructor(private fb: FormBuilder,
              private metadataService: MetadataService) {
  }

  ngOnInit(): void {
    this.contextFormGroup = this.fb.group({
      'dateFrom': [StringHelper.getISODateWithHourMinute(new Date()),
        Validators.compose([Validators.required, FormHelper.validateDateTimePicker()])],
      'dateTo': [StringHelper.getISODateWithHourMinute(new Date()),
        Validators.compose([Validators.required, FormHelper.validateDateTimePicker()])]
    });
  }

  download() {
    if (!this.contextFormGroup.valid) {
      return;
    }

    this.processing = true;

    this.metadataService.prepareLogsZip(
      this.contextFormGroup.get('dateFrom').value,
      this.contextFormGroup.get('dateTo').value
    ).subscribe(fileHash => {
        window.open(environment.api + '/files/get?preloadId=' + encodeURIComponent(fileHash));
      },
      () => {
        this.processing = false;
      },
      () => {
        this.processing = false;
      });
  }
}
