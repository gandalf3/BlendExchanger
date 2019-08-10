# BlendExchanger
A userscript which allows uploading .blends to [Blend-Exchange](https://blend-exchange.giantcowfilms.com) directly from the editor on [blender.stackexchange.com](https://blender.stackexchange.com).

## Installation

This script should work with just about any userscript manager, but it has been tested with [greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) and [tampermonkey](https://www.tampermonkey.net/).

Once you have a userscript manager installed, you can [install the script via OpenUserJS](https://openuserjs.org/scripts/gandalf3/BlendExchanger), or just [install it directly by clicking here](https://github.com/gandalf3/BlendExchanger/raw/master/blendexchanger.user.js).

## Usage

Click the icon above your post editor or press or press <kbd>Ctrl</kbd><kbd>B</kbd> to upload a .blend.

Note that the script is disabled when writing as yet unposted questions. This is because blend-exchange requires the question url to verify that what is uploaded is actually a legitimate .blend used on blender.stackexchange. Since obviously the question url is unknown until you've posted your question, in order to upload your .blend on a question, you'll have to first post the question, then edit it and upload then.
