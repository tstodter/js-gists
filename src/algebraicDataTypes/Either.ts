import {match} from '../sumUtilities';

type Left<T> = {
  kind: 'left';
  left: T;
};
const Left = <T>(left: T): Left<T> => ({
  kind: 'left',
  left
});

type Right<T> = {
  kind: 'right';
  right: T;
};
const Right = <T>(right: T): Right<T> => ({
  kind: 'right',
  right
});

type Either<L, R> = Left<L> | Right<R>;

const Either = {
  ofLeft: Left,
  ofRight: Right,
  fold: <L, T>(onLeft: (_: L) => T) =>
          <R>(onRight: (_: R) => T) =>
            match<Either<L, R>, T>({
              left: ({left}) => onLeft(left),
              right: ({right}) => onRight(right)
            }),
  map: <R, T>(f: (right: R) => T) =>
        <L>(eitherObj: Either<L, R>) =>
          match<Either<L, R>, Either<L, T>>({
            left : ({left})  => Left(left),
            right: ({right}) => Right(f(right))
          })(eitherObj)
};

export default Either;

const eitherMap = <L, R, T>(f: (right: R) => T) => match<Either<L, R>, Either<L, T>>({
  left : ({left})  => Either.ofLeft(left),
  right: ({right}) => Either.ofRight(f(right))
});

const mightBeAnError: Either<string, number> = Either.ofRight(3);
const toInt = Either.fold(
  (numString: string) => Number.parseInt(numString)
)(
  (num: number) => Math.floor(num)
);

const y = toInt(Either.ofRight(123.3));
