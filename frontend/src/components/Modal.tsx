import {
  ModalOverlay,
  type ModalOverlayProps,
  Modal as RACModal,
} from "react-aria-components";

const overlayStyles =
  "fixed top-0 left-0 w-full h-(--visual-viewport-height) isolate z-20 bg-black/[15%] flex items-center justify-center p-4 text-center backdrop-blur-lg";

const modalStyles =
  "w-full max-w-md max-h-full rounded bg-white dark:bg-zinc-800/70 dark:backdrop-blur-2xl dark:backdrop-saturate-200 forced-colors:bg-[Canvas] text-left align-middle text-slate-700 dark:text-zinc-300 shadow-2xl bg-clip-padding border border-black/10 dark:border-white/10";

export const Modal = (props: ModalOverlayProps) => {
  return (
    <ModalOverlay {...props} className={overlayStyles}>
      <RACModal {...props} className={modalStyles} />
    </ModalOverlay>
  );
};

const fullPageModalStyles =
  "w-full max-w-[90dvw] max-h-[90dvh] h-full rounded bg-white dark:bg-zinc-800/70 dark:backdrop-blur-2xl dark:backdrop-saturate-200 forced-colors:bg-[Canvas] text-left align-middle text-slate-700 dark:text-zinc-300 shadow-2xl bg-clip-padding border border-black/10 dark:border-white/10";

export const FullPageModal = (props: ModalOverlayProps) => {
  return (
    <ModalOverlay {...props} className={overlayStyles}>
      <RACModal {...props} className={fullPageModalStyles} />
    </ModalOverlay>
  );
};
