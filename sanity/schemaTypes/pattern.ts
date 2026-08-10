import { defineType, defineField } from 'sanity'

export const patternType = defineType({
  name: 'pattern',
  title: 'Pattern',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text'
    }),
    defineField({
      name: 'timeComplexity',
      title: 'Time Complexity',
      type: 'string'
    }),
    defineField({
      name: 'spaceComplexity',
      title: 'Space Complexity',
      type: 'string'
    }),
    defineField({
      name: 'useCases',
      title: 'Use Cases',
      type: 'array',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'concept',
      title: 'Concept',
      type: 'text' // Markdown could be used here if installed, else simple text/portable text
    }),
    defineField({
      name: 'templateCode',
      title: 'Template Code (Java)',
      type: 'text'
    }),
    defineField({
      name: 'explanation',
      title: 'Explanation',
      type: 'text'
    }),
    defineField({
      name: 'variations',
      title: 'Variations',
      type: 'array',
      of: [{ type: 'variation' }]
    })
  ]
})
