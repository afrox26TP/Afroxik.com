import React from "react";
import { createPortal } from "react-dom";

const WarpDialogContext = React.createContext(null);

function useWarpDialogContext() {
  const ctx = React.useContext(WarpDialogContext);
  if (!ctx) {
    throw new Error("WarpDialog components must be used inside <WarpDialog>.");
  }
  return ctx;
}

export function WarpDialog({ children, open: openProp, onOpenChange }) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = openProp ?? internalOpen;

  const setOpen = React.useCallback(
    (nextOpen) => {
      if (onOpenChange) {
        onOpenChange(nextOpen);
      } else {
        setInternalOpen(nextOpen);
      }
    },
    [onOpenChange]
  );

  React.useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);

  const value = React.useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return <WarpDialogContext.Provider value={value}>{children}</WarpDialogContext.Provider>;
}

export function WarpDialogTrigger({ asChild = false, children }) {
  const { setOpen } = useWarpDialogContext();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      "data-slot": "dialog-trigger",
      onClick: (event) => {
        children.props.onClick?.(event);
        setOpen(true);
      },
    });
  }

  return (
    <button type="button" data-slot="dialog-trigger" onClick={() => setOpen(true)}>
      {children}
    </button>
  );
}

export function WarpDialogContent({ children }) {
  const { open, setOpen } = useWarpDialogContext();

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="warp-dialog-root" role="presentation">
      <button
        type="button"
        className="warp-dialog-backdrop"
        aria-label="Close dialog"
        onClick={() => setOpen(false)}
      />
      <div className="warp-dialog-panel" role="dialog" aria-modal="true">
        <div className="warp-dialog-chrome" aria-hidden="true" />
        <button
          type="button"
          className="warp-dialog-close"
          aria-label="Close dialog"
          onClick={() => setOpen(false)}
        >
          x
        </button>
        <div className="warp-dialog-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}
