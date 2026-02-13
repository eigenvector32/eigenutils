# Emitter Variants

The ultimate source for this code is the Emitter found in the source code for Visual Studio Code itself as it existed around 2019. And that Emitter in VS code has, over the years, gone down the route of becoming more and more complex. I have instead gone with six simple emitters that are each very specialized. This comes with the usual pros and cons: improved effeciency (fewer branches, less memory), simpler code in exchange for some duplication of code.

As a side note, this could certainly be done better with a single template and perhaps some specialization in C++. But with the tools available on the web I much prefer this setup, even with some code duplication, over the single overloaded Emitter model. 

# Tests

One thing of interest here is the unit testing of code using WeakRef. In order for these tests to work the instance of node running Jest needs to be launched with the --expose-gc argument. See the package.json for an example.
These tests are potentially fragile if the internal workings of garbage collection in Node substantially change in the future. However, I am confident that this is the best solution that is currently possible to test this functionality at all. 