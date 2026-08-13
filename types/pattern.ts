export interface PatternVariation {
  id: string;
  title: string;
  concept: string;
  templateCode: string;
  problems?: any[];
}

export interface PatternData {
  slug: string;
  title: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  useCases: string[];
  concept: string;
  templateCode: string;
  explanation: string;
  variations: PatternVariation[];
}
