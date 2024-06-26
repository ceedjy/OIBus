import { NorthConnectorManifest } from '../../../../shared/model/north-connector.model';

const manifest: NorthConnectorManifest = {
  id: 'mqtt',
  name: 'MQTT',
  category: 'iot',
  description: 'MQTT description',
  modes: {
    files: false,
    points: true,
    items: false
  },
  settings: [
    {
      key: 'url',
      type: 'OibText',
      label: 'URL',
      validators: [
        { key: 'required' },
        { key: 'pattern', params: { pattern: '^(mqtt:\\/\\/|mqtts:\\/\\/|tcp:\\/\\/|tls:\\/\\/|ws:\\/\\/|wss:\\/\\/).*' } }
      ],
      displayInViewMode: true
    },
    {
      key: 'qos',
      type: 'OibSelect',
      options: ['0', '1', '2'],
      label: 'QoS',
      defaultValue: '1',
      newRow: false,
      validators: [{ key: 'required' }],
      displayInViewMode: true
    },
    {
      key: 'username',
      type: 'OibText',
      label: 'Username',
      defaultValue: '',
      newRow: true,
      displayInViewMode: false
    },
    {
      key: 'password',
      type: 'OibSecret',
      label: 'Password',
      defaultValue: '',
      newRow: false,
      displayInViewMode: false
    },
    {
      key: 'certFile',
      type: 'OibText',
      label: 'Cert File',
      defaultValue: '',
      newRow: true,
      displayInViewMode: false
    },
    {
      key: 'keyFile',
      type: 'OibText',
      label: 'Key File',
      defaultValue: '',
      newRow: false,
      displayInViewMode: false
    },
    {
      key: 'caFile',
      type: 'OibText',
      label: 'CA File',
      defaultValue: '',
      newRow: false,
      displayInViewMode: false
    },
    {
      key: 'rejectUnauthorized',
      type: 'OibCheckbox',
      label: 'Reject Unauthorized Connection',
      defaultValue: false,
      newRow: false,
      displayInViewMode: false
    },
    {
      key: 'regExp',
      type: 'OibText',
      label: 'RegExp',
      validators: [{ key: 'required' }],
      defaultValue: '(.*)'
    },
    {
      key: 'topic',
      type: 'OibText',
      label: 'Topic',
      defaultValue: '%1$s',
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
    }
  ]
};

export default manifest;
