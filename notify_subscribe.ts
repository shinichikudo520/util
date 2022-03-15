const enum EVENT {
  INIT,
  ADD,
  DELETE,
  UPDATE,
}
class Manager {
  private static events: { [event: string]: Array<(...args: any) => void> } =
    {}; // 一个对象，{事件：订阅者（数组）}
  private static ready = false; // 一个状态，可以控制订阅发布开始的时机
  // 发布函数，只在内部使用
  static notifyWatcher(event: EVENT, ...args: any) {
    if (this.ready) {
      const watcheres = this.events[event];
      if (watcheres.length) {
        for (const watcher of watcheres) {
          try {
            watcher(...args);
          } catch (ex) {
            console.log(ex);
          }
        }
      }
    }
  }
  // 定义订阅函数
  static subscribeEv(event: EVENT, cb: (...args: any) => void) {
    getOrInitArr(this.events, event).push(cb);
  }
  publish() {
    // 发布示例
    Manager.notifyWatcher(EVENT.ADD, 'addData');
  }
}
function getOrInitArr<T>(
  obj: { [key: string]: Array<T> },
  key: string | number
) {
  return getOrInit(obj, key, () => [] as Array<T>);
}
function getOrInit<T>(
  obj: { [key: string]: T },
  key: string | number,
  initializer: (key: string | number) => T
): T {
  let value = obj[key];
  if (value !== undefined) {
    return value;
  } else {
    value = initializer(key);
    obj[key] = value;
    return value;
  }
}
// 订阅示例
function subscribeFn() {
  Manager.subscribeEv(EVENT.ADD, (addData: string) => {
    console.log('被添加的值：', addData);
  });
}
