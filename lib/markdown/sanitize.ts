import { defaultSchema } from 'rehype-sanitize';

export const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [
      ...(defaultSchema.attributes?.code ?? []),
      ['className', /^language-/],
      ['className', /^token/],
      ['className', /^shiki/],
      ['className', /^hljs-/],
    ],
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      ['className', /.*/],
      ['style'],
    ],
    pre: [
      ...(defaultSchema.attributes?.pre ?? []),
      ['className', /.*/],
      ['style'],
    ],
    div: [
      ...(defaultSchema.attributes?.div ?? []),
      ['className', /.*/],
      ['style'],
      ['data-lang'],
      ['data-color-mode'],
    ],
    input: [
      ['type', 'checkbox'],
      ['checked'],
      ['disabled'],
      ['className'],
    ],
    table: [...(defaultSchema.attributes?.table ?? []), ['className']],
    th: [...(defaultSchema.attributes?.th ?? []), ['className', 'align']],
    td: [...(defaultSchema.attributes?.td ?? []), ['className', 'align']],
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      ['target', '_blank'],
      ['rel', 'noopener noreferrer nofollow'],
      ['className'],
    ],
  },
  tagNames: [
    ...(defaultSchema.tagNames ?? []).filter(
      (t) => !['iframe', 'object', 'embed', 'style', 'link', 'form', 'button'].includes(t)
    ),
    'input',
    'del',
    's',
    'strike',
    'sub',
    'sup',
    'kbd',
  ],
  protocols: {
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https'],
  },
};

