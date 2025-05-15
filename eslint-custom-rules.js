module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow using index.ts files',
      category: 'Best Practices',
      recommended: true
    },
    fixable: null,
    schema: []
  },
  create: function(context) {
    return {
      Program(node) {
        const filename = context.getFilename();
        if (filename.endsWith('index.ts') || filename.endsWith('index.tsx')) {
          context.report({
            node: node,
            message: 'Using index.ts files is not allowed. Use descriptive file names instead.'
          });
        }
      }
    };
  }
};
