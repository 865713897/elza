// 获取版本号
export const getVersion = () => {
  const { version } = require('../../package.json');
  return version;
};
