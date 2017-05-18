// Copyright 2015-2017, University of Colorado Boulder

/**
 * Renders the lifelike/schematic view for a Battery.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var FixedLengthCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/FixedLengthCircuitElementNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Property = require( 'AXON/Property' );

  /**
   * @param {CircuitConstructionKitScreenView} circuitConstructionKitScreenView
   * @param {CircuitNode} circuitNode
   * @param {Battery} battery
   * @param {Property.<boolean>} runningProperty - supplied for consistency with other CircuitElementNode constructors
   * @param {Property.<string>} viewProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function SeriesAmmeterNode( circuitConstructionKitScreenView, circuitNode, battery, runningProperty, viewProperty, tandem, options ) {

    viewProperty = new Property( 'lifelike' );

    // @public (read-only) - the Battery rendered by this Node
    this.battery = battery;

    var createNode = function() {
      var node = new Rectangle( 0, 0, 100, 40, 10, 10, {
        fill: '#f39033',
        stroke: '#231f20',
        lineWidth: 4
      } );

      // Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
      node.mouseArea = node.bounds.copy();
      node.touchArea = node.bounds.copy();

      // Center vertically to match the FixedLengthCircuitElementNode assumption that origin is center left
      node.centerY = 0;
      return node;
    };

    var lifelikeNode = createNode();
    var schematicNode = createNode();

    FixedLengthCircuitElementNode.call( this,
      circuitConstructionKitScreenView,
      circuitNode,
      battery,
      viewProperty,
      lifelikeNode,
      schematicNode,
      tandem,
      options
    );
  }

  circuitConstructionKitCommon.register( 'SeriesAmmeterNode', SeriesAmmeterNode );

  return inherit( FixedLengthCircuitElementNode, SeriesAmmeterNode );
} );