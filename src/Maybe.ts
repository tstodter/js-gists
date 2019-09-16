type Maybe<T> = Some<T> | None;

type Some<T> = {
  kind: 'some';
  val: T;
};

type None = {
  kind: 'none';
};

const Some = <T>(val: T): Some<T> => ({
  kind: 'some',
  val
});

const None = (): None => ({
  kind: 'none'
});

const isMaybe = <T>(maybeMaybe: void | T | Maybe<T>): maybeMaybe is Maybe<T> => (
  !!maybeMaybe && 'kind' in maybeMaybe && (
    maybeMaybe.kind === 'some' || maybeMaybe.kind === 'none'
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

const Maybe = Object.assign(
  <T>(val: T | void | Maybe<T>) => ({
    map: <R>(mapping: (v: T) => R | void): Maybe<R> => {
      return maybeFold<T, Maybe<R>>(
        None,
        (v: T) => Maybe.of(mapping(v))
      )(Maybe.of(val));
    },
    fold: <R>(
      onNone: () => R,
      onSome: (_: T) => R
    ): R => maybeFold(
      onNone, onSome
    )(Maybe.of(val))
  }),
  {
    of: <T>(val: T | void | Maybe<T>) => {
      if (isMaybe(val)) return val;
      if (val === null || val === undefined) return None();
      return Some(val);
    },
    map: <T, R>(mapping: (v: T) => R | void) => (mb: Maybe<T>): Maybe<R> => {
      return maybeFold<T, Maybe<R>>(
        None,
        (v: T) => Maybe.of(mapping(v))
      )(mb);
    },
    fold: maybeFold
  }
);

export default Maybe;
