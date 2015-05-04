'use strict';

const _ = require('lodash'),
    path = require('path'),
    gutil = require('gulp-util'),
    through = require('through2'),
    gettext = require('gettext-parser'),
    { name } = require('./package.json');

module.exports = function (options) {
  _.defaults(options, {
    fn: function(s) {
      return s.split('').reverse().join('');
    },
    language: 'test'
  });

  const { fn, language } = options;

  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      this.push(file);
      return cb();
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError(name, 'Streaming not supported'));
      return cb();
    }
    // Parse PO/POT file
    const parsed = gettext.po.parse(file.contents);
    parsed.headers.language = language;

    // Translate
    const { translations } = parsed;

    _.each(translations, (catalog, bundle) => {
      _.each(bundle, (key, translation) => {
        if (key.length === 0) {
          return;
        }

        translation.msgstr[0] = fn(translation.msgid);

        if (translation.msgid_plural) {
          translation.msgstr[1] = fn(translation.msgid_plural);
        }
      });
    });

    file.contents = gettext.po.compile(parsed);

    // Rename abc.po or abc.pot to abc.[language].po
    const filePath = file.path,
        dirname = path.dirname(filePath),
        extension = path.extname(filePath),
        basename = path.basename(filePath, extension);

    file.path = path.join(dirname, basename + '.' + options.language + '.po');

    this.push(file);
    cb();
  });
};
