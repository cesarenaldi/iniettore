import iniettore from '../../src/iniettore'
import { FUNCTION, VALUE } from '../../src/iniettore'

describe('Given a context with a registered function', function () {

	var rootContext

	describe('when the function has some dependencies', function () {

		var BAR = {}

		it('should return a partial application of the function', function () {
			var foo = function (bar, param1) {
				expect(bar).to.equal(BAR)
				expect(param1).to.equal(42)
			}

			rootContext = iniettore.create(function (map) {
				map('bar').to(BAR).as(VALUE)
				map('foo').to(foo).as(FUNCTION).injecting('bar')
			})

			foo = rootContext.get('foo')

			foo(42)
		})
	})
})
