# koa-izanami-proxy

[![Build Status](https://travis-ci.org/charlyx/koa-izanami-proxy.svg?branch=master)](https://travis-ci.org/charlyx/koa-izanami-proxy)
[![Coverage Status](https://coveralls.io/repos/github/charlyx/koa-izanami-proxy/badge.svg?branch=master)](https://coveralls.io/github/charlyx/koa-izanami-proxy?branch=master)

[Izanami](https://maif.github.io/izanami/) proxy for [Koa](https://koajs.com/)

## Install

```sh
npm install koa-izanami-proxy@alpha
```

```sh
yarn add koa-izanami-proxy@alpha
```

## Example

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
izanamiProxy({ app, featureClientConfig })

app.listen(5000, () => {
  console.log('Example app listening on port 5000!')
})
```
