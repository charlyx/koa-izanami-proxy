const Koa = require('koa')
const route = require('koa-route')
const izanami = require('izanami-node')

function izanamiProxy(config = {}) {
  const {
    app,
    configClientConfig,
    experimentClientConfig,
    featureClientConfig,
    pattern = '*',
    path = '/api/izanami',
  } = config

  if (!(app instanceof Koa)) {
    throw Error('No app given. Please specify app property in your proxy configuration')
  }

  const featureClient = featureClientConfig && izanami.featureClient(featureClientConfig)
  const experimentClient = experimentClientConfig && izanami.experimentClient(experimentClientConfig)
  const configClient = configClientConfig && izanami.configClient(configClientConfig)

  app.use(route.get(path, async ctx => {
    const izanamiFeatures = [
      featureClient ? featureClient.features(pattern) : {},
      experimentClient ? experimentClient.experiments(pattern) : {},
      configClient ? configClient.configs(pattern) : {},
    ]
    const [features, experiments, configurations] = await Promise.all(izanamiFeatures)

    ctx.body = { features, experiments, configurations }
  }))
}

module.exports = izanamiProxy
