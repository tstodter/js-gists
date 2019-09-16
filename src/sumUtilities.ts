export type UnionType = {kind: string};

export type UnionMemberByKind<U, K> = Extract<U, { kind: K }>

export type UnionMatchObj<U extends UnionType, Ret> = {
  [K in U['kind']]: (unionMember: UnionMemberByKind<U, K>) => Ret
};

export type Merge<M extends {}, N extends {}> = {
  [P in Exclude<keyof M, keyof N>]: M[P]
} & N;

export const match = <U extends UnionType, RetT>(
  fObj: UnionMatchObj<U, RetT>
) => (
  unionVal: U
) => (
  fObj[unionVal.kind as U['kind']](unionVal as any)
);

type A = {
  kind: 'a';
  one: number;
  two: string;
};

type B = {
  kind: 'b';
  bee: number;
};

type C = {
  kind: 'c';
  cee: number;
  dee: A;
};

type Union = A | B | C;

const matchU = match<Union, number>({
  a: ({one, two}) => 1,
  b: ({bee}) => 2,
  c: ({cee, dee}) => dee.one
});//({kind: 'c', cee: 3, dee: {kind: 'a', one: 1234, two: 'fdsa'}});

