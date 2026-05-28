import { plugin as PrometheusDatasourcePlugin } from './module';

declare const process: {
  env: {
    NODE_ENV?: string;
  };
};

const originalNodeEnv = process.env.NODE_ENV;

jest.mock('@grafana/i18n', () => ({
  ...jest.requireActual('@grafana/i18n'),
  initPluginTranslations: jest.fn(),
}));

jest.mock('@grafana/prometheus', () => ({
  loadResources: jest.fn(),
  PromCheatSheet: jest.fn(),
  PrometheusDatasource: jest.fn(),
  PromQueryEditorByApp: jest.fn(),
}));

jest.mock('./configuration/ConfigEditor', () => ({
  ConfigEditor: jest.fn(),
}));

describe('module', () => {
  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should have metrics query field in panels and Explore', () => {
    expect(PrometheusDatasourcePlugin.components.QueryEditor).toBeDefined();
  });

  it('should skip translation initialization when running tests', () => {
    process.env.NODE_ENV = 'test';
    let initPluginTranslations: jest.Mock | undefined;

    jest.isolateModules(() => {
      require('./module');
      initPluginTranslations = require('@grafana/i18n').initPluginTranslations;
    });

    expect(initPluginTranslations).not.toHaveBeenCalled();
  });

  it('should initialize plugin translations outside tests', () => {
    process.env.NODE_ENV = 'development';
    let initPluginTranslations: jest.Mock | undefined;

    jest.isolateModules(() => {
      require('./module');
      initPluginTranslations = require('@grafana/i18n').initPluginTranslations;
    });

    expect(initPluginTranslations).toHaveBeenCalledTimes(1);
    expect(initPluginTranslations).toHaveBeenCalledWith('grafana-amazonprometheus-datasource', [expect.any(Function)]);
  });

  it('should not await translation initialization', () => {
    process.env.NODE_ENV = 'development';
    const neverResolvingPromise = new Promise(() => {});

    expect(() => {
      jest.isolateModules(() => {
        const { initPluginTranslations } = require('@grafana/i18n');
        initPluginTranslations.mockReturnValue(neverResolvingPromise);

        require('./module');
      });
    }).not.toThrow();
  });
});
