import { z } from 'zod';

const tavilyResultSchema = z.object({
  title: z.string().default('Untitled'),
  url: z.string().url(),
  content: z.string().optional()
});

const tavilyResponseSchema = z.object({
  results: z.array(tavilyResultSchema).default([])
});

export type SearchResult = {
  title: string;
  url: string;
  snippet: string;
};

export async function searchWeb(query: string): Promise<{ top: SearchResult; alternates: SearchResult[] }> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    throw new Error('TAVILY_API_KEY is not configured');
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      query,
      search_depth: 'basic',
      max_results: 5,
      include_answer: false,
      include_raw_content: false
    })
  });

  if (!response.ok) {
    throw new Error(`Tavily request failed with ${response.status}`);
  }

  const data = tavilyResponseSchema.parse(await response.json());
  const mapped = data.results.map((result) => ({
    title: result.title,
    url: result.url,
    snippet: result.content ?? ''
  }));

  if (mapped.length === 0) {
    throw new Error('No search results found');
  }

  return {
    top: mapped[0],
    alternates: mapped.slice(1)
  };
}
