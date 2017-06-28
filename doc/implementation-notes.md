* This repo is supposed to contain code that would be used in potentially any circuit construction kit offshoot.  
However, since we don't have designs for some of the sims (such as AC), it is kind of like a kitchen sink **or** a 
dedicated repo for the CCK-DC simulation.
* Model and view are in the same coordinate frame, with the origin an the center of the screen.  The layout reflows to
move control panels to the edges to maximize the available play area.
* Each node defines its own lifelike and schematic nodes internally, so nothing needs to be disposed or re-created when
the view type changes.
* There are two kinds of ammeter.  One is a single-terminal probe (Ammeter.js) which can sense the current when placed 
over a wire. The other is a series ammeter (SeriesAmmeter.js), which must be connected with a circuit in series and 
reads out the current through itself.
* View Layering: the CircuitLayerNode shows circuit elements, highlights, solder, and sensors.  Each CircuitElementNode
may node parts that appear in different layers, such as the highlight and the light bulb socket.  Having the light bulb
socket in another layer makes it possible to show the electrons going "through" the socket (in z-ordering). The 
CircuitElementNode constructors populate different layers of the CircuitLayerNode in their constructors and depopulate 
in their dispose functions.
* To attain high performance on iPad2, some of the CircuitLayerNode child node layers have been implemented in WebGL 
using `renderer:'webgl'`.  This means all of the nodes must be rendered with solid-fill Rectangle (without rounded 
corners or gradients), and images.  Node.toDataURLNodeSynchronous is used throughout these view layers to rasterize as 
images. 