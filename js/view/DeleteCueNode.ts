// Copyright 2025, University of Colorado Boulder

/**
 * A Node that displays a visual cue to use delete/backspace to cut or remove a component.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import KeyboardCueNode, { KeyboardCueNodeOptions } from '../../../scenery-phet/js/accessibility/nodes/KeyboardCueNode.js';
import TextKeyNode from '../../../scenery-phet/js/keyboard/TextKeyNode.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

type SelfOptions = EmptySelfOptions;
export type DeleteCueNodeOptions = SelfOptions & StrictOmit<KeyboardCueNodeOptions, 'createKeyNode'>;

export default class DeleteCueNode extends KeyboardCueNode {
  public constructor( providedOptions: DeleteCueNodeOptions ) {
    const options = optionize<DeleteCueNodeOptions, SelfOptions, KeyboardCueNodeOptions>()( {
      createKeyNode: TextKeyNode.delete
    }, providedOptions );

    super( options );
  }
}

circuitConstructionKitCommon.register( 'DeleteCueNode', DeleteCueNode );
