export { };

// If the --expose-gc flag is passed to node then this function is available at the global scope
// On windows, getting heft to call jest via a node instance with this flag needs to call heft/lib/start.js directly:
// node --expose-gc \"./node_modules/@rushstack/heft/lib/start.js\" test --log-heap-usage --jest:log-heap-usage --clean
declare global {
    function gc(): void;
}