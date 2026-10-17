import React from "react";
import { createPortal } from "react-dom";
import { IconClose } from "../ui/icons";
import { useT } from "../../lib/i18n";

const WarpDialogContext = React.createContext(null);

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])';

function useWarpDialogContext() {
  const context = React.useContext(WarpDialogContext);
  if (!context) throw new Error("WarpDialog components must be used inside WarpDialog");
  return context;
}

// Funguje řízeně (open + onOpenChange) i neřízeně (WarpDialogTrigger).
export function WarpDialog({ open: openProp, onOpenChange, children }) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;

  const setOpen = React.useCallback(
    (next) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const value = React.useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return <WarpDialogContext.Provider value={value}>{children}</WarpDialogContext.Provider>;
}

export function WarpDialogTrigger({ asChild = false, children }) {
  const { setOpen } = useWarpDialogContext();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      "aria-haspopup": "dialog",
      onClick: (event) => {
        children.props.onClick?.(event);
        setOpen(true);
      },
    });
  }

  return (
    <button type="button" aria-haspopup="dialog" onClick={() => setOpen(true)}>
      {children}
    </button>
  );
}

export function WarpDialogContent({ title, description, children }) {
  const t = useT();
  const { open, setOpen } = useWarpDialogContext();
  const panelRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return undefined;

    const returnFocusTo = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      // Fokus zůstává uvnitř dialogu.
      const focusable = [...panelRef.current.querySelectorAll(FOCUSABLE)];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    const raf = requestAnimationFrame(() => panelRef.current?.focus());

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      returnFocusTo?.focus?.();
    };
  }, [open, setOpen]);

  if (!open) return null;

  return createPortal(
    <div className="warp-dialog-root">
      <button
        type="button"
        className="warp-dialog-backdrop"
        aria-label={t.dialog.close}
        tabIndex={-1}
        onClick={() => setOpen(false)}
      />
      <div
        ref={panelRef}
        className="warp-dialog-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-dialog-title"
        aria-describedby="contact-dialog-copy"
        tabIndex={-1}
      >
        <div className="warp-dialog-chrome" aria-hidden="true" />
        <button type="button" className="warp-dialog-close" aria-label={t.dialog.close} onClick={() => setOpen(false)}>
          <IconClose />
        </button>
        <div className="warp-dialog-body">
          <span className="kicker kicker--accent">{t.sections.contact}</span>
          <h2 id="contact-dialog-title" className="warp-dialog-title">
            {title}
          </h2>
          <p id="contact-dialog-copy" className="warp-dialog-copy">
            {description}
          </p>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
