import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';

// ─── Web Audio ────────────────────────────────────────────────
let _ac: AudioContext | null = null;

function getAC(): AudioContext {
  if (!_ac || _ac.state === 'closed') {
    _ac = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (_ac.state === 'suspended') _ac.resume();
  return _ac;
}

function playClick() {
  try {
    const ac = getAC();
    const now = ac.currentTime;
    const sr = ac.sampleRate;

    // ① High "tick" — the tactile click of MX Blue
    const len1 = Math.floor(sr * 0.035);
    const buf1 = ac.createBuffer(1, len1, sr);
    const d1 = buf1.getChannelData(0);
    for (let i = 0; i < len1; i++) {
      d1[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len1, 6);
    }
    const src1 = ac.createBufferSource();
    src1.buffer = buf1;
    const bp = ac.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 4200;
    bp.Q.value = 0.7;
    const g1 = ac.createGain();
    g1.gain.setValueAtTime(0.22, now);
    src1.connect(bp); bp.connect(g1); g1.connect(ac.destination);
    src1.start(now);

    // ② Low "thock" — bottom-out impact, 40 ms later
    const len2 = Math.floor(sr * 0.045);
    const buf2 = ac.createBuffer(1, len2, sr);
    const d2 = buf2.getChannelData(0);
    for (let i = 0; i < len2; i++) {
      d2[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len2, 3);
    }
    const src2 = ac.createBufferSource();
    src2.buffer = buf2;
    const lp = ac.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 600;
    const g2 = ac.createGain();
    g2.gain.setValueAtTime(0.14, now + 0.04);
    src2.connect(lp); lp.connect(g2); g2.connect(ac.destination);
    src2.start(now + 0.04);
  } catch (_) {/* AudioContext blocked */ }
}

// ─── Layout ───────────────────────────────────────────────────
// All rows = 15u wide. Unit = 40px, gap = 4px.
// Key pixel width = units * 40 - 4

interface KeyDef {
  label: string;
  sub?: string;
  units: number;
  code?: string;
  variant?: 'default' | 'accent' | 'wide' | 'space';
}

const ROWS: KeyDef[][] = [
  // Row 0 — numbers  (13 × 1u + 1 × 2u = 15u)
  [
    { label: '`', sub: '~',  units: 1, code: 'Backquote' },
    { label: '1', sub: '!',  units: 1, code: 'Digit1' },
    { label: '2', sub: '@',  units: 1, code: 'Digit2' },
    { label: '3', sub: '#',  units: 1, code: 'Digit3' },
    { label: '4', sub: '$',  units: 1, code: 'Digit4' },
    { label: '5', sub: '%',  units: 1, code: 'Digit5' },
    { label: '6', sub: '^',  units: 1, code: 'Digit6' },
    { label: '7', sub: '&',  units: 1, code: 'Digit7' },
    { label: '8', sub: '*',  units: 1, code: 'Digit8' },
    { label: '9', sub: '(',  units: 1, code: 'Digit9' },
    { label: '0', sub: ')',  units: 1, code: 'Digit0' },
    { label: '-', sub: '_',  units: 1, code: 'Minus' },
    { label: '=', sub: '+',  units: 1, code: 'Equal' },
    { label: 'Bksp',         units: 2, code: 'Backspace', variant: 'wide' },
  ],
  // Row 1 — QWERTY  (1.5u + 12 × 1u + 1.5u = 15u)
  [
    { label: 'Tab',          units: 1.5, code: 'Tab',          variant: 'wide' },
    { label: 'Q',            units: 1,   code: 'KeyQ' },
    { label: 'W',            units: 1,   code: 'KeyW' },
    { label: 'E',            units: 1,   code: 'KeyE' },
    { label: 'R',            units: 1,   code: 'KeyR' },
    { label: 'T',            units: 1,   code: 'KeyT' },
    { label: 'Y',            units: 1,   code: 'KeyY' },
    { label: 'U',            units: 1,   code: 'KeyU' },
    { label: 'I',            units: 1,   code: 'KeyI' },
    { label: 'O',            units: 1,   code: 'KeyO' },
    { label: 'P',            units: 1,   code: 'KeyP' },
    { label: '[', sub: '{',  units: 1,   code: 'BracketLeft' },
    { label: ']', sub: '}',  units: 1,   code: 'BracketRight' },
    { label: '\\', sub: '|', units: 1.5, code: 'Backslash',   variant: 'wide' },
  ],
  // Row 2 — ASDF  (1.75u + 11 × 1u + 2.25u = 15u)
  [
    { label: 'Caps',         units: 1.75, code: 'CapsLock',   variant: 'wide' },
    { label: 'A',            units: 1,    code: 'KeyA' },
    { label: 'S',            units: 1,    code: 'KeyS' },
    { label: 'D',            units: 1,    code: 'KeyD' },
    { label: 'F',            units: 1,    code: 'KeyF' },
    { label: 'G',            units: 1,    code: 'KeyG' },
    { label: 'H',            units: 1,    code: 'KeyH' },
    { label: 'J',            units: 1,    code: 'KeyJ' },
    { label: 'K',            units: 1,    code: 'KeyK' },
    { label: 'L',            units: 1,    code: 'KeyL' },
    { label: ';', sub: ':',  units: 1,    code: 'Semicolon' },
    { label: "'", sub: '"',  units: 1,    code: 'Quote' },
    { label: 'Enter',        units: 2.25, code: 'Enter',      variant: 'accent' },
  ],
  // Row 3 — ZXCV  (2.25u + 10 × 1u + 2.75u = 15u)
  [
    { label: 'Shift',        units: 2.25, code: 'ShiftLeft',  variant: 'wide' },
    { label: 'Z',            units: 1,    code: 'KeyZ' },
    { label: 'X',            units: 1,    code: 'KeyX' },
    { label: 'C',            units: 1,    code: 'KeyC' },
    { label: 'V',            units: 1,    code: 'KeyV' },
    { label: 'B',            units: 1,    code: 'KeyB' },
    { label: 'N',            units: 1,    code: 'KeyN' },
    { label: 'M',            units: 1,    code: 'KeyM' },
    { label: ',', sub: '<',  units: 1,    code: 'Comma' },
    { label: '.', sub: '>',  units: 1,    code: 'Period' },
    { label: '/', sub: '?',  units: 1,    code: 'Slash' },
    { label: 'Shift',        units: 2.75, code: 'ShiftRight', variant: 'wide' },
  ],
  // Row 4 — bottom  (3 × 1.5u + 6u + 3 × 1.5u = 15u)
  [
    { label: 'Ctrl',  units: 1.5, code: 'ControlLeft',  variant: 'wide' },
    { label: '⊞',    units: 1.5, code: 'MetaLeft',      variant: 'wide' },
    { label: 'Alt',   units: 1.5, code: 'AltLeft',       variant: 'wide' },
    { label: '',      units: 6,   code: 'Space',         variant: 'space' },
    { label: 'Alt',   units: 1.5, code: 'AltRight',      variant: 'wide' },
    { label: 'Fn',    units: 1.5,                        variant: 'wide' },
    { label: 'Ctrl',  units: 1.5, code: 'ControlRight',  variant: 'wide' },
  ],
];

// ─── Component ────────────────────────────────────────────────
export function InteractiveKeyboard() {
  const [pressed, setPressed] = useState<Set<string>>(new Set());
  const caseRef = useRef<HTMLDivElement>(null);

  const pressKey = useCallback((code: string) => {
    playClick();
    setPressed(p => new Set([...p, code]));
  }, []);

  const releaseKey = useCallback((code: string) => {
    setPressed(p => { const n = new Set(p); n.delete(code); return n; });
  }, []);

  // Real keyboard input
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.repeat) return;
      pressKey(e.code);
    };
    const up = (e: KeyboardEvent) => releaseKey(e.code);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [pressKey, releaseKey]);

  // GSAP entrance — keys stagger in
  useEffect(() => {
    const keys = caseRef.current?.querySelectorAll<HTMLElement>('.kb-key');
    if (!keys?.length) return;
    gsap.fromTo(keys,
      { y: -16, opacity: 0, scale: 0.88 },
      { y: 0, opacity: 1, scale: 1, stagger: 0.012, duration: 0.45, ease: 'back.out(1.4)', delay: 0.1 }
    );
    // Idle float
    gsap.to(caseRef.current, {
      y: '-=14', repeat: -1, yoyo: true, duration: 2.8, ease: 'sine.inOut',
    });
  }, []);

  return (
    <div className="kb-scene">
      <div className="kb-case" ref={caseRef}>
        {ROWS.map((row, ri) => (
          <div key={ri} className="kb-row">
            {row.map((key, ki) => {
              const isPressed = key.code ? pressed.has(key.code) : false;
              const w = key.units * 40 - 4;
              return (
                <div
                  key={ki}
                  className={`kb-key kb-key--${key.variant ?? 'default'}${isPressed ? ' kb-key--pressed' : ''}`}
                  style={{ width: w }}
                  onMouseDown={() => key.code && pressKey(key.code)}
                  onMouseUp={() => key.code && releaseKey(key.code)}
                  onMouseLeave={() => key.code && releaseKey(key.code)}
                >
                  {key.sub && <span className="kb-key__sub">{key.sub}</span>}
                  <span className="kb-key__label">{key.label}</span>
                </div>
              );
            })}
          </div>
        ))}
        <div className="kb-underglow" aria-hidden="true" />
      </div>
    </div>
  );
}
