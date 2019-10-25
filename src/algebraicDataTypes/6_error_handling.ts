import Either from './Either';
import { makeFactory, matcher } from '../sumUtilities';

const delay = (ms: number) => new Promise(
  resolve => {
    setTimeout(resolve, ms);
  }
);

const randomInt = (from: number, to: number) => (
  from + Math.floor(Math.random() * (to - from))
);

const request = async (url: string) => {
  const timeForRequest = randomInt(100, 500);
  await delay(timeForRequest);

  const randomChoice = randomInt(0, 3);
  if (randomChoice === 0) {
    throw new Error('not found');
  }
  if (randomChoice === 1) {
    throw new Error('500 error');
  }
  return {name: "Slartibartfast"};
};

///////////////////////////////////////////////////////////////////////////////

type User = {
  name: string
};

type CommonErrorFields = {
  code: number;
  message: string;
};

type NotFound = {
  kind: 'notFound';
} & CommonErrorFields;

type Status500 = {
  kind: 'status500';
  systemId: string;
} & CommonErrorFields;

type DefaultError = {
  kind: 'defaultError';
} & CommonErrorFields;

const NotFound = (message: string): NotFound => ({
  kind: 'notFound',
  code: 404,
  message
});
const Status500  = (message: string, systemId: string): Status500 => ({
  kind: 'status500',
  code: 500,
  systemId,
  message
});
const DefaultError  = (message: string): DefaultError => ({
  kind: 'defaultError',
  code: 400,
  message
});

type GetUserErrors = NotFound | Status500 | DefaultError;
type GetUserResponse = Either<GetUserErrors, User>;

const getUser = async (id: number): Promise<GetUserResponse> => {
  const timeForRequest = randomInt(100, 500);
  await delay(timeForRequest);

  try {
    const user: User = await request('/the/user/url');

    return Either.ofRight(user);
  } catch (err) {
    const errorObj =
      err.message === 'notFound'  ? NotFound(err.message) :
      err.message === 'status500' ? Status500(err.message, 'this-system')
                                  : DefaultError(err.message);

    return Either.ofLeft(errorObj);
  }
};

const userErrorMatch = matcher<GetUserErrors>();

const doThatStuff = async () => {
  const getWithErrorLogs = Either.fold<GetUserErrors, string>(userErrorMatch({
    notFound: ({code, message}) =>
      `${code} error with message: ${message}`,
    status500: ({message, systemId}) =>
      `500 error from ${systemId} with message: ${message}`,
    defaultError: ({message}) =>
      `Unspecified error: ${message}`
  }));

  const getLog = getWithErrorLogs<User>(({name}: User) =>
    `Successfully retreived user ${name}`
  );

  const user = await getUser(673);

  const log = getLog(user);
  console.log(log);
};
