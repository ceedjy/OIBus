import SqliteDatabaseMock, { all, get, run } from '../tests/__mocks__/database.mock';
import { generateRandomId } from '../service/utils';
import EngineRepository from './engine.repository';
import { EngineSettingsCommandDTO, EngineSettingsDTO } from '../../../shared/model/engine.model';
import { Database } from 'better-sqlite3';

jest.mock('../tests/__mocks__/database.mock');
jest.mock('../service/utils', () => ({
  generateRandomId: jest.fn(() => '123456')
}));

let database: Database;
let repository: EngineRepository;
describe('Empty engine repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    database = new SqliteDatabaseMock();
    all.mockReturnValue([]);
    database.prepare = jest.fn().mockReturnValue({
      run,
      get,
      all
    });
    repository = new EngineRepository(database);
  });

  it('should properly init engine settings table', () => {
    const command: EngineSettingsCommandDTO = {
      name: 'OIBus',
      port: 2223,
      proxyEnabled: false,
      proxyPort: 9000,
      logParameters: {
        console: {
          level: 'silent'
        },
        file: {
          level: 'info',
          maxFileSize: 50,
          numberOfFiles: 5
        },
        database: {
          level: 'info',
          maxNumberOfLogs: 100_000
        },
        loki: {
          level: 'silent',
          interval: 60,
          address: '',
          username: '',
          password: ''
        },
        oia: {
          level: 'silent',
          interval: 10
        }
      }
    };

    repository.createEngineSettings(command);
    expect(generateRandomId).toHaveBeenCalledWith();
    expect(database.prepare).toHaveBeenCalledWith(
      'INSERT INTO engines (id, name, port, proxy_enabled, proxy_port, log_console_level, log_file_level, log_file_max_file_size, ' +
        'log_file_number_of_files, log_database_level, log_database_max_number_of_logs, log_loki_level, ' +
        'log_loki_interval, log_loki_address, log_loki_username, log_loki_password, log_oia_level, log_oia_interval) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);'
    );
    expect(run).toHaveBeenCalledWith(
      '123456',
      command.name,
      command.port,
      +command.proxyEnabled,
      command.proxyPort,
      command.logParameters.console.level,
      command.logParameters.file.level,
      command.logParameters.file.maxFileSize,
      command.logParameters.file.numberOfFiles,
      command.logParameters.database.level,
      command.logParameters.database.maxNumberOfLogs,
      command.logParameters.loki.level,
      command.logParameters.loki.interval,
      command.logParameters.loki.address,
      command.logParameters.loki.username,
      command.logParameters.loki.password,
      command.logParameters.oia.level,
      command.logParameters.oia.interval
    );

    expect(run).toHaveBeenCalledTimes(2);
  });

  it('should update engine settings', () => {
    const command: EngineSettingsCommandDTO = {
      name: 'OIBus',
      port: 2223,
      proxyEnabled: false,
      proxyPort: 9000,
      logParameters: {
        console: {
          level: 'silent'
        },
        file: {
          level: 'info',
          maxFileSize: 50,
          numberOfFiles: 5
        },
        database: {
          level: 'info',
          maxNumberOfLogs: 100_000
        },
        loki: {
          level: 'silent',
          interval: 60,
          address: '',
          username: '',
          password: ''
        },
        oia: {
          level: 'silent',
          interval: 10
        }
      }
    };
    repository.updateEngineSettings(command);
    expect(database.prepare).toHaveBeenCalledWith(
      'UPDATE engines SET name = ?, port = ?, proxy_enabled = ?, proxy_port = ?, log_console_level = ?, log_file_level = ?, log_file_max_file_size = ?, ' +
        'log_file_number_of_files = ?, log_database_level = ?, log_database_max_number_of_logs = ?, log_loki_level = ?, ' +
        'log_loki_interval = ?, log_loki_address = ?, log_loki_username = ?, ' +
        'log_loki_password = ?, log_oia_level = ?, log_oia_interval = ? WHERE rowid=(SELECT MIN(rowid) FROM engines);'
    );
    expect(run).toHaveBeenCalledWith(
      command.name,
      command.port,
      +command.proxyEnabled,
      command.proxyPort,
      command.logParameters.console.level,
      command.logParameters.file.level,
      command.logParameters.file.maxFileSize,
      command.logParameters.file.numberOfFiles,
      command.logParameters.database.level,
      command.logParameters.database.maxNumberOfLogs,
      command.logParameters.loki.level,
      command.logParameters.loki.interval,
      command.logParameters.loki.address,
      command.logParameters.loki.username,
      command.logParameters.loki.password,
      command.logParameters.oia.level,
      command.logParameters.oia.interval
    );
  });
});

describe('Non-empty Engine repository', () => {
  const existingSettings = {
    id: 'id1',
    name: 'OIBus',
    port: 2223,
    version: '3.3.3',
    proxyEnabled: false,
    proxyPort: 9000,
    consoleLogLevel: 'silent',
    fileLogLevel: 'info',
    fileLogMaxFileSize: 50,
    fileLogNumberOfFiles: 5,
    databaseLogLevel: 'info',
    databaseLogMaxNumberOfLogs: 100_000,
    lokiLogLevel: 'silent',
    lokiLogInterval: 60,
    lokiLogAddress: '',
    lokiLogUsername: '',
    lokiLogPassword: '',
    oiaLogLevel: 'silent',
    oiaLogInterval: 10
  };
  beforeEach(() => {
    jest.clearAllMocks();
    database = new SqliteDatabaseMock();
    all.mockReturnValue([existingSettings]);
    database.prepare = jest.fn().mockReturnValue({
      run,
      get,
      all
    });
    repository = new EngineRepository(database);
  });

  it('should properly get the engine settings', () => {
    const expectedValue: EngineSettingsDTO = {
      id: 'id1',
      name: 'OIBus',
      port: 2223,
      version: '3.3.3',
      proxyEnabled: false,
      proxyPort: 9000,
      logParameters: {
        console: {
          level: 'silent'
        },
        file: {
          level: 'info',
          maxFileSize: 50,
          numberOfFiles: 5
        },
        database: {
          level: 'info',
          maxNumberOfLogs: 100_000
        },
        loki: {
          level: 'silent',
          interval: 60,
          address: '',
          username: '',
          password: ''
        },
        oia: {
          level: 'silent',
          interval: 10
        }
      }
    };
    const engineSettings = repository.getEngineSettings();
    expect(database.prepare).toHaveBeenCalledWith(
      'SELECT id, name, port, oibus_version AS version, proxy_enabled AS proxyEnabled, proxy_port AS proxyPort, log_console_level AS consoleLogLevel, log_file_level AS fileLogLevel, ' +
        'log_file_max_file_size AS fileLogMaxFileSize, log_file_number_of_files AS fileLogNumberOfFiles, ' +
        'log_database_level AS databaseLogLevel, log_database_max_number_of_logs AS databaseLogMaxNumberOfLogs, ' +
        'log_loki_level AS lokiLogLevel, log_loki_interval AS lokiLogInterval, log_loki_address AS lokiLogAddress, ' +
        'log_loki_username AS lokiLogUsername, log_loki_password AS lokiLogPassword, ' +
        'log_oia_level AS oiaLogLevel, log_oia_interval AS oiaLogInterval FROM engines;'
    );
    expect(all).toHaveBeenCalledTimes(2);
    expect(engineSettings).toEqual(expectedValue);
  });

  it('should not create engine settings if they already exist', () => {
    const command: EngineSettingsCommandDTO = {
      name: 'OIBus',
      port: 2223,
      proxyEnabled: false,
      proxyPort: 9000,
      logParameters: {
        console: {
          level: 'silent'
        },
        file: {
          level: 'info',
          maxFileSize: 50,
          numberOfFiles: 5
        },
        database: {
          level: 'info',
          maxNumberOfLogs: 100_000
        },
        loki: {
          level: 'silent',
          interval: 60,
          address: '',
          username: '',
          password: ''
        },
        oia: {
          level: 'silent',
          interval: 10
        }
      }
    };
    repository.createEngineSettings(command);
    expect(generateRandomId).not.toHaveBeenCalled();
  });

  it('should update version', () => {
    repository.updateVersion('3.4.0');

    expect(database.prepare).toHaveBeenCalledWith('UPDATE engines SET oibus_version = ? WHERE rowid=(SELECT MIN(rowid) FROM engines);');
    expect(run).toHaveBeenCalledWith('3.4.0');
  });
});
