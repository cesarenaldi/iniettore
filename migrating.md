# Migrating from 3.x

Complete rewrite

Rationale
- too much magic
- broken interfaces (see blueprint)
- type support

## Deprecated

- implicit dependency argument notation
- property mapper
- lazy singletons...all singletons managed by iniettore are transient
- eager singleton not managed by the library

