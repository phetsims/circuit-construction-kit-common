* Model and view are in the same coordinate frame.
* Each node defines its own lifelike and schematic nodes internally, so nothing needs to be disposed or re-created when
the view type changes.
* This repo is supposed to contain code that would be used in potentially any circuit construction kit offshoot.  However, since
we don't have designs for some of the sims (such as AC), it is kind of like a kitchen sink
* There are two kinds of ammeter.  One is a single-terminal probe (Ammeter.js) which can sense the current when placed over a wire.
The other is a series ammeter (SeriesAmmeter.js), which must be connected with a circuit in series and reads out the current through itself.