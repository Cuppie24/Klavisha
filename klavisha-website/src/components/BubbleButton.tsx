import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { SlowMo } from 'gsap/EasePack';

gsap.registerPlugin(SlowMo);

interface BubbleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function BubbleButton({ children, onClick }: BubbleButtonProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const btTlRef      = useRef<gsap.core.Timeline | null>(null);
  const idleTlRef    = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const circlesTL = container.querySelectorAll<HTMLElement>('.bcircle-tl');
    const circlesBR = container.querySelectorAll<HTMLElement>('.bcircle-br');
    const effectBg  = container.querySelector<HTMLElement>('.beffect-bg');
    if (!effectBg) return;

    // ── Начальное состояние (как в оригинале) ─────────────────
    gsap.set(effectBg, { scaleY: 1, yPercent: -50 });
    gsap.set([circlesTL, circlesBR], { scale: 1, opacity: 1 });

    // ── Top-left timeline ──────────────────────────────────────
    const tl = gsap.timeline();
    tl.set(circlesTL, { scale: 1, x: 0, y: 0, opacity: 1, rotation: -45 });
    tl.to(circlesTL,    { duration: 1.2, x: -25, y: -25, scaleY: 2, ease: SlowMo.ease.config(0.1, 0.7, false) });
    tl.to(circlesTL[0], { duration: 0.1, scale: 0.2, x: '+=6',  y: '-=2' });
    tl.to(circlesTL[1], { duration: 0.1, scaleX: 1, scaleY: 0.8, x: '-=10', y: '-=7' }, '-=0.1');
    tl.to(circlesTL[2], { duration: 0.1, scale: 0.2, x: '-=15', y: '+=6'  }, '-=0.1');
    tl.to(circlesTL[0], { duration: 1, scale: 0, x: '-=5',  y: '-=15', opacity: 0 });
    tl.to(circlesTL[1], { duration: 1, scaleX: 0.4, scaleY: 0.4, x: '-=10', y: '-=10', opacity: 0 }, '-=1');
    tl.to(circlesTL[2], { duration: 1, scale: 0, x: '-=15', y: '+=5',  opacity: 0 }, '-=1');

    const tlBt1 = gsap.timeline();
    tlBt1.add(tl);

    // ── Bottom-right timeline ──────────────────────────────────
    const tl2 = gsap.timeline();
    tl2.set(circlesBR, { scale: 1, x: 0, y: 0, opacity: 1, rotation: 45 });
    tl2.to(circlesBR,    { duration: 1.1, x: 30, y: 30, ease: SlowMo.ease.config(0.1, 0.7, false) });
    tl2.to(circlesBR[0], { duration: 0.1, scale: 0.2, x: '-=6',  y: '+=3'  });
    tl2.to(circlesBR[1], { duration: 0.1, scale: 0.8, x: '+=7',  y: '+=3'  }, '-=0.1');
    tl2.to(circlesBR[2], { duration: 0.1, scale: 0.2, x: '+=15', y: '-=6'  }, '-=0.2');
    tl2.to(circlesBR[0], { duration: 1, scale: 0, x: '+=5',  y: '+=15', opacity: 0 });
    tl2.to(circlesBR[1], { duration: 1, scale: 0.4, x: '+=7',  y: '+=7',  opacity: 0 }, '-=1');
    tl2.to(circlesBR[2], { duration: 1, scale: 0, x: '+=15', y: '-=5',  opacity: 0 }, '-=1');

    const tlBt2 = gsap.timeline();
    tlBt2.add(tl2);

    // ── Мастер-тайминлайн (как в оригинале, включая effectBg) ─
    const btTl = gsap.timeline({ paused: true });
    btTl.add(tlBt1);
    btTl.to(effectBg, { duration: 0.8, scaleY: 1.1, yPercent: -50 }, 0.1);
    btTl.add(tlBt2, 0.2);
    btTl.to(effectBg, { duration: 1.8, scale: 1, yPercent: -50, ease: 'elastic.out(1.2, 0.4)' }, 1.2);
    btTl.timeScale(2.6);
    btTlRef.current = btTl;

    // ── Idle — покачивание раз в 8 секунд ─────────────────────
    const idleTl = gsap.timeline({ repeat: -1, repeatDelay: 8 });
    idleTl.to(container, { duration: 0.18, x: -2.5, ease: 'sine.inOut' });
    idleTl.to(container, { duration: 0.18, x:  2.5, ease: 'sine.inOut' });
    idleTl.to(container, { duration: 0.18, x: -1.5, ease: 'sine.inOut' });
    idleTl.to(container, { duration: 0.55, x:  0,   ease: 'power2.out' });
    idleTlRef.current = idleTl;

    // ── Только mouseover, как в оригинале ─────────────────────
    const onEnter = () => {
      idleTl.pause();
      gsap.to(container, { duration: 0.15, x: 0, overwrite: 'auto', ease: 'power2.out' });
      btTl.restart();
    };

    const onLeave = () => {
      // Анимация доигрывает сама до конца с тёмным цветом (CSS убирает hover)
      idleTl.resume();
    };

    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);

    return () => {
      btTl.kill();
      idleTl.kill();
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <span className="bubble-btn" ref={containerRef}>
      <button className="bubble-btn__trigger" onClick={onClick}>
        {children}
      </button>
      <span className="bubble-btn__goo" aria-hidden="true">
        <span className="bcircle-tl" />
        <span className="bcircle-tl" />
        <span className="bcircle-tl" />
        <span className="beffect-bg" />
        <span className="bcircle-br" />
        <span className="bcircle-br" />
        <span className="bcircle-br" />
      </span>
    </span>
  );
}
