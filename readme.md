#eigenutils

Collection of utilities useful to web applications. There are no import files collecting them together. Each class or function should be imported separately to aid with tree shaking.

## color
So far just enough color code to do contrast calculations.
## data
Note that the data section is still highly speculative and not ready for production use.
## di
A basic dependency container.
## emitter
A set of event emitters. Also includes weak events that do not retain a strong reference to their listeners.
## workers
Wrapper / helper for web workers.

# rigs
Two rigs for use with rushstack and heft. One for node.js and one that can be used for web applications bundled with webpack or for standalone libraries.