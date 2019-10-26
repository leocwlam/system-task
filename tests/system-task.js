'use strict'
/* eslint-env mocha */

const chai = require('chai')
const { expect } = chai

// const testHelper = require('./testHelper')
const MockTask = require('./mockTask')

const logMethod = function (messageType, message, detailMessage) {
  // console.log(messageType, message, detailMessage)
}

class MockInsertPreprocessItemsHandlerFailTask extends MockTask {
  constructor (isAsyncProcess, logMethod) {
    super(isAsyncProcess, logMethod)
    this.type = 'Fail Task'
  }
  async insertPreprocessItemsHandler (task) {
    await super.insertPreprocessItemsHandler(task)
    throw new Error('Fail for test')
  }
}

class MockPreprocessHandlerFailTask extends MockTask {
  constructor (isAsyncProcess, logMethod) {
    super(isAsyncProcess, logMethod)
    this.type = 'Fail Task'
  }
  async preprocessHandler (task, preProcessItem) {
    await super.preprocessHandler(task, preProcessItem)
    throw new Error('Fail for test')
  }
}

class MockProcessHandlerFailTask extends MockTask {
  constructor (isAsyncProcess, logMethod) {
    super(isAsyncProcess, logMethod)
    this.type = 'Fail Task'
  }
  async processHandler (task, processItem) {
    await super.processHandler(task, processItem)
    throw new Error('Fail for test')
  }
}

class MockCleanupHandlerFailTask extends MockTask {
  constructor (isAsyncProcess, logMethod) {
    super(isAsyncProcess, logMethod)
    this.type = 'Fail Task'
  }
  async cleanupHandler (task, cleanupItems) {
    await super.cleanupHandler(task, cleanupItems)
    throw new Error('Fail for test')
  }
}

const SystemTask = require('../src/system-task')
describe('system-task Tests', function () {
  describe('Setting Tests', function () {
    it('Pass no parameter ctor', function () {
      const task = new SystemTask()
      expect(task.type).to.equal('System Task')
      expect(task.isAsyncProcess).to.equal(false)
      expect(typeof task.logMethod).to.equal('undefined')
    })

    it('Pass parameter ctor', function () {
      const task = new SystemTask('Test Task', true, logMethod)
      expect(task.type).to.equal('Test Task')
      expect(task.isAsyncProcess).to.equal(true)
      expect(typeof task.logMethod).not.to.equal('undefined')
    })
  })

  describe('Test Task Behavior', function () {
    describe('Validate on isValidProcess', function () {
      const testCases = [
        { description: `Fail task start with AsyncProcess and missing logMethod`, testObject: new SystemTask(null, true) },
        { description: `Fail task start with AsyncProcess and missing logMethod`, testObject: new SystemTask(null, true, null) },
        { description: `Fail task start with SyncProcess and missing logMethod`, testObject: new SystemTask(null, false) },
        { description: `Fail task start with SyncProcess and missing logMethod`, testObject: new SystemTask(null, false, null) },
        { description: `Fail custom task start with AsyncProcess and missing logMethod`, testObject: new MockTask(true) },
        { description: `Fail custom task start with SyncProcess and missing logMethod`, testObject: new MockTask(false) }
      ]
      testCases.forEach(function (testCase) {
        it(testCase.description, async function () {
          const task = testCase.testObject
          await task.start()
            // .then(() => { assert.fail('Should be fail') })
            .catch((err) => {
              expect(err.message).to.equal('Missing type or logMethod')
              if (task.type === MockTask.TYPE) {
                const report = task.behaviorReport()
                expect(report.isInsertPreprocessItemsCalled).to.equal(false)
                expect(report.isPreprocessCalled).to.equal(false)
                expect(report.isProcessCalled).to.equal(false)
                expect(report.isCleanupCalled).to.equal(false)
                expect(report.numberOfInsertPreprocessItemsExecuted).to.equal(0)
                expect(report.numberOfPreprocesssExecuted).to.equal(0)
                expect(report.numberOfProcesssExecuted).to.equal(0)
                expect(report.numberOfCleanupExecuted).to.equal(0)
              }
            })
        })
      })
    })

    describe('Check service behavior', function () {
      it('Success execute task with no processing items', async function () {
        const task = new MockTask(true, logMethod)
        await task.start()
        const report = task.behaviorReport()
        expect(report.isInsertPreprocessItemsCalled).to.equal(true)
        expect(report.isPreprocessCalled).to.equal(false)
        expect(report.isProcessCalled).to.equal(false)
        expect(report.isCleanupCalled).to.equal(true)
        expect(report.numberOfInsertPreprocessItemsExecuted).to.equal(0)
        expect(report.numberOfPreprocesssExecuted).to.equal(0)
        expect(report.numberOfProcesssExecuted).to.equal(0)
        expect(report.numberOfCleanupExecuted).to.equal(0)
      })

      it('Success execute task with some processing items', async function () {
        const task = new MockTask(true, logMethod)
        task.manualAddPreprocessItem({ 'item': '1' })
        task.manualAddPreprocessItem({ 'item': '2' })
        await task.start()
        const report = task.behaviorReport()
        expect(report.isInsertPreprocessItemsCalled).to.equal(true)
        expect(report.isPreprocessCalled).to.equal(true)
        expect(report.isProcessCalled).to.equal(true)
        expect(report.isCleanupCalled).to.equal(true)
        expect(report.numberOfInsertPreprocessItemsExecuted).to.equal(2)
        expect(report.numberOfPreprocesssExecuted).to.equal(2)
        expect(report.numberOfProcesssExecuted).to.equal(2)
        expect(report.numberOfCleanupExecuted).to.equal(2)
      })

      describe('Fail on insertPreprocessItemsHandler behavior', function () {
        const testCases = [
          { description: `with AsyncProcess`, testObject: new MockInsertPreprocessItemsHandlerFailTask(true, logMethod) },
          { description: `with SyncProcess`, testObject: new MockInsertPreprocessItemsHandlerFailTask(false, logMethod) }
        ]
        testCases.forEach(function (testCase) {
          it(testCase.description, async function () {
            const task = testCase.testObject
            task.manualAddPreprocessItem({ 'item': '1' })
            task.manualAddPreprocessItem({ 'item': '2' })
            await task.start()
              // .then(() => { assert.fail('Should be fail') })
              .catch((err) => {
                expect(err.message).to.equal('Fail for test')
                const report = task.behaviorReport()
                expect(report.isInsertPreprocessItemsCalled).to.equal(true)
                expect(report.isPreprocessCalled).to.equal(false)
                expect(report.isProcessCalled).to.equal(false)
                expect(report.isCleanupCalled).to.equal(false)
                expect(report.numberOfInsertPreprocessItemsExecuted).to.equal(2)
                expect(report.numberOfPreprocesssExecuted).to.equal(0)
                expect(report.numberOfProcesssExecuted).to.equal(0)
                expect(report.numberOfCleanupExecuted).to.equal(0)
              })
          })
        })
      })

      describe('Fail on preprocessHandler without processing item behavior', function () {
        const testCases = [
          { description: `with AsyncProcess`, testObject: new MockPreprocessHandlerFailTask(true, logMethod) },
          { description: `with SyncProcess`, testObject: new MockPreprocessHandlerFailTask(false, logMethod) }
        ]
        testCases.forEach(function (testCase) {
          it(testCase.description, async function () {
            const task = testCase.testObject
            await task.start()
              .then(() => {
                const report = task.behaviorReport()
                expect(report.isInsertPreprocessItemsCalled).to.equal(true)
                expect(report.isPreprocessCalled).to.equal(false)
                expect(report.isProcessCalled).to.equal(false)
                expect(report.isCleanupCalled).to.equal(true)
                expect(report.numberOfInsertPreprocessItemsExecuted).to.equal(0)
                expect(report.numberOfPreprocesssExecuted).to.equal(0)
                expect(report.numberOfProcesssExecuted).to.equal(0)
                expect(report.numberOfCleanupExecuted).to.equal(0)
              })
          })
        })
      })

      describe('Fail on preprocessHandler with processing items behavior', function () {
        const testCases = [
          { description: `with AsyncProcess`, testObject: new MockPreprocessHandlerFailTask(true, logMethod), checkProcessNumberitems: true },
          { description: `with SyncProcess`, testObject: new MockPreprocessHandlerFailTask(false, logMethod), checkProcessNumberitems: false }
        ]
        testCases.forEach(function (testCase) {
          it(testCase.description, async function () {
            const task = testCase.testObject
            task.manualAddPreprocessItem({ 'item': '1' })
            task.manualAddPreprocessItem({ 'item': '2' })
            await task.start()
              // .then(() => { assert.fail('Should be fail') })
              .catch((err) => {
                expect(err.message).to.equal('Fail for test')
                const report = task.behaviorReport()
                expect(report.isInsertPreprocessItemsCalled).to.equal(true)
                expect(report.isPreprocessCalled).to.equal(true)
                expect(report.isProcessCalled).to.equal(false)
                expect(report.isCleanupCalled).to.equal(false)
                expect(report.numberOfInsertPreprocessItemsExecuted).to.equal(2)
                if (testCase.checkProcessNumberitems) {
                  expect(report.numberOfPreprocesssExecuted).to.equal(1)
                }
                expect(report.numberOfProcesssExecuted).to.equal(0)
                expect(report.numberOfCleanupExecuted).to.equal(0)
              })
          })
        })
      })

      describe('Fail on processHandler without processing item behavior', function () {
        const testCases = [
          { description: `with AsyncProcess`, testObject: new MockProcessHandlerFailTask(true, logMethod) },
          { description: `with SyncProcess`, testObject: new MockProcessHandlerFailTask(false, logMethod) }
        ]
        testCases.forEach(function (testCase) {
          it(testCase.description, async function () {
            const task = testCase.testObject
            await task.start()
              .then(() => {
                const report = task.behaviorReport()
                expect(report.isInsertPreprocessItemsCalled).to.equal(true)
                expect(report.isPreprocessCalled).to.equal(false)
                expect(report.isProcessCalled).to.equal(false)
                expect(report.isCleanupCalled).to.equal(true)
                expect(report.numberOfInsertPreprocessItemsExecuted).to.equal(0)
                expect(report.numberOfPreprocesssExecuted).to.equal(0)
                expect(report.numberOfProcesssExecuted).to.equal(0)
                expect(report.numberOfCleanupExecuted).to.equal(0)
              })
          })
        })
      })

      describe('Fail on processHandler with processing items behavior', function () {
        const testCases = [
          { description: `with AsyncProcess`, testObject: new MockProcessHandlerFailTask(true, logMethod), checkProcessNumberitems: true },
          { description: `with SyncProcess`, testObject: new MockProcessHandlerFailTask(false, logMethod), checkProcessNumberitems: false }
        ]
        testCases.forEach(function (testCase) {
          it(testCase.description, async function () {
            const task = testCase.testObject
            task.manualAddPreprocessItem({ 'item': '1' })
            task.manualAddPreprocessItem({ 'item': '2' })
            await task.start()
              // .then(() => { assert.fail('Should be fail') })
              .catch((err) => {
                expect(err.message).to.equal('Fail for test')
                const report = task.behaviorReport()
                expect(report.isInsertPreprocessItemsCalled).to.equal(true)
                expect(report.isPreprocessCalled).to.equal(true)
                expect(report.isProcessCalled).to.equal(true)
                expect(report.isCleanupCalled).to.equal(false)
                expect(report.numberOfInsertPreprocessItemsExecuted).to.equal(2)
                expect(report.numberOfPreprocesssExecuted).to.equal(2)
                if (testCase.checkProcessNumberitems) {
                  expect(report.numberOfProcesssExecuted).to.equal(1)
                }
                expect(report.numberOfCleanupExecuted).to.equal(0)
              })
          })
        })
      })

      describe('Fail on cleanupHandler behavior', function () {
        const testCases = [
          { description: `with AsyncProcess`, testObject: new MockCleanupHandlerFailTask(true, logMethod) },
          { description: `with SyncProcess`, testObject: new MockCleanupHandlerFailTask(false, logMethod) }
        ]
        testCases.forEach(function (testCase) {
          it(testCase.description, async function () {
            const task = testCase.testObject
            task.manualAddPreprocessItem({ 'item': '1' })
            task.manualAddPreprocessItem({ 'item': '2' })
            await task.start()
              // .then(() => { assert.fail('Should be fail') })
              .catch((err) => {
                expect(err.message).to.equal('Fail for test')
                const report = task.behaviorReport()
                expect(report.isInsertPreprocessItemsCalled).to.equal(true)
                expect(report.isPreprocessCalled).to.equal(true)
                expect(report.isProcessCalled).to.equal(true)
                expect(report.isCleanupCalled).to.equal(true)
                expect(report.numberOfInsertPreprocessItemsExecuted).to.equal(2)
                expect(report.numberOfPreprocesssExecuted).to.equal(2)
                expect(report.numberOfProcesssExecuted).to.equal(2)
                expect(report.numberOfCleanupExecuted).to.equal(2)
              })
          })
        })
      })
    })
  })
})
