import { defineType, defineField } from 'sanity'

export const variationType = defineType({
  name: 'variation',
  title: 'Variation',
  type: 'object',
  fields: [
    defineField({
      name: 'id',
      title: 'ID',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'concept',
      title: 'Concept',
      type: 'text'
    }),
    defineField({
      name: 'templateCode',
      title: 'Template Code (Java)',
      type: 'text'
    })
  ]
})
