import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { AppFooter } from '../components/AppFooter';
import { InteractiveKeyboard } from '../components/InteractiveKeyboard';
import { Check, Truck, ShieldCheck, Zap, Layers, Headphones } from 'lucide-react';

export function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [toast, setToast] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="layout">
      <AppHeader
        scrolled={scrolled}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={(q) => { if (q.trim()) navigate(`/catalog?q=${encodeURIComponent(q.trim())}`) }}
      />

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="sc-wrap">
        <section className="lp-hero">
          <div className="lp-hero-text">
            <div className="lp-kicker">Механические клавиатуры · Ташкент</div>
            <h1 className="lp-h1">
              Звук.<br />
              Тактильность.<br />
              <b>Уникальность.</b>
            </h1>
            <p className="lp-sub">
              Клавиатуры, кейкапы, свитчи и аксессуары от ведущих мировых производителей. Кастомные сборки под ваш стиль и задачи.
            </p>
            <div className="lp-cta-row">
              <button className="lp-btn lp-btn--primary" onClick={() => navigate('/catalog')}>
                Смотреть каталог
              </button>
              <button className="lp-btn lp-btn--ghost" onClick={showToast}>
                Заказать сборку →
              </button>
            </div>
            <div className="lp-stats">
              <div className="lp-stat">
                <div className="v"><b>500+</b></div>
                <div className="k">моделей в наличии</div>
              </div>
              <div className="lp-stat">
                <div className="v"><b>50+</b></div>
                <div className="k">брендов в каталоге</div>
              </div>
              <div className="lp-stat">
                <div className="v">1–2</div>
                <div className="k">дня доставка</div>
              </div>
            </div>
          </div>

          <div className="lp-hero-visual">
            <InteractiveKeyboard />
          </div>
        </section>
      </div>

      {/* ── Promise strip ────────────────────────────────── */}
      <div className="sc-wrap">
        <section className="lp-sec">
          <div className="lp-sechead">
            <div>
              <div className="lp-seclabel">Почему Klavisha</div>
              <h2 className="lp-sectitle">Больше, чем магазин</h2>
            </div>
          </div>
          <div className="lp-promise">
            <div className="lp-promise-item">
              <div className="lp-promise-ic"><Zap size={17} strokeWidth={2} /></div>
              <h4>Лучшие переключатели</h4>
              <p>Linear, tactile, clicky — полная линейка от Gateron, Akko, Durock и других топовых производителей.</p>
            </div>
            <div className="lp-promise-item">
              <div className="lp-promise-ic"><Layers size={17} strokeWidth={2} /></div>
              <h4>Кастомные сборки</h4>
              <p>Собираем клавиатуру под ваш стиль: корпус, PCB, кейкапы, демпфирование — всё по вашему вкусу.</p>
            </div>
            <div className="lp-promise-item">
              <div className="lp-promise-ic"><Headphones size={17} strokeWidth={2} /></div>
              <h4>Экспертная консультация</h4>
              <p>Поможем выбрать под задачи: геймерская, офисная, для программирования — без лишних трат.</p>
            </div>
          </div>
        </section>
      </div>

      {/* ── Build spotlight ──────────────────────────────── */}
      <div className="sc-wrap">
        <section className="lp-sec" id="build">
          <div className="lp-spot">
            <div className="lp-spot-img">
              <div className="lp-spot-spec">
                <div className="lp-spot-spec-head">build_config.toml</div>
                <div className="lp-spot-spec-row"><span>Корпус</span><b>Aluminum 75%</b></div>
                <div className="lp-spot-spec-row"><span>Плата</span><b>Hot-swap PCB</b></div>
                <div className="lp-spot-spec-row"><span>Свитчи</span><b>Gateron · смазка</b></div>
                <div className="lp-spot-spec-row"><span>Стабилизаторы</span><b>Durock · тюнинг</b></div>
                <div className="lp-spot-spec-row"><span>Кейкапы</span><b>PBT · ваш выбор</b></div>
                <div className="lp-spot-spec-row lp-spot-spec-row--accent"><span>Тест звука</span><b>✓ пройден</b></div>
              </div>
              <span className="lp-spot-cap">/ кастом-сборка — сборка и настройка</span>
            </div>
            <div className="lp-spot-body">
              <div className="lp-seclabel">Сервис сборки</div>
              <h3>Вы выбираете детали.<br />Мы собираем мечту.</h3>
              <p>Не хотите собирать самостоятельно? Выберите корпус, свитчи и кейкапы из каталога — наша команда соберёт, смажет, настроит и протестирует клавиатуру перед отправкой.</p>
              <div className="lp-spot-steps">
                <span><span className="lp-dot" />Выбираете корпус, свитчи и кейкапы</span>
                <span><span className="lp-dot" />Мы собираем, смазываем и стабилизируем</span>
                <span><span className="lp-dot" />Тест звука и отправка за 5–7 дней</span>
              </div>
              <button className="lp-btn lp-btn--primary" style={{ alignSelf: 'flex-start' }} onClick={showToast}>
                Начать сборку →
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ── Guarantee strip ──────────────────────────────── */}
      <div className="sc-wrap">
        <div className="lp-guarantee">
          <div className="lp-guarantee-item">
            <div className="lp-promise-ic"><Check size={17} strokeWidth={2.2} /></div>
            <h4>Проверено на стенде</h4>
            <p>Каждая позиция проверяется вручную перед отправкой из нашего шоурума.</p>
          </div>
          <div className="lp-guarantee-item">
            <div className="lp-promise-ic"><Truck size={17} strokeWidth={1.8} /></div>
            <h4>Быстрая доставка</h4>
            <p>1–2 дня по Ташкенту, доставка по всему Узбекистану.</p>
          </div>
          <div className="lp-guarantee-item">
            <div className="lp-promise-ic"><ShieldCheck size={17} strokeWidth={1.8} /></div>
            <h4>Гарантия 1 год</h4>
            <p>Реальная поддержка от людей, которые сами строят клавиатуры.</p>
          </div>
        </div>
      </div>

      <AppFooter />

      <div className={`toast${toast ? ' toast--visible' : ''}`} role="status" aria-live="polite">
        Функционал в разработке — скоро!
      </div>
    </div>
  );
}
