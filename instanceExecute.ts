/**
 * 处理并发的promise，让promise排队处理
 * @param executor 排队处理的异步函数
 * @param immediately 立即执行
 * @returns
 */
export function instanceExecute(
  executor: (...args) => Promise<any>,
  immediately = false
) {
  let promise: Promise<any> = null;
  if (immediately) {
    return (...args) => executor(...args);
  } else {
    return (...args) => {
      if (!promise || immediately) {
        promise = executor(...args).finally(() => {
          promise = null;
        });
      }
      return promise;
    };
  }
}
