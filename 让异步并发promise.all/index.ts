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

  const arr = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  ];
  const LIMIT = 10;
  /**
   * 让指定数量的异步同时进行, 并发处理, 提高批量异步的需求的速度
   *    比一个个异步请求, await, 速度约提高 2-3 倍
   * @param datas
   * @returns
   */
  async function concurrent(datas: Array<any>) {
    const tasks: Array<Promise<any>> = [];
    await splitBulk(LIMIT, datas, async (arr) => {
      const p: Promise<any> = new Promise((resolve) => {
        resolve(arr);
      });
      tasks.push(p);
    });
    const temp = await Promise.all(tasks);
    return temp;
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

  // [test concurrent]
  console.log("concurrent", await concurrent(arr)); // [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]]

  /**
   * 并发: 没有补位功能
   *  与 concurrent 相比, 其实就是将分割函数封装起来了, 可以由外部传入指定的分割函数
   *  将数据使用传入的分割函数 split 进行分割后, 调用回调 callback 返回一个 promise
   *  tasks 接收所有 promise, 并发处理, 等待所有 promise 完成后返回
   * @param limits 分割限制
   * @param datas 数据
   * @param split 分割函数
   * @param callback 针对分割后的数据进行处理的函数, 需要返回一个 promise
   * @returns
   */
  async function concurrent1<T>(
    limits: Array<number>,
    datas: Array<T>,
    split: (
      limits: number,
      datas: Array<T>,
      cb: (subDatas: Array<T>) => void
    ) => void,
    callback: (subDatas: Array<T>) => Promise<any>
  ) {
    const tasks: Array<Promise<any>> = [];
    await split.apply(this, [
      ...limits,
      datas,
      (subDatas) => tasks.push(callback(subDatas)),
    ]);
    const result = await Promise.all(tasks);
    return result;
  }

  // [test concurrent1]
  const temp = await concurrent1.call(
    this,
    [LIMIT],
    arr,
    splitBulk,
    (subDatas) => {
      const p = new Promise((resolve) => {
        resolve(subDatas);
      });
      return p;
    }
  );
  console.log("concurrent1", temp); // [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]]

  /**
   * 并发: 可以补位
   *  按照指定 limit 数量并发处理异步, 当某一个完成, 则下一个异步进入, 直到异步并发数量 == limit
   * @param limit 指定每次最大并发数量
   * @returns
   */
  function concurrent2(limit: number) {
    const queue: Array<Function> = [];
    let activeCount = 0;

    const next = () => {
      activeCount--;
      if (queue.length > 0) {
        (queue.shift() as any)();
      }
    };

    const run = async (fn, resolve, ...args) => {
      activeCount++;
      const result = (async () => fn(...args))();
      try {
        const res = await result;
        resolve(res);
      } catch (error) {}
      next();
    };

    const enqueue = (fn, resolve, ...args) => {
      queue.push(run.bind(null, fn, resolve, ...args));
      if (activeCount < limit && queue.length > 0) {
        (queue.shift() as any)();
      }
    };

    const generator = (fn, ...args) =>
      new Promise((resolve) => enqueue(fn, resolve, ...args));

    return generator;
  }

  // [test concurrent2]
  const promises: Array<Promise<any>> = [];
  const generator = concurrent2(2);
  await splitBulk(LIMIT, arr, (subDatas) => {
    const p = () =>
      new Promise((resolve) => {
        resolve(subDatas);
      });
    promises.push(generator(p));
  });
  const temp1 = await Promise.all(promises);
  console.log("concurrent2", temp1); // [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]]
  //  ------------------ COMPLETE
})();
