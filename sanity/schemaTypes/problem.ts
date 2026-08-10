import { defineType, defineField } from 'sanity'

export const problemType = defineType({
  name: 'problem',
  title: 'Problem',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      options: {
        list: [
          { title: 'Easy', value: 'Easy' },
          { title: 'Medium', value: 'Medium' },
          { title: 'Hard', value: 'Hard' }
        ],
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'pattern',
      title: 'Pattern',
      type: 'reference',
      to: [{ type: 'pattern' }]
    }),
    defineField({
      name: 'variation',
      title: 'Variation (ID or Title)',
      description: 'Used to group problems within a pattern (matches Variation ID or Title)',
      type: 'string'
    })
  ]
})
