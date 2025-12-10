// Copyright 2024, University of Colorado Boulder

/**
 * ESLint configuration for circuit-construction-kit-common.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import simEslintConfig from '../perennial-alias/js/eslint/config/sim.eslint.config.mjs';

export default [
  ...simEslintConfig,

  {
    rules: {

      // This sim is experimenting with allowing object spread on non-literals, so disable this rule. I'll double-check before publication if that's still a good idea.
      // see https://github.com/phetsims/circuit-construction-kit-common/issues/1107
      'phet/no-object-spread-on-non-literals': 'off'
    }
  }
];