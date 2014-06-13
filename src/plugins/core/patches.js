define(function (require) {

  /**
   * Command patches browser inconsistencies. They do not perform core features
   * of the editor, such as ensuring P elements are created when
   * applying/unapplying commands — that is the job of the core commands.
   */

  'use strict';

  return {
    commands: {
      bold: require('./patches/commands/bold'),
      indent: require('./patches/commands/indent'),
      insertHTML: require('./patches/commands/insert-html'),
      insertList: require('./patches/commands/insert-list'),
      outdent: require('./patches/commands/outdent'),
      createLink: require('./patches/commands/create-link'),
    },
    events: require('./patches/events')
  };

});
