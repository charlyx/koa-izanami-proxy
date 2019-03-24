const route = require('koa-route')
const izanami = require('izanami-node')

function izanamiProxy(config = {}) {
  const {
    app,
    configClientConfig,
    experimentClientConfig,
    experimentWonPath = '/api/experiments/won',
    experimentDisplayedPath = '/api/experiments/displayed',
    featureClientConfig,
    pattern = '*',
    path = '/api/izanami',
  } = config

  if (!app) {
    throw Error('No app given. Please specify app property in your proxy configuration')
  }

  const featureClient = featureClientConfig && izanami.featureClient({
    ...izanami.defaultConfig,
    ...featureClientConfig,
  })
  const experimentClient = experimentClientConfig && izanami.experimentClient({
    ...izanami.defaultConfig,
    ...experimentClientConfig,
  })
  const configClient = configClientConfig && izanami.configClient({
    ...izanami.defaultConfig,
    ...configClientConfig,
  })

  app.use(route.get(path, async ctx => {
    const izanamiFeatures = [
      featureClient ? featureClient.features(pattern) : {},
      experimentClient ? experimentClient.experiments(pattern) : {},
      configClient ? configClient.configs(pattern) : {},
    ]
    const [features, experiments, configurations] = await Promise.all(izanamiFeatures)

    ctx.body = { features, experiments, configurations }
  }))

  app.use(route.post(experimentWonPath, async ctx => {
    if (experimentClient) {
      experimentClient.won(ctx.query.experiment).then(() => {
        ctx.body = { done: true }
      })
    } else {
      ctx.throw('Please specify experimentClientConfig.')
    }
  }))

  app.use(route.post(experimentDisplayedPath, async ctx => {
    if (experimentClient) {
      experimentClient.displayed(ctx.query.experiment).then(() => {
        ctx.body = { done: true }
      })
    } else {
      ctx.throw('Please specify experimentClientConfig.')
    }
  }))
}

module.exports = izanamiProxy
