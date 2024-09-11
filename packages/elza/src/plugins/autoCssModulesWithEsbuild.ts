import { IEsbuildLoaderHandlerParams } from '../types'

const CSS_SUFFIX_REGX = /\.(:?css|less|scss|sass)$/;
const FILE_SUFFIX = '?css_modules';

export function autoCssModulesWithEsbuild(opts: IEsbuildLoaderHandlerParams) {
  let { code } = opts;
  let offset = 0;
  opts.imports.forEach((i) => {
    if (i.d < 0 && isStyleFile({ filename: i.n })) {
      const importSegment = code.substring(i.ss + offset, i.s + offset);
      if (~importSegment.indexOf(' from')) {
        code = `${code.substring(0, i.e + offset)}${FILE_SUFFIX}${code.substring(i.e + offset)}`;
        offset += FILE_SUFFIX.length;
      }
    }
  });

  return code;
}

function isStyleFile({ filename }: { filename: string }) {
  return filename && CSS_SUFFIX_REGX.test(filename);
}
