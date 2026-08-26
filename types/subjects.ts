export interface SubjectTopic {
  id: string;
  slug: string;
  title: string;
  description: string;
  iconName?: string;
  order?: number;
  questionCount?: number;
}

export interface SubjectModule {
  id: string;
  slug: string;
  title: string;
  description: string;
  topics: SubjectTopic[];
}
