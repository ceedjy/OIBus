export default {
  name: 'FolderScanner',
  category: 'file',
  description: 'FolderScanner description',
  modes: {
    subscription: false,
    lastPoint: false,
    lastFile: true,
    historyPoint: false,
    historyFile: false,
  },
  settings: [
    {
      key: 'inputFolder',
      type: 'OibText',
      label: 'Input folder',
      defaultValue: './input/',
      newRow: true,
      class: 'col-8',
      validators: [{ key: 'required' }],
      readDisplay: true,
    },
    {
      key: 'preserveFiles',
      type: 'OibCheckbox',
      label: 'Preserve File?',
      defaultValue: true,
      newRow: false,
      class: 'col-2',
      validators: [{ key: 'required' }],
      readDisplay: true,
    },
    {
      key: 'ignoreModifiedDate',
      type: 'OibCheckbox',
      label: 'Ignore modified date',
      defaultValue: false,
      newRow: false,
      class: 'col-2',
      conditionalDisplay: { preserveFiles: [true] },
      validators: [{ key: 'required' }],
      readDisplay: false,
    },
    {
      key: 'minAge',
      type: 'OibInteger',
      label: 'Minimum Age (ms)',
      defaultValue: 1000,
      newRow: true,
      class: 'col-4',
      validators: [{ key: 'required' }, { key: 'min', params: { min: 100 } }, { key: 'max', params: { max: 3_600_000 } }],
      readDisplay: true,
    },
    {
      key: 'compression',
      type: 'OibCheckbox',
      label: 'Compress File?',
      defaultValue: false,
      newRow: true,
      class: 'col-4',
      validators: [{ key: 'required' }],
      readDisplay: true,
    },
  ],
  items: {
    scanMode: {
      acceptSubscription: false,
      subscriptionOnly: false,
    },
    settings: [{
      key: 'regex',
      type: 'OibText',
      label: 'RegExp',
      defaultValue: '.txt',
      validators: [{ key: 'required' }],
      readDisplay: true,
    }],
  },
}