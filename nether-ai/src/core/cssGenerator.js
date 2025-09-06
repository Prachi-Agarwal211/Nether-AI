export function generateGradientCss(colors) {
  return [
    '.heading-gradient {',
    '  background: linear-gradient(110deg, ' + colors.join(', ') + ');',
    '  -webkit-background-clip: text;',
    '  background-clip: text;',
    '  -webkit-text-fill-color: transparent;',
    '}'
  ].join('\n') + '\n';
}

export function generateRootCss(variables) {
  return ':root {\n' + 
    variables.join('\n') + 
    '\n}\n\n';
}
