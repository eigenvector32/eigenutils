A simple wrapper around a web worker intended to be hosted in the dependency container.
Reminder: In order for webpack to put the web worker code in it's own chunk, the URL
sent to WorkerService should be created like:
`new URL('./webWorker.js', import.meta.url)`