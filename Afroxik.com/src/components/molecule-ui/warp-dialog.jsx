import React from "react";
import { createPortal } from "react-dom";

const WarpDialogContext = React.createContext(null);

function useWarpDialogContext() {
  const context = React.useContext(WarpDialogContext);
  if (!context) throw new Error("WarpDialog components must be used inside WarpDialog");
  return context;
}

export function WarpDialog({ children }) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef(null);
  const value = React.useMemo(() => ({ open, setOpen, triggerRef }), [open]);

  return <WarpDialogContext.Provider value={value}>{children}</WarpDialogContext.Provider>;
}

export function WarpDialogTrigger({ asChild = false, children }) {
  const { setOpen, triggerRef } = useWarpDialogContext();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref: triggerRef,
      "aria-haspopup": "dialog",
      onClick: (event) => {
        children.props.onClick?.(event);
        setOpen(true);
      },
    });
  }

  return (
    <button ref={triggerRef} type="button" aria-haspopup="dialog" onClick={() => setOpen(true)}>
      {children}
    </button>
  );
}

export function WarpDialogContent({ children }) {
  const { open, setOpen, triggerRef } = useWarpDialogContext();
  const panelRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const triggerElement = triggerRef.current;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => panelRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      triggerElement?.focus?.();
    };
  }, [open, setOpen, triggerRef]);

  if (!open) return null;

  return createPortal(
    <div className="warp-dialog-root">
      <button
        type="button"
        className="warp-dialog-backdrop"
        aria-label="Zavřít kontakty"
        onClick={() => setOpen(false)}
      />
      <div
        ref={panelRef}
        className="warp-dialog-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-dialog-title"
        tabIndex={-1}
      >
        <div className="warp-dialog-chrome" aria-hidden="true" />
        <button
          type="button"
          className="warp-dialog-close"
          aria-label="Zavřít kontakty"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
        <div className="warp-dialog-body">
          <h2 id="contact-dialog-title" className="warp-dialog-title">Contact me</h2>
          <p className="warp-dialog-copy">Choose a channel and write to me directly.</p>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
