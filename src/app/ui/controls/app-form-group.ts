import { FormGroup } from '@angular/forms';

export class AppFormGroup extends FormGroup {
  public docLevelServerSideValidationErrors: any[];
  public submitted = false;
}
