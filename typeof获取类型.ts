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

function method() {
  return obj;
}
// 获取函数返回值类型
type returnType = ReturnType<typeof method>;

// 获取数组的值作为类型
const arr = ["aa", "bb", "cc", "dd", "ee"] as const; // as const 必须有
type Arr_Value = typeof arr[number]; // "aa" | "bb" | "cc" | "dd" | "ee"
type Obj = { id: string } & { [key in Arr_Value]: any }; // { id: string } & {aa: any;bb: any;cc: any;dd: any;ee: any;}

const arr1 = [{ key: "a" }, { key: "b" }] as const;
type Arr1_Value = typeof arr1[number]["key"]; // 'a' | 'b'
