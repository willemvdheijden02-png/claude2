const Anthropic = require('@anthropic-ai/sdk');

let _client;
function getClient() {
  if (!_client) {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) throw new Error('ANTHROPIC_API_KEY niet ingesteld');
    _client = new Anthropic({ apiKey: key });
  }
  return _client;
}

async function ask(prompt, { system = null, maxTokens = 2048 } = {}) {
  const client = getClient();
  const messages = [{ role: 'user', content: prompt }];
  const params = {
    model: 'claude-opus-4-5',
    max_tokens: maxTokens,
    messages,
  };
  if (system) params.system = system;
  const res = await client.messages.create(params);
  return res.content[0].text;
}

module.exports = { ask };
