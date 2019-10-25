
type None = {
  kind: 'none'
};

type Concat<T> = {
  kind: 'concat';
  first: T;
  tail: List<T>;
};

const None = (): None => ({
  kind: 'none'
});

const List = <T>(first: T, tail: List<T>): List<T> => ({
  kind: 'concat',
  first,
  tail
});

type List<T> = None | Concat<T>;



// type List<T> = None | (T & List<T>);











// type List<T> = None | {
//   kind: 'concat';
//   first: T;
//   tail: None | {
//     kind: 'concat';
//     first: T;
//     tail: None | {
//       kind: 'concat';
//       first: T;
//       tail: None | {
//         kind: 'concat';
//         first: T;
//         tail: List<T>;
//       };
//     };
//   };
// };

// type List<T> = None | (T & (None | (T & List<T>)))
//                None + (T * (None + (T * List<T>)))
//                None + T + (T * T * (None | (T & List<T>)))
//                           (T * T + T * T * (T & List<T>))
// type List<T> = None | T | T & T | T & T & T | T & T & T & T | ..
// type List<T> = None | T | [T, T] | [T, T, T] | [T, T, T, T]

// type List2<T> = [] | [T] | [T, T] | [T, T, T] | [T, T, T, T]

