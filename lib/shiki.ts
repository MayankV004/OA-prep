import { codeToHtml } from 'shiki';

export async function highlightCode(code: string, language: string = 'java') {
  if (!code) return '';
  try {
    return await codeToHtml(code, {
      lang: language,
      theme: 'github-dark'
    });
  } catch (e) {
    console.error("Failed to highlight code", e);
    // Fallback simple HTML
    return `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
  }
}
