/**
 * @jest-environment node
 */

import { app, dialog } from 'electron';

import { onFirstRunMaybe } from '../../src/main/first-run';
import { isFirstRun } from '../../src/main/utils/check-first-run';
import { overridePlatform, resetPlatform } from '../utils';

jest.mock('../../src/main/utils/check-first-run', () => ({
  isFirstRun: jest.fn(),
}));

const mockDialogResponse = {
  response: 1,
};

describe('first-run', () => {
  const oldDefaultApp = process.defaultApp;

  beforeEach(() => {
    overridePlatform('darwin');

    (dialog.showMessageBox as jest.Mock<any>).mockResolvedValue(
      mockDialogResponse,
    );
  });

  afterEach(() => {
    resetPlatform();
  });

  afterEach(() => {
    (process as any).defaultApp = oldDefaultApp;
  });

  describe('onFirstRunMaybe()', () => {
    it(`doesn't run unless required (not first run)`, () => {
      onFirstRunMaybe();
      expect(dialog.showMessageBox).toHaveBeenCalledTimes(0);
    });

    it(`doesn't run unless required (is already in app folder)`, () => {
      (isFirstRun as jest.Mock).mockReturnValueOnce(true);
      (app.isInApplicationsFolder as jest.Mock).mockReturnValue(true);

      onFirstRunMaybe();

      expect(dialog.showMessageBox).toHaveBeenCalledTimes(0);
    });

    it(`doesn't run unless required (dev mode)`, () => {
      (isFirstRun as jest.Mock).mockReturnValueOnce(true);
      (process as any).defaultApp = true;
      (app.isInApplicationsFolder as jest.Mock).mockReturnValue(false);

      onFirstRunMaybe();

      expect(dialog.showMessageBox).toHaveBeenCalledTimes(0);
    });

    it(`doesn't run unless required (Windows, Linux)`, () => {
      overridePlatform('win32');

      (isFirstRun as jest.Mock).mockReturnValueOnce(true);
      (app.isInApplicationsFolder as jest.Mock).mockReturnValue(false);

      onFirstRunMaybe();

      expect(dialog.showMessageBox).toHaveBeenCalledTimes(0);
    });

    it(`moves the app when requested to do so`, async () => {
      (isFirstRun as jest.Mock).mockReturnValue(true);
      (app.isInApplicationsFolder as jest.Mock).mockReturnValue(false);

      mockDialogResponse.response = 1;
      await onFirstRunMaybe();
      expect(app.moveToApplicationsFolder).toHaveBeenCalledTimes(0);

      mockDialogResponse.response = 0;
      await onFirstRunMaybe();
      expect(app.moveToApplicationsFolder).toHaveBeenCalledTimes(1);
    });
  });
});
