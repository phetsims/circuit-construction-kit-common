// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var NumberControl = require( 'SCENERY_PHET/NumberControl' );
  var RoundPushButton = require( 'SUN/buttons/RoundPushButton' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var Range = require( 'DOT/Range' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var Property = require( 'AXON/Property' );

  function CircuitElementEditPanel( title, units, valueProperty, circuit, circuitElement, tandem, options ) {
    options = _.extend( { numberControlEnabled: true }, options );

    var font = new PhetFont( 14 );
    var numberControlOptions = {
      titleFont: font,
      valueFont: font,
      decimalPlaces: 1
    };

    // Track whether the changes were from the user interface or from the model (e.g. the resistance of a wire
    // changing when its length changes).
    var proxy = new Property( valueProperty.value );
    var changing = false;
    proxy.lazyLink( function( value ) {
      valueProperty.value = value;
      if ( !changing ) {
        circuit.componentEditedEmitter.emit();
      }
    } );
    valueProperty.lazyLink( function( value ) {
      changing = true;
      proxy.value = value;
      changing = false;
    } );

    // Create the controls using the proxy
    var numberControl = new NumberControl( title, proxy, new Range( 0, 100 ), _.extend( {
      tandem: tandem.createTandem( 'numberControl' ),
      units: units
    }, numberControlOptions ) );
    var trashButton = new RoundPushButton( {
      baseColor: 'yellow',
      content: new FontAwesomeNode( 'trash', {
        scale: CircuitConstructionKitConstants.fontAwesomeIconScale
      } ),
      listener: function() {
        circuit.remove( circuitElement );
      },
      minXMargin: 10,
      minYMargin: 10,
      tandem: tandem.createTandem( 'trashButton' )
    } );
    var children = [];
    if ( options.numberControlEnabled ) {
      children.push( numberControl );
    }
    if ( circuitElement.canBeDroppedInToolbox ) {
      children.push( trashButton );
    }
    HBox.call( this, {
      spacing: 40,
      align: 'bottom',
      children: children
    } );

    this.disposeCircuitElementEditPanel = function() {
      numberControl.dispose();
    };
  }

  circuitConstructionKitCommon.register( 'CircuitElementEditPanel', CircuitElementEditPanel );

  return inherit( HBox, CircuitElementEditPanel, {
    dispose: function() {
      this.disposeCircuitElementEditPanel();
      HBox.prototype.dispose.call( this );
    }
  } );
} );