import { Student, GroupConfig, ActionReason, PrizeDB, PoolMetadata } from './types';
import { Gift, Wand2, Crown, Dice5 } from 'lucide-react';

export const INITIAL_STUDENTS: Student[] = [
  { id: 1, name: "陈梓豪", stars: 0, spent: 0, history: [], avatar: null },
  { id: 2, name: "潘昊宇", stars: 0, spent: 0, history: [], avatar: null },
  { id: 3, name: "戴宥宸", stars: 0, spent: 0, history: [], avatar: null },
  { id: 4, name: "何诺", stars: 0, spent: 0, history: [], avatar: null },
  { id: 5, name: "李梓冉", stars: 0, spent: 0, history: [], avatar: null },
  { id: 6, name: "胡景畅", stars: 0, spent: 0, history: [], avatar: null },
  { id: 7, name: "林当", stars: 0, spent: 0, history: [], avatar: null },
  { id: 8, name: "楼文恺", stars: 0, spent: 0, history: [], avatar: null },
  { id: 9, name: "楼翊辰", stars: 0, spent: 0, history: [], avatar: null },
  { id: 10, name: "邵梓聪", stars: 0, spent: 0, history: [], avatar: null },
  { id: 11, name: "王绍丞", stars: 0, spent: 0, history: [], avatar: null },
  { id: 12, name: "王诗晨", stars: 0, spent: 0, history: [], avatar: null },
  { id: 13, name: "王煜宸", stars: 0, spent: 0, history: [], avatar: null },
  { id: 14, name: "尹晨鑫", stars: 0, spent: 0, history: [], avatar: null },
  { id: 16, name: "张嘉懿", stars: 0, spent: 0, history: [], avatar: null },
  { id: 17, name: "张睿翔", stars: 0, spent: 0, history: [], avatar: null },
  { id: 18, name: "高诚锴", stars: 0, spent: 0, history: [], avatar: null },
  { id: 21, name: "蔡晨欣", stars: 0, spent: 0, history: [], avatar: null },
  { id: 22, name: "曹珺涵", stars: 0, spent: 0, history: [], avatar: null },
  { id: 23, name: "柴依晴", stars: 0, spent: 0, history: [], avatar: null },
  { id: 24, name: "陈与韩", stars: 0, spent: 0, history: [], avatar: null },
  { id: 25, name: "陈臻", stars: 0, spent: 0, history: [], avatar: null },
  { id: 26, name: "褚佳倪", stars: 0, spent: 0, history: [], avatar: null },
  { id: 27, name: "戴欣蕾", stars: 0, spent: 0, history: [], avatar: null },
  { id: 28, name: "方思", stars: 0, spent: 0, history: [], avatar: null },
  { id: 29, name: "方子颖", stars: 0, spent: 0, history: [], avatar: null },
  { id: 30, name: "蒋羽涵", stars: 0, spent: 0, history: [], avatar: null },
  { id: 31, name: "齐悦彤", stars: 0, spent: 0, history: [], avatar: null },
  { id: 32, name: "钱诗文", stars: 0, spent: 0, history: [], avatar: null },
  { id: 33, name: "沈梦莹", stars: 0, spent: 0, history: [], avatar: null },
  { id: 34, name: "沈昕妍", stars: 0, spent: 0, history: [], avatar: null },
  { id: 35, name: "汪艺宣", stars: 0, spent: 0, history: [], avatar: null },
  { id: 36, name: "王裳洁", stars: 0, spent: 0, history: [], avatar: null },
  { id: 37, name: "王晨熹", stars: 0, spent: 0, history: [], avatar: null },
  { id: 38, name: "项小凡", stars: 0, spent: 0, history: [], avatar: null },
  { id: 39, name: "杨菲", stars: 0, spent: 0, history: [], avatar: null },
  { id: 40, name: "杨彧", stars: 0, spent: 0, history: [], avatar: null },
  { id: 41, name: "叶洛菡", stars: 0, spent: 0, history: [], avatar: null },
  { id: 42, name: "张恩惠", stars: 0, spent: 0, history: [], avatar: null },
  { id: 43, name: "朱欣悦", stars: 0, spent: 0, history: [], avatar: null },
];

export const INITIAL_GROUP_CONFIG: GroupConfig[] = [
  { id: 1, members: ["朱欣悦", "楼翊辰", "陈梓豪", "杨彧"] },
  { id: 2, members: ["方子颖", "张睿翔", "高诚锴", "杨菲"] },
  { id: 3, members: ["钱诗文", "楼文恺", "胡景畅", "陈臻"] },
  { id: 4, members: ["褚佳倪", "汪艺宣", "林当", "曹珺涵"] },
  { id: 5, members: ["陈与韩", "李梓冉", "何诺", "沈梦莹"] },
  { id: 6, members: ["王裳洁", "王煜宸", "邵梓聪", "项小凡"] },
  { id: 7, members: ["沈昕妍", "戴宥宸", "潘昊宇", "叶洛菡"] },
  { id: 8, members: ["张恩惠", "尹晨鑫", "王诗晨", "王晨熹"] },
  { id: 9, members: ["王绍丞", "蔡晨欣", "张嘉懿", "蒋羽涵"] },
  { id: 10, members: ["戴欣蕾", "柴依晴", "方思", "齐悦彤"] }
];

export const ACTION_REASONS: ActionReason[] = [
    { label: "💯 计算全对", score: 1, type: 'success' },
    { label: "🧑‍🏫 课堂小老师", score: 1, type: 'success' },
    { label: "✅ 订正过关", score: 0.5, type: 'warning' },
    { label: "🙋 课堂表现", score: 0.5, type: 'warning' },
    { label: "🤫 纪律提醒", score: -0.5, type: 'orange' },
    { label: "💤 上课不认真", score: -1, type: 'danger' },
    { label: "📉 作业没交", score: -1, type: 'danger' },
];

export const INITIAL_PRIZE_DB: PrizeDB = {
  bronze: [
    { name: "神笔马良：一支特殊的红笔或荧光笔", type: 'bronze', prob: 0.3 },
    { name: "甜蜜补给：大白兔奶糖 / 小饼干", type: 'bronze', prob: 0.35 },
    { name: "美丽绷带：修正带一个", type: 'bronze', prob: 0.15 },
    { name: "好运加倍：再来一次", type: 'bronze', prob: 0.05 },
    { name: "知情权：可以问金老师一个非隐私的个人问题", type: 'bronze', prob: 0.15 }
  ],
  silver: [
    { name: "快乐能量包：变异大白兔 /咪咪 / 巧克力", type: 'silver', prob: 0.3 },
    { name: "零食奖励包：一个蛋挞/鸡翅/可乐", type: 'silver', prob: 0.3 },
    { name: "免死金牌：抵消一次非原则性惩罚", type: 'silver', prob: 0.15 },
    { name: "好友同享卡：当你获得某项奖时，可以指定一位好朋友分享权益（变异大白兔 /咪咪 / 巧克力/一个蛋挞/鸡翅/可乐）", type: 'silver', prob: 0.25 }
  ],
  gold: [
    { name: "假期乐园通行证：寒/暑假笔头作业免做", type: 'gold', prob: 0.15 },
    { name: "分数隐身衣：成绩保密，不单独告知家长", type: 'gold', prob: 0.2 },
    { name: "平时成绩满分卡：期末评价日常分满分", type: 'gold', prob: 0.2 },
    { name: "金总请客券：兑换自选汉堡/奶茶", type: 'gold', prob: 0.3 },
    { name: "获赠一本适合五年级的趣味数学课外书/益智玩具", type: 'gold', prob: 0.1 },
    { name: "全家桶一份", type: 'gold', prob: 0.05 }
  ],
  destiny: [
    { name: "神笔马良：一支特殊的红笔或荧光笔", type: 'bronze', prob: 0.08 },
    { name: "甜蜜补给：大白兔奶糖 / 小饼干", type: 'bronze', prob: 0.08 },
    { name: "美丽绷带：修正带一个", type: 'bronze', prob: 0.08 },
    { name: "好运加倍：再来一次", type: 'bronze', prob: 0.03 },
    { name: "知情权：可以问金老师一个非隐私的个人问题", type: 'bronze', prob: 0.05 },
    { name: "快乐能量包：变异大白兔 /咪咪 / 巧克力", type: 'silver', prob: 0.07 },
    { name: "零食奖励包：一个蛋挞/鸡翅/可乐", type: 'silver', prob: 0.05 },
    { name: "免死金牌：抵消一次非原则性惩罚", type: 'silver', prob: 0.05 },
    { name: "好友同享卡：当你获得某项奖时，可以指定一位好朋友分享权益", type: 'silver', prob: 0.05 },
    { name: "假期乐园通行证：寒/暑假笔头作业免做", type: 'gold', prob: 0.03 },
    { name: "分数隐身衣：成绩保密，不单独告知家长", type: 'gold', prob: 0.05 },
    { name: "平时成绩满分卡：期末评价日常分满分", type: 'gold', prob: 0.05 },
    { name: "金总请客券：兑换自选汉堡/奶茶", type: 'gold', prob: 0.03 },
    { name: "获赠一本适合五年级的趣味数学课外书/益智玩具", type: 'gold', prob: 0.03 },
    { name: "全家桶一份", type: 'gold', prob: 0.02 },
    { name: "凡尔赛大师：用最欠揍的语气说“数学太简单了”并保持高冷3秒", type: 'funny', prob: 0.05 },
    { name: "人形闹钟：下节课前负责站讲台提醒全班安静", type: 'funny', prob: 0.05 },
    { name: "天选打工人：帮老师整理一天的讲台桌面", type: 'funny', prob: 0.05 },
    { name: "自带BGM：回答问题前给自己配出场音乐", type: 'funny', prob: 0.05 },
    { name: "数学推销员：30秒向全班推销数学作业本", type: 'funny', prob: 0.05 }
  ]
};

export const POOL_METADATA: PoolMetadata = {
  bronze: {
    key: 'bronze',
    title: '🎁 惊喜盲盒',
    slogan: '快乐与小确幸',
    cost: 5,
    gradient: 'from-pink-400 to-rose-500',
    shadow: 'shadow-pink-200',
    iconColor: 'text-white',
    color: 'text-rose-500',
    icon: Gift,
  },
  silver: {
    key: 'silver',
    title: '🔮 魔法宝箱',
    slogan: '实用与特权',
    cost: 10,
    gradient: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-200',
    iconColor: 'text-white',
    color: 'text-purple-600',
    icon: Wand2,
  },
  gold: {
    key: 'gold',
    title: '👑 传说宝藏',
    slogan: '震撼与荣耀',
    cost: 15,
    gradient: 'from-amber-400 to-yellow-500',
    shadow: 'shadow-amber-200',
    iconColor: 'text-white',
    color: 'text-amber-500',
    icon: Crown,
  },
  destiny: {
    key: 'destiny',
    title: '🌌 命运宝箱',
    slogan: '心跳与未知',
    cost: 7,
    gradient: 'from-indigo-500 to-cyan-500', 
    shadow: 'shadow-indigo-200',
    iconColor: 'text-white',
    color: 'text-indigo-500',
    icon: Dice5, 
  }
};

export const ANIMATION_STYLES = `
  @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0px); } }
  @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
  @keyframes shake { 0% { transform: translate(1px, 1px) rotate(0deg); } 50% { transform: translate(-1px, 2px) rotate(-1deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
  @keyframes wiggle { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
  @keyframes pop { 0% { transform: scale(0.8); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
  @keyframes scroll-up { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
  @keyframes bg-pan { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  @keyframes ray-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-blob { animation: blob 10s infinite; }
  .animate-delay-2000 { animation-delay: 2s; }
  .animate-delay-4000 { animation-delay: 4s; }
  .animate-shake { animation: shake 0.5s infinite; }
  .animate-wiggle { animation: wiggle 1s ease-in-out infinite; }
  .animate-pop { animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
  .animate-spin-slow { animation: spin 4s linear infinite; }
  .animate-scroll-up { animation: scroll-up 20s linear infinite; }
  .animate-scroll-up:hover { animation-play-state: paused; }
  .animate-bg-pan { background-size: 200% 200%; animation: bg-pan 15s ease infinite; }
  .animate-ray-rotate { animation: ray-rotate 10s linear infinite; }
`;