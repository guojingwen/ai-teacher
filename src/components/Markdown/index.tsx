import React from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
// import './atom-one-dark.css';

import styles from './index.module.css';

type IProps = {
  markdownText: string;
};

export const Markdown = (props: IProps) => {
  const renderer = new marked.Renderer();
  renderer.code = (code, language: string) => {
    const validLanguage = hljs.getLanguage(language)
      ? language
      : 'plaintext';
    const highlightedCode = hljs.highlight(validLanguage, code).value;
    return `<pre><code class='hljs ${validLanguage}'>${highlightedCode}</code></pre>`;
  };
  const markdownText = props.markdownText;
  marked.setOptions({
    renderer,
  });
  const html = marked(markdownText);
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      className={styles.mark}></div>
  );
};
