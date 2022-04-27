/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {redo, undo} from '../keyboardShortcuts/index.mjs';
import {
  assertHTML,
  clearEditor,
  click,
  focusEditor,
  html,
  initialize,
  pressToggleBold,
  pressToggleUnderline,
  test,
} from '../utils/index.mjs';

async function assertMarkdownImportExport(
  page,
  textToImport,
  expectedHTML,
  ignoreClasses,
) {
  // Clear the editor from previous content
  await clearEditor(page);

  // Create code block that will be imported as a markdown into editor
  await page.keyboard.type('```markdown ');
  await page.keyboard.type(textToImport);
  await click(page, '.action-button .markdown');
  await assertHTML(page, expectedHTML, {ignoreClasses});

  // Cycle through import-export to verify it produces the same result
  await click(page, '.action-button .markdown');
  await click(page, '.action-button .markdown');
  await assertHTML(page, expectedHTML);
}

test.describe('Markdown', () => {
  test.beforeEach(({isCollab, isPlainText, page}) => {
    test.skip(isPlainText);
    initialize({isCollab, page});
  });

  const BASE_BLOCK_SHORTCUTS = [
    {
      html: html`
        <h1><br /></h1>
      `,
      text: '# ',
    },
    {
      html: html`
        <h2><br /></h2>
      `,
      text: '## ',
    },
    {
      html: html`
        <ol>
          <li value="1"><br /></li>
        </ol>
      `,
      text: '1. ',
    },
    {
      html: html`
        <ol start="25">
          <li value="25"><br /></li>
        </ol>
      `,
      text: '25. ',
    },
    {
      html: html`
        <ol>
          <li value="1">
            <ol>
              <li value="1"><br /></li>
            </ol>
          </li>
        </ol>
      `,
      text: '    1. ',
    },
    {
      html: html`
        <ul>
          <li value="1"><br /></li>
        </ul>
      `,
      text: '- ',
    },
    {
      html: html`
        <ul>
          <li value="1">
            <ul>
              <li value="1"><br /></li>
            </ul>
          </li>
        </ul>
      `,
      text: '    - ',
    },
    {
      html: html`
        <ul>
          <li value="1"><br /></li>
        </ul>
      `,
      text: '* ',
    },
    {
      html: html`
        <ul>
          <li value="1">
            <ul>
              <li value="1"><br /></li>
            </ul>
          </li>
        </ul>
      `,
      text: '    * ',
    },
    {
      html: html`
        <ul>
          <li value="1">
            <ul>
              <li value="1"><br /></li>
            </ul>
          </li>
        </ul>
      `,
      text: '      * ',
    },
    {
      html: html`
        <ul>
          <li value="1">
            <ul>
              <li value="1">
                <ul>
                  <li value="1">
                    <br />
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        </ul>
      `,
      text: '        * ',
    },
    {
      html: html`
        <div
          contenteditable="false"
          style="display: contents;"
          data-lexical-decorator="true">
          <hr />
        </div>
        <p><br /></p>
      `,
      text: '--- ',
    },
    {
      html: html`
        <div
          contenteditable="false"
          style="display: contents;"
          data-lexical-decorator="true">
          <hr />
        </div>
        <p><br /></p>
      `,
      text: '*** ',
    },
  ];

  const SIMPLE_TEXT_FORMAT_SHORTCUTS = [
    {
      html: html`
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
          dir="ltr">
          <span data-lexical-text="true">hello</span>
          <em
            class="PlaygroundEditorTheme__textItalic"
            data-lexical-text="true">
            world
          </em>
          <span data-lexical-text="true">!</span>
        </p>
      `,
      text: 'hello *world*!',
    },
    {
      html: html`
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
          dir="ltr">
          <span data-lexical-text="true">hello</span>
          <strong
            class="PlaygroundEditorTheme__textBold"
            data-lexical-text="true">
            world
          </strong>
          <span data-lexical-text="true">!</span>
        </p>
      `,
      text: 'hello **world**!',
    },
    {
      html: html`
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
          dir="ltr">
          <span data-lexical-text="true">hello</span>
          <strong
            class="PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic"
            data-lexical-text="true">
            world
          </strong>
          <span data-lexical-text="true">!</span>
        </p>
      `,
      text: 'hello ***world***!',
    },
    {
      html: html`
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
          dir="ltr">
          <span data-lexical-text="true">hello</span>
          <strong
            class="PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic"
            data-lexical-text="true">
            world
          </strong>
          <span data-lexical-text="true">!</span>
        </p>
      `,
      text: 'hello ___world___!',
    },
    {
      html: html`
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
          dir="ltr">
          <span data-lexical-text="true">hello</span>
          <a
            class="PlaygroundEditorTheme__link PlaygroundEditorTheme__ltr"
            dir="ltr"
            href="https://www.test.com">
            <span data-lexical-text="true">world</span>
          </a>
          <span data-lexical-text="true">!</span>
        </p>
      `,
      text: 'hello [world](https://www.test.com)!',
    },
  ];

  const NESTED_TEXT_FORMAT_SHORTCUTS = [
    {
      html: html`
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
          dir="ltr">
          <strong
            class="PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic PlaygroundEditorTheme__textStrikethrough"
            data-lexical-text="true">
            hello world
          </strong>
          <span data-lexical-text="true">!</span>
        </p>
      `,
      text: '~~_**hello world**_~~!',
    },
    {
      html: html`
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
          dir="ltr">
          <em
            class="PlaygroundEditorTheme__textItalic PlaygroundEditorTheme__textStrikethrough"
            data-lexical-text="true">
            hello world
          </em>
          <span data-lexical-text="true">!</span>
        </p>
      `,
      text: '~~_hello world_~~!',
    },
    {
      html: html`
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
          dir="ltr">
          <strong
            class="PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textStrikethrough"
            data-lexical-text="true">
            hello world
          </strong>
          <span data-lexical-text="true">!</span>
        </p>
      `,
      text: '~~**hello world**~~!',
    },
    {
      html: html`
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
          dir="ltr">
          <strong
            class="PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic"
            data-lexical-text="true">
            hello world
          </strong>
          <span data-lexical-text="true">!</span>
        </p>
      `,
      text: '_**hello world**_!',
    },
  ];

  BASE_BLOCK_SHORTCUTS.forEach((testCase) => {
    test(`can convert "${testCase.text}" shortcut`, async ({
      page,
      isCollab,
    }) => {
      await focusEditor(page);
      await page.keyboard.type(testCase.text);
      await assertHTML(page, testCase.html, {ignoreClasses: true});

      if (!isCollab) {
        const escapedText = testCase.text.replace('>', '&gt;');
        await undo(page);
        await assertHTML(
          page,
          `<p><span data-lexical-text="true">${escapedText}</span></p>`,
          {ignoreClasses: true},
        );
        await redo(page);
        await assertHTML(page, testCase.html, {ignoreClasses: true});
      }
    });
  });

  SIMPLE_TEXT_FORMAT_SHORTCUTS.forEach((testCase) => {
    test(`can convert "${testCase.text}" shortcut`, async ({
      page,
      isCollab,
    }) => {
      await focusEditor(page);
      await page.keyboard.type(testCase.text);
      await assertHTML(page, testCase.html, {ignoreClasses: false});

      if (!isCollab) {
        // Undo "!" and undo markdown transformation
        const expectedText = testCase.text.slice(0, -1);
        await undo(page);
        await undo(page);
        await assertHTML(
          page,
          `<p dir="ltr"><span data-lexical-text="true">${expectedText}</span></p>`,
          {ignoreClasses: true},
        );
      }

      await assertMarkdownImportExport(page, testCase.text, testCase.html);
    });
  });

  NESTED_TEXT_FORMAT_SHORTCUTS.forEach((testCase) => {
    test(`can convert "${testCase.text}" shortcut`, async ({page}) => {
      await focusEditor(page);
      await page.keyboard.type(testCase.text);
      await assertHTML(page, testCase.html, {ignoreClasses: false});
      await assertMarkdownImportExport(page, testCase.text, testCase.html);
    });
  });

  test('can convert already styled text (overlapping ranges)', async ({
    page,
  }) => {
    // type partially bold/underlined text, add opening markdown tag within bold/underline part
    // and add closing within plain text
    await focusEditor(page);
    await pressToggleBold(page);
    await pressToggleUnderline(page);
    await page.keyboard.type('h_e~~llo');
    await pressToggleBold(page);
    await pressToggleUnderline(page);
    await page.keyboard.type(' wo~~r_ld');
    await assertHTML(
      page,
      html`
        <p
          class="PlaygroundEditorTheme__paragraph PlaygroundEditorTheme__ltr"
          dir="ltr">
          <strong
            class="PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textUnderline"
            data-lexical-text="true">
            h
          </strong>
          <strong
            class="PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic PlaygroundEditorTheme__textUnderline"
            data-lexical-text="true">
            e
          </strong>
          <strong
            class="PlaygroundEditorTheme__textUnderlineStrikethrough PlaygroundEditorTheme__textBold PlaygroundEditorTheme__textItalic"
            data-lexical-text="true">
            llo
          </strong>
          <em
            class="PlaygroundEditorTheme__textItalic PlaygroundEditorTheme__textStrikethrough"
            data-lexical-text="true">
            wo
          </em>
          <em
            class="PlaygroundEditorTheme__textItalic"
            data-lexical-text="true">
            r
          </em>
          <span data-lexical-text="true">ld</span>
        </p>
      `,
    );
  });
});
