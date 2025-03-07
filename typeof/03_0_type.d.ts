/** 键值对象 */
declare type KVObject<K extends string | number | symbol, T = any> = Record<
  K,
  T
>;

/** 获取对象、数组、Map、Set的键类型 */
declare type Key<T extends any> = T extends object
  ? keyof T
  : T extends KVObject<infer K, any>
  ? K
  : T extends any[]
  ? number
  : T extends Map<infer K, any>
  ? K
  : T extends Set<infer K>
  ? K
  : never;

/** 获取对象、数组、Map、Set的值类型 */
declare type Value<T extends any> = T extends object
  ? T[keyof T]
  : T extends KVObject<infer _, infer V>
  ? V
  : T extends (infer V)[]
  ? V
  : T extends Map<any, infer V>
  ? V
  : T extends Set<infer V>
  ? V
  : never;

/** 获取对象、数组、Map、Set的值的复合数组类型 */
declare type Values<T extends any> = Value<T>[];

/** 是否是 Array */
declare type IsArray<T> = T extends any[] ? true : false;
/** 是否是 Set */
declare type IsSet<T> = T extends Set<any> ? true : false;

/** 推断对象类型 */
declare type Compute<O extends object> = O extends Function
  ? O
  : { [key in keyof O]: O[key] };

/** 合并两个对象的结果类型 */
declare type Merge<O1 extends object, O2 extends object> = Compute<
  O1 & Omit<O2, keyof O1>
>;

/** 两个对象相交的对象结果 */
declare type Intersection<O1 extends object, O2 extends object> = Pick<
  O1,
  Extract<keyof O1, keyof O2> & Extract<keyof O2, keyof O1>
>;

/** 让数据可写 */
declare type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

/** 让数据深层可写 */
declare type DeepWritable<T> = T extends object
  ? T extends Function
    ? Function
    : Writable<{
        [K in keyof T]: DeepWritable<T[K]>;
      }>
  : never;

/** 让数据深层只读 */
declare type DeepReadonly<T> = T extends object
  ? T extends Function
    ? Function
    : Readonly<{
        [k in keyof T]: DeepReadonly<T[k]>;
      }>
  : T;

/** 数据深层必须 */
declare type DeepRequired<T> = T extends object
  ? T extends Function
    ? Function
    : Required<{
        [K in keyof T]: DeepRequired<T[K]>;
      }>
  : T;
/** 数据深层非必须 */
declare type DeepPartial<T> = T extends object
  ? T extends Function
    ? Function
    : Partial<{
        [K in keyof T]: DeepPartial<T[K]>;
      }>
  : never;

/** 推断函数的参数类型 */
declare type Arguments<T extends Function> = T extends (...args: infer A) => any
  ? A
  : never;

/** 推断构造函数的参数类型 */
declare type Constructor<T extends new () => any> = ConstructorParameters<T>;

/** 推断 promise 结果类型 */
declare type PromiseResult<P extends Promise<any>> = P extends Promise<infer R>
  ? R extends Promise<any>
    ? PromiseResult<R>
    : R
  : never;

/** 可能是 promise */
declare type MaybePromise<T> = T | Promise<T>;

/** 可能返回 promise */
declare type MaybeReturnPromise = (...args: any) => MaybePromise<any>;

/** 非 null */
declare type NotNull<T> = T extends null ? never : T;

/** 可 null */
declare type Nullable<T> = T | null;

/** 非 null 非 undefined */
declare type NotEmpty<T> = T extends null | undefined ? never : T;

/** 推断数组第一个元素类型 */
declare type First<T extends unknown[]> = T extends [infer F, ...infer _]
  ? F
  : never;

/** 推断数组最后一个元素类型 */
declare type Last<T extends unknown[]> = T extends [infer _, ...infer L]
  ? L
  : never;

/** 推断数组长度 */
declare type Length<T extends unknown[]> = T["length"];

/** 找到元素在数组中的索引 */
declare type Find<
  T extends unknown[],
  D extends T[number],
  I extends number[] = []
> = T extends [infer L, ...infer R]
  ? L extends D
    ? I["length"]
    : R extends unknown[]
    ? Find<R, D, [...I, 0]>
    : never
  : never;

/** 将数组转化成枚举
 *  B === true  => {T[number] : index}
 *  B === false => {T[number] : T[number]}
 */
declare type ArrayToEnum<
  T extends unknown[],
  B extends boolean = false
> = T extends (infer I)[]
  ? I extends string | number | symbol
    ? {
        [key in I]: I extends key ? (B extends true ? Find<T, I> : I) : never;
      }
    : never
  : never;

/** 将集合转化成数组 */
declare type SetToArray<T extends Set<unknown>> = T extends Set<infer I>
  ? I[]
  : never;

/** 判断 X Y 是否相等, 相等则返回 A , 反之返回 B */
declare type IsEqual<X, Y, A = X, B = never> = (<T>() => T extends X
  ? 1
  : 2) extends <T>() => T extends Y ? 1 : 2
  ? A
  : B;

/** 是否只读 */
declare type IsReadonly<T, R extends boolean = true> = R extends true
  ? Readonly<T>
  : R extends false
  ? Writable<T>
  : never;

/** 找到只读属性 */
declare type ReadonlyKeys<T> = {
  [K in keyof T]-?: IsEqual<
    { [O in K]: T[K] },
    { readonly [O in K]: T[K] },
    K,
    never
  >;
}[keyof T];

/** 忽略只读属性 */
declare type OmitReadonlyKey<T extends object> = Omit<T, ReadonlyKeys<T>>;

/** 重映射 as
 * 功能与 Pick 一致, 只读取指定的属性
 * 功能与 Omit 相反, 去除指定的属性
 */
declare type As<T, K extends keyof T> = {
  [P in keyof T as P extends K ? P : never]: T[P];
};

/** 指定只读属性 */
declare type PickReadonly<T, K extends keyof T> = Merge<
  Readonly<Pick<T, K>>,
  Writable<Omit<T, K>>
>;

/** 指定必要属性 */
declare type PickRequired<T extends object, K extends keyof T> = Merge<
  T,
  Required<Pick<T, K>>
>;

/** 指定可选属性 */
declare type PickPartial<T extends object, K extends keyof T> = Merge<
  T,
  Partial<Pick<T, K>>
>;

/** 添加属性值 */
declare type Append<T, K extends keyof any, V> = {
  [P in keyof T | K]: P extends keyof T ? T[P] : V;
};

/** 是否是空数组 */
declare type IsEmptyArray<T> = [] extends T ? true : false;

/** 是否是空字符串 */
declare type IsEmptyString<T extends string> = T extends `${infer L}${infer R}`
  ? false
  : true;

/** 空格 */
declare type BlankSpace = " " | "\n" | "\r" | "\t";

/** 推断字符串是否以某字符串开头  */
declare type StartsWith<
  T extends string,
  U extends string
> = T extends `${U}${infer _}` ? T : never;

/** 去除左边空格 */
declare type TrimLeft<T extends string> = T extends `${infer L}${infer R}`
  ? L extends BlankSpace
    ? TrimLeft<R>
    : T
  : "";

/** 去除右边空格 */
declare type TrimRight<T extends string> = T extends `${infer L}${infer R}`
  ? R extends BlankSpace
    ? TrimRight<L>
    : T
  : "";

/** 去除两边空格 */
declare type Trim<T extends string> = T extends `${BlankSpace}${infer R}`
  ? Trim<R>
  : T extends `${infer L}${BlankSpace}`
  ? Trim<L>
  : T;

/** 分割字符串的每一个字符作为类型 */
declare type StringToUnion<
  T extends string,
  U = never
> = T extends IsEmptyString<T>
  ? U
  : T extends `${infer L}${infer R}`
  ? StringToUnion<R, L | U>
  : U;
