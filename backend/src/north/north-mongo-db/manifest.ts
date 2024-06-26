import { NorthConnectorManifest } from '../../../../shared/model/north-connector.model';

const manifest: NorthConnectorManifest = {
  id: 'mongodb',
  name: 'MongoDB',
  category: 'database',
  description: 'MongoDB description',
  modes: {
    files: false,
    points: true,
    items: false
  },
  settings: [
    {
      key: 'host',
      type: 'OibText',
      label: 'Host',
      validators: [{ key: 'required' }, { key: 'pattern', params: { pattern: '^(http:\\/\\/|https:\\/\\/|HTTP:\\/\\/|HTTPS:\\/\\/).*' } }],
      defaultValue: 'http://localhost:8086',
      newRow: true,
      displayInViewMode: true
    },
    {
      key: 'database',
      type: 'OibText',
      newRow: false,
      label: 'Database',
      validators: [{ key: 'required' }],
      displayInViewMode: true
    },
    {
      key: 'username',
      type: 'OibText',
      label: 'User',
      defaultValue: '',
      validators: [{ key: 'required' }],
      displayInViewMode: true
    },
    {
      key: 'password',
      type: 'OibSecret',
      label: 'Password',
      defaultValue: '',
      newRow: false,
      validators: [
        { key: 'minLength', params: { minLength: 1 } },
        { key: 'maxLength', params: { maxLength: 255 } }
      ]
    },
    {
      key: 'regExp',
      type: 'OibText',
      label: 'RegExp',
      defaultValue: '(.*)',
      validators: [{ key: 'required' }],
      newRow: true
    },
    {
      key: 'collection',
      type: 'OibText',
      label: 'Collection',
      defaultValue: '%1$s',
      validators: [{ key: 'required' }]
    },
    {
      key: 'indexFields',
      type: 'OibText',
      label: 'Index fields',
      defaultValue: '',
      newRow: false,
      validators: [
        { key: 'minLength', params: { minLength: 1 } },
        { key: 'maxLength', params: { maxLength: 255 } }
      ]
    },
    {
      key: 'createCollection',
      type: 'OibCheckbox',
      label: 'Create collection if it does not exist',
      defaultValue: false,
      validators: [{ key: 'required' }]
    },
    {
      key: 'timestampKey',
      type: 'OibText',
      label: 'Timestamp key',
      defaultValue: 'timestamp',
      newRow: false,
      validators: [{ key: 'required' }]
    },
    {
      key: 'useDataKeyValue',
      type: 'OibCheckbox',
      label: 'Use key "value" of Json "data"',
      defaultValue: false,
      validators: [{ key: 'required' }]
    },
    {
      key: 'keyParentValue',
      type: 'OibText',
      label: 'Key parent value'
    },
    {
      key: 'timestampPathInDataValue',
      type: 'OibText',
      label: 'Timestamp path in data value'
    }
  ]
};

export default manifest;
