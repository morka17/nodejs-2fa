export type Option<T> = Some<T> | None;

export class Some<T> {
  readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  isSome(): this is Some<T> {
    return true;
  }

  isNone(): this is None {
    return false;
  }

  unwrap(): T {
    return this.value;
  }
}

export class None {
  isSome(): this is Some<any> {
    return false;
  }

  isNone(): this is None {
    return true;
  }

  unwrap(): never {
    throw new Error('Tried to unwrap a None value');
  }
}

export const some = <T>(value: T): Option<T> => new Some(value);
export const none = (): Option<never> => new None();
