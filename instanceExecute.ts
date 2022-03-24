/**
 * 处理并发的promise
 * @param executor 排队处理的异步函数
 * @param immediately 立即执行
 * @returns
 */
export function instanceExecute(
  executor: (...args) => Promise<any>,
  immediately = false
) {
  let promise: Promise<any> = null;
  if (immediately) { // immediately立即执行一次
    return (...args) => executor(...args);
  } else {
    return (...args) => {
      if (!promise || immediately) { // immediately立即执行一次
        promise = executor(...args).finally(() => {
          promise = null;
        });
      }
      return promise; // 短时间内重复调用同一个promise，而上一次调用还没执行完成，则不重复调用，直接返回上一次的调用
    };
  }
}
