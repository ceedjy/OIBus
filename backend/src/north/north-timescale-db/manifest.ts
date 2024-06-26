import { NorthConnectorManifest } from '../../../../shared/model/north-connector.model';

const manifest: NorthConnectorManifest = {
  id: 'timescaledb',
  name: 'TimescaleDB',
  category: 'database',
  description: 'TimescaleDB description',
  modes: {
    files: false,
    points: true,
    items: false
  },
  settings: [
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
      ],
      displayInViewMode: false
    },
    {
      key: 'host',
      type: 'OibText',
      label: 'Host',
      validators: [{ key: 'required' }, { key: 'pattern', params: { pattern: '^(http:\\/\\/|https:\\/\\/|HTTP:\\/\\/|HTTPS:\\/\\/).*' } }],
      newRow: true,
      displayInViewMode: true
    },
    {
      key: 'database',
      type: 'OibText',
      newRow: false,
      label: 'Database',
      defaultValue: '',
      validators: [{ key: 'required' }],
      displayInViewMode: true
    },
    {
      key: 'regExp',
      type: 'OibText',
      label: 'RegExp',
      defaultValue: '(.*)',
      validators: [{ key: 'required' }]
    },
    {
      key: 'table',
      type: 'OibText',
      label: 'Table',
      defaultValue: '%1$s',
      validators: [{ key: 'required' }]
    },
    {
      key: 'optFields',
      type: 'OibText',
      label: 'Optional fields',
      defaultValue: '',
      newRow: false,
      validators: [
        { key: 'minLength', params: { minLength: 1 } },
        { key: 'maxLength', params: { maxLength: 255 } }
      ]
    },
    {
      key: 'timestampPathInDataValue',
      type: 'OibText',
      label: 'Timestamp path in data value',
      defaultValue: '',
      newRow: true
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
      label: 'Key parent value',
      defaultValue: ''
    }
  ]
};

export default manifest;
