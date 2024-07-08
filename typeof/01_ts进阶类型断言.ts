/**
 * ## TS 进阶之类型获取
 */

/** ### 一、 keyof */

/** 1. 使用: 获取对象键值类型 */
type Person = { id: number; name: string; age: number };
type Key1 = keyof Person; // 'id' | 'name' | 'age'

const p: { [key in Key1]: any } = {
  id: "1",
  name: 1,
  age: "1",
  //   sex: "man", // 会报错
};

/** 2. 衍生应用: 获取对象属性的类型 */
type Value1 = Person[keyof Person]; // 'string' | 'number'

/** 3. 约束泛型参数的范围 */
declare type MyPick<T, K extends keyof T> = { [P in K]: T[P] };
type Person1 = MyPick<Person, "id" | "name">;

const P1: Person1 = {
  id: 1,
  name: "1",
  //   age: 1, // 会报错
};

/** 4. readonly 修饰词 */
declare type MyPick1<T, K extends keyof T> = { [P in K]: T[P] };
declare type MyReadonly<T, K extends keyof T> = { readonly [P in K]: T[P] };
type Person2 = MyReadonly<Person, "id" | "age">;
/** 将某种类型的属性都加上 readonly */
declare type MyReadonly1<T> = { readonly [P in keyof T]: T[P] };
type Person2_1 = MyReadonly1<Person>;

const p2: Person2 = {
  id: 2,
  age: 2,
  // name: "2", // 会报错
};
// p2.id = 3; // 会报错

/** 5. 去掉某些属性, 重映射
 *  as P extends K ? never : P 这段代码叫重映射
 *  never 是空的联合类型, 可以通过 never 忽略我们不需要的 P, 只保留需要的
 */
declare type MyOmit<T, K> = {
  readonly [P in keyof T as P extends K ? never : P]: T[P];
};
type Person3 = MyOmit<Person, "id" | "age">; // == {readonly name: string}
const p3: Person3 = {
  // id: 3, // 会报错
  // age: 3, // 会报错
  name: "3",
};
// p3.name = "4"; // 会报错

/** 6. 添加新属性 */
declare type MyAppend<T, K extends keyof any, V> = {
  [P in keyof T | K]: P extends keyof T ? T[P] : V;
};
type Person4 = MyAppend<Person, "sex", string>;
const p4: Person4 = {
  id: 4,
  name: "4",
  age: 4,
  sex: "man",
};

/** 7. 合并两种类型
 * Record 声明一种键值类型 Record<string, any> === {[key:string]: any}
 *  T extends U ? X : Y; 是一种条件类型
 */
declare type MyMerge<
  F extends Record<string, any>,
  S extends Record<string, any>
> = {
  [P in keyof F | keyof S]: P extends keyof F
    ? F[P]
    : P extends keyof S
    ? S[P]
    : never;
};
type Skill = {
  run: () => void;
};
type Person5 = MyMerge<Person, Skill>;
const p5: Person5 = {
  id: 5,
  name: "5",
  age: 5,
  run: () => {
    console.log("p5 is running...");
  },
};

/** ### 二、 条件类型 */

/** 1. 使用
 * T extends U ? X : Y;
 */
type MyIf<T, K extends string, V extends any> = {
  [P in keyof T | K]: P extends keyof T ? T[P] : V;
};

/** 2. 练习 */
interface Animal {
  live: () => void;
}
interface Dog extends Animal {
  woof: () => void;
}
type IsAnimal<T> = T extends Animal ? string : number;
type A1 = IsAnimal<Dog>; // string
type A2 = IsAnimal<RegExp>; // number

/** 3. 条件类型的分发特性
 * 重点：条件的分发特性
 *  1. 主要针对的T是联合类型
 *  2. 分发的必须是裸类型, 裸类型是指没有被数组, 元组, promise 等包装过的类型
 *
 */
declare type MyExclude<T, U> = T extends U ? never : T;
type A3 = MyExclude<"a" | "b" | "c", "a" | "b">; // 'ccc'
/**
 * 解析:
 *  对联合类型 T 进行分发:
 *  'a' extends 'a' | 'b' ? never :'a' |
 *  'b' extends 'a' | 'b' ? never :'b' |
 *  'c' extends 'a' | 'b' ? never :'c'
 *
 *  计算结果: never | never | 'c'
 *  最终结果: 'c'
 */

/** 针对裸类型 */
declare type IsString<T> = T[] extends string[]
  ? "Is a string"
  : "Not a stirng ";
declare type IsString1<T> = T extends string ? "Is a string" : "Not a stirng ";
type A4 = IsString<string | number>; // "Not a stirng "
type A5 = IsString1<string | number>; // "Not a stirng " | "Is a string"
/**
 * 解析:
 * IsString 中的 T 被数组包装过, 所以不会进行分发, 直接判断 string | number[], 所以得到 "Not a stirng "
 * IsString1 中的 T 没有被数组, 元组, promise 等包装, 所以会分发, 得到 "Not a stirng " | "Is a string"
 */

/** 4. 判断类型是否相等 */
declare type MyEqual<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T
>() => T extends Y ? 1 : 2
  ? X
  : never;

/**
 * 格式化之后不好阅读, 标注好阅读的写法
 * lare type MyEqual<X, Y> = (<T>() => T extends X ? 1 : 2) extends 
                             (<T>() => T extends Y ? 1 : 2) ? true : false;
 */

/** ### 三、 infer */

/** 1. 使用
 *  重点说明:
 *    1. infer 只能在条件类型的 extends 子句中使用
 *    2. infer 得到的类型只能在为 true 的语句中使用
 */
declare type InferArray<T> = T extends (infer U)[] ? U : never;
type infer1 = InferArray<[string, number]>; // string | number
type infer2 = InferArray<string[]>; // string
type infer3 = InferArray<number[]>; // number

/** 推断数组第一个元素的类型 */
declare type InferFirst<T extends unknown[]> = T extends [infer P, ...infer _]
  ? P
  : never;
type First1 = InferFirst<[1, 2, 3]>; // 1
/** 推断数组最后一个元素的类型 */
declare type InferLast<T extends unknown[]> = T extends [...infer _, infer P]
  ? P
  : never;
type Last1 = InferLast<[1, 2, 3]>; // 3
/** 推断函数类型的参数的类型 */
declare type InferArguments<T extends Function> = T extends (
  ...args: infer P
) => any
  ? P
  : never;
type Arguments1 = InferArguments<(arg1: string, arg2: number) => void>; // [string, number]
const args: Arguments1 = ["1", 1];
/** 推断函数类型的返回值的类型 */
declare type InferReturn<T extends Function> = T extends (
  ...args: any
) => infer P
  ? P
  : never;
type retun1 = InferReturn<() => string>; // string
type retun2 = InferReturn<() => number>; // number

/** 推断 promise  成功值的类型 */
declare type InferPromise<T> = T extends Promise<infer P> ? P : never;
type Promise1 = InferPromise<Promise<string>>; // string

/** 推断字符串的第一个字符类型 */
declare type InferFirstString<T> = T extends `${infer First}${infer _}`
  ? First
  : never;
type FirstString = InferFirstString<"snjkdcnsdjkcn">; // s

/** 2. 练习 */
/** 推断排除数组第一个元素之外的元素类型 */
declare type InferShift<T> = T extends [infer _, ...infer P] ? [...P] : never;
type Shift = InferShift<[1, 2, 3]>; // [2, 3]
/** 推断排除数组最后一个元素之外的元素类型 */
declare type InferPop<T> = T extends [...infer P, infer _] ? [...P] : never;
type Pop = InferPop<[1, 2, 3]>; // [1, 2 ]
/** 推断是否是空数组 */
declare type IsEmptyArray1<T> = [] extends T ? true : false;
type aaa = IsEmptyArray<[]>; // true
type bbb = IsEmptyArray<[1, 2, 3]>; // false
/** 把 T 数组反转再与 U 数组拼接 */
declare type InferReverse<
  T extends unknown[],
  U extends unknown[] = []
> = [] extends T
  ? U
  : T extends [infer L, ...infer R]
  ? InferReverse<R, [L, ...U]>
  : U;
type reverse1 = InferReverse<[1, 2, 3], [4, 5, 6]>; // [3, 2, 1, 4, 5, 6]

/** 把函数的参数反转再执行 */
declare type FlipArguments<T extends Function> = T extends (
  ...args: infer P
) => infer S
  ? (...arg: InferReverse<P>) => S
  : T;
type FlipArguments1 = FlipArguments<(a: 1, b: 2, c: 3) => boolean>; //  (arg_0: 3, arg_1: 2, arg_2: 1) => void
// const func1: FlipArguments1 = (a: 1, b: 2, c: 3) => "aaa"; // x: 参数类型必须是 3,2,1
// const func2: FlipArguments1 = (a: 3, b: 2, c: 1) => "aaa"; // x: 不能将 'aaa' 赋值给 boolean
const func3: FlipArguments1 = (a: 3, b: 2, c: 1) => true;

/** 推断字符串是否以某字符串开头  */
declare type StartsWith1<
  T extends string,
  U extends string
> = T extends `${U}${infer _}` ? T : never;
type IsAStart<T extends string> = T extends StartsWith<T, "A"> ? true : false;
type IsAStart1 = IsAStart<"Ansjknkds">;

/** 是否是空字符串 */
type IsEmptyString1<T extends string> = T extends `${infer L}${infer R}`
  ? false
  : true;
type IsEmptyString11 = IsEmptyString<"">;
type IsEmptyString12 = IsEmptyString<"a">;

type Empty = " " | "\n" | "\r" | "\t";
/** 去除左边空格 */
declare type TrimLeft1<T extends string> = T extends `${infer L}${infer R}`
  ? L extends Empty
    ? TrimLeft<R>
    : T
  : "";
type AAA = TrimLeft<"   ssss    ">;
const sss: AAA = "ssss    ";

/** 去除两边空格 */
declare type Trim1<T extends string> = T extends `${Empty}${infer R}`
  ? Trim<R>
  : T extends `${infer L}${Empty}`
  ? Trim<L>
  : T;
const jjjjj: Trim<"   ssss    "> = "ssss";

/** 分割字符串的每一个字符作为类型 */
declare type StringToUnion1<
  T extends string,
  U = never
> = T extends IsEmptyString<T>
  ? U
  : T extends `${infer L}${infer R}`
  ? StringToUnion<R, L | U>
  : U;

type StringToUnion11 = StringToUnion<"abcde">; //  "a" | "b" | "c" | "d" | "e"

/** 四、 as const
 *    是一个修饰符, 用来修改类型推断的行为
 *    如果用在一个变量或者表达式的类型上, 会强制将变量或者表达式变成不可变的
 */

/** 1. 使用 */
const obj11 = {
  id: 1,
  age: 1,
};
obj11.age = 11;

const obj12 = {
  id: 2,
  age: 2,
} as const;
// obj12.age = 12; // 会报错, as const 会将 obj12 属性都变为只读

/** 2. 特性: 不可变量的类型不能被扩展, 反而被缩小到最精准的类型  */
let num = 1;
type num1 = typeof num; // number
let num2 = 1 as const;
type num3 = typeof num2; // 1

/**
 * 参考资料
 * 1. keyof: https://www.jianshu.com/p/097936fae5be
 * 2. 条件类型: https://www.jianshu.com/p/c2d5efa1f2cc
 * 3. infer: https://www.jianshu.com/p/707a304d7752
 * 4. as const: https://blog.csdn.net/hhbbeijing/article/details/132449249
 */
