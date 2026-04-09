import { mergeProps, useRender } from "@base-ui/react";
import {
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DraggableSyntheticListeners,
  type DragStartEvent,
  type DropAnimation,
  type Modifiers,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  defaultAnimateLayoutChanges,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  type AnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/shared/lib/utils";

const SortableItemContext = React.createContext<{
  listeners: DraggableSyntheticListeners | undefined;
  isDragging?: boolean;
  disabled?: boolean;
}>({
  listeners: undefined,
  isDragging: false,
  disabled: false,
});

const IsOverlayContext = React.createContext<boolean>(false);

const SortableInternalContext = React.createContext<{
  activeId: UniqueIdentifier | null;
  modifiers?: Modifiers;
}>({
  activeId: null,
  modifiers: undefined,
});

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

export interface SortableRootProps<T> extends Omit<
  useRender.ComponentProps<"div">,
  "onDragStart" | "onDragEnd" | "children"
> {
  value: T[];
  getItemValue: (item: T) => string;
  onValueChange: (value: T[]) => void;
  children: React.ReactNode;
  onMove?: (event: {
    event: DragEndEvent;
    activeIndex: number;
    overIndex: number;
  }) => void;
  strategy?: "horizontal" | "vertical" | "grid";
  modifiers?: Modifiers;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
}

function Sortable<T>({
  value,
  onValueChange,
  getItemValue,
  className,
  render,
  onMove,
  strategy = "vertical",
  onDragStart,
  onDragEnd,
  modifiers,
  children,
  ...props
}: SortableRootProps<T>) {
  const [activeId, setActiveId] = React.useState<UniqueIdentifier | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useLayoutEffect(() => setMounted(true), []);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = React.useCallback(
    (event: DragStartEvent) => {
      setActiveId(event.active.id);
      onDragStart?.(event);
    },
    [onDragStart]
  );

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      onDragEnd?.(event);

      if (!over) return;

      // Handle item reordering
      const activeIndex = value.findIndex(
        (item: T) => getItemValue(item) === active.id
      );
      const overIndex = value.findIndex(
        (item: T) => getItemValue(item) === over.id
      );

      if (activeIndex !== overIndex) {
        if (onMove) {
          onMove({ event, activeIndex, overIndex });
        } else {
          const newValue = arrayMove(value, activeIndex, overIndex);
          onValueChange(newValue);
        }
      }
    },
    [onDragEnd, onMove, onValueChange, getItemValue, value]
  );

  const handleDragCancel = React.useCallback(() => {
    setActiveId(null);
  }, []);

  const getStrategy = () => {
    switch (strategy) {
      case "horizontal":
        return rectSortingStrategy;
      case "grid":
        return rectSortingStrategy;
      case "vertical":
      default:
        return verticalListSortingStrategy;
    }
  };

  const itemIds = React.useMemo(
    () => value.map(getItemValue),
    [value, getItemValue]
  );

  const contextValue = React.useMemo(
    () => ({ activeId, modifiers }),
    [activeId, modifiers]
  );

  const defaultProps = {
    "data-slot": "sortable",
    "data-dragging": activeId !== null,
    className: cn(activeId !== null && "cursor-grabbing!", className),
    children,
  };

  // Find the active child for the overlay
  const overlayContent = React.useMemo(() => {
    if (!activeId) return null;
    let result: React.ReactNode = null;

    React.Children.forEach(children, (child) => {
      if (
        React.isValidElement(child) &&
        (child.props as any).value === activeId
      ) {
        result = React.cloneElement(child as React.ReactElement<any>, {
          ...(child.props as any),
          className: cn((child.props as any).className, "z-50"),
        });
      }
    });
    return result;
  }, [activeId, children]);

  return (
    <SortableInternalContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        modifiers={modifiers}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always,
          },
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={itemIds} strategy={getStrategy()}>
          {useRender({
            defaultTagName: "div",
            render,
            props: mergeProps<"div">(defaultProps, props),
          })}
        </SortableContext>
        {mounted &&
          createPortal(
            <DragOverlay
              dropAnimation={dropAnimationConfig}
              modifiers={modifiers}
              className={cn("z-50", activeId && "cursor-grabbing")}
            >
              <IsOverlayContext.Provider value={true}>
                {overlayContent}
              </IsOverlayContext.Provider>
            </DragOverlay>,
            document.body
          )}
      </DndContext>
    </SortableInternalContext.Provider>
  );
}

function SortableItem({
  value,
  className,
  render,
  disabled,
  ...props
}: useRender.ComponentProps<"div"> & {
  value: string;
  disabled?: boolean;
}) {
  const isOverlay = React.useContext(IsOverlayContext);

  const {
    setNodeRef,
    transform,
    transition,
    attributes,
    listeners,
    isDragging: isSortableDragging,
  } = useSortable({
    id: value,
    disabled: disabled || isOverlay,
    animateLayoutChanges,
  });

  if (isOverlay) {
    const defaultProps = {
      "data-slot": "sortable-item",
      "data-value": value,
      "data-dragging": true,
      className: cn(className),
      children: props.children,
    };
    return (
      <SortableItemContext.Provider
        value={{ listeners: undefined, isDragging: true, disabled: false }}
      >
        {useRender({
          defaultTagName: "div",
          render,
          props: mergeProps<"div">(defaultProps, props),
        })}
      </SortableItemContext.Provider>
    );
  }

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  } as React.CSSProperties;

  const defaultProps = {
    "data-slot": "sortable-item",
    "data-value": value,
    "data-dragging": isSortableDragging,
    "data-disabled": disabled,
    ref: setNodeRef,
    style,
    ...attributes,
    className: cn(
      isSortableDragging && "opacity-50 z-50",
      disabled && "opacity-50",
      className
    ),
    children: props.children,
  };

  return (
    <SortableItemContext.Provider
      value={{ listeners, isDragging: isSortableDragging, disabled }}
    >
      {useRender({
        defaultTagName: "div",
        render,
        props: mergeProps<"div">(defaultProps, props),
      })}
    </SortableItemContext.Provider>
  );
}

function SortableItemHandle({
  className,
  render,
  cursor = true,
  ...props
}: useRender.ComponentProps<"div"> & {
  cursor?: boolean;
}) {
  const { listeners, isDragging, disabled } =
    React.useContext(SortableItemContext);

  const defaultProps = {
    "data-slot": "sortable-item-handle",
    "data-dragging": isDragging,
    "data-disabled": disabled,
    ...listeners,
    className: cn(
      cursor && (isDragging ? "cursor-grabbing!" : "cursor-grab!"),
      className
    ),
    children: props.children,
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

function SortableOverlay({
  children,
  className,
  ...props
}: Omit<React.ComponentProps<typeof DragOverlay>, "children"> & {
  children?:
    | React.ReactNode
    | ((params: { value: UniqueIdentifier }) => React.ReactNode);
}) {
  const { activeId, modifiers } = React.useContext(SortableInternalContext);
  const [mounted, setMounted] = React.useState(false);

  React.useLayoutEffect(() => setMounted(true), []);

  const content =
    activeId && children
      ? typeof children === "function"
        ? children({ value: activeId })
        : children
      : null;

  if (!mounted) return null;

  return createPortal(
    <DragOverlay
      dropAnimation={dropAnimationConfig}
      modifiers={modifiers}
      className={cn("z-50", activeId && "cursor-grabbing", className)}
      {...props}
    >
      <IsOverlayContext.Provider value={true}>
        {content}
      </IsOverlayContext.Provider>
    </DragOverlay>,
    document.body
  );
}

export { Sortable, SortableItem, SortableItemHandle, SortableOverlay };
