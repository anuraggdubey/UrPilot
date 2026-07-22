import OpenAI from 'openai';

export async function callLLM<T>({ system, user, model = 'llama-3.3-70b-versatile' }: {
  system: string;
  user: string;
  model?: string;
}): Promise<T> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const groq = new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1'
  });

  const completion = await groq.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2
  });

  const content = completion.choices[0]?.message.content;
  if (!content) {
    throw new Error('Groq returned an empty response');
  }

  return JSON.parse(content) as T;
}
