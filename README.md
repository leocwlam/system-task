# <a name="system-task"></a>system-task
> Provide the basic task framework to help initial task implementation.  It can be easy to inject any logging mechanism and integrate with any service framework.

[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/leocwlam/system-task/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/leocwlam/system-task.svg?branch=master)](https://travis-ci.org/leocwlam/system-task)
[![Coverage Status](https://coveralls.io/repos/github/leocwlam/system-task/badge.svg?branch=master)](https://coveralls.io/github/leocwlam/system-task?branch=master)
[![Dependency Status](https://david-dm.org/leocwlam/system-task.svg)](https://david-dm.org/leocwlam/system-task)
[![devDependency Status](https://david-dm.org/leocwlam/system-task/dev-status.svg)](https://david-dm.org/leocwlam/system-task?type=dev)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Greenkeeper badge](https://badges.greenkeeper.io/leocwlam/system-task.svg)](https://greenkeeper.io/)
[![npm badge](https://img.shields.io/npm/v/system-task/latest.svg)](https://www.npmjs.com/package/system-task)

# Contents
-------

<p align="center">
    <a href="#install">Install</a> &bull;
    <a href="#definition">Definition</a> &bull;
    <a href="#get-start">Get Start</a> &bull;
    <a href="#license">License</a>
</p>

-------

# <a href="#system-task">^</a><a name="install"></a>Install
**Install via npm:**
``` bash
npm install system-task --save
```

# <a href="#system-task">^</a><a name="definition"></a>Definition
``` js
const systemTask = require('system-task')
```

## <a name="systemTask"></a>SystemTask
SystemTask is a base task engine, which handles to process all task items.  It needs to overwritten by the following methods:

| Method                       | Description                      | Overriding Defination                          |
|------------------------------|----------------------------------|------------------------------------------------|
| insertPreprocessItemsHandler | Insert items for process         | async insertPreprocessItemsHandler (task)      |
| preprocessHandler            | Preprocess each item for process | async preprocessHandler (task, preProcessItem) |
| processHandler               | Execute each task item           | async processHandler (task, processItem)       |
| cleanupHandler               | Cleanup any processed task items | async cleanupHandler (task, cleanupItems)      |


# <a href="#system-task">^</a><a name="get-start"></a>Get Start
- Implement Custom Task

``` js
const SystemTask = require('system-service')
const TYPE = 'Demo Task'

const DEMOASSET = {
  name: 'DEMO ASSET',
  execute () {
    console.log('Implement execute aseet logic')
  }
}

const logMethod = function (messageType, message, detailMessage) {
  console.log(messageType, message, detailMessage)
}

class DemoTask extends SystemTask {
  const REQUIREASYNCEPROCESS = true
  constructor () {
    super(TYPE, REQUIREASYNCEPROCESS, logMethod)
  }

  async insertPreprocessItemsHandler (task) {
    return [
        { Object.assign({}, DEMOASSET, { name: 'Asset 1' }) },
        { Object.assign({}, DEMOASSET, { name: 'Asset 2' }) }
      ]
  }

  async processHandler (task, processItem) {
    await task.log('info', `execuse`, {Type: task.type, processItem})
    // processItem can be execute method 
    // e.g. await processItem.execute()

    return processItem
  }
}

module.exports = DemoTask
```

- Start up Task

``` js
const DemoTask = require('./demoTask')
const task = new DemoTask()

task.start()
```



# <a href="#system-service">^</a><a name="license"></a>License
MIT
