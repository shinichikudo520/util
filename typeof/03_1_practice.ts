const obj = { id: 1, name: "1", age: 1 };
const arr = [1, 2, 3] as const;

type key = Key<typeof obj>; // "id" | "name" | "age"
const key1: key = "id";
const key2: key = "name";
const key3: key = "age";
// const key4: key = "sex"; // 报错

type value = Value<typeof arr>; // 1 | 2 | 3
const arr1: value = 1;
const arr2: value = 2;
const arr3: value = 3;
// const arr4: value = 4; // 报错

type values = Values<typeof arr>; // [] | [1] | [2] | [3] | [1, 2] | [1, 3] | [2, 3] | [1, 2, 3]
const arrs0: values = [];
const arrs1: values = [1];
const arrs2: values = [2];
const arrs3: values = [3];
const arrs4: values = [1, 2, 3];
// const arrs5: values = [1, 2, 3, 4]; // 报错

type isArray = IsArray<[]>;
type isArray1 = IsArray<1>;

type readonly1 = Readonly<typeof obj>;
const obj1: readonly1 = {
  id: 2,
  name: "2",
  age: 2,
};
// obj1.id = 3; // 报错
type writable = Writable<readonly1>;
const obj2: writable = {
  id: 2,
  name: "2",
  age: 2,
};
obj2.id = 3;

type Readonly2 = IsReadonly<typeof obj, true>;
type Writable2 = IsReadonly<typeof obj, false>;

type arr11 = ["aaa", "bbb", "ccc"];
type finda = Find<arr11, "aaa">;
type arr12 = [1, 2, 3];
type find3 = Find<arr12, 3>;

type toEnum1 = ArrayToEnum<arr11, true>;
type toEnum2 = ArrayToEnum<arr11, false>;

type o = { readonly id: 1; name: "1"; readonly age: 1 };
type oo = ReadonlyKeys<o>;
type oo1 = OmitReadonlyKey<o>;

type readonlyPick = PickReadonly<typeof obj, "id">;
