# koa-izanami-proxy

[![Build Status](https://travis-ci.org/charlyx/koa-izanami-proxy.svg?branch=master)](https://travis-ci.org/charlyx/koa-izanami-proxy)
[![Coverage Status](https://coveralls.io/repos/github/charlyx/koa-izanami-proxy/badge.svg?branch=master)](https://coveralls.io/github/charlyx/koa-izanami-proxy?branch=master)

[Izanami](https://maif.github.io/izanami/) proxy for [Koa](https://koajs.com/)

## Why?

In order to use Izanami features on the client side you have to use a proxy. To call Izanami APIs you need to provide authentication keys and you don’t want the keys to be exposed on the client side. For further details, please see the [documentation](https://maif.github.io/izanami/manual/tutorials/spring.html#create-a-proxy).

The proxy provided by [izanami-node](https://github.com/MAIF/izanami/blob/8af5562f9b56d3082441e5fc052af1dccba26ecc/izanami-clients/node/readme.md) has been written for express, thus it does not work with Koa.

## Install

```sh
npm install koa-izanami-proxy@alpha
```

```sh
yarn add koa-izanami-proxy@alpha
```


## Usage


You must specify at least one client configuration option depending on your needs (either `featureClientConfig`, `experimentClientConfig` or `configClientConfig`).  
One must contain a `host`, `clientId` and `clientSecret`:

* `host` is your Izanami server URL
* `clientId` and `clientSecret` are secrets you've created in Izanami keys management.

Other options are available for [proxy configuration](#proxy-configuration).

```js
const Koa = require('koa')
const cors = require('@koa/cors')
const izanamiProxy = require('koa-izanami-proxy')

const featureClientConfig =  {
  host: 'http://localhost:8080', // Izanami server URL
  clientId: process.env.CLIENT_ID || 'client',
  clientSecret: process.env.CLIENT_SECRET || 'client1234',
}

const app = new Koa()

app.use(cors())

const proxyConfiguration = { app, featureClientConfig }

izanamiProxy(proxyConfiguration)

app.listen(5000, () => {
  console.log('Example app listening on port 5000!')
})
```

## Proxy configuration

```js
{
  path: '/your/path', // default: '/api/izanami'
  featureClientConfig, // Optional
  configClientConfig, // Optional
  experimentClientConfig, // Optional
  experimentWonPath: '/your/won/path', // default: '/api/experiments/won'
  experimentDisplayedPath: '/your/displayed/path',  // default: '/api/experiments/displayed'
  app, // Koa app 
  pattern: 'my.namespace.*' // The pattern to filter experiments, configs and features (default: '*')
}
```
