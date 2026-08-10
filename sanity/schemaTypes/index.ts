import { type SchemaTypeDefinition } from 'sanity'

import { patternType } from './pattern'
import { variationType } from './variation'
import { problemType } from './problem'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [patternType, variationType, problemType],
}
