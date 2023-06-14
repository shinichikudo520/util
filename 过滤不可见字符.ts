/**
 * 参考资料: https://blog.csdn.net/Charonmomo/article/details/130862041
 */

/** 正则过滤: 不可见字符范围正则表达式 [\x00-\x1F\x7F] */
function filterInvisibleChar(str: string) {
  return str.replace(/[\x00-\x1F\x7F]+/g, ``);
}
/** 字符编号过滤: 不可见字符编码 code: 1-31 或者 127 */
function filterInvisibleChar1(str: string) {
  let result = "";
  if (str) {
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if ((code >= 0 && code <= 31) || code === 127) {
        continue;
      } else {
        result += str[i];
      }
    }
  }
  return result.trim();
}
