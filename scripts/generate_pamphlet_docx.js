const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, PageOrientation, WidthType, convertInchesToTwip, SectionType } = require('docx');

// Basic HTML-to-plain text extractor for headings and list items (simplified)
function extractBlocks(html) {
  const result = [];
  const headingRegex = /<h(\d)[^>]*>([\s\S]*?)<\/h\d>/gi;
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;

  const textify = (s) => s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

  // Preserve order: iterate raw and push blocks by nearest match
  let idx = 0;
  const tokens = [];
  const pushMatches = (regex, type) => {
    regex.lastIndex = 0;
    let m;
    while ((m = regex.exec(html))) tokens.push({ start: m.index, end: regex.lastIndex, type, level: m[1], text: m[2] || m[1] });
  };
  pushMatches(headingRegex, 'h');
  pushMatches(liRegex, 'li');
  pushMatches(pRegex, 'p');
  tokens.sort((a, b) => a.start - b.start);

  for (const t of tokens) {
    if (t.type === 'h') {
      result.push({ type: 'heading', level: parseInt(t.level, 10), text: textify(t.text) });
    } else if (t.type === 'li') {
      result.push({ type: 'list', text: textify(t.text) });
    } else if (t.type === 'p') {
      const tx = textify(t.text);
      if (tx) result.push({ type: 'para', text: tx });
    }
  }
  return result;
}

(async () => {
  try {
    const srcPath = path.resolve('/workspace/USER_MANUAL_PAMPHLET.md');
    const html = fs.readFileSync(srcPath, 'utf8');
    const blocks = extractBlocks(html);

    const pageWidthIn = 8.5;
    const pageHeightIn = 13;

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                width: convertInchesToTwip(pageWidthIn),
                height: convertInchesToTwip(pageHeightIn),
                orientation: PageOrientation.PORTRAIT,
              },
              margin: {
                top: convertInchesToTwip(0.3),
                right: convertInchesToTwip(0.3),
                bottom: convertInchesToTwip(0.3),
                left: convertInchesToTwip(0.3),
              },
              columns: {
                space: convertInchesToTwip(0.3),
                count: 3,
              },
            },
          },
          children: [
            new Paragraph({
              text: 'UPSKILL User Manual – Quick Pamphlet',
              heading: HeadingLevel.TITLE,
            }),
            ...blocks.map((b) => {
              if (b.type === 'heading') {
                const map = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3 };
                return new Paragraph({ text: b.text, heading: map[b.level] || HeadingLevel.HEADING_3 });
              }
              if (b.type === 'list') {
                return new Paragraph({ text: `• ${b.text}` });
              }
              return new Paragraph({ text: b.text });
            }),
          ],
        },
      ],
    });

    const buf = await Packer.toBuffer(doc);
    const outPath = path.resolve('/workspace/USER_MANUAL_PAMPHLET.docx');
    fs.writeFileSync(outPath, buf);
    console.log('DOCX generated:', outPath);
  } catch (err) {
    console.error('Failed to generate DOCX:', err);
    process.exit(1);
  }
})();