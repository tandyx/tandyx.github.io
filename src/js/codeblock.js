/**
 * @file codeblock.js
 * @fileoverview really only used to render codeblocks
 * @typedef {import("./index.js")}
 * @typedef {import("highlight.js").HLJSApi} hljs
 */
"use strict";

// hlj
const langMap = {
  js: "javascript",
  ps1: "powershell",
};

const themeCssMap = {
  dark: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs2015.min.css",
  light:
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs.min.css",
};

// main();
window.addEventListener("load", async () => {
  addCssFile(themeCssMap[Theme.activeTheme]);
  for (const preNode of document.getElementsByTagName("pre")) {
    const fileSource = preNode.getAttribute("data-src");
    const resp = await fetch(fileSource);
    if (!resp.ok) throw new Error(`fetching ${fileSource}: ${resp.status}`);
    loadCodeBlock(
      preNode,
      await resp.text(),
      preNode.getAttribute("data-language") || langMap[fileSource.split(".")[1]]
    );
    try {
      hljs.addPlugin(new CopyButtonPlugin());
    } catch (error) {
      console.error(error);
    }
  }
});
// /**
//  * main function, loads before `window.onload`
//  * @returns {void}
//  */
// function main() {

// }

/**
 * creates a code block
 * @param {string | HTMLElement} id - The id of the PRE block to put the code in
 * @param {string} code - The code to put in the code block
 * @param {string} language - The language of the code block
 * @returns {HTMLElement} - The pre block
 */

function loadCodeBlock(id, code, language = null) {
  const preNode = typeof id === "string" ? document.getElementById(id) : id;
  if (!preNode || preNode.tagName !== "PRE") {
    console.error("invalid id or element");
    return;
  }
  const codeNode = document.createElement("code");
  codeNode.textContent = code;
  for (const className of ["hljs", "code-font"]) {
    codeNode.classList.add(className);
  }
  preNode.appendChild(codeNode);
  if (!language) {
    hljs.highlightElement(codeNode);
    return preNode;
  }
  const src = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/${language}.min.js`;
  if (!checkSrcInHead(src)) {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      codeNode.classList.add(`language-${language}`);
      hljs.highlightElement(codeNode);
    };
    document.head.appendChild(script);
    return preNode;
  }
  codeNode.classList.add(`language-${language}`);
  return preNode;
}
