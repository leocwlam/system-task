'use strict'

const sinon = require('sinon')

const SystemTask = require('../src/system-task')
const MOCKTASKTYPE = 'Mock Task'

class MockTask extends SystemTask {
  constructor (isAsyncProcess, logMethod) {
    super(MOCKTASKTYPE, isAsyncProcess, logMethod)
    this.init()
  }

  init () {
    this.insertPreprocessItemsBehavior = sinon.stub()
    this.preprocesssBehavior = sinon.stub()
    this.processBehavior = sinon.stub()
    this.cleanupBehavior = sinon.stub()
    this.items = []
    this.insertPreprocessItemsExecuted = 0
    this.preprocesssExecuted = 0
    this.processsExecuted = 0
    this.cleanupExecuted = 0
  }

  manualAddPreprocessItem (item) {
    this.items.push(item)
  }

  // Implement insert items for preprocess
  async insertPreprocessItemsHandler (task) {
    let result = await super.insertPreprocessItemsHandler(task)
    task.insertPreprocessItemsBehavior()
    result = result.concat(this.items)
    task.insertPreprocessItemsExecuted = result.length
    return result
  }

  // Implement preprocess for all items
  async preprocessHandler (task, preProcessItem) {
    const result = await super.preprocessHandler(task, preProcessItem)
    task.preprocesssBehavior()
    task.preprocesssExecuted++
    return result
  }

  // Implement process for an item
  async processHandler (task, processItem) {
    const result = await super.processHandler(task, processItem)
    task.processBehavior()
    task.processsExecuted++
    return result
  }

  // Implement cleanup for all items
  async cleanupHandler (task, cleanupItems) {
    const result = await super.cleanupHandler(task, cleanupItems)
    task.cleanupBehavior()
    task.cleanupExecuted = cleanupItems.length
    return result
  }

  behaviorReport () {
    return {
      isInsertPreprocessItemsCalled: this.insertPreprocessItemsBehavior.called,
      isPreprocessCalled: this.preprocesssBehavior.called,
      isProcessCalled: this.processBehavior.called,
      isCleanupCalled: this.cleanupBehavior.called,
      numberOfInsertPreprocessItemsExecuted: this.insertPreprocessItemsExecuted,
      numberOfPreprocesssExecuted: this.preprocesssExecuted,
      numberOfProcesssExecuted: this.processsExecuted,
      numberOfCleanupExecuted: this.cleanupExecuted
    }
  }
}

module.exports = MockTask
module.exports.TYPE = MOCKTASKTYPE
