import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { PARENT_HOLD_MOVE_PX, PARENT_HOLD_MS } from '@/domain/parent/gate';

export interface ParentHoldHandlers {
  onPressIn: (pageX: number, pageY: number) => void;
  onTouchMove: (pageX: number, pageY: number) => void;
  onPressOut: () => void;
  /** True when the long-press already fired, so `onPress` must not also
   *  run the short-tap branch. */
  didFire: () => boolean;
}

/**
 * The 900 ms parent-gate hold contract, extracted verbatim from
 * `LandscapeTopBar` so more than one chrome control can host it without
 * duplicating (or drifting from) the gate's timing and move tolerance.
 *
 * The web branch listens on `window` for pointer/mouse movement because
 * react-native-web does not deliver `onTouchMove` for a mouse drag, and the
 * Playwright parent-gate specs drive the hold with a mouse.
 */
export function useParentHold(onLongPress?: () => void): ParentHoldHandlers {
  const hold = useRef({
    x: 0,
    y: 0,
    timer: null as ReturnType<typeof setTimeout> | null,
    fired: false,
    down: false,
    unlisten: null as (() => void) | null,
  });

  const cancelHold = () => {
    if (hold.current.timer) clearTimeout(hold.current.timer);
    hold.current.timer = null;
    hold.current.unlisten?.();
    hold.current.unlisten = null;
  };

  useEffect(() => () => cancelHold(), []);

  return {
    didFire: () => hold.current.fired,
    onPressIn: (x, y) => {
      hold.current.fired = false;
      hold.current.down = true;
      hold.current.x = x;
      hold.current.y = y;
      cancelHold();
      hold.current.down = true;
      if (
        Platform.OS === 'web' &&
        typeof window !== 'undefined' &&
        typeof window.addEventListener === 'function'
      ) {
        const onMove = (ev: MouseEvent | PointerEvent) => {
          const moved =
            Math.hypot(ev.pageX - hold.current.x, ev.pageY - hold.current.y) > PARENT_HOLD_MOVE_PX ||
            Math.abs(ev.movementX) > PARENT_HOLD_MOVE_PX ||
            Math.abs(ev.movementY) > PARENT_HOLD_MOVE_PX;
          if (moved) {
            hold.current.down = false;
            cancelHold();
          }
        };
        window.addEventListener('pointermove', onMove, true);
        window.addEventListener('mousemove', onMove, true);
        hold.current.unlisten = () => {
          window.removeEventListener('pointermove', onMove, true);
          window.removeEventListener('mousemove', onMove, true);
        };
      }
      hold.current.timer = setTimeout(() => {
        hold.current.fired = true;
        hold.current.timer = null;
        hold.current.down = false;
        hold.current.unlisten?.();
        hold.current.unlisten = null;
        onLongPress?.();
      }, PARENT_HOLD_MS);
    },
    onTouchMove: (x, y) => {
      if (!hold.current.down || hold.current.fired) return;
      if (Math.hypot(x - hold.current.x, y - hold.current.y) > PARENT_HOLD_MOVE_PX) {
        hold.current.down = false;
        cancelHold();
      }
    },
    onPressOut: () => {
      if (!hold.current.fired) {
        hold.current.down = false;
        cancelHold();
      }
    },
  };
}
