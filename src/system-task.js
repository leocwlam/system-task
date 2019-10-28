'use strict'
/* eslint-env mocha */

const TYPE = 'System Task'

const asyncForEach = async function (array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index])
  }
}

const asyncProcess = async function (items, executeAsyncCall, task, errors = []) {
  const result = []
  let anyIssue = false
  if (items) {
    await asyncForEach(items, async (item) => {
      if (anyIssue) return
      try {
        const processedItem = await executeAsyncCall(task, item)
        result.push(processedItem)
      } catch (error) {
        anyIssue = true
        errors.push(error)
      }
    })
  }

  if (anyIssue) {
    throw errors[0] // just throw the first error
  }
  return result
}

const syncProcess = async function (items, executeSyncCall, task, errors = []) {
  const processList = []
  if (items) {
    items.forEach(function (item) {
      const promiseTask = async () => {
        try {
          return await executeSyncCall(task, item)
        } catch (error) {
          errors.push(error)
          throw error
        }
      }
      processList.push(promiseTask)
    })
  }

  if (processList.length > 0) {
    const promises = processList.map((executeItem) => executeItem())

    const result = await Promise.all(promises)
    return result
  } else {
    return []
  }
}

class SystemTask {
  constructor (taskType, isAsyncProcess, logMethod) {
    this.type = (taskType != null) ? taskType : TYPE
    this.isAsyncProcess = (isAsyncProcess != null) ? isAsyncProcess : false
    this.logMethod = logMethod
  }

  async log (type, message, detail) {
    if (this.logMethod) {
      await this.logMethod(type, message, detail)
    }
  }

  // Handle insert preprocess items before preprocessHandler
  async insertPreprocessItemsHandler (task) {
    await task.log('verbose', 'insert Preprocess Items', { Type: task.type })
    return []
  }

  // Handle preprocess
  async preprocessHandler (task, preProcessItem) {
    await task.log('verbose', 'preprocess item', { Type: task.type, preProcessItem })
    return preProcessItem
  }

  // Implement process Item execution
  async processHandler (task, processItem) {
    await task.log('verbose', 'execute item', { Type: task.type, processItem })
    return processItem
  }

  // Implement all assets cleanup process
  async cleanupHandler (task, cleanupItems) {
    await task.log('verbose', 'cleanup items', { Type: task.type, cleanupItems })
    return cleanupItems
  }

  async preprocess () {
    const preprocessItems = await this.insertPreprocessItemsHandler(this)
    const errors = []

    try {
      let result
      if (this.isAsyncProcess) {
        result = await asyncProcess(preprocessItems, this.preprocessHandler, this, errors)
      } else {
        result = await syncProcess(preprocessItems, this.preprocessHandler, this, errors)
      }
      return result
    } catch (error) {
      await this.log('error', 'preprocess', { Type: this.type, errors })
      throw error
    }
  }

  async process (preProcessResult) {
    const errors = []

    try {
      let result
      if (this.isAsyncProcess) {
        result = await asyncProcess(preProcessResult, this.processHandler, this, errors)
      } else {
        result = await syncProcess(preProcessResult, this.processHandler, this, errors)
      }
      return result
    } catch (error) {
      await this.log('error', 'process', { Type: this.type, errors })
      throw error
    }
  }

  async cleanup (processResult) {
    const result = await this.cleanupHandler(this, processResult)
    return result
  }

  isValidProcess () {
    if ((!this.type) || (!this.logMethod)) {
      throw new Error('Missing type or logMethod')
    }
  }

  // General design to run process steps
  async start () {
    await this.log('info', `Getting start process under ${this.type}`, { Type: this.type })
    try {
      this.isValidProcess()

      // Fail here, should be able to rerun (No Cleanup require)
      await this.log('info', 'Preprocess all records before execute', { Type: this.type })
      let preprocessResult = []
      try {
        preprocessResult = await this.preprocess()
      } catch (error) {
        await this.log('error', 'Fail: preprocess', { Error: error.message, Type: this.type })
        throw error
      }

      // Fail here, process is depended which type of asset, it should be able to re-runable.
      // In General, it should not need to cleanup for all the successful during this run,
      // but it is optional to cleanup inside preprocessHandler per base.
      await this.log('info', 'Start process', { Type: this.type, NumberOfPreprocess: preprocessResult.length })
      const processResult = await this.process(preprocessResult)

      // Handle the success process assets
      await this.log('info', 'Cleanup processing after process', { Type: this.type, NumberOfProcess: processResult.length })
      const cleanupResult = await this.cleanup(processResult)

      await this.log('info', 'Complete: task', { Type: this.type, NumberOfCleanup: cleanupResult.length })
    } catch (error) {
      await this.log('error', 'Fail: task', { Error: error.message, Type: this.type })
      throw error
    }
  }
}

module.exports = SystemTask
module.exports.SyncProcess = syncProcess
module.exports.AsyncProcess = asyncProcess
