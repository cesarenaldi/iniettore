# TODO
- [x] Dispose sub dependencies
- [x] Child context support
- [x] Bind container itself
- [x] Handle errors in case constructors, providers or dispose fails
	- [x] keep original errors trackable

- [ ] Make possible to pass extra params
	- [x] to contructors and providers
	- [ ] singletons should consider the arguments
- [ ] Handle errors in case of wrong fluid api calls
- [ ] Make dispose method name configurable
- [ ] Improve fluid API
	- [ ] remove done call
- [ ] test case when singletons do NOT implement a dispose method
- [ ] cleanup
	- [ ] remove memoize if not used
