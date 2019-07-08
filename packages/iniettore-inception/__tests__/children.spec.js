// import { container } from 'iniettore'
import { child, fork } from '../src'
import { get } from 'http'

describe('Given a context', () => {
  describe('when a child context is create out of it', () => {
    xit('should', () => {
      const context = container(() => ({
        bob: child(() => ({}))
      }))
    })
  })
})
