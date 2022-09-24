const obj: { aaa: string; bbb: number; ccc: Array<any>; ddd: Function } = {
  aaa: "hello world",
  bbb: 123,
  ccc: [],
  ddd: function () {},
};
// 获取对象 key 的类型
type typeKey = keyof typeof obj; // typeKey: 'aaa' | 'bbb' | 'ccc' | 'ddd'
// 获取对象 Value 的类型
type typeVal = typeof obj[keyof typeof obj]; // typeVal: string | number | Array<any> | Function


function method(){
  return obj
}
// 获取函数返回值类型
type returnType = ReturnType<typeof method>