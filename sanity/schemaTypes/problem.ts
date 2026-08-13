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
      name: 'problemType',
      title: 'Problem Type',
      type: 'string',
      options: {
        list: [
          { title: 'DSA', value: 'DSA' },
          { title: 'CP', value: 'CP' },
          { title: 'Both', value: 'Both' }
        ]
      },
      initialValue: 'DSA'
    }),
    defineField({
      name: 'rating',
      title: 'CP Rating',
      type: 'number',
      hidden: ({ document }) => document?.problemType === 'DSA'
    }),
    defineField({
      name: 'contest',
      title: 'Contest Name',
      type: 'string',
      hidden: ({ document }) => document?.problemType === 'DSA'
    }),
    defineField({
      name: 'companyTags',
      title: 'Company Tags',
      type: 'array',
      of: [{ type: 'string' }],
      hidden: ({ document }) => document?.problemType === 'CP'
    })
  ]
})
