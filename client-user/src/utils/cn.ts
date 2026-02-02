import classNames from 'classnames';

export const cn = (...args: Parameters<typeof classNames>) =>
  classNames(...args);
