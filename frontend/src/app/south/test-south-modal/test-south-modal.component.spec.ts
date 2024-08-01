import { TestSouthModalComponent } from './test-south-modal.component';
import { ComponentTester, createMock } from 'ngx-speculoos';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TestBed } from '@angular/core/testing';
import { provideI18nTesting } from '../../../i18n/mock-i18n';

class TestSouthModalComponentTester extends ComponentTester<TestSouthModalComponent> {
  constructor() {
    super(TestSouthModalComponent);
  }

  get yesButton() {
    return this.button('#yes-button')!;
  }

  get noButton() {
    return this.button('#no-button')!;
  }
}

describe('ResetCacheModalComponent', () => {
  let tester: TestSouthModalComponentTester;
  let fakeActiveModal: NgbActiveModal;

  beforeEach(() => {
    fakeActiveModal = createMock(NgbActiveModal);

    TestBed.configureTestingModule({
      providers: [provideI18nTesting(), { provide: NgbActiveModal, useValue: fakeActiveModal }]
    });
    tester = new TestSouthModalComponentTester();
  });

  it('should send yes', () => {
    tester.detectChanges();

    tester.yesButton.click();
    expect(fakeActiveModal.close).toHaveBeenCalledWith(true);
  });

  it('should send no', () => {
    tester.detectChanges();

    tester.noButton.click();
    expect(fakeActiveModal.close).toHaveBeenCalledWith(false);
  });
});
