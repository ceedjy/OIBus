import { Component, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { ObservableState, SaveButtonComponent } from '../../../shared/save-button/save-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { formDirectives } from '../../../shared/form-directives';
import { EngineService } from '../../../services/engine.service';
import { LOG_LEVELS, RegistrationSettingsCommandDTO, RegistrationSettingsDTO } from '../../../../../../shared/model/engine.model';

@Component({
  selector: 'oib-register-oibus-modal',
  templateUrl: './register-oibus-modal.component.html',
  styleUrl: './register-oibus-modal.component.scss',
  imports: [...formDirectives, TranslateModule, SaveButtonComponent],
  standalone: true
})
export class RegisterOibusModalComponent {
  state = new ObservableState();
  form = inject(NonNullableFormBuilder).group({
    host: ['', Validators.required],
    useProxy: [false as boolean, Validators.required],
    proxyUrl: '',
    proxyUsername: '',
    proxyPassword: '',
    acceptUnauthorized: [false, Validators.required]
  });

  constructor(
    private modal: NgbActiveModal,
    private oibusService: EngineService
  ) {}

  /**
   * Prepares the component for edition.
   */
  prepare(registration: RegistrationSettingsDTO) {
    this.form.patchValue({
      host: registration.host,
      useProxy: registration.useProxy,
      proxyUrl: registration.proxyUrl || '',
      proxyUsername: registration.proxyUsername || '',
      proxyPassword: '',
      acceptUnauthorized: registration.acceptUnauthorized
    });
  }

  cancel() {
    this.modal.dismiss();
  }

  save() {
    if (!this.form.valid) {
      return;
    }

    const formValue = this.form.value;

    const command: RegistrationSettingsCommandDTO = {
      host: formValue.host!,
      acceptUnauthorized: formValue.acceptUnauthorized!,
      useProxy: formValue.useProxy!,
      proxyUrl: formValue.proxyUrl!,
      proxyUsername: formValue.proxyUsername!,
      proxyPassword: formValue.proxyPassword!
    };

    this.oibusService
      .updateRegistrationSettings(command)
      .pipe(this.state.pendingUntilFinalization())
      .subscribe(() => {
        this.modal.close();
      });
  }

  protected readonly logLevels = LOG_LEVELS;
}
