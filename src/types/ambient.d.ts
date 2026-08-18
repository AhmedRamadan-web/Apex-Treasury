/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference types="next/navigation" />

declare module "react" {
  export interface ReactNodeArray extends Array<ReactNode> {}
  export type ReactNode =
    | ReactElement
    | string
    | number
    | Iterable<ReactNode>
    | ReactPortal
    | boolean
    | null
    | undefined;

  export type ReactElement<P = any, T extends string | JSXElementConstructor<any> = any> = {
    type: T;
    props: P;
    key: string | null;
  };

  export type JSXElementConstructor<P> = ((props: P) => ReactElement<any, any> | null) | (new (props: P) => Component<any, any>);
  export interface ReactPortal extends ReactElement {
    key: string | null;
    children: ReactNode;
  }

  export type Component<P = {}, S = {}> = any;

  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<any>): void;
  export function useRef<T>(initialValue: T): { current: T };
  export function useMemo<T>(factory: () => T, deps: ReadonlyArray<any> | undefined): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>): T;
  export function useContext<T>(context: any): T;
  export function createContext<T>(defaultValue: T): any;

  export interface FormEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    target: T;
  }

  export interface ChangeEvent<T = Element> {
    target: T & { value: string; checked?: boolean };
  }

  export interface MouseEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
  }

  export interface HTMLAttributes<T> {
    className?: string;
    style?: any;
    children?: ReactNode;
    onClick?: (e: MouseEvent<T>) => void;
    id?: string;
    dir?: string;
    lang?: string;
    title?: string;
    ariaLabel?: string;
  }

  export namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

declare module "react-dom" {
  export function render(element: any, container: any): void;
}

declare module "react-dom/client" {
  export function createRoot(container: any): {
    render(children: any): void;
    unmount(): void;
  };
}

declare module "next/link" {
  import { ReactNode } from "react";
  export interface LinkProps {
    href: string;
    children?: ReactNode;
    className?: string;
    onClick?: () => void;
    title?: string;
    ariaCurrent?: any;
  }
  export default function Link(props: LinkProps): any;
}

declare module "next/navigation" {
  export function usePathname(): string;
  export function useRouter(): {
    push(href: string): void;
    replace(href: string): void;
    back(): void;
    forward(): void;
  };
  export function useSearchParams(): {
    get(name: string): string | null;
  };
}
