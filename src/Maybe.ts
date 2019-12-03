import { matcher } from "./sumUtilities";

// import { match, matcher } from "./sumUtilities";

type Maybe<T> = Some<T> | None;

type Some<T> = {
  kind: 'some';
  val: T;
};

type None = {
  kind: 'none';
};

export const Some = <T>(val: T): Some<T> => ({
  kind: 'some',
  val
});

export const None = (): None => ({
  kind: 'none'
});

const isMaybe = <T>(maybeMaybe: void | T | Maybe<T>): maybeMaybe is Maybe<T> => (
  !!maybeMaybe &&
  maybeMaybe instanceof Object &&
  'kind' in maybeMaybe && (
    maybeMaybe.kind === 'some' ||
    maybeMaybe.kind === 'none'
  )
);

const maybeFold = <T, R>(
  onNone: () => R,
  onSome: (_: T) => R
) => (
  mb: Maybe<T>
): R => {
  switch (mb.kind) {
    case 'none': return onNone();
    case 'some': return onSome(mb.val);
  }
};

const maybePipe = <T0, T1, T2, T3>(
  f0: (_: T0) => Maybe<T1>,
  f1: (_: T1) => Maybe<T2>,
  f2: (_: T2) => Maybe<T3>
) => (mb: Maybe<T0>) => {
  return Maybe.flatMap(f2)(
          Maybe.flatMap(f1)(
           Maybe.flatMap(f0)(mb)));
};

const Maybe = {
  of: <T>(val: T | void | Maybe<T>) => {
    if (isMaybe(val))
      return val;

    if (val === null || val === undefined || Number.isNaN(val as unknown as number))
      return None();

    return Some(val as T);
  },
  map: <T, R>(mapping: (v: T) => R | void) => (mb: Maybe<T>): Maybe<R> => {
    return maybeFold<T, Maybe<R>>(
      None,
      (v: T) => Maybe.of(mapping(v))
    )(mb);
  },
  flatMap: <T, R>(mapping: (v: T) => Maybe<R>) => (mb: Maybe<T>): Maybe<R> => {
    return maybeFold<T, Maybe<R>>(
      None,
      (v: T) => mapping(v)
    )(mb);
  },
  fold: maybeFold,
  pipe: maybePipe
};

export default Maybe;

// const maybeMatch = matcher<Maybe<number>>();

const maybeMatch = matcher<Maybe<number>>();

const defaultNeg1 = maybeMatch({
  some: ({val}) => val,
  none: () => -1
});

defaultNeg1(Maybe.of())

const abc = Maybe.of(4)
abc
 