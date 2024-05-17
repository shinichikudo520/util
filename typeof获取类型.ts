const obj: { aaa: string; bbb: number; ccc: Array<any>; ddd: Function } = {
  aaa: "hello world",
  bbb: 123,
  ccc: [],
  ddd: function () {},
};
// 获取对象 key 的类型
type typeKey = keyof typeof obj; // typeKey: 'aaa' | 'bbb' | 'ccc' | 'ddd'
// 获取对象 Value 的类型
type typeVal = (typeof obj)[keyof typeof obj]; // typeVal: string | number | Array<any> | Function
// 获取对象的值作为类型
const obj1 = {
  LINE: "line",
  ARC: "arc",
} as const;
type typeVal1 = (typeof obj1)[keyof typeof obj1]; // "line" | "arc"

const obj2 = {
  ZORE: 0,
  ONE: 1,
  TWO: 2,
} as const;
type ObjectToUnion<T> = T extends { value: infer V } ? V : never;

type Test = ObjectToUnion<
  { key1: { value: 1 } } | { key2: { value: 2 } } | { key3: { value: 3 } }
>;
// Test 将会是 1 | 2 | 3

function method() {
  return obj;
}
// 获取函数返回值类型
type returnType = ReturnType<typeof method>;

// 获取数组的值作为类型
const arr = ["aa", "bb", "cc", "dd", "ee"] as const; // as const 必须有
type Arr_Value = (typeof arr)[number]; // "aa" | "bb" | "cc" | "dd" | "ee"
type Obj = { id: string } & { [key in Arr_Value]: any }; // { id: string } & {aa: any;bb: any;cc: any;dd: any;ee: any;}

const arr1 = [{ key: "a" }, { key: "b" }] as const;
type Arr1_Value = (typeof arr1)[number]["key"]; // 'a' | 'b'

enum Colors {
  Red = 1,
  Green = 2,
  Blue = 3,
}
// 在TypeScript中，你可以使用数字字面量类型来表示只能是特定数字的类型。
// 这种类型在定义一些有限集合或者特殊的配置项时非常有用。
type ColorType = Colors.Red | Colors.Green | Colors.Blue;

let myColor: ColorType = Colors.Green; // 正确
// myColor = 4; // 错误：类型不匹配
