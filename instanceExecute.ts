/**
 * 处理并发的promise
 *  同时进来 1、2、3、4、5、6次，则只执行第 1 次，且后面几次返回第 1 次的 promise
 * @param executor 处理的异步函数
 * @param immediately 立即执行
 * @returns 返回 executor 的结果（promise）
 */
export function instanceExecute(
  executor: (...args) => Promise<any>,
  immediately = false
) {
  let promise: Promise<any> = null;
  if (immediately) {
    // immediately立即执行一次
    return (...args) => executor(...args);
  } else {
    return (...args) => {
      if (!promise || immediately) {
        // immediately立即执行一次
        promise = executor(...args).finally(() => {
          promise = null;
        });
      }
      return promise; // 短时间内重复调用同一个promise，而上一次调用还没执行完成，则不重复调用，直接返回上一次的调用
    };
  }
}
/**
 * !!! 这个方法有问题
 * 处理并发的promise
 *  同时进来 1、2、3、4、5、6次，则执行第 1 次，且执行最后进入的第 6 次，
 * @param executor 处理的异步函数
 * @returns 返回 executor 的结果（promise）
 */
export function instanceExecute1(executor: (...args) => Promise<any>) {
  let ticket = 0;
  let cur = 0;
  let _args: any[] | undefined;
  let promise: Promise<any> | undefined;
  let _resolve: (result?: any) => void, _reject: (err?: any) => void;
  const loop = async () => {
    cur = ticket;
    promise = undefined;
    const res = _resolve;
    const rej = _reject;
    try {
      const ret = await executor(..._args);
      res(ret);
    } catch (error) {
      rej(error);
    }
    if (cur < ticket) {
      Promise.resolve().then(loop);
    }
  };
  return (...args) => {
    if (cur === ticket) {
      Promise.resolve().then(loop);
    }
    ++ticket;
    _args = args;
    if (!promise) {
      promise = new Promise<any>((resolve, reject) => {
        _resolve = resolve;
        _reject = reject;
      });
    }
    return promise;
  };
}

/**
 * 处理并发的promise
 *  同时进来 1、2、3、4、5、6次，则执行第 1 次，且执行最后进入的第 6 次
 *  与 instanceExecute1 的区别则是不会返回promise作为结果
 * @param executor 处理的异步函数
 * @returns 无返回
 */
export function instanceExecute2(executor: (...args) => Promise<any>) {
  let ticket = 0;
  const ticketList = new Array<number>();
  let _args;
  const loop = async () => {
    const cur = ticketList.pop();
    if (cur !== undefined && cur >= ticket) {
      await executor(..._args);
    }
    requestAnimationFrame(loop);
  };
  loop();
  return (...args) => {
    ticketList.push(++ticket);
    _args = args;
  };
}
