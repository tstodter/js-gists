// import { A } from "ts-toolbelt";

// type Func<P, T> = (...args: P[]) => T;

// type G<A, T> = (...a: A[]) => T;
// type F<A, T> = (f: F<A, T>) => G<A, T>;

// type Y =
//   <A, T>(f: F<A, T>) => G<A, T>;

// const Y: Y = <A, T>(f: F<A, T>) => (
//   g => f(g(g))
// )(
//   (g) => f(g(g))
// );

// const res = Y<number, number>(f => n => n > 1 ? n + f(n - 1) : 1);

// const res1 = res(4);

// console.log('result', res1);

// /*
// g => f(g(g))
//   return type matches f return type
// f
//   return type matches g
//   return type
// */

import num from './test';

console.log('reevaluating');
let i = 0;
console.log(num + 2);