import imgAK820White       from '../products/AJAZZ AK820 (White Edition).png';
import imgAK820Black       from '../products/AJAZZ AK820 (Black Edition).png';
import imgAK820CS2         from '../products/AJAZZ AK820 (CS2 Edition).png';
import imgAK820CSBW        from '../products/AJAZZ AK820 (CS Black-White Edition).png';
import imgAK820Jett        from '../products/AJAZZ AK820 (Jett Edition).png';
import imgAK820Reyna       from '../products/AJAZZ AK820 (Reyna Edition).png';
import imgAK820Cyberpunk   from '../products/AJAZZ AK820 (Cyberpunk Edition).png';
import imgAK820Earth       from '../products/AJAZZ AK820 (Earth Edition).png';
import imgAK820WhiteWave   from '../products/AJAZZ AK820 (White wave Edition).png';
import imgAK820BlackWave   from '../products/AJAZZ AK820 (Black wave Edition).png';
import imgAK820Japan       from '../products/AJAZZ AK820 (Japan Edition).png';
import imgAK820Nippon      from '../products/AJAZZ AK820 (Nippon Edition).png';
import imgAK820Levi        from '../products/AJAZZ AK820 (Levi Edition).png';
import imgWOMIERWhite      from '../products/WOMIER S-K80 (KANAGAWA White edition).png';
import imgWOMIERBlack      from '../products/WOMIER S-K80 (KANAGAWA Black edition).png';
import imgDAGK             from '../products/DAGK K87 PRO (Matcha edition).png';
import imgYK75             from '../products/YK75 Низкопрофильный.png';
import imgXINMENG          from '../products/XINMENG M87 LITE.png';
import imgAULA             from '../products/AULA Wolf Spider WIN60.png';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  tag?: 'new' | 'hot' | 'sale' | 'custom';
}

export const CATEGORIES = ['Все', 'Компактные клавиатуры', 'Полноразмерные клавиатуры', 'Кастом', 'Кейкапы', 'Свитчи', 'Аксессуары'] as const;
export type Category = (typeof CATEGORIES)[number];

export const products: Product[] = [
  {
    id: 1,
    name: 'AJAZZ AK820 White Edition',
    description: 'Проводное USB-C, Синяя подсветка, Синие тактильные свитчи',
    price: 510000,
    originalPrice: 1500000,
    category: 'Компактные клавиатуры',
    image: imgAK820White,
    rating: 4.8,
    reviews: 142,
    inStock: true,
    tag: 'hot',
  },
  {
    id: 2,
    name: 'AJAZZ AK820 Black Edition',
    description: 'Проводное USB-C, Белая подсветка, Красные линейные свитчи',
    price: 510000,
    originalPrice: 1500000,
    category: 'Компактные клавиатуры',
    image: imgAK820Black,
    rating: 4.8,
    reviews: 138,
    inStock: true,
    tag: 'hot',
  },
  {
    id: 3,
    name: 'AJAZZ AK820 CS2 Edition',
    description: 'Проводное USB-C, Синяя подсветка, Синие тактильные свитчи',
    price: 845000,
    originalPrice: 1500000,
    category: 'Компактные клавиатуры',
    image: imgAK820CS2,
    rating: 4.7,
    reviews: 64,
    inStock: true,
    tag: 'new',
  },
  {
    id: 4,
    name: 'AJAZZ AK820 CS Black-White Edition',
    description: 'Проводное USB-C, Белая подсветка, Красные линейные свитчи',
    price: 810000,
    originalPrice: 1500000,
    category: 'Компактные клавиатуры',
    image: imgAK820CSBW,
    rating: 4.7,
    reviews: 51,
    inStock: true,
    tag: 'new',
  },
  {
    id: 5,
    name: 'AJAZZ AK820 Jett Edition',
    description: 'Проводное USB-C, Синяя подсветка, Синие тактильные свитчи',
    price: 720000,
    originalPrice: 1500000,
    category: 'Компактные клавиатуры',
    image: imgAK820Jett,
    rating: 4.7,
    reviews: 39,
    inStock: true,
    tag: 'new',
  },
  {
    id: 6,
    name: 'AJAZZ AK820 Reyna Edition',
    description: 'Проводное USB-C, Белая подсветка, Красные линейные свитчи',
    price: 720000,
    originalPrice: 1500000,
    category: 'Компактные клавиатуры',
    image: imgAK820Reyna,
    rating: 4.7,
    reviews: 33,
    inStock: true,
    tag: 'new',
  },
  {
    id: 7,
    name: 'AJAZZ AK820 Cyberpunk Edition',
    description: 'Проводное USB-C, Белая подсветка, Красные линейные свитчи',
    price: 810000,
    originalPrice: 1500000,
    category: 'Компактные клавиатуры',
    image: imgAK820Cyberpunk,
    rating: 4.8,
    reviews: 47,
    inStock: true,
    tag: 'new',
  },
  {
    id: 8,
    name: 'AJAZZ AK820 Earth Edition',
    description: 'Проводное USB-C, Белая подсветка, Красные линейные свитчи',
    price: 810000,
    originalPrice: 1500000,
    category: 'Компактные клавиатуры',
    image: imgAK820Earth,
    rating: 4.6,
    reviews: 28,
    inStock: true,
    tag: 'new',
  },
  {
    id: 9,
    name: 'AJAZZ AK820 White Wave Edition',
    description: 'Проводное USB-C, Синяя подсветка, Синие тактильные свитчи',
    price: 810000,
    originalPrice: 1500000,
    category: 'Компактные клавиатуры',
    image: imgAK820WhiteWave,
    rating: 4.7,
    reviews: 22,
    inStock: true,
    tag: 'new',
  },
  {
    id: 10,
    name: 'AJAZZ AK820 Black Wave Edition',
    description: 'Проводное USB-C, Белая подсветка, Красные линейные свитчи',
    price: 810000,
    originalPrice: 1500000,
    category: 'Компактные клавиатуры',
    image: imgAK820BlackWave,
    rating: 4.7,
    reviews: 19,
    inStock: true,
    tag: 'new',
  },
  {
    id: 11,
    name: 'AJAZZ AK820 Japan Edition',
    description: 'Проводное USB-C, Синяя подсветка, Синие тактильные свитчи',
    price: 810000,
    originalPrice: 1500000,
    category: 'Компактные клавиатуры',
    image: imgAK820Japan,
    rating: 4.8,
    reviews: 31,
    inStock: true,
    tag: 'new',
  },
  {
    id: 12,
    name: 'AJAZZ AK820 Nippon Edition',
    description: 'Проводное USB-C, Белая подсветка, Красные линейные свитчи',
    price: 810000,
    originalPrice: 1500000,
    category: 'Компактные клавиатуры',
    image: imgAK820Nippon,
    rating: 4.8,
    reviews: 26,
    inStock: true,
    tag: 'new',
  },
  {
    id: 13,
    name: 'AJAZZ AK820 Levi Edition',
    description: 'Проводное USB-C, Синяя подсветка, Синие тактильные свитчи',
    price: 810000,
    originalPrice: 1500000,
    category: 'Компактные клавиатуры',
    image: imgAK820Levi,
    rating: 4.8,
    reviews: 18,
    inStock: true,
    tag: 'new',
  },
  {
    id: 14,
    name: 'WOMIER S-K80 KANAGAWA White',
    description: 'TFT экран, Проводное USB-C, Белые линейные свитчи',
    price: 990000,
    originalPrice: 1190000,
    category: 'Компактные клавиатуры',
    image: imgWOMIERWhite,
    rating: 4.9,
    reviews: 57,
    inStock: true,
    tag: 'new',
  },
  {
    id: 15,
    name: 'WOMIER S-K80 KANAGAWA Black',
    description: 'TFT экран, Проводное USB-C, Серые линейные свитчи',
    price: 990000,
    originalPrice: 1190000,
    category: 'Компактные клавиатуры',
    image: imgWOMIERBlack,
    rating: 4.9,
    reviews: 49,
    inStock: true,
    tag: 'new',
  },
  {
    id: 16,
    name: 'DAGK K87 PRO Matcha Edition',
    description: '3 типа подключения, RGB подсветка, Красные линейные свитчи',
    price: 590000,
    originalPrice: 1200000,
    category: 'Компактные клавиатуры',
    image: imgDAGK,
    rating: 4.6,
    reviews: 83,
    inStock: true,
    tag: 'new',
  },
  {
    id: 17,
    name: 'YK75 Низкопрофильный',
    description: 'Проводное USB-C, Белая подсветка, Красные линейные свитчи',
    price: 720000,
    originalPrice: 1800000,
    category: 'Компактные клавиатуры',
    image: imgYK75,
    rating: 4.7,
    reviews: 44,
    inStock: true,
    tag: 'new',
  },
  {
    id: 18,
    name: 'XINMENG M87 LITE',
    description: 'Беспроводная, RGB, Brown tactile свитчи',
    price: 600000,
    originalPrice: 1300000,
    category: 'Компактные клавиатуры',
    image: imgXINMENG,
    rating: 4.5,
    reviews: 61,
    inStock: true,
    tag: 'new',
  },
  {
    id: 19,
    name: 'AULA Wolf Spider WIN60',
    description: 'Проводное USB-C, RGB, Магнитные свитчи',
    price: 550000,
    originalPrice: 1200000,
    category: 'Компактные клавиатуры',
    image: imgAULA,
    rating: 4.6,
    reviews: 35,
    inStock: true,
    tag: 'new',
  },
];
