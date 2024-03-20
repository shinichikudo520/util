(async () => {
  const tasks: Array<Promise<any>> = [];
  for (let i = 0; i < 10; i++) {
    const p = new Promise((resolve) => {
      resolve(i);
    });
    tasks.push(p);
  }

  const result = await Promise.all(tasks);
  console.log(result);

  const LIMIT = 10;
  /**
   * 让指定数量的异步同时进行, 并发处理, 提高批量异步的需求的速度
   *    比一个个异步请求, await, 速度约提高 2-3 倍
   * @param datas
   * @returns
   */
  async function batchSync(datas: Array<any>) {
    let result: Array<any> = [];
    await splitBulk(LIMIT, datas, async (arr) => {
      const tasks: Array<Promise<any>> = [];
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const p: Promise<any> = new Promise((resolve) => {
          resolve(item);
        });
        tasks.push(p);
      }
      const temp = await Promise.all(tasks);
      result = result.concat(temp);
    });
    return result;
  }

  async function splitBulk(
    limit: number,
    datas: any[],
    cb: (subDatas) => void
  ) {
    const len = datas.length;
    for (let i = 0; i < len; i += limit) {
      const maxI = Math.min(len, i + limit);
      await cb(datas.slice(i, maxI));
    }
  }

  console.log("batchSync", await batchSync([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]));
})();
