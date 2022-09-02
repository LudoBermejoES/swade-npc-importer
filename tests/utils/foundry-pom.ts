import { Page } from '@playwright/test';
import { ActoryType, Disposition, Languages, users } from './enums';
import fs from 'fs';
import { has } from 'lodash';

const inputPath = `${__dirname}/../testData/input/`;

export class FoundryApp {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('http://localhost:30000');
  }

  async login(user: users) {
    await this.goto();
    await this.page.locator('[name="userid"]').type(user);
    await this.page.locator('[name=join]').click();
    await this.page.locator('button:has-text("Ok")').click();
  }

  async deleteActor(actorName: string) {
    await this.page.locator(`h4:has-text("${actorName}")`).click({
      button: 'right',
    });
    await this.page.locator('text=Delete').click();
    await this.page.locator('button:has-text("Yes")').click();
  }

  async setLanguage(language: Languages) {
    await this.page.locator('[data-tab=settings]').first().click();
    await this.page.locator('[data-action=configure]').click();
    await this.page.locator('text=Module Settings').click();
    await this.page
      .locator('select[name="swade-npc-importer\\.parseLanguage"]')
      .selectOption(language);
    await this.page
      .locator('input[name=swade-npc-importer\\.renderSheet]')
      .uncheck();
    await this.page.locator('button[name=submit]').click();
  }

  async openImporter() {
    await this.page.locator('a:nth-child(4) .fas').first().click();
    await this.page.locator('button:has-text("Stat Block Importer")').click();
  }

  async importActor(actorName: string) {
    await this.page.locator('textarea[name="statBlock"]').click();
    await this.page
      .locator('textarea[name="statBlock"]')
      .fill(fs.readFileSync(`${inputPath}${actorName}.txt`, 'utf-8'));
    await this.page.locator('text=Import!').click();
  }

  async exportActor(actorName: string): Promise<string | null> {
    await this.page.locator(`h4:has-text("${actorName}")`).first().click({
      button: 'right',
    });
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.locator('text=Export Data').click(),
    ]);
    return download.path();
  }

  async selectActorType(actorType: ActoryType) {
    await this.page.locator(`#${actorType}`).check();
  }

  async selectIsWildCard(isWildCard: boolean = false) {
    await this.page.locator(`#${isWildCard ? 'yes' : 'no'}`).check();
  }

  async selectDisposition(disposition: Disposition) {
    await this.page.locator(`#${disposition}`).check();
  }

  async updateVision(
    hasVision: boolean = false,
    dimSight: number = 0,
    brightSight: number = 0
  ) {
    if (hasVision) {
      await this.page.locator('input[name="vision"]').check();
    }
    await this.page.locator('input[name="dimSight"]').fill(dimSight.toString());
    await this.page
      .locator('input[name="brightSight"]')
      .fill(brightSight.toString());
  }
}
