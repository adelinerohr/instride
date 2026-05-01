import {
  createStoreContext,
  useCreateStore,
  useSelector,
  type Store,
} from "@tanstack/react-store";
import * as React from "react";

export type ModalState<TPayload> = {
  open: boolean;
  payload: TPayload | null;
};

export type ModalApi<TPayload> = {
  isOpen: boolean;
  payload: TPayload | null;
  open: (payload: TPayload) => void;
  onOpenChange: (open: boolean) => void;
  close: () => void;
  /** Escape hatch: subscribe to a slice of state via the underlying store */
  store: Store<ModalState<TPayload>>;
};

export type ModalDefinition<TPayload> = {
  useModal: () => ModalApi<TPayload>;
  _Provider: React.FC<{ children: React.ReactNode }>;
  _Component: React.FC;
};

export type DefineModalOptions = {
  id: string;
  component: React.FC;
};

export function defineModal<TPayload>(
  options: DefineModalOptions
): ModalDefinition<TPayload> {
  const cache: Map<string, any> = ((globalThis as any).__modalContextCache ??=
    new Map());

  type StoreContextValue = {
    store: Store<ModalState<TPayload>>;
  };

  let entry: ReturnType<typeof createStoreContext<StoreContextValue>> =
    cache.get(options.id);
  if (!entry) {
    entry = createStoreContext<StoreContextValue>();
    cache.set(options.id, entry);
  }

  const { StoreProvider, useStoreContext } = entry;

  const Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const store = useCreateStore<ModalState<TPayload>>({
      open: false,
      payload: null,
    });
    return <StoreProvider value={{ store }}>{children}</StoreProvider>;
  };

  const useModal = (): ModalApi<TPayload> => {
    const { store } = useStoreContext();
    const isOpen = useSelector(store, (state) => state.open);
    const payload = useSelector(store, (state) => state.payload);

    const open = React.useCallback(
      (nextPayload: TPayload) => {
        store.setState(() => ({
          open: true,
          payload: nextPayload,
        }));
      },
      [store]
    );

    const close = React.useCallback(
      () => store.setState(() => ({ open: false, payload: null })),
      [store]
    );

    const onOpenChange = React.useCallback(
      (open: boolean) => !open && close(),
      [close]
    );

    return { isOpen, payload, open, close, onOpenChange, store };
  };

  return {
    useModal,
    _Provider: Provider,
    _Component: options.component,
  };
}

export type Modal = {
  _Provider: React.FC<{ children: React.ReactNode }>;
  _Component: React.FC;
};

export function ModalScope(props: {
  modals: ReadonlyArray<Modal>;
  children: React.ReactNode;
}) {
  const withProviders = props.modals.reduceRight<React.ReactElement>(
    (acc, modal) => <modal._Provider>{acc}</modal._Provider>,
    <>
      {props.modals.map((modal, i) => (
        <modal._Component key={i} />
      ))}
      {props.children}
    </>
  );
  return withProviders;
}
