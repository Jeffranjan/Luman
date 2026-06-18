"use client";

import * as React from "react";
import DOMPurify from "dompurify";

interface EmailRendererProps {
  html?: string;
  text?: string;
  className?: string;
}

/**
 * Premium email renderer that safely renders HTML emails.
 * Handles: text/html, text/plain, images, links, tables, lists, quotes, code blocks.
 * Collapses quoted reply history like Gmail.
 */
export function EmailRenderer({ html, text, className }: EmailRendererProps) {
  const [showQuoted, setShowQuoted] = React.useState(false);

  // Determine content to render
  const rawContent = html || text || "";
  const isHtml = !!html;

  // Split quoted content (Gmail-style: everything after the last quote marker)
  const { mainContent, quotedContent } = splitQuotedContent(rawContent, isHtml);

  // Sanitize HTML
  const sanitized = React.useMemo(() => {
    if (!isHtml) return "";
    return DOMPurify.sanitize(mainContent, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "div",
        "span",
        "a",
        "b",
        "i",
        "u",
        "strong",
        "em",
        "ul",
        "ol",
        "li",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "blockquote",
        "pre",
        "code",
        "table",
        "thead",
        "tbody",
        "tr",
        "td",
        "th",
        "img",
        "hr",
        "sub",
        "sup",
        "small",
        "mark",
        "dl",
        "dt",
        "dd",
        "figure",
        "figcaption",
        "details",
        "summary",
        "section",
        "article",
        "header",
        "footer",
      ],
      ALLOWED_ATTR: [
        "href",
        "src",
        "alt",
        "title",
        "width",
        "height",
        "style",
        "class",
        "id",
        "target",
        "rel",
        "colspan",
        "rowspan",
        "align",
        "valign",
        "bgcolor",
        "cellpadding",
        "cellspacing",
        "border",
        "width",
        "height",
        "loading",
      ],
      ALLOW_DATA_ATTR: false,
      ADD_ATTR: ["target", "loading"],
      FORBID_TAGS: [
        "script",
        "iframe",
        "object",
        "embed",
        "form",
        "input",
        "button",
        "select",
        "textarea",
      ],
      FORBID_ATTR: ["onerror", "onclick", "onload", "onmouseover"],
    });
  }, [mainContent, isHtml]);

  // Sanitize quoted content
  const sanitizedQuoted = React.useMemo(() => {
    if (!quotedContent) return "";
    if (isHtml) {
      return DOMPurify.sanitize(quotedContent, {
        ALLOWED_TAGS: [
          "p",
          "br",
          "div",
          "span",
          "a",
          "b",
          "i",
          "strong",
          "em",
          "blockquote",
          "table",
          "tr",
          "td",
          "th",
          "tbody",
          "thead",
        ],
        ALLOWED_ATTR: ["href", "style", "class"],
        FORBID_TAGS: ["script", "iframe", "object", "embed", "form"],
      });
    }
    return quotedContent;
  }, [quotedContent, isHtml]);

  if (!rawContent) {
    return (
      <div className="text-sm italic" style={{ color: "var(--text-tertiary)" }}>
        No content
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Main content */}
      {isHtml ? (
        <div
          className="email-content prose-custom"
          dangerouslySetInnerHTML={{ __html: sanitized }}
          style={emailStyles}
        />
      ) : (
        <div
          className="text-sm leading-relaxed whitespace-pre-wrap"
          style={{ color: "var(--text)" }}
        >
          {mainContent}
        </div>
      )}

      {/* Quoted history — collapsed by default */}
      {quotedContent && (
        <div className="mt-4">
          <button
            onClick={() => setShowQuoted(!showQuoted)}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              color: "var(--text-tertiary)",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{
                transform: showQuoted ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 150ms",
              }}
            >
              <path d="M4 2l4 4-4 4" />
            </svg>
            {showQuoted ? "Hide" : "Show"} quoted text
          </button>

          {showQuoted && (
            <div
              className="mt-3 pl-4"
              style={{ borderLeft: "2px solid var(--border)" }}
            >
              {isHtml ? (
                <div
                  className="email-content opacity-70"
                  dangerouslySetInnerHTML={{ __html: sanitizedQuoted }}
                  style={emailStyles}
                />
              ) : (
                <div
                  className="text-sm whitespace-pre-wrap opacity-70"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {quotedContent}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Split email content into main body and quoted reply history.
 * Detects Gmail-style quoted text (lines starting with ">") and common reply headers.
 */
function splitQuotedContent(
  content: string,
  isHtml: boolean,
): { mainContent: string; quotedContent: string } {
  if (!content) return { mainContent: "", quotedContent: "" };

  if (isHtml) {
    // Look for Gmail quoted content markers
    const gmailQuotePatterns = [
      /<div class="gmail_quote"/i,
      /<blockquote[^>]*class="gmail_quote"/i,
      /<div style="border:none;border-top:solid/i,
      /On .* wrote:/i,
    ];

    // Try to find the split point
    for (const pattern of gmailQuotePatterns) {
      const match = content.match(pattern);
      if (match && match.index !== undefined && match.index > 0) {
        return {
          mainContent: content.substring(0, match.index),
          quotedContent: content.substring(match.index),
        };
      }
    }

    // Try splitting at blockquote
    const blockquoteMatch = content.match(/<blockquote[^>]*>/i);
    if (
      blockquoteMatch &&
      blockquoteMatch.index !== undefined &&
      blockquoteMatch.index > 100
    ) {
      return {
        mainContent: content.substring(0, blockquoteMatch.index),
        quotedContent: content.substring(blockquoteMatch.index),
      };
    }

    return { mainContent: content, quotedContent: "" };
  }

  // Plain text: look for common reply markers
  const lines = content.split("\n");
  let splitIndex = -1;

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i]!.trim();
    // Gmail-style "On [date], [person] wrote:"
    if (/^On .+ wrote:$/i.test(line)) {
      splitIndex = i;
      break;
    }
    // Outlook-style "From:"
    if (
      /^[-]+ ?Original Message ?[-]+$/i.test(line) ||
      /^From:\s+/i.test(line)
    ) {
      splitIndex = i;
      break;
    }
    // Quoted lines
    if (line.startsWith(">") && i > 5) {
      splitIndex = i;
      break;
    }
  }

  if (splitIndex > 0) {
    return {
      mainContent: lines.slice(0, splitIndex).join("\n").trim(),
      quotedContent: lines.slice(splitIndex).join("\n").trim(),
    };
  }

  return { mainContent: content, quotedContent: "" };
}

/**
 * Inline styles for email content rendering.
 * Uses CSS variables from the theme for consistent look.
 */
const emailStyles: React.CSSProperties = {
  color: "var(--text)",
  fontSize: "14px",
  lineHeight: "1.7",
  wordBreak: "break-word",
};

// Inject styles for email content (runs once)
if (typeof document !== "undefined") {
  const styleId = "email-renderer-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .email-content { font-family: var(--font-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .email-content h1 { font-size: 1.5em; font-weight: 700; margin: 1em 0 0.5em; color: var(--text); }
      .email-content h2 { font-size: 1.25em; font-weight: 600; margin: 0.8em 0 0.4em; color: var(--text); }
      .email-content h3 { font-size: 1.1em; font-weight: 600; margin: 0.6em 0 0.3em; color: var(--text); }
      .email-content p { margin: 0.5em 0; }
      .email-content a { color: var(--accent); text-decoration: none; }
      .email-content a:hover { text-decoration: underline; }
      .email-content img { max-width: 100%; height: auto; border-radius: 12px; margin: 0.5em 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
      .email-content blockquote { border-left: 3px solid var(--accent); padding-left: 1em; margin: 1em 0; color: var(--text-secondary); }
      .email-content pre, .email-content code { background: var(--bg-secondary); border-radius: 6px; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.85em; }
      .email-content pre { padding: 1em; overflow-x: auto; margin: 1em 0; }
      .email-content code { padding: 0.15em 0.4em; }
      .email-content ul, .email-content ol { padding-left: 1.5em; margin: 0.5em 0; }
      .email-content li { margin: 0.25em 0; }
      .email-content table { width: 100%; border-collapse: collapse; margin: 1em 0; border-radius: 8px; overflow: hidden; }
      .email-content th, .email-content td { padding: 0.5em 0.75em; text-align: left; border-bottom: 1px solid var(--border); }
      .email-content th { background: var(--bg-secondary); font-weight: 600; font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.05em; }
      .email-content hr { border: none; border-top: 1px solid var(--border); margin: 1.5em 0; }
      .email-content mark { background: var(--accent-muted); color: var(--accent); padding: 0.1em 0.3em; border-radius: 3px; }
      .email-content details { margin: 0.5em 0; }
      .email-content summary { cursor: pointer; font-weight: 500; color: var(--text-secondary); }
      .email-content .gmail_quote { opacity: 0.7; }
    `;
    document.head.appendChild(style);
  }
}
