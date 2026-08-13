export interface PatternVariation {
  id?: string;
  _id?: string;
  variation?: string;
  title?: string;
  description?: string;
  concept?: string;
  templateCode?: string;
  template_code?: string;
  important_details?: string[];
  other_relevant_details?: string;
  problems?: any[];
}

export interface PatternData {
  _id?: string;
  slug: string;
  title: string;
  description: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  useCases?: string[];
  concept?: string;
  templateCode?: string;
  explanation?: string;
  important_details?: string[];
  other_relevant_details?: string;
  variations: PatternVariation[];
}
