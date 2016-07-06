// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * The node that shows the black round rectangle with a question mark.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Text = require( 'SCENERY/nodes/Text' );
  var CircuitConstructionKitQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitQueryParameters' );

  /**
   * @param {number} width
   * @param {number} height
   * @param {Property.<boolean>} revealingProperty - true if the user is pressing the "reveal" button
   * @param {Object} [options]
   * @constructor
   */
  function BlackBoxNode( width, height, revealingProperty, options ) {
    var questionMarkTextNode = new Text( '?', {
      fontSize: 82,
      centerX: width / 2,
      centerY: height / 2,
      fill: 'white'
    } );
    revealingProperty.link( function( revealing ) {questionMarkTextNode.visible = !revealing;} );
    Node.call( this, {

      // Don't let clicks go through the black box
      pickable: true,

      children: [
        new Rectangle( 0, 0, width, height, 20, 20, {
          fill: 'black',
          opacity: CircuitConstructionKitQueryParameters.dev ? 0.2 : 1
        } ),
        questionMarkTextNode
      ]
    } );
    this.mutate( options );
  }

  circuitConstructionKitCommon.register( 'BlackBoxNode', BlackBoxNode );
  return inherit( Node, BlackBoxNode );
} );