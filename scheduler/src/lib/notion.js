const { Client } = require('@notionhq/client');

function getClient() {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error('NOTION_TOKEN niet ingesteld');
  return new Client({ auth: token });
}

async function appendToPage(pageId, content) {
  const notion = getClient();
  await notion.blocks.children.append({
    block_id: pageId,
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content } }],
        },
      },
    ],
  });
}

async function createPage(databaseId, title, content) {
  const notion = getClient();
  const page = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      title: { title: [{ text: { content: title } }] },
    },
  });
  if (content) await appendToPage(page.id, content);
  return page.id;
}

module.exports = { appendToPage, createPage };
