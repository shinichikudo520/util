function fn() {
  return {
    aaa: "aaa",
    bbb: "bbb",
    ccc: "ccc",
    ddd: "ddd",
    eee: "eee",
  };
}

let type: ReturnType<typeof fn>; // ReturnType 可以拿到函数 fn 返回值对象作为声明类型
console.log(type.aaa);
console.log(type.bbb);
console.log(type.ccc);
console.log(type.ddd);
