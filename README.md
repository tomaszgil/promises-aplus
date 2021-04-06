<a href="https://promisesaplus.com/">
    <img src="https://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo"
         title="Promises/A+ 1.0 compliant" align="right" />
</a>

# Promises/A+

Simple TypeScript implementation of JavaScript promises, conformant with Promise/A+ specification.

1. Specification - https://promisesaplus.com/
1. Tests - https://github.com/promises-aplus/promises-tests

## Development

Starts typescript compilation for every file from `src` directory, with output to `dist`.

```
npm start
```

## Running tests

Requires compiling to JavaScript first.
Tests use `index.ts`, which exports an adapter for the tests to create promises.

```
npm run test
```
