{%- comment -%}
  Runs inside the theme's search index builder (just-the-docs.js), once per page indexed.

  Japanese and Chinese are written without spaces, and lunr splits words on spaces : a
  whole sentence became one token, and its trimmer then removed every character that is
  not a latin letter, so a search in those languages found nothing. In those two builds
  the tokenizer splits every run of Japanese or Chinese characters into overlapping pairs
  (設定画面 : 設定 定画 画面), on the pages and in what the reader types alike, and trims
  the tokens by Unicode letters instead. The other languages keep the theme's search.
{%- endcomment -%}
{%- if site.docs_language == "ja" or site.docs_language == "zh" %}
if (!lunr.afCjk) {
  var afTokenizer = lunr.tokenizer;
  var afCjkRun = /[぀-ヿ㐀-䶿一-鿿豈-﫿ｦ-ﾟ]+/g;
  var afEdges = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;
  lunr.tokenizer = function(input, metadata) {
    var out = [];
    afTokenizer(input, metadata).forEach(function(token) {
      var str = token.toString().replace(afEdges, '');
      var start = token.metadata.position ? token.metadata.position[0] : 0;
      var offset = token.toString().indexOf(str);
      var pieces = [];
      var last = 0;
      var match;
      // Step 1 : the latin parts stay whole, every CJK run becomes pairs of characters
      afCjkRun.lastIndex = 0;
      while ((match = afCjkRun.exec(str)) !== null) {
        if (match.index > last) {
          pieces.push([str.slice(last, match.index), last]);
        }
        var run = match[0];
        if (run.length === 1) {
          pieces.push([run, match.index]);
        }
        for (var i = 0; i + 1 < run.length; i++) {
          pieces.push([run.slice(i, i + 2), match.index + i]);
        }
        last = match.index + run.length;
      }
      if (last < str.length) {
        pieces.push([str.slice(last), last]);
      }
      // Step 2 : each piece keeps its position in the page, for the search previews
      pieces.forEach(function(piece) {
        var text = piece[0].replace(afEdges, '');
        if (text === '') {
          return;
        }
        var meta = lunr.utils.clone(token.metadata) || {};
        meta.position = [start + offset + piece[1], piece[0].length];
        meta.index = out.length;
        out.push(new lunr.Token(text, meta));
      });
    });
    return out;
  };
  lunr.tokenizer.separator = afTokenizer.separator;
  lunr.afCjk = true;
}
this.tokenizer = lunr.tokenizer;
this.pipeline.remove(lunr.trimmer);
this.pipeline.remove(lunr.stopWordFilter);
{%- endif %}
