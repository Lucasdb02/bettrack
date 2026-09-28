/* Haalt alle zichtbare (Nederlandse) teksten uit app/ en lib/ voor de vertaling.
   Output: scripts/i18n/strings.json  { exact: [..], patterns: [..] }
   Patronen zijn template literals met {0}, {1}, ... op de plek van ${...}. */
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const ROOTS = ['app', 'lib'];
const SKIP_ATTRS = new Set(['className', 'style', 'href', 'src', 'id', 'key', 'type', 'name', 'value', 'htmlFor', 'rel', 'target', 'role', 'inputMode', 'autoComplete', 'method', 'fill', 'stroke', 'd', 'viewBox', 'points', 'strokeLinecap', 'strokeLinejoin', 'mode', 'as', 'dataKey', 'layout', 'orientation', 'position', 'textAnchor', 'dominantBaseline', 'accept', 'lang', 'crossOrigin', 'loading', 'sizes', 'media', 'charSet', 'content', 'property']);
const CSS_HINT = /(^-?[\d.]+(px|%|em|rem|vh|vw|dvh|ms|s|deg|fr)?(\s+-?[\d.]+(px|%|em|rem|vh|vw|dvh|ms|s|deg|fr)?)*$)|rgba?\(|hsla?\(|var\(--|linear-gradient|radial-gradient|cubic-bezier|\bsolid\b|\bdashed\b|translate|rotate\(|scale\(|^#[0-9a-f]{3,8}$|^(flex|grid|block|none|inline|absolute|relative|fixed|sticky|center|left|right|top|bottom|auto|hidden|pointer|nowrap|wrap|bold|normal|italic|uppercase|column|row|contain|cover|transparent|inherit|space-between|flex-start|flex-end|stretch|baseline)$/i;
const IGNORE_FILE = /scripts\/|\/api\/parse-screenshot\//;

const exact = new Set();
const patterns = new Set();

function isText(s, jsx = false) {
  const t = s.trim();
  if (t.length < 2 || t.length > 2500) return false;
  if (!/[a-zA-ZÀ-ÿ]{2}/.test(t)) return false;
  if (CSS_HINT.test(t)) return false;
  if (/^(https?:|mailto:|\.\/|\.\.\/|@\/|#|data:|use (client|server))/.test(t)) return false;
  if (!jsx && /^\//.test(t)) return false;
  if (!jsx && /^[a-z0-9_.\-:/]+$/.test(t)) return false;         // identifiers, slugs, paden (JSX-tekst is altijd zichtbaar)
  if (/^[A-Z0-9_]+$/.test(t) && t.length > 3 && t.includes('_')) return false; // CONSTANTS
  if (/^(price|sub|cus|evt|seti|cs|we|prj|team|dpl)_/.test(t)) return false;
  if (/\b(select|insert|update|from)\(/.test(t)) return false;
  return true;
}

function attrName(node) {
  let p = node.parent;
  while (p && (ts.isJsxExpression(p) || ts.isConditionalExpression(p) || ts.isBinaryExpression(p) || ts.isParenthesizedExpression(p))) p = p.parent;
  return p && ts.isJsxAttribute(p) ? p.name.getText() : null;
}

function inSkippedContext(node) {
  const a = attrName(node);
  if (a && SKIP_ATTRS.has(a)) return true;
  let p = node.parent;
  if (!p) return false;
  if (ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isExternalModuleReference(p)) return true;
  if (ts.isPropertyAssignment(p) && p.name === node) return true;           // object keys
  if (ts.isElementAccessExpression(p) && p.argumentExpression === node) return true;
  if (ts.isCallExpression(p) && ['require', 'import', 'getItem', 'setItem', 'removeItem', 'querySelector', 'getElementById', 'addEventListener', 'removeEventListener', 'get', 'eq', 'select', 'from', 'order', 'setProperty', 'classList.add'].some(n => p.expression.getText().endsWith(n))) return true;
  if (ts.isBinaryExpression(p) && ['===', '!==', '==', '!='].includes(p.operatorToken.getText())) return true; // vergelijkingen
  if (ts.isCaseClause(p)) return true;
  // CSS in style-objecten: { color: '...' }
  if (ts.isPropertyAssignment(p)) {
    const key = p.name.getText().replace(/['"]/g, '');
    if (/^(color|background|border|margin|padding|font|width|height|display|position|transform|transition|boxShadow|gap|flex|grid|align|justify|overflow|opacity|zIndex|inset|top|left|right|bottom|cursor|outline|filter|stroke|fill|letterSpacing|lineHeight|textAlign|textTransform|whiteSpace|userSelect|pointerEvents|objectFit|backdropFilter|WebkitBackdropFilter|WebkitBackgroundClip|WebkitTextFillColor|borderRadius|min|max|animation|verticalAlign|textDecoration|resize|content|src|href|icon|vb|path|slug|id|key|value|type|logo|tool|base|category|plan|sport|url|email|phone|kvk|vat|street|postalCode|city|country|name|brand|dark[A-Z]|bg|textColor|priceCurrency|price|@type|@context|changeFrequency|contentType|display_name|start_url|lang|theme_color|background_color|short_name|applicationCategory|operatingSystem|inLanguage|locale)/.test(key) && !/^(name|label|title|description|naam|sub|cta)$/.test(key)) {
      // 'name' uitzonderen wanneer het tekst is (bv. naam van functie) → valt onder isText
      if (!/^(name)$/.test(key)) return true;
    }
  }
  return false;
}

function norm(s) { return s.replace(/\s+/g, ' ').trim(); }

function visit(node, sf) {
  if (ts.isJsxText(node)) {
    const t = norm(node.getText(sf));
    if (isText(t, true)) exact.add(t);
  } else if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    const t = norm(node.text);
    if (isText(t) && !inSkippedContext(node)) exact.add(t);
  } else if (ts.isTemplateExpression(node)) {
    if (!inSkippedContext(node)) {
      let out = node.head.text; let i = 0;
      for (const span of node.templateSpans) out += `{${i++}}` + span.literal.text;
      const t = norm(out);
      const staticPart = t.replace(/\{\d+\}/g, '');
      if (isText(staticPart) && /[a-zA-Z]{3}/.test(staticPart)) patterns.add(t);
    }
  }
  ts.forEachChild(node, n => visit(n, sf));
}

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(js|jsx|mjs)$/.test(e.name) && !IGNORE_FILE.test(p)) {
      const src = fs.readFileSync(p, 'utf8');
      const sf = ts.createSourceFile(p, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.JSX);
      visit(sf, sf);
    }
  }
}
ROOTS.forEach(walk);

const out = { exact: [...exact].sort(), patterns: [...patterns].sort() };
fs.writeFileSync('scripts/i18n/strings.json', JSON.stringify(out, null, 1));
const chars = out.exact.join('').length + out.patterns.join('').length;
console.log(`exact: ${out.exact.length}, patterns: ${out.patterns.length}, chars: ${chars}`);
