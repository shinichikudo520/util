/**
 * 防抖
 * @param fn 防抖包裹的函数
 * @param delay 延迟时间
 * @param option 配置
 *      @param {Boolean} immediate 是否在高频事件触发时，立即执行一次
 *      @param {Boolean} immediate 1.是否在高频事件结束后 2.满足延迟时间后 再执行一次事件
 *          若 immediate = true & trailing = false , 则高频事件触发时，立即执行一次，事件触发终止 delay 后不会再执行回调
 *          若 immediate = true & trailing = true , 则高频事件触发时，立即执行一次，事件触发终止 delay 后会再执行一次回调
 *          若 immediate = false  则高频事件触发终止 dely 毫秒后执行一次回调 , trailing 设置失效
 */
export function debounce(
  fn,
  delay = 500,
  option = { immediate: false, trailing: false }
) {
  let timer = null;
  return function () {
    if (timer) {
      window.clearTimeout(timer);
    }
    if (!option.immediate) {
      timer = window.setTimeout(() => {
        fn.apply(this, arguments);
      }, delay);
    } else {
      if (!timer) {
        fn.apply(this, arguments);
      }
      timer = window.setTimeout(() => {
        timer = null;
        if (option.trailing) {
          fn.apply(this, arguments);
        }
      }, delay);
    }
  };
}
