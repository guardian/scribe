require('node-amd-require')({
  baseUrl: __dirname + "/../../src",
  paths: {
    'lodash-amd': '../../bower_components/lodash-amd',
    'immutable': '../../bower_components/immutable'
  }
});

var keystrokes = require('../src/keystrokes');


var chai = require('chai');

var expect = chai.expect;

var MockBrowser = require('mock-browser').mocks.MockBrowser;
var fakeBrowser = new MockBrowser();
var win = fakeBrowser.getWindow();

function createKeyEvent(keyCode, modifiers) {
  var event = new win.KeyboardEvent('keydown', {
    keyCode: keyCode,
    altKey: modifiers.alt || false,
    metaKey: modifiers.meta || false,
    shiftKey: modifiers.shift || false,
    ctrlKey: modifiers.ctrl || false
  });
  return event;
};

describe('Keystrokes', function() {
  describe('Undo keystroke', function() {
    it('should react to valid keystrokes', function() {
      var event1 = createKeyEvent(90, { meta: true });
      var event2 = createKeyEvent(90, { ctrl: true });
      var event3 = createKeyEvent(90, { meta: true, alt: true });

      expect(keystrokes.isUndoKeyCombination(event1), 'meta+z').to.equal(true);
      expect(keystrokes.isUndoKeyCombination(event2), 'ctrl+z').to.equal(true);
      expect(keystrokes.isUndoKeyCombination(event3), 'meta+alt+z').to.equal(true);
    });

    it('should ignore invalid keystrokes', function() {
      var event1 = createKeyEvent(90, { meta: true, shift: true });
      var event2 = createKeyEvent(90, { ctrl: true, shift: true });
      var event3 = createKeyEvent(90, { ctrl: true, alt: true });
      var event4 = createKeyEvent(89, { meta: true });

      expect(keystrokes.isUndoKeyCombination(event1), 'meta+shift+z').to.equal(false);
      expect(keystrokes.isUndoKeyCombination(event2), 'ctrl+shift+z').to.equal(false);
      expect(keystrokes.isUndoKeyCombination(event3), 'ctrl+alt+z').to.equal(false);
      expect(keystrokes.isUndoKeyCombination(event4), 'meta+y').to.equal(false);
    });
  });

  describe('Redo keystroke', function() {
    it('should react to valid keystrokes', function() {
      var event1 = createKeyEvent(90, { meta: true, shift: true });
      var event2 = createKeyEvent(90, { ctrl: true, shift: true });
      var event3 = createKeyEvent(90, { meta: true, alt: true, shift: true });

      expect(keystrokes.isRedoKeyCombination(event1), 'meta+shift+z').to.equal(true);
      expect(keystrokes.isRedoKeyCombination(event2), 'ctrl+shift+z').to.equal(true);
      expect(keystrokes.isRedoKeyCombination(event3), 'meta+alt+shift+z').to.equal(true);
    });

    it('should ignore invalid keystrokes', function() {
      var event1 = createKeyEvent(90, { meta: true });
      var event2 = createKeyEvent(90, { ctrl: true, alt: true });
      var event3 = createKeyEvent(90, { ctrl: true, alt: true, shift: true });
      var event4 = createKeyEvent(89, { meta: true, shift: true });

      expect(keystrokes.isRedoKeyCombination(event1), 'meta+z').to.equal(false);
      expect(keystrokes.isRedoKeyCombination(event2), 'ctrl+alt+z').to.equal(false);
      expect(keystrokes.isRedoKeyCombination(event3), 'ctrl+alt+shift+z').to.equal(false);
      expect(keystrokes.isRedoKeyCombination(event4), 'meta+shift+y').to.equal(false);
    });
  });
});
