// Copyright 2017-2021, University of Colorado Boulder

/**
 * Radio buttons that allow the user to choose between Schematic and Lifelike views. Exists for the life of the sim and
 * hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Vector2 from '../../../dot/js/Vector2.js';
import merge from '../../../phet-core/js/merge.js';
import RectangularRadioButtonGroup from '../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Battery from '../model/Battery.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import Vertex from '../model/Vertex.js';
import BatteryNode from './BatteryNode.js';

// constants
const BATTERY_LENGTH = CCKCConstants.BATTERY_LENGTH;
const SCALE = 0.4;

class ViewRadioButtonGroup extends RectangularRadioButtonGroup<CircuitElementViewType> {

  /**
   * @param {Property.<CircuitElementViewType>} viewTypeProperty - whether to show lifelike or schematic representations
   * @param {Tandem} tandem
   * @param {Object} [providedOptions]
   */
  constructor( viewTypeProperty: Property<CircuitElementViewType>, tandem: Tandem, providedOptions?: any ) {

    providedOptions = merge( {
      spacing: 20,
      orientation: 'horizontal',
      buttonContentXMargin: 8,
      buttonContentYMargin: 11,
      baseColor: CCKCConstants.PANEL_COLOR,
      deselectedButtonOpacity: 0.4,
      overButtonOpacity: 0.7,
      cornerRadius: CCKCConstants.CORNER_RADIUS,
      tandem: tandem,
      touchAreaXDilation: 9,
      touchAreaYDilation: 10
    }, providedOptions );

    // Create a battery which can be used in the views
    const startVertex = new Vertex( new Vector2( BATTERY_LENGTH / 2, 0 ) );
    const endVertex = new Vertex( new Vector2( -BATTERY_LENGTH / 2, 0 ) );
    const battery = new Battery( endVertex, startVertex, new NumberProperty( 0 ), 'normal', Tandem.OPTIONAL, {
      initialOrientation: 'left'
    } );

    /**
     * Create a battery node to be used as an icon.
     *
     * @param {CircuitElementViewType} view
     * @param {Tandem} tandem
     * @returns {BatteryNode}
     */
    const createBatteryNode = ( view: CircuitElementViewType, tandem: Tandem ) => new BatteryNode( null, null, battery, new Property( view ), tandem, {
      isIcon: true,
      scale: SCALE
    } );
    const lifelikeIcon = createBatteryNode( CircuitElementViewType.LIFELIKE, tandem.createTandem( 'lifelikeIcon' ) );
    const schematicIcon = createBatteryNode( CircuitElementViewType.SCHEMATIC, tandem.createTandem( 'schematicIcon' ) );
    super( viewTypeProperty, [ {
      value: CircuitElementViewType.LIFELIKE,
      node: lifelikeIcon,
      tandemName: 'lifelikeRadioButton'
    }, {
      value: CircuitElementViewType.SCHEMATIC,
      node: schematicIcon,
      tandemName: 'schematicRadioButton'
    } ], providedOptions );
  }
}

circuitConstructionKitCommon.register( 'ViewRadioButtonGroup', ViewRadioButtonGroup );
export default ViewRadioButtonGroup;