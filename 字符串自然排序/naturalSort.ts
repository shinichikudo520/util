/**
 * 找出字符中的数字
 * @param s
 * @returns result的顺序依次是 [数字前面的字符,数字,完整的字符]
 */
function naturalSortSplitor(s: string) {
  const reg = /\d+/g;
  const result = new Array<string | number>();
  let index = 0;
  for (;;) {
    const m = reg.exec(s);
    if (m) {
      if (index < m.index) {
        result.push(s.substring(index, m.index));
      }
      index = m.index + m[0].length;
      result.push(parseInt(m[0]));
    } else {
      break;
    }
  }
  result.push(s);
  return result;
}
/**
 * 字符排序：排序规则  数字 > 字符 > undefined
 * @param a
 * @param b
 * @returns
 */
function naturalSortComparator(
  a: Array<string | number>,
  b: Array<string | number>
) {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const ai = a[i];
    const bi = b[i];
    let cp = 0;
    if (typeof ai === "string" && typeof bi === "string") {
      cp = ai.localeCompare(bi);
    } else if (typeof ai === "number" && typeof bi === "number") {
      cp = ai - bi;
    } else if (typeof ai === "number" && typeof bi === "string") {
      return -1;
    } else if (typeof ai === "string" && typeof bi === "number") {
      return 1;
    } else if (ai === undefined && bi !== undefined) {
      return 1;
    } else if (ai !== undefined && bi === undefined) {
      return -1;
    }

    if (cp !== 0) {
      return cp;
    }
  }
  return 0;
}

(function () {
  const arr = ["蓝忘机", "魏无羡", "AAA", "aaa", "157", undefined, "123"];
  console.log("排序前...", arr.concat());

  arr.sort((a, b) => {
    // 1.1 sort 的回调中参数 a 是后面一位,b 是前面一位
    console.log("后一位", a, "前一位", b);
    // 1.3 返回 1/0 代表不交换位置，-1 代表交换位置
    return naturalSortComparator(naturalSortSplitor(a), naturalSortSplitor(b));
  });
  // 1.2 sort 会自动将 undefined 排到最后，不会进回调函数
  console.log("sort 排序后...", arr);

  const arr2 = ["蓝忘机", "魏无羡", "AAA", "aaa", "157", undefined, "123"];
  for (let i = 0; i < arr2.length - 1; i++) {
    for (let j = 0; j < arr2.length - 1 - i; j++) {
      const a = arr2[j];
      const b = arr2[j + 1];
      // 2.1 模仿 sort 先传后面的数 b，再传前面的数 a，才能保证返回 -1 时需要调回位置
      //   if (
      //     naturalSortComparator(naturalSortSplitor(b), naturalSortSplitor(a)) < 0
      //   ) {
      //     const temp = arr2[j];
      //     arr2[j] = arr2[j + 1];
      //     arr2[j + 1] = temp;
      //   }
      // 2.2 如果正常顺序传入 a（前一位）,b（后面一位），那么返回 -1 则代表不换位置，1/0才交换位置
      if (
        naturalSortComparator(naturalSortSplitor(a), naturalSortSplitor(b)) >= 0
      ) {
        const temp = arr2[j];
        arr2[j] = arr2[j + 1];
        arr2[j + 1] = temp;
      }
    }
  }
  console.log("冒泡排序后...", arr2);

  const arr1 = ["AAA", "aaa", "157", "123"];
  console.log("排序前...", arr1.concat());

  arr1.sort((a, b) => {
    console.log("后一位", a, "前一位", b);
    return naturalSortComparator(naturalSortSplitor(a), naturalSortSplitor(b));
  });
  console.log("排序后...", arr1);
})();
