import BaseEngine from './base-engine';
import EncryptionService from '../service/encryption.service';
import pino from 'pino';
import NorthConnector from '../north/north-connector';
import SouthConnector from '../south/south-connector';
import NorthService from '../service/north.service';
import SouthService from '../service/south.service';
import { createFolder, filesExists } from '../service/utils';
import path from 'node:path';
import fs from 'node:fs/promises';

import { SouthConnectorDTO, SouthConnectorItemDTO } from '../../../shared/model/south-connector.model';
import { NorthConnectorDTO, NorthConnectorItemDTO } from '../../../shared/model/north-connector.model';
import { Instant } from '../../../shared/model/types';
import { PassThrough } from 'node:stream';
import { ScanModeDTO } from '../../../shared/model/scan-mode.model';
import HomeMetricsService from '../service/home-metrics.service';
import { OIBusContent } from '../../../shared/model/engine.model';

const CACHE_FOLDER = './cache/data-stream';

/**
 * At startup, handles of North and South connectors.
 */
export default class OIBusEngine extends BaseEngine {
  private northConnectors: Map<string, NorthConnector> = new Map<string, NorthConnector>();
  private southConnectors: Map<string, SouthConnector> = new Map<string, SouthConnector>();

  constructor(
    encryptionService: EncryptionService,
    northService: NorthService,
    southService: SouthService,
    private readonly homeMetricsService: HomeMetricsService,
    logger: pino.Logger
  ) {
    super(encryptionService, northService, southService, logger, CACHE_FOLDER);
  }

  /**
   * Method called by South connectors to add content to the appropriate Norths
   */
  async addContent(southId: string, data: OIBusContent) {
    for (const north of this.northConnectors.values()) {
      if (north.isEnabled() && north.isSubscribed(southId)) {
        switch (data.type) {
          case 'time-values':
            await north.cacheValues(data.content);
            return;
          case 'raw':
            await north.cacheFile(data.filePath);
            return;
        }
      }
    }
  }

  /**
   * Add content to a north connector from the OIBus API endpoints
   * @param northId - the north id
   * @param data - the content to be added
   */
  async addExternalContent(northId: string, data: OIBusContent): Promise<void> {
    const north = this.northConnectors.get(northId);
    if (north && north.isEnabled()) {
      switch (data.type) {
        case 'time-values':
          await north.cacheValues(data.content);
          return;
        case 'raw':
          await north.cacheFile(data.filePath);
          return;
      }
    }
  }

  /**
   * Creates a new instance for every North and South connectors and initialize them.
   * Creates CronJobs based on the ScanModes and starts them.
   */
  override async start(): Promise<void> {
    // North connectors
    const northListSettings = this.northService.getNorthList();
    for (const settings of northListSettings) {
      try {
        await this.startNorth(settings.id, settings);
      } catch (error) {
        this.logger.error(`Error while creating North connector "${settings.name}" of type "${settings.type}" (${settings.id}): ${error}`);
      }
    }

    // South connectors
    const southListSettings = this.southService.getSouthList();
    for (const settings of southListSettings) {
      try {
        await this.startSouth(settings.id, settings);
      } catch (error) {
        this.logger.error(`Error while creating South connector "${settings.name}" of type "${settings.type}" (${settings.id}): ${error}`);
      }
    }

    this.logger.info('OIBus engine started');
  }

  /**
   * Gracefully stop every timer, South and North connectors
   */
  override async stop(): Promise<void> {
    for (const id of this.southConnectors.keys()) {
      await this.stopSouth(id);
    }

    for (const id of this.northConnectors.keys()) {
      await this.stopNorth(id);
    }
  }

  async startSouth(_southId: string, settings: SouthConnectorDTO): Promise<void> {
    const baseFolder = path.resolve(this.cacheFolder, `south-${settings.id}`);
    await createFolder(baseFolder);

    const items = this.southService.getSouthItems(settings.id);
    const south = this.southService.createSouth(
      settings,
      items,
      this.addContent.bind(this),
      baseFolder,
      this.logger.child({ scopeType: 'south', scopeId: settings.id, scopeName: settings.name })
    );
    if (south.isEnabled()) {
      this.homeMetricsService.addSouth(south, settings.id);
      south.connectedEvent.on('connected', async () => {
        await south.createSubscriptions(items.filter(item => item.scanModeId === 'subscription' && item.enabled));
        south.createCronJobs(items.filter(item => item.scanModeId !== 'subscription' && item.enabled));
      });
      // Do not await here, so it can start all connectors without blocking the thread
      south.start().catch(error => {
        this.logger.error(`Error while starting South connector "${settings.name}" of type "${settings.type}" (${settings.id}): ${error}`);
      });
    } else {
      this.logger.trace(`South connector ${settings.name} not enabled`);
    }
    this.southConnectors.set(settings.id, south);
  }

  async startNorth(_northId: string, settings: NorthConnectorDTO): Promise<void> {
    const baseFolder = path.resolve(this.cacheFolder, `north-${settings.id}`);
    await createFolder(baseFolder);

    const north = this.northService.createNorth(
      settings,
      baseFolder,
      this.logger.child({ scopeType: 'north', scopeId: settings.id, scopeName: settings.name })
    );
    if (north.isEnabled()) {
      this.homeMetricsService.addNorth(north, settings.id);
      // Do not await here, so it can start all connectors without blocking the thread
      north.start().catch(error => {
        this.logger.error(`Error while starting North connector "${settings.name}" of type "${settings.type}" (${settings.id}): ${error}`);
      });
    } else {
      this.logger.trace(`North connector "${settings.name}" not enabled`);
    }
    this.northConnectors.set(settings.id, north);
  }

  async addItemToSouth(southId: string, item: SouthConnectorItemDTO): Promise<void> {
    await this.southConnectors.get(southId)?.addItem(item);
  }

  async deleteItemFromSouth(southId: string, item: SouthConnectorItemDTO): Promise<void> {
    await this.southConnectors.get(southId)?.deleteItem(item);
  }

  async deleteAllItemsFromSouth(southId: string): Promise<void> {
    await this.southConnectors.get(southId)?.deleteAllItems();
  }

  async updateItemInSouth(southId: string, oldItem: SouthConnectorItemDTO, newItem: SouthConnectorItemDTO): Promise<void> {
    await this.southConnectors.get(southId)?.updateItem(oldItem, newItem);
  }

  async stopSouth(southId: string): Promise<void> {
    this.homeMetricsService.removeSouth(southId);
    await this.southConnectors.get(southId)?.stop();
    this.southConnectors.delete(southId);
  }

  async stopNorth(northId: string): Promise<void> {
    this.homeMetricsService.removeNorth(northId);
    await this.northConnectors.get(northId)?.stop();
    this.northConnectors.delete(northId);
  }

  /**
   * Stops the south connector and deletes all cache inside the base folder
   */
  async deleteSouth(southId: string, name: string): Promise<void> {
    await this.stopSouth(southId);
    const baseFolder = path.resolve(this.cacheFolder, `south-${southId}`);

    try {
      this.logger.trace(`Deleting base folder "${baseFolder}" of South connector "${name}" (${southId})`);

      if (await filesExists(baseFolder)) {
        await fs.rm(baseFolder, { recursive: true });
      }

      this.logger.info(`Deleted South connector "${name}" (${southId})`);
    } catch (error) {
      this.logger.error(`Unable to delete South connector "${name}" (${southId} base folder: ${error}`);
    }
  }

  /**
   * Stops the north connector and deletes all cache inside the base folder
   */
  async deleteNorth(northId: string, name: string): Promise<void> {
    await this.stopNorth(northId);
    const baseFolder = path.resolve(this.cacheFolder, `north-${northId}`);

    try {
      this.logger.trace(`Deleting base folder "${baseFolder}" of North connector "${name}" (${northId})`);

      if (await filesExists(baseFolder)) {
        await fs.rm(baseFolder, { recursive: true });
      }

      this.logger.info(`Deleted North connector "${name}" (${northId})`);
    } catch (error) {
      this.logger.error(`Unable to delete North connector "${name}" (${northId}) base folder: ${error}`);
    }
  }

  addItemToNorth(northId: string, item: NorthConnectorItemDTO): void {
    this.northConnectors.get(northId)?.addItem(item);
  }

  deleteItemFromNorth(northId: string, item: NorthConnectorItemDTO): void {
    this.northConnectors.get(northId)?.deleteItem(item);
  }

  deleteAllItemsFromNorth(northId: string): void {
    this.northConnectors.get(northId)?.deleteAllItems();
  }

  updateItemInNorth(northId: string, oldItem: NorthConnectorItemDTO, newItem: NorthConnectorItemDTO): void {
    this.northConnectors.get(northId)?.updateItem(oldItem, newItem);
  }

  setLogger(value: pino.Logger) {
    super.setLogger(value);

    for (const [id, south] of this.southConnectors.entries()) {
      const southSettings = this.southService.getSouth(id);
      if (southSettings) {
        south.setLogger(this.logger.child({ scopeType: 'south', scopeId: southSettings.id, scopeName: southSettings.name }));
      }
    }

    for (const [id, north] of this.northConnectors.entries()) {
      const northSettings = this.northService.getNorth(id);
      if (northSettings) {
        north.setLogger(this.logger.child({ scopeType: 'north', scopeId: northSettings.id, scopeName: northSettings.name }));
      }
    }
  }

  async getErrorFiles(northId: string, start: Instant, end: Instant, fileNameContains: string) {
    return (await this.northConnectors.get(northId)?.getErrorFiles(start, end, fileNameContains)) || [];
  }

  async getErrorFileContent(northId: string, filename: string) {
    return (await this.northConnectors.get(northId)?.getErrorFileContent(filename)) || null;
  }

  async removeErrorFiles(northId: string, filenames: Array<string>): Promise<void> {
    await this.northConnectors.get(northId)?.removeErrorFiles(filenames);
  }

  async retryErrorFiles(northId: string, filenames: Array<string>): Promise<void> {
    await this.northConnectors.get(northId)?.retryErrorFiles(filenames);
  }

  async removeAllErrorFiles(northId: string): Promise<void> {
    await this.northConnectors.get(northId)?.removeAllErrorFiles();
  }

  async retryAllErrorFiles(northId: string): Promise<void> {
    await this.northConnectors.get(northId)?.retryAllErrorFiles();
  }

  async getCacheFiles(northId: string, start: Instant, end: Instant, fileNameContains: string) {
    return (await this.northConnectors.get(northId)?.getCacheFiles(start, end, fileNameContains)) || [];
  }

  async getCacheFileContent(northId: string, filename: string) {
    return (await this.northConnectors.get(northId)?.getCacheFileContent(filename)) || null;
  }

  async removeCacheFiles(northId: string, filenames: Array<string>): Promise<void> {
    await this.northConnectors.get(northId)?.removeCacheFiles(filenames);
  }

  async archiveCacheFiles(northId: string, filenames: Array<string>): Promise<void> {
    await this.northConnectors.get(northId)?.archiveCacheFiles(filenames);
  }

  async getArchiveFiles(northId: string, start: Instant, end: Instant, fileNameContains: string) {
    return (await this.northConnectors.get(northId)?.getArchiveFiles(start, end, fileNameContains)) || [];
  }

  async getArchiveFileContent(northId: string, filename: string) {
    return (await this.northConnectors.get(northId)?.getArchiveFileContent(filename)) || null;
  }

  async removeArchiveFiles(northId: string, filenames: Array<string>): Promise<void> {
    await this.northConnectors.get(northId)?.removeArchiveFiles(filenames);
  }

  async retryArchiveFiles(northId: string, filenames: Array<string>): Promise<void> {
    await this.northConnectors.get(northId)?.retryArchiveFiles(filenames);
  }

  async removeAllArchiveFiles(northId: string): Promise<void> {
    await this.northConnectors.get(northId)?.removeAllArchiveFiles();
  }

  async retryAllArchiveFiles(northId: string): Promise<void> {
    await this.northConnectors.get(northId)?.retryAllArchiveFiles();
  }

  async getCacheValues(northId: string, fileNameContains: string) {
    return this.northConnectors.get(northId)?.getCacheValues(fileNameContains) || [];
  }

  async removeCacheValues(northId: string, filenames: Array<string>) {
    await this.northConnectors.get(northId)?.removeCacheValues(filenames);
  }

  async removeAllCacheValues(northId: string) {
    await this.northConnectors.get(northId)?.removeAllCacheValues();
  }

  async getValueErrors(northId: string, start: Instant, end: Instant, fileNameContains: string) {
    return (await this.northConnectors.get(northId)?.getValueErrors(start, end, fileNameContains)) || [];
  }

  async removeValueErrors(northId: string, filenames: Array<string>) {
    await this.northConnectors.get(northId)?.removeValueErrors(filenames);
  }

  async removeAllValueErrors(northId: string) {
    await this.northConnectors.get(northId)?.removeAllValueErrors();
  }

  async retryValueErrors(northId: string, filenames: Array<string>) {
    await this.northConnectors.get(northId)?.retryValueErrors(filenames);
  }

  async retryAllValueErrors(northId: string) {
    await this.northConnectors.get(northId)?.retryAllValueErrors();
  }

  getSouthDataStream(southId: string): PassThrough | null {
    return this.southConnectors.get(southId)?.getMetricsDataStream() || null;
  }

  getNorthDataStream(northId: string): PassThrough | null {
    return this.northConnectors.get(northId)?.getMetricsDataStream() || null;
  }

  resetSouthMetrics(southId: string): PassThrough | null {
    return this.southConnectors.get(southId)?.resetMetrics() || null;
  }

  resetNorthMetrics(northId: string): PassThrough | null {
    return this.northConnectors.get(northId)?.resetMetrics() || null;
  }

  async updateScanMode(scanMode: ScanModeDTO): Promise<void> {
    for (const [id, south] of this.southConnectors.entries()) {
      const southSettings = this.southService.getSouth(id);
      if (southSettings) {
        await south.updateScanMode(scanMode);
      }
    }

    for (const [id, north] of this.northConnectors.entries()) {
      const northSettings = this.northService.getNorth(id);
      if (northSettings) {
        await north.updateScanMode(scanMode);
      }
    }
  }
}
