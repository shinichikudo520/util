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

    const generator = (fn, ...args) => {
      /** 必须将参数深拷贝, 否则并发时, 引用数据类型可能会受影响, 导致数据混乱 */
      const _args = deepClone(args);
      return new Promise((resolve) => enqueue(fn, resolve, ..._args));
    };

    return generator;
  }
  function deepClone(obj: any) {
    if (
      typeof obj !== "object" ||
      obj === null ||
      obj instanceof Date ||
      obj instanceof ArrayBuffer ||
      obj instanceof FormData
    ) {
      return obj;
    } else {
      if (Array.isArray(obj)) {
        return obj.map(deepClone);
      } else {
        let obj2 = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            obj2[key] = deepClone(obj[key]);
          }
        }
        return obj2;
      }
    }
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

  /**
   * 并发: 可以补位(继续封装)
   *  按照指定 limit 数量并发处理异步, 当某一个完成, 则下一个异步进入, 直到异步并发数量 == limit
   * @param limit 指定每次最大并发数量
   * @param callback 需要并发的异步函数
   * @param limit 并发函数需要的参数
   * @returns
   */
  async function concurrent3(
    limit: number,
    callback: (...arg) => void | Promise<any>,
    args: any[]
  ) {
    const generator = concurrent2(limit);
    const tasks: Promise<any>[] = [];

    for (const arg of args) {
      const _arg = Array.isArray(arg) ? arg : [arg];
      tasks.push(generator(callback, ..._arg));
    }

    return await Promise.all(tasks);
  }

  // [test concurrent3]
  const p = async (num) => {
    return num;
  };
  const temp2 = await concurrent3(2, p, arr);
  console.log("concurrent3", temp2); // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
  //  ------------------ COMPLETE

  /**
   * 并发: 可以补位(继续封装)
   *  按照指定 limit 数量并发处理异步, 当某一个完成, 则下一个异步进入, 直到异步并发数量 == limit
   * @param limit 指定每次最大并发数量
   * @param c 需要实例化的类
   * @param f 类的函数
   * @param args1 类构造函数需要的参数
   * @param f 类的函数需要的参数, 如果村长, 长度必须与 args1 长度相等, 否则参数无效
   * @returns
   */
  async function concurrent4<T>(
    limit: number,
    c: new (...args: any[]) => T,
    f: string,
    args1?: any[],
    args2?: any[]
  ) {
    const generator = concurrent2(limit);
    const tasks: Promise<any>[] = [];

    if (args1) {
      for (let i = 0; i < args1.length; i++) {
        const arg1 = args1[i];
        const _arg1 = Array.isArray(arg1) ? arg1 : [arg1];
        const instance = new c(..._arg1);
        const callback = instance[f].bind(instance);

        if (args2 && args2.length === args1.length) {
          const arg2 = args2[i];
          const _arg2 = Array.isArray(arg2) ? arg2 : [arg2];
          tasks.push(generator(callback, ..._arg2));
        } else {
          tasks.push(generator(callback));
        }
      }
    } else {
      const instance = new c();
      const callback = instance[f].bind(instance);
      if (args2) {
        for (const arg2 of args2) {
          const _arg2 = Array.isArray(arg2) ? arg2 : [arg2];
          tasks.push(generator(callback, ..._arg2));
        }
      } else {
        tasks.push(generator(callback));
      }
    }

    return Promise.all(tasks);
  }
})();
