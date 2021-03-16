import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { LookupSourceService } from '../../logic/services/lookup-source.service';
import { FormHelper } from './form-helper';
import { Subject } from 'rxjs';
import { FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'app-text-lookup',
  templateUrl: './app-text-lookup.component.html'
})
export class AppTextLookupComponent implements OnChanges {
  @Input() contextControlName;
  @Input() lookupName;
  @Input() placeholder = '';
  @Input() contextFormGroup;
  @Input() validationTooltipRight = false;
  @Input() validationTooltipTopLeft = false;
  @Input() validationTooltipBottomLeft = false;
  @Input() contextControlId;
  @Input() disabled = false;
  @Output() change = new Subject<any>();
  @Output() blur: EventEmitter<any> = new EventEmitter<any>();
  @Input() sorted = false;
  @Input() required = true;
  @Input() commentsFieldName = '';
  @Input() displayFieldName = 'caption';
  @Input() visibleValidationTextError = true;
  lookupItems = [];
  selectedValueText = '';
  lastLookupSearchText = undefined;
  focused = false;
  hBlurTimeout: any;
  hovered = false;
  popupSelectedIndex = undefined;
  hRefilterTimeout = undefined;
  rndToken = Math.floor(Math.random() * 1000000).toString();
  boundControl: any;

  @ViewChild('textInput') textInput: ElementRef;

  constructor(private lookupSourceService: LookupSourceService) {

  }

  updateSelectedValueText() {
    this.lookupSourceService.getLookupObj(this.lookupName).subscribe(lookup => {
      const el = lookup['Obj' + this.boundControl.value];
      this.selectedValueText = el
        ? (el[this.displayFieldName] + (el[this.commentsFieldName] ? ' (' + el[this.commentsFieldName] + ')' : ''))
        : '';
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.lastLookupSearchText = undefined;
    this.updateBoundControl();
    this.refilterLookupDelayed();
    this.updateSelectedValueText();
  }

  onFocus() {
    clearTimeout(this.hBlurTimeout);
    this.focused = true;
  }

  onBlur() {
    clearTimeout(this.hBlurTimeout);
    this.hBlurTimeout = setTimeout(() => {
      this.focused = false;
      this.blur.emit();
      this.updateLookupSearchText();
    }, 200);
  }

  refilterLookupDelayed() {
    if (this.hRefilterTimeout) {
      clearTimeout(this.hRefilterTimeout);
      this.hRefilterTimeout = undefined;
    }

    this.hRefilterTimeout = setTimeout(() => {
      this.refilterLookup();
    }, 300);
  }

  refilterLookup() {

    this.lookupSourceService.getLookup(this.lookupName).subscribe(lookup => {

      const lookupSearchText = this.textInput.nativeElement.value;

      if (!this.sorted) {
        lookup.sort((item1, item2) => item1.id - item2.id);
      } else {
        lookup.sort((item1, item2) => item1[this.displayFieldName]
          ? item1[this.displayFieldName].localeCompare(item2[this.displayFieldName]) : 0);
      }

      this.lookupItems = [];
      this.popupSelectedIndex = 0;

      for (const el of lookup) {

        if (!lookupSearchText) {
          const newEl = {
            id: el.id,
            captionBefore: el[this.displayFieldName],
            comments: el[this.commentsFieldName] ? ' (' + el[this.commentsFieldName] + ')' : '',
          };
          this.lookupItems.push(newEl);
        } else {
          const ix = el[this.displayFieldName].toLowerCase().indexOf(lookupSearchText.toLowerCase());

          if (ix >= 0) {
            const newEl = {
              id: el.id,
              captionBefore: el[this.displayFieldName].substr(0, ix),
              captionSearchText: el[this.displayFieldName].substring(ix, ix + lookupSearchText.length),
              captionAfter: el[this.displayFieldName].substr(ix + lookupSearchText.length),
              comments: el[this.commentsFieldName] ? ' (' + el[this.commentsFieldName] + ')' : '',
            };
            this.lookupItems.push(newEl);
          }
        }

        if (this.lookupItems.length >= 50) {
          break;
        }
      }

      this.lookupItems.sort((item1, item2) =>
        (item1 || '_').captionBefore.localeCompare((item2 || '_').captionBefore));
    });
  }

  isInvalid(cname: string) {
    return FormHelper.isInvalidControl(this.boundControl);
  }

  clearValue() {
    this.selectLookupItem(undefined);
  }

  onHover() {
    this.hovered = true;
  }

  onHoverEnd() {
    this.hovered = false;
  }

  selectLookupItem(item: any) {
    const newId = item ? item.id : undefined;
    this.boundControl.setValue(newId);
    this.boundControl.markAsDirty();
    this.updateSelectedValueText();
    this.focused = false;
    this.updateLookupSearchText();
    this.change.next(newId);
  }

  updateLookupSearchText() {
    setTimeout(() => {
      if (!this.focused) {
        this.textInput.nativeElement.value = '';
        this.refilterLookupDelayed();
      }
    });
  }

  onInputKeyDown($event: KeyboardEvent) {
    this.focused = true;

    if ($event.key === 'Enter') {
      if (this.popupSelectedIndex >= 0 && this.lookupItems[this.popupSelectedIndex]) {
        this.selectLookupItem(this.lookupItems[this.popupSelectedIndex]);
      }
    } else if ($event.key === 'ArrowDown') {
      if (this.popupSelectedIndex >= 0 && this.lookupItems.length > this.popupSelectedIndex + 1) {
        this.popupSelectedIndex++;
        this.showSelectedElement();
      }
    } else if ($event.key === 'ArrowUp') {
      if (this.popupSelectedIndex > 0) {
        this.popupSelectedIndex--;
        this.showSelectedElement();
      }
    } else {

      const lookupSearchText = this.textInput.nativeElement.value;

      if (lookupSearchText !== this.lastLookupSearchText) {
        this.lastLookupSearchText = lookupSearchText;
        this.refilterLookupDelayed();
      }
    }
  }

  private showSelectedElement() {
    const element = document.getElementById('ppp' + this.rndToken + '_' + this.popupSelectedIndex);
    if (element) {
      element.scrollIntoView(false);
    }
  }

  private updateBoundControl() {

    const _boundControl = this.contextFormGroup instanceof FormArray
      ? this.contextFormGroup.controls[this.contextControlName]
      : this.contextFormGroup.get(this.contextControlName);

    if (this.boundControl !== _boundControl) {
      this.boundControl = _boundControl;
      this.boundControl.valueChanges.subscribe({
        next: () => {
          this.updateSelectedValueText();
        }
      });
    }
  }

  setInputFocused() {
    this.textInput.nativeElement.focus();
  }
}
