import EncryptionServiceMock from '../tests/__mocks__/encryption-service.mock';
import RepositoryServiceMock from '../tests/__mocks__/repository-service.mock';
import PinoLogger from '../tests/__mocks__/logger.mock';
import EncryptionService from './encryption.service';
import RepositoryService from './repository.service';
import pino from 'pino';
import SouthService from './south.service';
import ConnectionService from './connection.service';

jest.mock('./encryption.service');
jest.mock('./south-cache.service');
jest.mock('./south-connector-metrics.service');
jest.mock('./connection.service');

const encryptionService: EncryptionService = new EncryptionServiceMock('', '');
const repositoryRepository: RepositoryService = new RepositoryServiceMock('', '');

const logger: pino.Logger = new PinoLogger();
let service: SouthService;
describe('south service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const connectionService = new ConnectionService(logger);
    service = new SouthService(encryptionService, repositoryRepository, connectionService);
  });

  it('should get a South connector settings', () => {
    service.getSouth('southId');
    expect(repositoryRepository.southConnectorRepository.getSouthConnector).toHaveBeenCalledTimes(1);
    expect(repositoryRepository.southConnectorRepository.getSouthConnector).toHaveBeenCalledWith('southId');
  });

  it('should get a South connector items', () => {
    service.getSouthItems('southId');
    expect(repositoryRepository.southItemRepository.getSouthItems).toHaveBeenCalledTimes(1);
    expect(repositoryRepository.southItemRepository.getSouthItems).toHaveBeenCalledWith('southId');
  });

  it('should get all South connector settings', () => {
    service.getSouthList();
    expect(repositoryRepository.southConnectorRepository.getSouthConnectors).toHaveBeenCalledTimes(1);
  });

  it('should create South connector', () => {
    const connector = service.createSouth(
      {
        id: 'southId',
        name: 'mySouth',
        description: 'my test connector',
        type: 'folder-scanner',
        enabled: false,
        history: {
          maxInstantPerItem: true,
          maxReadInterval: 3600,
          readDelay: 0,
          overlap: 0
        },
        settings: { verbose: true }
      },
      jest.fn(),
      'myBaseFolder',
      logger
    );
    expect(connector).toBeDefined();
  });

  it('should not create South connector not installed', () => {
    let connector;
    let error;
    try {
      connector = service.createSouth(
        {
          id: 'southId',
          name: 'mySouth',
          description: 'my test connector',
          type: 'another',
          enabled: false,
          history: {
            maxInstantPerItem: true,
            maxReadInterval: 3600,
            readDelay: 0,
            overlap: 0
          },
          settings: { verbose: true }
        },
        jest.fn(),
        'myBaseFolder',
        logger
      );
    } catch (err) {
      error = err;
    }
    expect(error).toEqual(new Error('South connector of type another not installed'));
    expect(connector).not.toBeDefined();
  });

  it('should retrieve a list of south manifest', () => {
    const list = service.getInstalledSouthManifests();
    expect(list).toBeDefined();
  });
});
