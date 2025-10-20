

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type FilterByTrue<
  T,
  Keys extends Partial<Record<keyof T, boolean>>,
> = Prettify<{
  [K in keyof Keys as Keys[K] extends true ? K : never]: K extends keyof T
    ? T[K]
    : never;
}>;