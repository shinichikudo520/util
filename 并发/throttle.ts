/**
 * 函数节流
 *  节流算法‌是一种限制函数执行频率的技术，主要用于减少函数被频繁调用的次数，从而避免性能问题。
 *  ‌Throttle算法的基本思想‌是通过设置一个时间间隔（阈值），在这个时间间隔内，无论函数被调用多少次，都只会在时间间隔结束时执行一次函数。
 * @param func
 * @param delay
 * @returns
 */
export default function throttle<K, T>(
  func: (...args: K[]) => T,
  delay: number
) {
  let lastTime = 0;
  let timerId: NodeJS.Timeout;

  return function (...args: K[]): ReturnType<typeof func> {
    const currentTime = new Date().getTime();
    if (currentTime - lastTime >= delay) {
      // 达到执行间隔
      clearTimeout(timerId);
      lastTime = currentTime;
      return func.apply(this, args);
    } else {
      // 执行间隔内触发, 保证最后一次的执行
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        lastTime = currentTime;
        return func.apply(this, ...args);
      }, delay);
    }
  };
}
