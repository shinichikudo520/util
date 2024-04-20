/**
 * 批量数据分割操作
 * @param limit 每次分割的数量
 * @param datas 需要批量操作的数据
 * @param callback 对分割后的数据进行处理的回调函数
 */
async function splitBulk(
  limit: number,
  datas: any[],
  callback: (subDatas) => void
) {
  const len = datas.length;
  for (let i = 0; i < len; i += limit) {
    const maxI = Math.min(len, i + limit);
    await callback(datas.slice(i, maxI));
  }
}
/**
 * 批量数据分割操作
 * @param limit1 每次分割的大小
 * @param limit2 每次分割的数量
 * @param datas 需要批量操作的数据
 * @param callback 对分割后的数据进行处理的回调函数
 */
async function splitBulk1(
  limit1: number,
  limit2: number,
  datas: any[],
  callback: (subDatas) => void
) {
  const len = datas.length;
  let size = 0;
  let temp = ``;
  let arr: any[] = [];
  for (let i = 0; i < len; i++) {
    const data = datas[i];
    const str = JSON.stringify(data);

    const BSize = unescape(encodeURIComponent(str)).length; // 获取字节
    const MBSize = BSize / Math.pow(1024, 2); // 字节转 MB
    if (size + MBSize >= limit1 || arr.length >= limit2) {
      temp && (await callback(arr));

      size = MBSize;
      temp = str;
      arr = [data];
    } else {
      size += MBSize;
      temp += str;
      arr.push(data);
    }
  }

  if (temp) {
    await callback(arr);
  }
}
/**
 * 批量数据分割操作
 * @param num 分割次数, 将数据分割成*次操作
 * @param datas 需要批量操作的数据
 * @param callback 对分割后的数据进行处理的回调函数
 */
export async function splitBulk2<T>(
  num: number,
  datas: Array<T>,
  callback: (subDatas: Array<T>) => void
) {
  const len = datas.length;
  const limit = Math.ceil(len / num);
  for (let i = 0; i < len; i += limit) {
    const max = Math.min(len, i + limit);
    if (callback instanceof Promise) {
      await callback(datas.slice(i, max));
    } else {
      callback(datas.slice(i, max));
    }
  }
}
