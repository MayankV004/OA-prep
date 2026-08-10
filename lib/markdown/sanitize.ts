import { defaultSchema } from 'rehype-sanitize';

export const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ['className', /^language-/]],
    span: [...(defaultSchema.attributes?.span ?? []), ['className', /^hljs-/]],
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      ['target', '_blank'],
      ['rel', 'noopener noreferrer nofollow'],
    ],
  },
  tagNames: (defaultSchema.tagNames ?? []).filter(
    (t) => !['iframe', 'object', 'embed', 'style', 'link', 'form', 'input', 'button'].includes(t)
  ),
  protocols: {
    href: ['http', 'https', 'mailto'],
    src: ['http', 'https'],
  },
};
