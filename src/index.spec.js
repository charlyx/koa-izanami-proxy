const request = require('supertest')
const Koa = require('koa')
const izanami = require('izanami-node')
const izanamiProxy = require('.')

const { objectContaining } = expect

describe('Izanami proxy', () => {
  let proxy

  beforeEach(jest.clearAllMocks)

  afterEach(() => proxy && proxy.close())

  it('should throw an error if no app specified', () => {
    expect(izanamiProxy).toThrow('No app given. Please specify app property in your proxy configuration')
  })

  it('should answer at /api/izanami by default', async () => {
    expect.assertions(1)
    proxy = createProxy()

    const response = await callIzanamiThrough(proxy)

    expect(response.statusCode).toBe(200)
  })

  it('should answer at specified path', async () => {
    expect.assertions(1)
    const path = '/my/custom/path'
    proxy = createProxy({ path })

    const response = await request(proxy).get(path)

    expect(response.statusCode).toBe(200)
  })

  const izanamiMocks = {
    features: { clientName: 'featureClient' },
    experiments: { clientName: 'experimentClient' },
    configurations: { clientName: 'configClient', clientMethod: 'configs' },
  }

  for (const feat of ['features', 'experiments', 'configurations']) {
    const { clientName, clientMethod = feat } = izanamiMocks[feat]
    const client = izanami[clientName]
    const featConfig = { some: `${feat} conf` }
    const clientConfigName = `${clientName}Config`
    const config = { [clientConfigName]: featConfig }

    describe(feat, () => {
      it(`should return empty ${feat}`, async () => {
        expect.assertions(1)
        proxy = createProxy()

        const response = await callIzanamiThrough(proxy)

        expect(response.body).toEqual(objectContaining({ [feat]: {} }))
      })

      it(`should call ${clientName} with specified config`, async () => {
        expect.assertions(1)
        proxy = createProxy(config)

        const response = await callIzanamiThrough(proxy)

        expect(client).toHaveBeenCalledWith(featConfig)
      })

      it(`should call ${clientName} with wildcard pattern by default`, async () => {
        expect.assertions(1)
        proxy = createProxy(config)

        const response = await callIzanamiThrough(proxy)

        expect(client()[clientMethod]).toHaveBeenCalledWith('*')
      })

      it(`should call ${clientName} with specified pattern`, async () => {
        expect.assertions(1)
        const pattern = 'myPattern'
        proxy = createProxy({ ...config, pattern })

        const response = await callIzanamiThrough(proxy)

        expect(client()[clientMethod]).toHaveBeenCalledWith(pattern)
      })

      it(`should return ${feat} from client`, async done => {
        expect.assertions(1)
        proxy = createProxy(config)

        const response = await callIzanamiThrough(proxy)

        expect(response.body).toEqual(objectContaining({ [feat]: `my ${feat}` }))
        done() // FIX remaining last open handle with supertest and jest :/
      })
    })
  }

  const configNames = {
    won: 'experimentWonPath',
    displayed: 'experimentDisplayedPath',
  }

  for (const experimentFeature of ['won', 'displayed']) {
    describe(`Experiment - ${experimentFeature}`, () => {
      const experimentClientConfig = { some: 'conf' }

      it('should fail if no experiment client is configured', async () => {
        expect.assertions(1)
        proxy = createProxy()

        const response = await callExperiment(proxy, experimentFeature)

        expect(response.statusCode).toBe(500)
      })

      it(`should answer at /api/experiments/${experimentFeature} by default`, async () => {
        expect.assertions(1)
        proxy = createProxy({ experimentClientConfig })

        const response = await callExperiment(proxy, experimentFeature)

        expect(response.statusCode).toBe(200)
      })

      it('should answer at /my/experiments/won', async () => {
        expect.assertions(1)
        const configPath = `/my/experiments/${experimentFeature}`
        const configName = configNames[experimentFeature]
        proxy = createProxy({ experimentClientConfig, [configName]: configPath })

        const response = await request(proxy).post(configPath)

        expect(response.statusCode).toBe(200)
      })

      it('should call won from client', async () => {
        expect.assertions(3)
        const experiment = 'my.experiment.id'
        proxy = createProxy({ experimentClientConfig })

        const response = await callExperiment(proxy, experimentFeature, experiment)

        expect(response.statusCode).toBe(200)
        expect(response.body).toEqual({ done: true })
        expect(izanami.experimentClient()[experimentFeature]).toHaveBeenCalledWith(experiment)
      })
    })
  }
})

function createProxy(config = {}) {
  const app = new Koa()
  izanamiProxy({
    ...config,
    app,
  })
  return app.listen()
}

function callIzanamiThrough(proxy) {
  return request(proxy).get('/api/izanami')
}

function callExperiment(proxy, feature, experiment) {
  const query = experiment ? `?experiment=${experiment}` : ''
  return request(proxy).post(`/api/experiments/${feature}${query}`)
}

jest.mock('izanami-node', () => {
  const features = jest.fn().mockResolvedValue('my features')
  const experiments = jest.fn().mockResolvedValue('my experiments')
  const configs = jest.fn().mockResolvedValue('my configurations')
  const won = jest.fn().mockResolvedValue('')
  const displayed = jest.fn().mockResolvedValue('')

  return {
    featureClient: jest.fn().mockImplementation(() => ({ features })),
    experimentClient: jest.fn().mockImplementation(() => ({ experiments, won, displayed })),
    configClient: jest.fn().mockImplementation(() => ({ configs })),
  }
})
