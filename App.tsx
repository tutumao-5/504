import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Star, Trophy, Search, User, Users, Lock, Unlock, Save, Award, TrendingUp, Medal, Gift, X, Loader, Sparkles, Zap, Package, Edit2, ChevronRight, Hash, StarHalf, CheckCircle2, AlertCircle, RotateCcw, Plus, Undo2, Trash2, KeyRound, Fingerprint, Crown, Rocket, Wand2, Download, Upload, History, Megaphone, HelpCircle, MessageCircle, Dice5, Smile, UserPlus, UserMinus, Coins, ChevronLeft, Ticket, Settings, ArrowRightLeft, BookOpen, Calculator, PenTool, Flame, Skull, Ghost, PartyPopper, Menu, ChevronDown, ScrollText, Minus, Eraser, Camera, Table, AlertTriangle } from 'lucide-react';

import { 
  INITIAL_STUDENTS, 
  INITIAL_GROUP_CONFIG, 
  INITIAL_PRIZE_DB, 
  ACTION_REASONS, 
  POOL_METADATA, 
  ANIMATION_STYLES 
} from './constants';
import { 
  Student, 
  GroupConfig, 
  PrizeDB, 
  LogEntry, 
  LotteryRecord, 
  PendingPrize, 
  GachaponState,
  StarLogs,
  GroupData,
  Prize
} from './types';
import { generateAIContent } from './services/aiService';

// --- 学期常规版 专属静态配置 (Semester Mode Configs) ---
const SEMESTER_ACTION_REASONS = [
  { label: '作业全对', score: 1, type: 'success' },
  { label: '卷面极佳', score: 1, type: 'success' },
  { label: '订正及时', score: 1, type: 'success' },
  { label: '攻克每周一题', score: 3, type: 'warning' },
  { label: '提出优质问题', score: 3, type: 'warning' },
  { label: '一题多解', score: 3, type: 'warning' },
  { label: '测验满分大进步', score: 5, type: 'orange' },
  { label: '担任小老师', score: 5, type: 'orange' },
  { label: '违规乱加分', score: -3, type: 'danger' }
];

const SEMESTER_POOL_METADATA: Record<string, any> = {
  bronze: { title: "星尘补给袋", cost: 20, icon: Package, gradient: "from-slate-400 to-slate-600", iconColor: "text-white", shadow: "shadow-slate-200", slogan: "基础奖励包，人人可及" },
  silver: { title: "银河寻宝图", cost: 40, icon: Sparkles, gradient: "from-indigo-400 to-purple-500", iconColor: "text-white", shadow: "shadow-indigo-200", slogan: "进阶奖励，需要持续努力" },
  gold: { title: "宇宙主宰匣", cost: 60, icon: Crown, gradient: "from-amber-400 to-orange-500", iconColor: "text-white", shadow: "shadow-amber-200", slogan: "终极特权，强者的证明" }
};

const SEMESTER_INITIAL_PRIZE_DB: Record<string, Prize[]> = {
  bronze: [
    { name: "基础文具", type: "bronze", prob: 0.4 },
    { name: "免做一页口算卷", type: "bronze", prob: 0.3 },
    { name: "点播一首午休歌曲", type: "bronze", prob: 0.3 }
  ],
  silver: [
    { name: "某项常规作业减半", type: "silver", prob: 0.4 },
    { name: "免做一次改错题", type: "silver", prob: 0.3 },
    { name: "零食盲袋", type: "silver", prob: 0.3 }
  ],
  gold: [
    { name: "挑选同桌体验权", type: "gold", prob: 0.4 },
    { name: "数学课代表体验卡", type: "gold", prob: 0.3 },
    { name: "免做一次周末作业", type: "gold", prob: 0.3 }
  ]
};

// --- Helper Functions ---
const getGroupStatus = (avgStars: number) => {
  if (avgStars >= 15) return { name: "🏆 超级战队", color: "text-amber-700", bg: "bg-gradient-to-r from-amber-100 to-yellow-100" };
  if (avgStars >= 10) return { name: "🔥 潜力股", color: "text-rose-600", bg: "bg-gradient-to-r from-rose-100 to-pink-100" };
  return { name: "🌱 努力中", color: "text-emerald-600", bg: "bg-gradient-to-r from-emerald-100 to-green-100" };
};

const getTier = (stars: number) => {
  if (stars >= 15) return { name: "黄金王者", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: Trophy };
  if (stars >= 10) return { name: "白银骑士", color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-300", icon: Medal };
  if (stars >= 5) return { name: "青铜勇士", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: Award };
  return { name: "积蓄力量", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100", icon: User };
};

const drawPrize = (items: Prize[]) => {
  if (!items || items.length === 0) return { name: "暂无奖品配置", type: 'funny', prob: 0 };
  
  const rand = Math.random();
  let cumulative = 0;
  const totalProb = items.reduce((acc, item) => acc + item.prob, 0);
  
  for (const item of items) {
    cumulative += (item.prob / totalProb); 
    if (rand < cumulative) return item; 
  }
  return items[items.length - 1];
};

const StarDisplay = ({ count }: { count: number }) => {
  const isMilestone = count > 0 && count % 5 === 0;

  if (isMilestone) {
    return (
      <div className="flex items-center bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-1 rounded-full shadow-lg shadow-amber-200 animate-pop transform hover:scale-105 transition-transform cursor-default">
        <span className="text-xl font-black mr-1 drop-shadow-md">{count}</span>
        <Star size={18} className="fill-white text-white" />
      </div>
    );
  }

  const fullStars = Math.floor(count);
  const hasHalfStar = count % 1 !== 0;

  return (
    <div className="flex flex-wrap justify-end gap-0.5 max-w-[140px]">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={i} size={16} className="text-yellow-400 fill-yellow-400 drop-shadow-sm transform hover:scale-125 transition-transform duration-200 ease-out" />
      ))}
      {hasHalfStar && (
        <div className="relative">
             <StarHalf size={16} className="text-yellow-400 fill-yellow-400 drop-shadow-sm" />
        </div>
      )}
      {count === 0 && <span className="text-slate-300 text-xs font-bold bg-slate-100 px-2 py-0.5 rounded-full">暂无星星</span>}
    </div>
  );
};

const TierIconWrapper = ({ icon: Icon, size, className }: { icon: any, size: number, className?: string }) => <Icon size={size} className={className} />;

// --- App Wrapper (Handles Mode Switching & Data Isolation) ---
export default function AppWrapper() {
  const [appMode, setAppMode] = useState<'final' | 'semester'>('final');
  
  return (
    <AppCore key={appMode} appMode={appMode} setAppMode={setAppMode} />
  );
}

// --- Main App Component ---
function AppCore({ appMode, setAppMode }: { appMode: 'final' | 'semester', setAppMode: (mode: 'final' | 'semester') => void }) {
  // 数据隔离辅助函数：学期模式下自动为 localStorage 键值添加 _semester 后缀
  const getStorageKey = (key: string) => appMode === 'final' ? key : `${key}_semester`;

  // 动态选择当前模式的配置
  const currentActionReasons = appMode === 'semester' ? SEMESTER_ACTION_REASONS : ACTION_REASONS;
  const currentPoolMeta = appMode === 'semester' ? SEMESTER_POOL_METADATA : POOL_METADATA;

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(getStorageKey('504_stars_data'));
    const parsed = saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    return parsed.map((s: any) => ({ ...s, spent: s.spent || 0 }));
  });
  
  const [teamNames, setTeamNames] = useState<{[key: number]: string}>(() => {
    const saved = localStorage.getItem(getStorageKey('504_team_names'));
    return saved ? JSON.parse(saved) : {};
  });

  const [leaders, setLeaders] = useState<{[key: number]: number}>(() => {
    const saved = localStorage.getItem(getStorageKey('504_team_leaders'));
    return saved ? JSON.parse(saved) : {};
  });

  const [starLogs, setStarLogs] = useState<StarLogs>(() => {
    const saved = localStorage.getItem(getStorageKey('504_star_logs'));
    return saved ? JSON.parse(saved) : {};
  });

  const [lotteryHistory, setLotteryHistory] = useState<LotteryRecord[]>(() => {
    const saved = localStorage.getItem(getStorageKey('504_lottery_history'));
    return saved ? JSON.parse(saved) : [];
  });

  const [pendingPrizes, setPendingPrizes] = useState<PendingPrize[]>(() => {
    const saved = localStorage.getItem(getStorageKey('504_pending_prizes'));
    return saved ? JSON.parse(saved) : [];
  });

  const [redeemedHistory, setRedeemedHistory] = useState<PendingPrize[]>(() => {
    const saved = localStorage.getItem(getStorageKey('504_redeemed_history'));
    return saved ? JSON.parse(saved) : [];
  });

  const [teamBonuses, setTeamBonuses] = useState<{[key: string]: boolean}>(() => {
    const saved = localStorage.getItem(getStorageKey('504_team_bonuses'));
    return saved ? JSON.parse(saved) : {};
  });

  const [dailyChampions, setDailyChampions] = useState<{[key: number]: string}>(() => {
    const saved = localStorage.getItem(getStorageKey('504_daily_champions'));
    return saved ? JSON.parse(saved) : {};
  });

  const [maxDay, setMaxDay] = useState<number>(() => {
    const saved = localStorage.getItem(getStorageKey('504_max_day'));
    return saved ? parseInt(saved) : 1;
  });

  const [groupConfig, setGroupConfig] = useState<GroupConfig[]>(() => {
    const saved = localStorage.getItem(getStorageKey('504_group_config'));
    return saved ? JSON.parse(saved) : INITIAL_GROUP_CONFIG;
  });

  const [prizes, setPrizes] = useState<PrizeDB>(() => {
      const saved = localStorage.getItem(getStorageKey('504_prize_db'));
      if (saved) return JSON.parse(saved);
      return appMode === 'semester' ? SEMESTER_INITIAL_PRIZE_DB : INITIAL_PRIZE_DB;
  });
  
  const [viewMode, setViewMode] = useState<'dashboard' | 'all_students' | 'redemption' | 'team_manage' | 'admin'>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [notification, setNotification] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [showPrizeOverview, setShowPrizeOverview] = useState(false);
  const [isEditingPrizes, setIsEditingPrizes] = useState(false);
  
  const [redemptionFilterId, setRedemptionFilterId] = useState('');
  const [isBatchAddOpen, setIsBatchAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<{id: number, name: string, oldName?: string} | null>(null);
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<Student | null>(null);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [sortMode, setSortMode] = useState<'id' | 'stars'>('id');

  const [gachapon, setGachapon] = useState<GachaponState>({
    isOpen: false, tier: null, stage: 'auth', result: null, studentId: '', studentName: '', currentStars: 0, aiDescription: null, resultType: null
  });

  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  const [aiPraise, setAiPraise] = useState<{[key: number]: string}>({});
  const [loadingPraise, setLoadingPraise] = useState<{[key: number]: boolean}>({});
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'undo' | 'reset' | 'removeLeader' | 'batchAdd' | null;
    data: any;
  }>({
    isOpen: false,
    type: null,
    data: null 
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null); 

  const totalClassStars = useMemo(() => students.reduce((acc, s) => acc + s.stars, 0), [students]);

  useEffect(() => { localStorage.setItem(getStorageKey('504_stars_data'), JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem(getStorageKey('504_team_names'), JSON.stringify(teamNames)); }, [teamNames]);
  useEffect(() => { localStorage.setItem(getStorageKey('504_team_leaders'), JSON.stringify(leaders)); }, [leaders]);
  useEffect(() => { localStorage.setItem(getStorageKey('504_star_logs'), JSON.stringify(starLogs)); }, [starLogs]);
  useEffect(() => { localStorage.setItem(getStorageKey('504_lottery_history'), JSON.stringify(lotteryHistory)); }, [lotteryHistory]);
  useEffect(() => { localStorage.setItem(getStorageKey('504_pending_prizes'), JSON.stringify(pendingPrizes)); }, [pendingPrizes]);
  useEffect(() => { localStorage.setItem(getStorageKey('504_redeemed_history'), JSON.stringify(redeemedHistory)); }, [redeemedHistory]);
  useEffect(() => { localStorage.setItem(getStorageKey('504_team_bonuses'), JSON.stringify(teamBonuses)); }, [teamBonuses]);
  useEffect(() => { localStorage.setItem(getStorageKey('504_daily_champions'), JSON.stringify(dailyChampions)); }, [dailyChampions]);
  useEffect(() => { localStorage.setItem(getStorageKey('504_max_day'), maxDay.toString()); }, [maxDay]);
  useEffect(() => { localStorage.setItem(getStorageKey('504_group_config'), JSON.stringify(groupConfig)); }, [groupConfig]);
  useEffect(() => { localStorage.setItem(getStorageKey('504_prize_db'), JSON.stringify(prizes)); }, [prizes]);

  useEffect(() => {
    if (selectedDay > maxDay) {
        setMaxDay(selectedDay);
    }
  }, [selectedDay, maxDay]);

  useEffect(() => {
    let bonusTriggered = false;
    let newStudents = [...students];
    let newBonuses = { ...teamBonuses };
    let triggeredGroups: string[] = [];

    groupConfig.forEach(config => {
        const groupId = config.id;
        const bonusKey = `${groupId}-${selectedDay}`;

        if (!newBonuses[bonusKey]) {
            const memberIds = config.members.map(name => {
                const s = newStudents.find(stu => stu.name === name);
                return s ? s.id : null;
            }).filter((id): id is number => id !== null);

            const allQualified = memberIds.length > 0 && memberIds.every(id => {
                const s = newStudents.find(stu => stu.id === id);
                return s && (s.history[selectedDay - 1] || 0) >= 1;
            });

            if (allQualified) {
                bonusTriggered = true;
                newBonuses[bonusKey] = true;
                triggeredGroups.push(teamNames[groupId] || `第 ${groupId} 战队`);

                newStudents = newStudents.map(s => {
                    if (memberIds.includes(s.id)) {
                        const newHistory = [...s.history];
                        const currentScore = newHistory[selectedDay - 1] || 0;
                        newHistory[selectedDay - 1] = currentScore + 0.5;
                        
                        const totalEarned = newHistory.reduce((a, b) => a + (b || 0), 0);
                        const newStars = totalEarned - (s.spent || 0);
                        return { ...s, history: newHistory, stars: newStars };
                    }
                    return s;
                });
            }
        }
    });

    if (bonusTriggered) {
        setStudents(newStudents);
        setTeamBonuses(newBonuses);
        showNotification(`🏆 恭喜！${triggeredGroups.join(', ')} 达成共同富裕！全员奖励 0.5 星！`);
    }
  }, [students, selectedDay, teamBonuses, teamNames, groupConfig]);

  const handlePrevDay = () => {
    if (selectedDay > 1) {
        setSelectedDay(prev => prev - 1);
    }
  };

  const handleNextDay = () => {
    const next = selectedDay + 1;
    setSelectedDay(next);
    if (next > maxDay) {
        setMaxDay(next);
        showNotification(`📅 开启新的一天：第 ${next} 天！`, 'success');
    }
  };

  const groups = useMemo<GroupData[]>(() => {
    return groupConfig.map(config => {
        const groupStudents = config.members.map(name => 
            students.find(s => s.name === name)
        ).filter((s): s is Student => !!s); 

        const groupId = config.id;
        
        const leaderId = leaders[groupId];
        let sortedStudents = [...groupStudents];
        
        if (leaderId) {
            sortedStudents = [
                ...sortedStudents.filter(s => s.id === leaderId),
                ...sortedStudents.filter(s => s.id !== leaderId)
            ];
        }

        const totalStars = sortedStudents.reduce((acc, curr) => {
            const totalHistory = curr.history.reduce((hAcc, val) => hAcc + (val || 0), 0);
            return acc + totalHistory;
        }, 0);
        
        const avgStars = sortedStudents.length > 0 ? totalStars / sortedStudents.length : 0;
        
        return {
            id: groupId,
            name: teamNames[groupId] || `第 ${groupId} 战队`,
            students: sortedStudents,
            totalStars,
            avgStars,
            leaderId: leaderId
        };
    });
  }, [students, teamNames, leaders, groupConfig]);

  const updateTeamName = (groupId: number, newName: string) => {
    setTeamNames(prev => ({ ...prev, [groupId]: newName }));
  };

  const moveStudent = (studentName: string, targetGroupId: number | null) => {
      setGroupConfig(prev => {
          const newConfig = JSON.parse(JSON.stringify(prev)); 
          
          newConfig.forEach((group: GroupConfig) => {
              group.members = group.members.filter(m => m !== studentName);
          });

          if (targetGroupId !== null && targetGroupId !== -1) {
              const targetGroup = newConfig.find((g: GroupConfig) => g.id === targetGroupId);
              if (targetGroup) {
                  targetGroup.members.push(studentName);
              }
          }
          return newConfig;
      });
  };

  const saveStudentInfo = () => {
      if (!editingStudent) return;
      
      const { id, name, oldName } = editingStudent;
      const newId = Number(id);

      if (students.some(s => s.id === newId && s.name !== oldName)) {
          showNotification('学号已存在，请更换！', 'error');
          return;
      }

      setStudents(prev => prev.map(s => s.name === oldName ? { ...s, id: newId, name: name } : s));

      if (name !== oldName) {
          setGroupConfig(prev => prev.map(g => ({
              ...g,
              members: g.members.map(m => m === oldName ? name : m)
          })));
      }

      setEditingStudent(null);
      showNotification('学生信息已更新');
  };

  const addNewStudent = () => {
      const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
      const newName = `新同学${newId}`;
      const newStudent = { id: newId, name: newName, stars: 0, spent: 0, history: [], avatar: null };
      
      setStudents(prev => [...prev, newStudent]);
      showNotification(`已添加: ${newName}`);
  };

  const handleSelectChampion = () => {
    let maxScore = -1;
    let winners: string[] = [];

    groupConfig.forEach(config => {
       const groupStudents = config.members.map(name => students.find(s => s.name === name)).filter(Boolean);
       if (groupStudents.length === 0) return;

       const dailyTotal = groupStudents.reduce((acc, s) => acc + (s!.history[selectedDay - 1] || 0), 0);
       const dailyAvg = dailyTotal / groupStudents.length;
       const roundedScore = Math.round(dailyAvg * 100) / 100;

       if (roundedScore > maxScore) {
         maxScore = roundedScore;
         winners = [teamNames[config.id] || `第 ${config.id} 战队`];
       } else if (roundedScore === maxScore) {
         winners.push(teamNames[config.id] || `第 ${config.id} 战队`);
       }
    });

    if (winners.length > 0 && maxScore > 0) {
      const winnerText = winners.join(' & ');
      const displayResult = `${winnerText} (人均 ${maxScore} 星)`;
      
      setDailyChampions(prev => ({ ...prev, [selectedDay]: displayResult }));
      showNotification(`👑 评选揭晓！第 ${selectedDay} 天冠军：${winnerText}`, 'success');
    } else {
      showNotification(`第 ${selectedDay} 天暂无有效得分记录，无法评选`, 'error');
    }
  };

  const commitAddStar = (studentId: number, day: number, amount: number, reason: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const newHistory = [...s.history];
      const currentScore = newHistory[day - 1] || 0;
      newHistory[day - 1] = currentScore + amount;
      
      const totalEarned = newHistory.reduce((a, b) => a + (b || 0), 0);
      const newStars = totalEarned - (s.spent || 0);
      
      return { ...s, history: newHistory, stars: newStars };
    }));

    setStarLogs(prev => {
      const key = `${studentId}-${day}`;
      const currentLog = prev[key] || [];
      return { ...prev, [key]: [...currentLog, { amount, reason, id: Date.now() }] };
    });
    
    showNotification(`🎉 成功：${reason} ${amount > 0 ? '+' : ''}${amount} 🌟`);
  };

  const handleAddStar = (studentId: number, day: number, amount: number) => {
    commitAddStar(studentId, day, amount, "快速加星");
  };

  const handleRemoveLog = (studentId: number, day: number, logId: number, amount: number) => {
      setStudents(prev => prev.map(s => {
          if (s.id !== studentId) return s;
          const newHistory = [...s.history];
          const currentScore = newHistory[day - 1] || 0;
          newHistory[day - 1] = currentScore - amount; 
          
          const totalEarned = newHistory.reduce((a, b) => a + (b || 0), 0);
          const newStars = totalEarned - (s.spent || 0);
          return { ...s, history: newHistory, stars: newStars };
      }));

      setStarLogs(prev => {
          const key = `${studentId}-${day}`;
          const currentLog = prev[key] || [];
          return { ...prev, [key]: currentLog.filter(log => {
              if (typeof log === 'object' && log.id) return log.id !== logId;
              return true; 
          }) };
      });
      showNotification('已撤销该条记录');
  };

  const batchAddStar = (amount: number) => {
    setStudents(prev => prev.map(s => {
      const newHistory = [...s.history];
      const currentScore = newHistory[selectedDay - 1] || 0;
      newHistory[selectedDay - 1] = currentScore + amount;
      
      const totalEarned = newHistory.reduce((a, b) => a + (b || 0), 0);
      const newStars = totalEarned - (s.spent || 0);

      return { ...s, history: newHistory, stars: newStars };
    }));
    
    setStarLogs(prev => {
        const newLogs = { ...prev };
        students.forEach(s => {
            const key = `${s.id}-${selectedDay}`;
            const currentLog = newLogs[key] || [];
            newLogs[key] = [...currentLog, { amount, reason: '全员奖励', id: Date.now() + s.id }];
        });
        return newLogs;
    });

    showNotification(`🎉 全班同学已奖励 ${amount} 颗星！`);
  };

  const triggerBatchAdd = (amount: number) => {
      setIsBatchAddOpen(false);
      setConfirmModal({
          isOpen: true,
          type: 'batchAdd',
          data: { amount }
      });
  };

  const triggerSetLeader = (student: Student, groupId: number) => {
      if (leaders[groupId] === student.id) {
          setConfirmModal({
              isOpen: true,
              type: 'removeLeader',
              data: { studentId: student.id, name: student.name, groupId }
          });
      } else {
          setLeaders(prev => ({ ...prev, [groupId]: student.id }));
          showNotification(`👑 ${student.name} 已晋升为组长！`);
      }
  };

  const executeConfirm = () => {
      const { type, data } = confirmModal;
      if (!data) return;

      if (type === 'undo') {
          const key = `${data.studentId}-${data.day}`;
          const currentLog = starLogs[key] || [];
          if (currentLog.length > 0) {
              const lastItem = currentLog[currentLog.length - 1];
              const lastAmount = typeof lastItem === 'number' ? lastItem : lastItem.amount;
              
              const newLog = currentLog.slice(0, -1);
              setStarLogs(prev => ({ ...prev, [key]: newLog }));

              setStudents(prev => prev.map(s => {
                  if (s.id !== data.studentId) return s;
                  const newHistory = [...s.history];
                  const currentScore = newHistory[data.day - 1] || 0;
                  newHistory[data.day - 1] = Math.max(0, currentScore - lastAmount);
                  
                  const totalEarned = newHistory.reduce((a, b) => a + (b || 0), 0);
                  const newStars = totalEarned - (s.spent || 0);

                  return { ...s, history: newHistory, stars: newStars };
              }));
              showNotification(`已撤销 ${data.name} 的最近一次操作`);
          }
      } else if (type === 'reset') {
          setStudents(prev => prev.map(s => {
              if (s.id !== data.studentId) return s;
              const newHistory = [...s.history];
              newHistory[data.day - 1] = 0;
              
              const totalEarned = newHistory.reduce((a, b) => a + (b || 0), 0);
              const newStars = totalEarned - (s.spent || 0);

              return { ...s, history: newHistory, stars: newStars };
          }));
          const key = `${data.studentId}-${data.day}`;
          setStarLogs(prev => { const { [key]: _, ...rest } = prev; return rest; });
          showNotification(`已重置 ${data.name} 今日分数`);
      } else if (type === 'removeLeader') {
          const newLeaders = { ...leaders };
          delete newLeaders[data.groupId];
          setLeaders(newLeaders);
          showNotification(`已撤销 ${data.name} 的组长职务`);
      } else if (type === 'batchAdd') {
          batchAddStar(data.amount);
      }
      
      setConfirmModal({ isOpen: false, type: null, data: null });
  };

  const triggerUndo = (student: Student, day: number) => {
    const logKey = `${student.id}-${day}`;
    const currentLog = starLogs[logKey] || [];
    if (currentLog.length === 0) return;
    
    setConfirmModal({
        isOpen: true,
        type: 'undo',
        data: { studentId: student.id, name: student.name, day, amount: 0 }
    });
  };

  const triggerReset = (student: Student, day: number) => {
    setConfirmModal({
        isOpen: true,
        type: 'reset',
        data: { studentId: student.id, name: student.name, day }
    });
  };

  const batchSetScore = (score: number) => {
    setStudents(prev => prev.map(s => {
      const newHistory = [...s.history];
      newHistory[selectedDay - 1] = score;
      
      const totalEarned = newHistory.reduce((a, b) => a + (b || 0), 0);
      const newStars = totalEarned - (s.spent || 0);

      return { ...s, history: newHistory, stars: newStars };
    }));
    setStarLogs(prev => {
      const newLogs = { ...prev };
      students.forEach(s => { delete newLogs[`${s.id}-${selectedDay}`]; });
      return newLogs;
    });
    showNotification(`第 ${selectedDay} 天全员设为 ${score} 星`);
  };

  const handleExportData = () => {
    const data = { timestamp: new Date().toISOString(), students, teamNames, starLogs, lotteryHistory, leaders, teamBonuses, dailyChampions, pendingPrizes, redeemedHistory, groupConfig };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `504班摘星数据备份_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('数据已成功导出备份！💾');
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') return;
        const data = JSON.parse(result);
        if (data.students && Array.isArray(data.students)) {
          if (window.confirm('确定要恢复此备份吗？当前未保存的数据将被覆盖！')) {
            setStudents(data.students.map((s: any) => ({ ...s, spent: s.spent || 0 })));
            if (data.teamNames) setTeamNames(data.teamNames);
            if (data.starLogs) setStarLogs(data.starLogs);
            if (data.lotteryHistory) setLotteryHistory(data.lotteryHistory);
            if (data.leaders) setLeaders(data.leaders);
            if (data.teamBonuses) setTeamBonuses(data.teamBonuses);
            if (data.dailyChampions) setDailyChampions(data.dailyChampions);
            if (data.pendingPrizes) setPendingPrizes(data.pendingPrizes);
            if (data.redeemedHistory) setRedeemedHistory(data.redeemedHistory); 
            if (data.groupConfig) setGroupConfig(data.groupConfig);
            if (data.prizes) setPrizes(data.prizes);
            showNotification('数据恢复成功！🎉');
          }
        } else { showNotification('文件格式错误', 'error'); }
      } catch (error) { showNotification('读取失败', 'error'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000); 
  };

  const openGachapon = (tierKey: string) => setGachapon({ isOpen: true, tier: tierKey, stage: 'auth', result: null, studentId: '', studentName: '', currentStars: 0, aiDescription: null, resultType: null });
  const closeGachapon = () => setGachapon({ ...gachapon, isOpen: false });

  const verifyStudent = () => {
    const id = parseInt(gachapon.studentId);
    const student = students.find(s => s.id === id);
    if (!student) { showNotification('查无此学号', 'error'); return; }
    if (!gachapon.tier) return;
    
    const cost = currentPoolMeta[gachapon.tier].cost;
    if (student.stars < cost) {
      setGachapon(prev => ({ ...prev, stage: 'denied', studentName: student.name, currentStars: student.stars }));
    } else {
      setGachapon(prev => ({ ...prev, stage: 'idle', studentName: student.name, currentStars: student.stars }));
    }
  };

  const spinGachapon = () => {
    if (!gachapon.tier) return;
    setGachapon(prev => ({ ...prev, stage: 'spinning', result: null, aiDescription: null }));
    setTimeout(async () => {
      const poolItems = prizes[gachapon.tier!];
      const prizeItem = drawPrize(poolItems);

      setGachapon(prev => ({ ...prev, stage: 'result', result: prizeItem.name, resultType: prizeItem.type }));
      
      const newRecord: LotteryRecord = {
        id: Date.now(),
        studentName: gachapon.studentName,
        tierTitle: currentPoolMeta[gachapon.tier!].title,
        prize: prizeItem.name,
        timestamp: new Date().toLocaleString()
      };
      setLotteryHistory(prev => [newRecord, ...prev]);

      const newPendingPrize: PendingPrize = {
          id: Date.now(), 
          studentName: gachapon.studentName,
          studentId: parseInt(gachapon.studentId),
          prizeName: prizeItem.name,
          prizeType: prizeItem.type,
          timestamp: new Date().toLocaleString()
      };
      setPendingPrizes(prev => [newPendingPrize, ...prev]);

      const prompt = `你是一个神奇的魔法扭蛋机精灵。一位名叫${gachapon.studentName}的小学生刚刚在班级抽奖中抽到了"${prizeItem.name}"。请用幽默、充满魔法感和夸张的语气描述这个奖品，让孩子觉得它独一无二。限制在40字以内。`;
      const description = await generateAIContent(prompt);
      setGachapon(prev => ({ ...prev, aiDescription: description }));
    }, 2000);
  };

  const handleAcceptPrize = () => {
    if (!gachapon.tier) return;
    const cost = currentPoolMeta[gachapon.tier].cost;
    const studentId = parseInt(gachapon.studentId);
    
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      
      const newSpent = (s.spent || 0) + cost;
      const totalEarned = s.history.reduce((a, b) => a + (b || 0), 0);
      const newStars = totalEarned - newSpent;
      
      return { ...s, spent: newSpent, stars: newStars };
    }));
    
    showNotification(`已扣除 ${cost} 颗星，请前往兑奖处兑换！`);
    closeGachapon();
  };

  const handleRedeemPrize = (id: number) => {
      const prize = pendingPrizes.find(p => p.id === id);
      if (prize) {
          setPendingPrizes(prev => prev.filter(p => p.id !== id));
          setRedeemedHistory(prev => [{...prize, redeemedAt: new Date().toLocaleString()}, ...prev]);
          showNotification('奖品兑换成功！');
      }
  };

  const handleUndoRedeem = (id: number) => {
      const prize = redeemedHistory.find(p => p.id === id);
      if (prize) {
          setRedeemedHistory(prev => prev.filter(p => p.id !== id));
          const { redeemedAt, ...rest } = prize;
          setPendingPrizes(prev => [rest, ...prev]);
          showNotification('已撤销兑换，奖品回到待兑换列表');
      }
  };

  const filteredPendingPrizes = useMemo(() => {
      if (!redemptionFilterId) return pendingPrizes;
      return pendingPrizes.filter(p => p.studentId === parseInt(redemptionFilterId));
  }, [pendingPrizes, redemptionFilterId]);

  const filteredRedeemedHistory = useMemo(() => {
      let history = redeemedHistory;
      if (redemptionFilterId) {
          history = history.filter(p => p.studentId === parseInt(redemptionFilterId));
      }
      return history.slice(0, 10); 
  }, [redeemedHistory, redemptionFilterId]);

  const generatePraise = async (studentName: string, studentId: number) => {
      setLoadingPraise(prev => ({ ...prev, [studentId]: true }));
      const prompt = `你是一位风趣幽默的小学班主任AI助手。学生"${studentName}"今天表现很棒，获得了星星奖励。请给出一句简短有力、充满童趣和鼓励的话。限制在30字以内。`;
      const praise = await generateAIContent(prompt);
      setAiPraise(prev => ({ ...prev, [studentId]: praise }));
      setLoadingPraise(prev => ({ ...prev, [studentId]: false }));
  };

  const updateScoreDirectly = (studentId: number, day: number, score: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== studentId) return s;
      const newHistory = [...s.history];
      newHistory[day - 1] = score;
      
      const totalEarned = newHistory.reduce((a, b) => a + (b || 0), 0);
      const newStars = totalEarned - (s.spent || 0);

      return { ...s, history: newHistory, stars: newStars };
    }));
    const key = `${studentId}-${day}`;
    setStarLogs(prev => { const { [key]: _, ...rest } = prev; return rest; });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !selectedStudentForAction) return;

      if (file.size > 500 * 1024) {
          showNotification('图片太大了，请上传小于 500KB 的图片', 'error');
          return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
          const base64 = event.target?.result as string;
          const updatedStudent = { ...selectedStudentForAction, avatar: base64 };
          setSelectedStudentForAction(updatedStudent);

          setStudents(prev => prev.map(s =>
              s.id === updatedStudent.id ? updatedStudent : s
          ));
          showNotification('头像更新成功！📸');
      };
      reader.readAsDataURL(file);
  };

  const getStudentLogs = (studentId: number, day: number) => {
      const logs = starLogs[`${studentId}-${day}`] || [];
      return logs.map(log => {
          if (typeof log === 'number') return { amount: log, reason: '手动调整', id: Math.random() };
          return log;
      });
  };

  const handlePrizeChange = (poolKey: string, index: number, field: string, value: any) => {
      const newPrizes = { ...prizes };
      const newPool = [...newPrizes[poolKey]];
      newPool[index] = { ...newPool[index], [field]: value };
      newPrizes[poolKey] = newPool;
      setPrizes(newPrizes);
  };

  const handleAddPrize = (poolKey: string) => {
      const newPrizes = { ...prizes };
      newPrizes[poolKey] = [...newPrizes[poolKey], { name: "新奖品", type: poolKey, prob: 0 }];
      setPrizes(newPrizes);
  };

  const handleDeletePrize = (poolKey: string, index: number) => {
      const newPrizes = { ...prizes };
      newPrizes[poolKey] = newPrizes[poolKey].filter((_, i) => i !== index);
      setPrizes(newPrizes);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-10 relative overflow-hidden">
      <style>{ANIMATION_STYLES}</style>
      
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-60"></div>
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-purple-200/30 blur-3xl animate-blob"></div>
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-blue-200/30 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] rounded-full bg-pink-200/30 blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm relative z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setViewMode('dashboard')}>
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-lg shadow-indigo-200">
                <Star className="w-5 h-5 fill-current animate-pulse" />
              </div>
              <h1 className="text-xl font-black tracking-tight text-slate-800">504班 · 摘星龙虎榜</h1>
            </div>
            
            {/* 模式切换开关 */}
            <div className="hidden sm:flex bg-slate-100 p-1 rounded-full border border-slate-200 shadow-inner items-center ml-2">
              <button
                onClick={() => { setAppMode('final'); showNotification('已切换至：期末冲刺版'); }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${appMode === 'final' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                🏁 期末冲刺版
              </button>
              <button
                onClick={() => { setAppMode('semester'); showNotification('已切换至：学期常规版'); }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center ${appMode === 'semester' ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Sparkles size={12} className="mr-1" /> 学期常规版
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
                onClick={() => setViewMode('all_students')}
                className={`text-xs font-bold px-4 py-2 rounded-full transition shadow-sm border flex items-center ${viewMode === 'all_students' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'}`}
            >
                <Users size={14} className="mr-1"/> 👥 全班花名册
            </button>
            <button 
                onClick={() => setShowRules(true)}
                className="text-xs font-bold px-4 py-2 rounded-full transition shadow-sm border flex items-center bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            >
                <ScrollText size={14} className="mr-1"/> 📜 规则说明
            </button>
            <button 
                onClick={() => {
                    const pwd = prompt("🔐 请输入查看密码:");
                    if (pwd === "504数学") {
                        setShowPrizeOverview(true);
                        showNotification("🔓 验证成功！已进入奖池管理中心", "success");
                    } else if (pwd !== null) {
                        showNotification("🚫 密码错误，无法查看", "error");
                    }
                }}
                className="text-xs font-bold px-4 py-2 rounded-full transition shadow-sm border flex items-center bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            >
                <Table size={14} className="mr-1"/> 📊 奖励一览
            </button>
            <button 
              onClick={() => setViewMode('redemption')} 
              className={`text-xs font-bold px-4 py-2 rounded-full transition shadow-sm border flex items-center ${viewMode === 'redemption' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'}`}
            >
              <Ticket size={14} className="mr-1"/> 🎁 兑奖处
              {pendingPrizes.length > 0 && <span className="ml-1 bg-rose-500 text-white text-[10px] px-1.5 rounded-full">{pendingPrizes.length}</span>}
            </button>

            {viewMode === 'dashboard' || viewMode === 'redemption' || viewMode === 'team_manage' || viewMode === 'all_students' ? (
              <button 
                onClick={() => setIsAuthenticated(prev => {
                  if(prev) { setViewMode('admin'); return true; }
                  else { const p = prompt("请输入管理密码:"); if(p==='504'){ setViewMode('admin'); return true;} return false; }
                })}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-2 rounded-full transition shadow-sm border border-slate-200"
              >
                👨‍🏫 老师入口
              </button>
            ) : (
              <button onClick={() => setViewMode('dashboard')} className="text-xs bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold px-4 py-2 rounded-full transition shadow-sm border border-emerald-200 flex items-center">
                <Users size={14} className="mr-1"/> 返回展示页
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Prize Overview Modal */}
      {showPrizeOverview && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-3xl p-6 w-full max-w-6xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex-shrink-0 flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg">
                            <Settings size={28} className={isEditingPrizes ? "animate-spin-slow" : ""} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-800">🏆 奖池管理中心</h2>
                            <p className="text-slate-500 text-sm mt-1">
                                {isEditingPrizes ? "⚠️ 编辑模式：请确保每个奖池的概率总和为 1 (100%)" : "公开透明，童叟无欺！快来看看心仪的奖品中奖率吧！"}
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button 
                            onClick={() => setIsEditingPrizes(!isEditingPrizes)}
                            className={`px-4 py-2 rounded-xl font-bold flex items-center transition-all ${isEditingPrizes ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                            <Edit2 size={16} className="mr-2"/> {isEditingPrizes ? "退出编辑" : "编辑模式"}
                        </button>
                        <button onClick={() => setShowPrizeOverview(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-2 rounded-full"><X size={20} /></button>
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 pr-2 pb-4">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {Object.keys(currentPoolMeta).map((key) => {
                            const meta = currentPoolMeta[key];
                            const currentPrizes = prizes[key] || [];
                            const totalProb = currentPrizes.reduce((acc, item) => acc + parseFloat(item.prob.toString()), 0);
                            const isValid = Math.abs(totalProb - 1.0) < 0.001;

                            return (
                                <div key={key} className={`bg-slate-50 rounded-2xl p-4 border-2 shadow-sm flex flex-col ${isEditingPrizes && !isValid ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}`}>
                                    <div className={`flex items-center justify-between mb-4 pb-2 border-b border-slate-200`}>
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-xl bg-gradient-to-br ${meta.gradient} text-white shadow-md`}>
                                                <TierIconWrapper icon={meta.icon} size={20} />
                                            </div>
                                            <div>
                                                <h3 className={`font-black text-lg text-slate-800`}>{meta.title}</h3>
                                                <span className="text-xs text-slate-400 font-bold">需 {meta.cost} 颗星</span>
                                            </div>
                                        </div>
                                        <div className={`text-sm font-bold px-3 py-1 rounded-lg ${isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700 animate-pulse'}`}>
                                            概率总和: {(totalProb * 100).toFixed(0)}%
                                            {!isValid && <span className="ml-1 flex items-center inline-flex"><AlertTriangle size={12} className="mr-1"/> 须为100%</span>}
                                        </div>
                                    </div>
                                    
                                    <div className="overflow-x-auto flex-1">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-slate-500 uppercase bg-slate-100/50">
                                                <tr>
                                                    <th className="px-2 py-2 rounded-l-lg">奖品名称</th>
                                                    {isEditingPrizes && <th className="px-2 py-2 w-20 text-center">概率(小数)</th>}
                                                    <th className="px-2 py-2 text-right rounded-r-lg w-20">概率%</th>
                                                    {isEditingPrizes && <th className="px-2 py-2 w-10"></th>}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {currentPrizes.length === 0 ? (
                                                    <tr><td colSpan={4} className="px-3 py-4 text-center text-slate-400 italic">暂无配置</td></tr>
                                                ) : (
                                                    currentPrizes.map((item, idx) => (
                                                        <tr key={idx} className="hover:bg-white transition-colors group">
                                                            <td className="px-2 py-2 font-medium text-slate-700">
                                                                {isEditingPrizes ? (
                                                                    <input 
                                                                        type="text" 
                                                                        value={item.name} 
                                                                        onChange={(e) => handlePrizeChange(key, idx, 'name', e.target.value)}
                                                                        className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
                                                                    />
                                                                ) : (
                                                                    item.name
                                                                )}
                                                            </td>
                                                            {isEditingPrizes && (
                                                                <td className="px-2 py-2 text-center">
                                                                    <input 
                                                                        type="number" 
                                                                        step="0.01"
                                                                        min="0"
                                                                        max="1"
                                                                        value={item.prob} 
                                                                        onChange={(e) => handlePrizeChange(key, idx, 'prob', parseFloat(e.target.value))}
                                                                        className="w-full text-center border border-slate-300 rounded px-1 py-1 text-sm focus:border-indigo-500 focus:outline-none font-mono"
                                                                    />
                                                                </td>
                                                            )}
                                                            <td className="px-2 py-2 text-right font-bold text-slate-600">
                                                                {(item.prob * 100).toFixed(0)}%
                                                            </td>
                                                            {isEditingPrizes && (
                                                                <td className="px-2 py-2 text-center">
                                                                    <button 
                                                                        onClick={() => handleDeletePrize(key, idx)}
                                                                        className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))
                                                )}
                                                {isEditingPrizes && (
                                                    <tr>
                                                        <td colSpan={4} className="p-2">
                                                            <button 
                                                                onClick={() => handleAddPrize(key)}
                                                                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-xs font-bold flex items-center justify-center"
                                                            >
                                                                <Plus size={14} className="mr-1"/> 添加新奖品
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-3">
                    {isEditingPrizes ? (
                        <>
                            <div className="flex-1 flex items-center text-xs text-rose-500 font-bold bg-rose-50 px-4 rounded-lg">
                                {!Object.keys(currentPoolMeta).every(k => Math.abs((prizes[k] || []).reduce((a,b)=>a+parseFloat(b.prob.toString()||"0"),0) - 1) < 0.001) && 
                                    <span><AlertCircle size={14} className="inline mr-1"/> 无法保存：请确保所有奖池概率总和均为 100%</span>
                                }
                            </div>
                            <button onClick={() => { setIsEditingPrizes(false); setPrizes(JSON.parse(localStorage.getItem(getStorageKey('504_prize_db')) || JSON.stringify(appMode === 'semester' ? SEMESTER_INITIAL_PRIZE_DB : INITIAL_PRIZE_DB))); }} className="px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200">
                                取消修改
                            </button>
                            <button 
                                disabled={!Object.keys(currentPoolMeta).every(k => Math.abs((prizes[k] || []).reduce((a,b)=>a+parseFloat(b.prob.toString()||"0"),0) - 1) < 0.001)}
                                onClick={() => { setIsEditingPrizes(false); showNotification("✅ 奖池配置已保存并生效！"); }} 
                                className="px-6 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                <Save size={18} className="mr-2"/> 保存配置
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setShowPrizeOverview(false)} className="bg-slate-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-slate-700 transition-all active:scale-95">关闭列表</button>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative overflow-y-auto max-h-[90vh]">
                <button onClick={() => setShowRules(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-slate-100 p-1 rounded-full"><X size={20} /></button>
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center p-3 bg-indigo-100 text-indigo-600 rounded-full mb-3">
                        <BookOpen size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800">🌟 {appMode === 'semester' ? '学期常规版' : '期末冲刺版'} 摘星说明</h2>
                    <p className="text-slate-500 text-sm mt-1">努力就有收获，合作才能共赢！</p>
                </div>

                {appMode === 'semester' ? (
                    <div className="space-y-6">
                        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                            <h3 className="font-bold text-emerald-800 text-lg mb-3 flex items-center"><Star className="mr-2 fill-emerald-500 text-emerald-600"/> 第一部分：如何赚取星星？</h3>
                            <ul className="space-y-2 text-sm text-emerald-900 font-medium">
                                <li className="flex items-start"><span className="bg-emerald-200 text-emerald-800 text-[10px] px-1.5 rounded mr-2 mt-0.5 min-w-fit">基础保底</span> 作业全对、卷面极佳、订正及时 ➡ <span className="font-bold ml-1">+1 颗星</span></li>
                                <li className="flex items-start"><span className="bg-emerald-200 text-emerald-800 text-[10px] px-1.5 rounded mr-2 mt-0.5 min-w-fit">思维进阶</span> 攻克每周一题、提出优质问题、一题多解 ➡ <span className="font-bold ml-1">+3 颗星</span></li>
                                <li className="flex items-start"><span className="bg-emerald-200 text-emerald-800 text-[10px] px-1.5 rounded mr-2 mt-0.5 min-w-fit">高光时刻</span> 测验满分/大进步、担任小老师 ➡ <span className="font-bold ml-1">+5 颗星</span></li>
                            </ul>
                        </div>
                        <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
                            <h3 className="font-bold text-purple-800 text-lg mb-3 flex items-center"><Gift className="mr-2 fill-purple-400 text-purple-600"/> 第二部分：星际盲盒（怎么花星？）</h3>
                            <div className="grid grid-cols-1 gap-3 text-sm">
                                <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-slate-600 mb-1">📦 星尘补给袋 (20星)</div>
                                        <div className="text-slate-500 text-xs">基础奖励包，人人可及。</div>
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-indigo-600 mb-1">🌌 银河寻宝图 (40星)</div>
                                        <div className="text-slate-500 text-xs">进阶特权奖励，需要持续努力。</div>
                                    </div>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-amber-600 mb-1">👑 宇宙主宰匣 (60星)</div>
                                        <div className="text-slate-500 text-xs">终极特权，强者的证明！</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                            <h3 className="font-bold text-emerald-800 text-lg mb-3 flex items-center"><Star className="mr-2 fill-emerald-500 text-emerald-600"/> 第一部分：星星收集（基础篇）</h3>
                            <ul className="space-y-2 text-sm text-emerald-900 font-medium">
                                <li className="flex items-start"><span className="bg-emerald-200 text-emerald-800 text-[10px] px-1.5 rounded mr-2 mt-0.5 min-w-fit">每日基础</span> 每日计算全对 + 书写工整 ➡ <span className="font-bold ml-1">+1 颗星</span></li>
                                <li className="flex items-start"><span className="bg-emerald-200 text-emerald-800 text-[10px] px-1.5 rounded mr-2 mt-0.5 min-w-fit">订正收益</span> 错题在放学前订正并过关 ➡ <span className="font-bold ml-1">+0.5 颗星</span></li>
                                <li className="flex items-start"><span className="bg-emerald-200 text-emerald-800 text-[10px] px-1.5 rounded mr-2 mt-0.5 min-w-fit">黑马红利</span> 随机突击检查被表扬 / 模拟考进步巨大 ➡ <span className="font-bold ml-1">额外奖励</span></li>
                            </ul>
                        </div>
                        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                            <h3 className="font-bold text-blue-800 text-lg mb-3 flex items-center"><Users className="mr-2 fill-blue-400 text-blue-600"/> 第二部分：战队团战（怎么分红？）</h3>
                            <ul className="space-y-2 text-sm text-blue-900 font-medium">
                                <li className="flex items-start">
                                    <div className="bg-blue-200 text-blue-800 text-[10px] px-1.5 rounded mr-2 mt-0.5 min-w-fit whitespace-nowrap">🏆 共同富裕奖</div>
                                    <div>如果小组4人当天作业全部全对，每个人<span className="font-bold ml-1">额外奖励 0.5 星！</span></div>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100">
                            <h3 className="font-bold text-purple-800 text-lg mb-3 flex items-center"><Gift className="mr-2 fill-purple-400 text-purple-600"/> 第三部分：消费与诱惑（怎么花星？）</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm">
                                    <div className="font-bold text-pink-600 mb-1">🎁 5星（惊喜盲盒）</div>
                                    <div className="text-slate-600 text-xs">换点小零食、来点小互动</div>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm">
                                    <div className="font-bold text-violet-600 mb-1">🔮 10星（魔法宝箱）</div>
                                    <div className="text-slate-600 text-xs">换取“免死金牌”、“计算器使用权”！</div>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm">
                                    <div className="font-bold text-amber-600 mb-1">👑 15星（传说宝藏）</div>
                                    <div className="text-slate-600 text-xs">终极大奖——“免做假期作业”、“金老师请客”！</div>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-sm relative overflow-hidden">
                                    <div className="font-bold text-indigo-600 mb-1">🌌 7星（命运宝箱）</div>
                                    <div className="text-slate-600 text-xs">勇敢者游戏！可能抽到大奖，也可能是惩罚！</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="mt-6 text-center">
                    <button onClick={() => setShowRules(false)} className="bg-slate-800 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-slate-700 transition-all active:scale-95">我明白了，去摘星！🚀</button>
                </div>
            </div>
        </div>
      )}

      {notification && <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl z-50 text-white text-sm font-bold animate-bounce flex items-center ${notification.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}>{notification.msg}</div>}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl transform scale-100">
                <div className="flex justify-center mb-4 text-amber-500"><AlertCircle size={48} /></div>
                <h3 className="text-lg font-bold text-center text-slate-800 mb-2">操作确认</h3>
                <p className="text-center text-slate-600 mb-6">
                    {confirmModal.type === 'undo' ? `确定要撤回 ${confirmModal.data.name} 的最近一次操作吗？` : 
                     confirmModal.type === 'reset' ? `⚠️ 确定要清空 ${confirmModal.data.name} 今日的所有星星吗？` :
                     confirmModal.type === 'removeLeader' ? `⚠️ 确定要撤销 ${confirmModal.data.name} 的组长职务吗？` : 
                     confirmModal.type === 'batchAdd' ? `⚠️ 确定要给全班所有同学每人奖励 ${confirmModal.data.amount} 颗星吗？` : ''}
                </p>
                <div className="flex space-x-3">
                    <button onClick={() => setConfirmModal({ isOpen: false, type: null, data: null })} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">取消</button>
                    <button onClick={executeConfirm} className={`flex-1 py-3 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-95 ${confirmModal.type === 'undo' || confirmModal.type === 'removeLeader' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-slate-700 hover:bg-slate-800'}`}>确定</button>
                </div>
            </div>
        </div>
      )}

      {/* Batch Add Options Modal */}
      {isBatchAddOpen && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                <button onClick={() => setIsBatchAddOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                <h3 className="text-lg font-bold text-center text-slate-800 mb-4">🌟 全员奖励</h3>
                <p className="text-center text-slate-500 mb-6 text-sm">请选择给全班同学增加的星星数量</p>
                <div className="flex gap-4">
                    <button onClick={() => triggerBatchAdd(0.5)} className="flex-1 py-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl flex flex-col items-center justify-center hover:bg-yellow-100 transition-all active:scale-95 group">
                        <StarHalf size={32} className="text-yellow-500 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="font-black text-slate-700 text-lg">+0.5 星</span>
                    </button>
                    <button onClick={() => triggerBatchAdd(1)} className="flex-1 py-4 bg-orange-50 border-2 border-orange-200 rounded-xl flex flex-col items-center justify-center hover:bg-orange-100 transition-all active:scale-95 group">
                        <Star size={32} className="text-orange-500 mb-2 group-hover:scale-110 transition-transform" fill="currentColor" />
                        <span className="font-black text-slate-700 text-lg">+1 星</span>
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Edit Student Info Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-[102] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center"><Edit2 size={18} className="mr-2"/> 编辑学生信息</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">学号</label>
                        <input 
                            type="number" 
                            value={editingStudent.id} 
                            onChange={(e) => setEditingStudent({...editingStudent, id: parseInt(e.target.value)})}
                            className="w-full border border-slate-200 rounded-lg p-2 font-bold text-slate-700"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">姓名</label>
                        <input 
                            type="text" 
                            value={editingStudent.name} 
                            onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
                            className="w-full border border-slate-200 rounded-lg p-2 font-bold text-slate-700"
                        />
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setEditingStudent(null)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold">取消</button>
                        <button onClick={saveStudentInfo} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-bold">保存</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Student Action Modal (For All Students View) */}
      {selectedStudentForAction && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
                <button onClick={() => { setSelectedStudentForAction(null); setPendingAction(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-slate-50 p-1 rounded-full z-20"><X size={20} /></button>
                
                <div className="text-center pt-6 px-6 pb-4 flex-shrink-0 bg-white z-10 shadow-sm border-b border-slate-50">
                    <div 
                        className="inline-block relative group cursor-pointer"
                        onClick={() => avatarInputRef.current?.click()}
                        title="点击更换头像"
                    >
                        {selectedStudentForAction.avatar ? (
                             <div className="w-20 h-20 rounded-full border-4 border-indigo-100 overflow-hidden mx-auto mb-2 shadow-sm group-hover:border-indigo-300 transition-colors">
                                 <img src={selectedStudentForAction.avatar} alt="avatar" className="w-full h-full object-cover" />
                             </div>
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center font-black text-3xl mb-2 mx-auto border-4 border-white shadow-sm group-hover:bg-indigo-200 transition-colors">
                                {selectedStudentForAction.id}
                            </div>
                        )}
                        <div className="absolute bottom-2 right-0 bg-white p-1.5 rounded-full shadow-md text-gray-400 group-hover:text-indigo-500">
                            <Camera size={14} />
                        </div>
                    </div>
                    <input 
                        type="file" 
                        ref={avatarInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleAvatarUpload}
                    />

                    <h3 className="text-2xl font-black text-slate-800 mb-1">{selectedStudentForAction.name}</h3>
                    <div className="flex items-center justify-center gap-1 text-amber-500 font-bold">
                        <Star size={20} fill="currentColor" />
                        <span className="text-xl">{selectedStudentForAction.stars}</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">今日得分 (第 {selectedDay} 天)</span>
                            <span className="font-black text-2xl text-slate-700">{selectedStudentForAction.history[selectedDay - 1] || 0}</span>
                        </div>
                        
                        {!pendingAction ? (
                            <div className="grid grid-cols-2 gap-3">
                                {currentActionReasons.map((action, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setPendingAction(action)}
                                        className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center font-bold transition-all active:scale-95 shadow-sm border-2 ${
                                            action.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300' :
                                            action.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100 hover:border-amber-300' :
                                            action.type === 'orange' ? 'bg-orange-50 border-orange-100 text-orange-700 hover:bg-orange-100 hover:border-orange-300' :
                                            'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100 hover:border-rose-300'
                                        }`}
                                    >
                                        <span className="text-sm mb-1">{action.label}</span>
                                        <span className="text-xl">{action.score > 0 ? '+' : ''}{action.score}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="animate-in fade-in zoom-in duration-200 bg-white p-4 rounded-xl border-2 border-indigo-100 shadow-md">
                                <div className="text-center mb-4">
                                    <div className="text-sm text-slate-500 mb-1">即将进行操作:</div>
                                    <div className="font-black text-xl text-slate-800">{pendingAction.label}</div>
                                    <div className={`text-2xl font-black mt-2 ${pendingAction.score > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {pendingAction.score > 0 ? '+' : ''}{pendingAction.score} 🌟
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setPendingAction(null)}
                                        className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center"
                                    >
                                        <Undo2 size={18} className="mr-2"/> 撤销
                                    </button>
                                    <button 
                                        onClick={() => {
                                            commitAddStar(selectedStudentForAction.id, selectedDay, pendingAction.score, pendingAction.label);
                                            setPendingAction(null);
                                        }}
                                        className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg transform active:scale-95 transition-all flex items-center justify-center"
                                    >
                                        <CheckCircle2 size={18} className="mr-2"/> 确定
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50/80 rounded-xl border border-slate-200 p-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center"><History size={12} className="mr-1"/> 📝 今日记录明细</h4>
                        <div className="space-y-2">
                            {getStudentLogs(selectedStudentForAction.id, selectedDay).length === 0 ? (
                                <div className="text-center text-slate-300 text-xs py-4">暂无记录</div>
                            ) : (
                                getStudentLogs(selectedStudentForAction.id, selectedDay).slice().reverse().map((log: LogEntry, i) => (
                                    <div key={log.id || i} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex items-center">
                                            <div className={`w-1.5 h-8 rounded-full mr-3 ${log.amount > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                                            <div>
                                                <div className="text-xs font-bold text-slate-700">{log.reason}</div>
                                                <div className={`text-[10px] font-black ${log.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{log.amount > 0 ? '+' : ''}{log.amount}</div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveLog(selectedStudentForAction.id, selectedDay, log.id, log.amount)}
                                            className="px-3 py-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg text-[10px] font-bold transition-colors border border-transparent hover:border-rose-100"
                                        >
                                            撤销
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-4 pb-6 flex-shrink-0 bg-white z-10 border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="flex gap-2">
                        <button onClick={() => { updateScoreDirectly(selectedStudentForAction.id, selectedDay, 0); showNotification(`已重置 ${selectedStudentForAction.name} 今日得分`); }} className="flex-1 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center">
                            <Eraser size={16} className="mr-2"/> 清零今日
                        </button>
                        <button onClick={() => { setSelectedStudentForAction(null); setPendingAction(null); }} className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 shadow-lg transition-transform active:scale-95">
                            完成
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Gachapon Modal */}
      {gachapon.isOpen && gachapon.tier && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm mx-auto shadow-2xl relative overflow-hidden transform transition-all border-4 border-white ring-4 ring-indigo-50">
            <button onClick={closeGachapon} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 bg-gray-50 p-1 rounded-full"><X size={20} /></button>
            
            <div className="text-center space-y-6 pt-2">
              {gachapon.stage !== 'result' && (
                <div className="animate-in slide-in-from-top duration-500">
                  <div className={`inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br ${currentPoolMeta[gachapon.tier].gradient} text-white mb-3 shadow-lg shadow-indigo-100`}>
                    <TierIconWrapper icon={currentPoolMeta[gachapon.tier].icon} size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800">{currentPoolMeta[gachapon.tier].title}</h3>
                  <div className="inline-block px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500 mt-2">✨ 消耗 {currentPoolMeta[gachapon.tier].cost} 颗星 ✨</div>
                </div>
              )}
              
              {/* Auth */}
              {gachapon.stage === 'auth' && (
                <div className="space-y-4 py-2">
                  <div className="bg-slate-50 p-5 rounded-2xl border-2 border-slate-100">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex justify-center items-center"><Fingerprint size={14} className="mr-1"/> 请输入学号</label>
                    <div className="flex justify-center">
                      <input type="number" value={gachapon.studentId} onChange={(e) => setGachapon(prev => ({...prev, studentId: e.target.value}))} className="w-24 text-center text-4xl font-black border-b-4 border-indigo-200 focus:border-indigo-500 outline-none bg-transparent py-2 text-indigo-900 transition-colors" placeholder="#" autoFocus />
                    </div>
                  </div>
                  <button onClick={verifyStudent} className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center text-lg"><KeyRound size={20} className="mr-2"/> 开始验证</button>
                </div>
              )}

              {/* Denied */}
              {gachapon.stage === 'denied' && (
                <div className="space-y-4 py-2 animate-in shake">
                  <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 text-center">
                    <div className="text-4xl mb-2">😢</div>
                    <h4 className="text-lg font-bold text-gray-800 mb-1">{gachapon.studentName} 同学</h4>
                    <p className="text-rose-500 font-bold">星星数量不足哦！</p>
                    <div className="mt-4 text-xs text-rose-400 bg-white inline-block px-3 py-1 rounded-full shadow-sm border border-rose-100">当前: {gachapon.currentStars} / 需要: {currentPoolMeta[gachapon.tier].cost}</div>
                  </div>
                  <button onClick={closeGachapon} className="w-full py-3 rounded-xl font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all">我会继续努力的！</button>
                </div>
              )}

              {/* Idle */}
              {gachapon.stage === 'idle' && (
                 <div className="relative h-48 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group animate-in zoom-in duration-300">
                   <div className="text-center z-10 space-y-2">
                      <div className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full inline-block flex items-center"><CheckCircle2 size={12} className="mr-1"/> 验证通过</div>
                      <div className="font-bold text-gray-700">{gachapon.studentName}</div>
                   </div>
                   <Package size={64} className="text-slate-300 mt-4 animate-bounce" />
                 </div>
              )}

              {/* Spinning */}
              {gachapon.stage === 'spinning' && (
                 <div className="relative h-48 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center"><div className="animate-shake relative"><Gift size={80} className={`${currentPoolMeta[gachapon.tier].iconColor}`} fill="currentColor" fillOpacity={0.2} /><div className="absolute -top-2 -right-2 text-yellow-400 animate-ping"><Zap size={24} fill="currentColor" /></div></div><div className="mt-4 text-lg font-black text-slate-400 animate-pulse">好运抽取中...</div></div>
              )}

              {/* Result */}
              {gachapon.stage === 'result' && (
                 <div className={`relative h-auto bg-gradient-to-b rounded-2xl border-4 flex flex-col items-center justify-center shadow-inner overflow-hidden p-4 ${gachapon.resultType === 'gold' ? 'from-yellow-50 to-white border-yellow-300' : gachapon.resultType === 'funny' ? 'from-green-50 to-white border-green-300' : 'from-slate-50 to-white border-slate-200'}`}>
                   <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.8)_2px,transparent_3px)] [background-size:24px_24px] opacity-50"></div>
                   <div className="relative z-10 flex flex-col items-center animate-pop w-full">
                     {gachapon.resultType === 'funny' ? <Smile size={64} className="text-green-500 mb-2 animate-bounce" /> : <Gift size={64} className="text-rose-500 mb-2 animate-bounce drop-shadow-md" />}
                     
                     <div className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-400">
                       {gachapon.resultType === 'gold' ? '🔥 传说降临 🔥' : gachapon.resultType === 'funny' ? '🤡 命运的玩笑' : '🎉 恭喜中奖'}
                     </div>
                     <div className="font-black text-2xl text-gray-800 px-4 text-center leading-tight mb-3">{gachapon.result}</div>
                     
                     {/* AI 魔法解语 */}
                     <div className="w-full bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-yellow-200 mt-2">
                         <div className="flex items-center text-xs font-bold text-indigo-500 mb-1"><Sparkles size={12} className="mr-1"/> 魔法解语</div>
                         <p className="text-xs text-slate-600 leading-relaxed italic">
                             {gachapon.aiDescription ? gachapon.aiDescription : <span className="flex items-center justify-center"><Loader size={12} className="animate-spin mr-1"/> 精灵正在解读奖品...</span>}
                         </p>
                     </div>
                   </div>
                 </div>
              )}

              {['idle', 'spinning', 'result'].includes(gachapon.stage) && (
                <div className="pt-2">
                  {gachapon.stage === 'idle' && <button onClick={spinGachapon} className={`w-full py-4 rounded-xl font-black text-white text-lg shadow-xl transform active:scale-95 transition-all bg-gradient-to-r from-slate-800 to-black hover:from-slate-700 hover:to-slate-900`}>投入星星 ⚡ 开启</button>}
                  {gachapon.stage === 'spinning' && <button disabled className="w-full py-4 rounded-xl font-bold bg-gray-100 text-gray-400 cursor-not-allowed">机器运转中...</button>}
                  {gachapon.stage === 'result' && <button onClick={handleAcceptPrize} className="w-full py-4 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg transform active:scale-95 transition-all flex items-center justify-center"><Save size={18} className="mr-2"/> 开心收下</button>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Team Detail Modal */}
      {activeGroupId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-indigo-900/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg mx-auto shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-white/50">
            {(() => {
              const activeGroup = groups.find(g => g.id === activeGroupId);
              if (!activeGroup) return null;
              const status = getGroupStatus(activeGroup.avgStars);
              
              return (
                <>
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 flex justify-between items-center shadow-lg z-10">
                    <div className="flex items-center space-x-3"><Users size={24} /><span className="font-bold text-xl tracking-tight">战队详情</span></div>
                    <div className="flex items-center space-x-3"><div className="flex items-center bg-black/20 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm"><span className="text-xs font-bold text-white/80 mr-1">正在录入:</span><span className="text-sm font-black text-white">第 {selectedDay} 天</span></div><button onClick={() => setActiveGroupId(null)} className="text-white/80 hover:text-white hover:bg-white/20 transition-all p-1.5 rounded-full"><X size={24} /></button></div>
                  </div>
                  <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1">
                    <div className="mb-6 bg-white p-4 rounded-2xl shadow-sm border border-indigo-50 group focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-50 transition-all"><label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 block flex items-center"><Edit2 size={12} className="mr-1"/> 战队名称 (点击修改)</label><input type="text" value={activeGroup.name} onChange={(e) => updateTeamName(activeGroup.id, e.target.value)} className="w-full text-2xl font-black text-gray-800 bg-transparent border-b-2 border-indigo-100 focus:border-indigo-500 focus:outline-none py-1 transition-colors placeholder-gray-300" placeholder="点此输入战队名..." /></div>
                    <div className="flex space-x-4 mb-6">
                      <div className={`flex-1 p-4 rounded-2xl ${status.bg} border-2 border-white shadow-sm flex flex-col justify-center items-center`}><div className={`text-xs font-bold mb-1 opacity-70 ${status.color}`}>当前状态</div><div className={`text-xl font-black ${status.color}`}>{status.name}</div></div>
                      <div className="flex-1 p-4 rounded-2xl bg-white border border-gray-100 text-center shadow-sm flex flex-col justify-center items-center"><div className="text-xs text-gray-400 font-bold mb-1">人均星星</div><div className="text-3xl font-black text-gray-800">{activeGroup.avgStars.toFixed(1)}</div></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-3 flex items-center text-sm uppercase tracking-wide opacity-50 pl-1"><Hash size={14} className="mr-1"/> 成员 & 今日加星</h3>
                      <div className="space-y-3">
                        {activeGroup.students.map((student) => {
                          const tier = getTier(student.stars);
                          const currentDayScore = student.history[selectedDay - 1] || 0;
                          const logKey = `${student.id}-${selectedDay}`;
                          const hasHistory = starLogs[logKey] && starLogs[logKey].length > 0;
                          const praise = aiPraise[student.id];
                          const isLeader = leaders[activeGroup.id] === student.id;
                          const totalEarned = student.history.reduce((a, b) => a + (b || 0), 0);

                          return (
                            <div key={student.id} className={`bg-white p-4 rounded-2xl border shadow-sm transition-all hover:shadow-md hover:border-indigo-200 group ${isLeader ? 'border-yellow-300 bg-yellow-50/30' : 'border-gray-100'}`}>
                              <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                                <div className="flex items-center space-x-3">
                                    <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 text-sm flex items-center justify-center font-bold mr-3 border border-indigo-100">#{student.id}</span>
                                    <div>
                                        <div className="font-bold text-gray-800 text-lg flex items-center">
                                            {student.name}
                                            {isLeader && <Crown size={16} className="ml-2 text-yellow-500 fill-yellow-500 animate-pulse" />}
                                            <button onClick={() => generatePraise(student.name, student.id)} className="ml-2 text-indigo-300 hover:text-indigo-500 transition-colors" title="AI夸夸"><MessageCircle size={14}/></button>
                                        </div>
                                        <div className={`text-[10px] ${tier.color} flex items-center font-bold`}><TierIconWrapper icon={tier.icon} size={10} className="mr-1"/>{tier.name}</div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <button 
                                        onClick={() => triggerSetLeader(student, activeGroup.id)} 
                                        className={`mb-1 p-1 rounded-full transition-colors ${isLeader ? 'text-red-400 hover:bg-red-50' : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-50'}`} 
                                        title={isLeader ? "撤销组长" : "设为组长"}
                                    >
                                        <Crown size={16} className={isLeader ? "fill-red-400" : ""} />
                                    </button>
                                    <StarDisplay count={student.stars} />
                                    <div className="text-[10px] text-gray-400 mt-1 font-medium">总计 {student.stars} 颗</div>
                                </div>
                              </div>
                              
                              {loadingPraise[student.id] && <div className="text-xs text-indigo-400 animate-pulse mb-2">✨ AI 正在思考夸奖词...</div>}
                              {praise && <div className="bg-indigo-50 p-2 rounded-lg text-xs text-indigo-700 italic mb-3 border border-indigo-100">“{praise}”</div>}

                              <div className="bg-slate-50 rounded-xl p-3 relative border border-slate-100">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-xs font-bold text-gray-500 flex items-center gap-3">
                                      <span>今日: <span className="text-indigo-600 font-black">{currentDayScore}</span></span>
                                      <span className="text-slate-300">|</span>
                                      <span>历史: <span className="text-amber-600 font-black">{totalEarned}</span></span>
                                  </div>
                                  <div className="flex space-x-2">
                                    {hasHistory && (
                                        <button onClick={() => triggerUndo(student, selectedDay)} className="text-[10px] bg-white border border-rose-200 text-rose-500 px-2 py-1 rounded-md flex items-center font-bold hover:bg-rose-50 transition-colors shadow-sm"><Undo2 size={12} className="mr-1"/> 撤回</button>
                                    )}
                                    {currentDayScore > 0 && (
                                        <button onClick={() => triggerReset(student, selectedDay)} className="text-[10px] text-slate-400 flex items-center hover:text-slate-600 transition-colors"><Trash2 size={10} className="mr-1"/> 清空</button>
                                    )}
                                  </div>
                                </div>
                                <div className="flex space-x-3">
                                  <button onClick={() => { handleAddStar(student.id, selectedDay, 0.5); showNotification(`👍 ${student.name} +0.5 🌟`); }} className="flex-1 group relative flex flex-col items-center justify-center h-14 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-yellow-400 hover:bg-yellow-50 transition-all active:scale-95"><div className="flex items-center text-yellow-500"><Plus size={10} strokeWidth={4} className="mr-1"/><StarHalf size={20} className="fill-yellow-500 drop-shadow-sm group-hover:scale-110 transition-transform" /></div><span className="text-[10px] font-bold text-slate-500 mt-0.5 group-hover:text-yellow-700">加半星</span></button>
                                  <button onClick={() => { handleAddStar(student.id, selectedDay, 1); showNotification(`🎉 ${student.name} +1 🌟`); }} className="flex-1 group relative flex flex-col items-center justify-center h-14 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-400 hover:bg-orange-50 transition-all active:scale-95"><div className="flex items-center text-orange-500"><Plus size={10} strokeWidth={4} className="mr-1"/><Star size={20} className="fill-orange-500 drop-shadow-sm group-hover:scale-110 transition-transform" /></div><span className="text-[10px] font-bold text-slate-500 mt-0.5 group-hover:text-orange-700">加一星</span></button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Main Content Areas */}
      <main className="max-w-5xl mx-auto p-4 mt-6 relative z-10">
        {viewMode === 'redemption' ? (
            <div className="animate-in fade-in zoom-in duration-500 pb-20">
                <div className="bg-white rounded-3xl shadow-xl border-2 border-amber-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center space-x-3">
                            <Gift size={32} className="animate-bounce" />
                            <h2 className="text-2xl font-black tracking-tight">奖品兑换中心</h2>
                        </div>
                        
                        {/* 筛选控件区 */}
                        <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-md p-2 rounded-xl">
                            <div className="flex items-center text-xs font-bold px-2">
                                <Search size={14} className="mr-1"/> 查找奖品:
                            </div>
                            <select 
                                value={redemptionFilterId} 
                                onChange={(e) => setRedemptionFilterId(e.target.value)}
                                className="bg-white text-slate-700 text-sm font-bold py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 border-none cursor-pointer"
                            >
                                <option value="">👀 显示全部学生</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>
                                        #{s.id} {s.name}
                                    </option>
                                ))}
                            </select>
                            <div className="text-xs font-bold bg-white/30 px-3 py-1.5 rounded-lg">
                                待兑: {filteredPendingPrizes.length}
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-slate-50 min-h-[400px]">
                        {filteredPendingPrizes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
                                <Package size={48} className="mb-4 opacity-20" />
                                <p className="font-bold text-lg">
                                    {redemptionFilterId ? '该同学暂无待兑换奖品' : '暂无待兑换奖品'}
                                </p>
                                <p className="text-xs mt-1">快去积攒星星抽奖吧！</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredPendingPrizes.map((prize) => (
                                    <div key={prize.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group hover:shadow-md transition-all">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-md">#{prize.studentId}</span>
                                                <span className="font-bold text-slate-800">{prize.studentName}</span>
                                                <span className="text-xs text-slate-400">• {prize.timestamp}</span>
                                            </div>
                                            <div className="text-lg font-black text-amber-600 flex items-center">
                                                {prize.prizeType === 'funny' ? <Smile size={16} className="mr-1 text-green-500"/> : <Gift size={16} className="mr-1 text-rose-500"/>}
                                                {prize.prizeName}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleRedeemPrize(prize.id)}
                                            className="ml-4 px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-bold rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center whitespace-nowrap"
                                        >
                                            <CheckCircle2 size={16} className="mr-1" /> 确认兑换
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-8 border-t-2 border-dashed border-slate-200 pt-6">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center">
                                <History size={16} className="mr-2"/> 最近已兑换 (点击撤回)
                            </h3>
                            {filteredRedeemedHistory.length === 0 ? (
                                <div className="text-center text-slate-300 text-xs py-4 italic">暂无最近兑换记录</div>
                            ) : (
                                <div className="space-y-3">
                                    {filteredRedeemedHistory.map(prize => (
                                        <div key={prize.id} className="flex justify-between items-center bg-slate-100 p-3 rounded-xl border border-slate-200 opacity-80 hover:opacity-100 transition-opacity">
                                            <div className="flex items-center space-x-3 overflow-hidden">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center text-xs text-slate-500">
                                                        <span className="font-bold mr-1">{prize.studentName}</span>
                                                        <span>兑换了</span>
                                                    </div>
                                                    <div className="font-bold text-slate-700 truncate text-sm">{prize.prizeName}</div>
                                                    <div className="text-[10px] text-slate-400">{prize.redeemedAt}</div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleUndoRedeem(prize.id)}
                                                className="ml-2 px-3 py-1.5 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center shadow-sm active:scale-95 transition-all"
                                            >
                                                <Undo2 size={12} className="mr-1"/> 撤回
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        ) : viewMode === 'team_manage' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <div className="bg-white rounded-3xl shadow-xl border-2 border-indigo-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <Settings size={32} className="animate-spin-slow" />
                            <h2 className="text-2xl font-black tracking-tight">战队与人员管理</h2>
                        </div>
                        <button onClick={addNewStudent} className="bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2 rounded-xl flex items-center transition-all">
                            <UserPlus size={18} className="mr-2"/> 添加新学生
                        </button>
                    </div>

                    <div className="p-6 bg-slate-50">
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">🍃 未分组学生</h3>
                            <div className="flex flex-wrap gap-2 p-4 bg-white rounded-2xl border border-dashed border-slate-300 min-h-[80px]">
                                {students.filter(s => !groupConfig.some(g => g.members.includes(s.name))).length === 0 && (
                                    <span className="text-slate-400 text-sm">所有学生都已加入战队</span>
                                )}
                                {students.filter(s => !groupConfig.some(g => g.members.includes(s.name))).map(s => (
                                    <div key={s.id} className="group relative bg-slate-100 hover:bg-white border hover:border-indigo-200 px-3 py-1.5 rounded-lg flex items-center shadow-sm transition-all">
                                        <span onClick={() => setEditingStudent({id: s.id, name: s.name, oldName: s.name})} className="text-xs font-bold text-slate-500 mr-2 cursor-pointer hover:text-indigo-600">#{s.id}</span>
                                        <span className="font-bold text-slate-700">{s.name}</span>
                                        <select 
                                            className="absolute inset-0 opacity-0 cursor-pointer" 
                                            value="" 
                                            onChange={(e) => moveStudent(s.name, parseInt(e.target.value))}
                                        >
                                            <option value="">移动到...</option>
                                            {groupConfig.map(g => <option key={g.id} value={g.id}>{teamNames[g.id] || `第 ${g.id} 战队`}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {groupConfig.map((group) => (
                                <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="p-3 bg-slate-100/50 border-b border-slate-100 flex justify-between items-center">
                                        <input 
                                            type="text" 
                                            value={teamNames[group.id] || `第 ${group.id} 战队`} 
                                            onChange={(e) => updateTeamName(group.id, e.target.value)}
                                            className="bg-transparent font-bold text-slate-700 focus:outline-none border-b border-transparent focus:border-indigo-300"
                                        />
                                        <span className="text-xs font-bold text-slate-400">{group.members.length} 人</span>
                                    </div>
                                    <div className="p-3 min-h-[100px] space-y-2">
                                        {group.members.map((memberName) => {
                                            const student = students.find(s => s.name === memberName);
                                            if (!student) return null;
                                            return (
                                                <div key={student.id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg group hover:bg-indigo-50 transition-colors">
                                                    <div className="flex items-center cursor-pointer" onClick={() => setEditingStudent({id: student.id, name: student.name, oldName: student.name})}>
                                                        <span className="text-xs font-bold text-slate-400 w-6">#{student.id}</span>
                                                        <span className="text-sm font-bold text-slate-700">{student.name}</span>
                                                        <Edit2 size={10} className="ml-2 text-indigo-300 opacity-0 group-hover:opacity-100"/>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <button onClick={() => moveStudent(memberName, null)} className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded" title="移出战队">
                                                            <UserMinus size={14} />
                                                        </button>
                                                        <div className="relative">
                                                            <button className="p-1 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded">
                                                                <ArrowRightLeft size={14} />
                                                            </button>
                                                            <select 
                                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                                value={group.id}
                                                                onChange={(e) => moveStudent(memberName, parseInt(e.target.value))}
                                                            >
                                                                {groupConfig.map(g => (
                                                                    <option key={g.id} value={g.id} disabled={g.id === group.id}>
                                                                        {teamNames[g.id] || `第 ${g.id} 战队`}
                                                                    </option>
                                                                ))}
                                                                <option value="-1">移出战队</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {group.members.length === 0 && (
                                            <div className="text-center text-xs text-slate-300 py-4 italic">暂无成员，从上方拖入或添加</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        ) : viewMode === 'all_students' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <div className="bg-white rounded-3xl shadow-xl border-2 border-indigo-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-cyan-500 p-6 text-white flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <Users size={32} className="animate-pulse" />
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">全班花名册</h2>
                                <p className="text-xs text-indigo-100 opacity-80">点击学生卡片进行加减分操作</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setSortMode(prev => prev === 'id' ? 'stars' : 'id')}
                                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md transition-all flex items-center shadow-sm border border-white/10"
                                title={sortMode === 'id' ? "切换为按星星数排名" : "切换为按学号排序"}
                            >
                                {sortMode === 'id' ? <Hash size={14} className="mr-1"/> : <Trophy size={14} className="mr-1 text-yellow-300"/>}
                                {sortMode === 'id' ? '排序：学号' : '排序：星星'}
                            </button>
                            <div className="flex items-center bg-black/20 px-4 py-2 rounded-xl backdrop-blur-md">
                                <span className="text-xs font-bold text-white/80 mr-2">班级总星数</span>
                                <span className="text-xl font-black text-yellow-300">{totalClassStars}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 min-h-[500px]">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {(() => {
                                const sortedList = [...students].sort((a, b) => {
                                    if (sortMode === 'stars') {
                                        return b.stars - a.stars || a.id - b.id;
                                    }
                                    return a.id - b.id;
                                });

                                return sortedList.map((student, index) => {
                                    const score = student.history[selectedDay - 1] || 0;
                                    const rank = index + 1;
                                    
                                    return (
                                        <button 
                                            key={student.id}
                                            onClick={() => setSelectedStudentForAction(student)}
                                            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center hover:shadow-md hover:border-indigo-300 hover:-translate-y-1 transition-all group relative overflow-hidden"
                                        >
                                            {sortMode === 'stars' && (
                                                <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm z-20 ${
                                                    rank === 1 ? 'bg-yellow-400 text-white ring-2 ring-yellow-200' :
                                                    rank === 2 ? 'bg-slate-300 text-slate-600 ring-2 ring-slate-100' :
                                                    rank === 3 ? 'bg-orange-300 text-white ring-2 ring-orange-100' :
                                                    'bg-slate-100 text-slate-400'
                                                }`}>
                                                    {rank}
                                                </div>
                                            )}

                                            <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-50 rounded-bl-full -mr-2 -mt-2 z-0"></div>
                                            <div className="relative z-10 flex flex-col items-center">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors border-2 border-white shadow-sm overflow-hidden">
                                                    {student.avatar ? (
                                                        <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        student.id
                                                    )}
                                                </div>
                                                <div className="font-bold text-slate-700 mb-1 group-hover:text-indigo-700">{student.name}</div>
                                                
                                                <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                                    <Star size={10} className="fill-amber-400 text-amber-500" />
                                                    <span className="text-xs font-black text-amber-600">{student.stars}</span>
                                                </div>

                                                {score !== 0 && (
                                                    <div className={`mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md ${score > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                        今日 {score > 0 ? '+' : ''}{score}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        ) : viewMode === 'dashboard' ? (
          <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Hero Banner */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-500 bg-[length:200%_auto] animate-bg-pan rounded-3xl p-8 text-white text-center shadow-xl shadow-indigo-200 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle,white_10%,transparent_20%)] [background-size:20px_20px]"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
                
                <div className="flex justify-between items-center mb-6 relative z-20">
                    <button 
                        onClick={handlePrevDay} 
                        disabled={selectedDay <= 1} 
                        className={`p-2 rounded-full bg-white/20 backdrop-blur-sm transition-all ${selectedDay <= 1 ? 'opacity-0 cursor-default' : 'opacity-100 hover:bg-white/30 text-white hover:scale-110'}`} 
                        title="前一天"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    
                    <div className="relative group">
                        <select 
                            value={selectedDay} 
                            onChange={(e) => setSelectedDay(Number(e.target.value))}
                            className="appearance-none bg-black/20 hover:bg-black/30 text-white font-black text-sm sm:text-base py-2 pl-6 pr-8 rounded-full border border-white/20 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/50 transition-all cursor-pointer text-center"
                        >
                            {Array.from({ length: maxDay }, (_, i) => (
                                <option key={i+1} value={i+1} className="text-slate-800">📅 第 {i+1} 天</option>
                            ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/70">
                            <ChevronRight size={14} className="rotate-90" />
                        </div>
                    </div>

                    <button 
                        onClick={handleNextDay} 
                        className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white hover:scale-110 transition-all relative group" 
                        title="进入下一天"
                    >
                        <ChevronRight size={24} />
                        {selectedDay === maxDay && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}
                    </button>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold mb-2 relative z-10 tracking-tight opacity-90 uppercase flex items-center justify-center"><Rocket size={20} className="mr-2"/> 504班 · 荣耀殿堂</h2>
                <div className="text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-500 drop-shadow-lg my-6 flex justify-center items-center relative z-10 animate-pulse-glow">
                  <Star size={64} className="fill-yellow-400 text-yellow-600 mr-4 animate-spin-slow drop-shadow-lg" />
                  {totalClassStars}
                </div>
                <p className="text-lg sm:text-xl font-medium relative z-10 bg-white/10 backdrop-blur-md inline-block px-8 py-2 rounded-full border border-white/20">
                  ✨ 聚沙成塔 · 汇星成河 · 504班势不可挡！ ✨
                </p>

                <div className="mt-6 pt-6 border-t border-white/20 relative z-20 flex flex-col items-center gap-4">
                    {dailyChampions[selectedDay] ? (
                      <div className="animate-pop text-center">
                         <div className="text-xs font-bold text-yellow-200 uppercase tracking-widest mb-1">📅 第 {selectedDay} 天 · 今日冠军</div>
                         <div className="text-2xl font-black text-white flex items-center justify-center gap-2">
                            <Trophy className="text-yellow-300" size={24} />
                            {dailyChampions[selectedDay]}
                            <Trophy className="text-yellow-300" size={24} />
                         </div>
                         <button onClick={handleSelectChampion} className="mt-2 text-[10px] bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full transition-colors flex items-center justify-center mx-auto pointer-events-auto relative z-30">
                           <RotateCcw size={10} className="mr-1"/> 更新评选
                         </button>
                      </div>
                    ) : (
                      <button onClick={handleSelectChampion} className="bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-900 font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center mx-auto pointer-events-auto relative z-30">
                         <Trophy size={18} className="mr-2" /> 选拔第 {selectedDay} 天冠军战队
                      </button>
                    )}
                </div>
            </div>

            {/* Leaderboard */}
            <div>
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-2xl font-black text-slate-800 flex items-center"><TrendingUp className="mr-3 text-indigo-500" size={28}/> 战队龙虎榜</h2>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsBatchAddOpen(true)}
                        className="text-xs font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-2 rounded-full shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center border border-yellow-200"
                    >
                        <Sparkles size={14} className="mr-1 fill-white" /> 全员加星
                    </button>
                    <div className="text-sm font-medium text-slate-400 flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
                        <Sparkles size={14} className="mr-1 text-yellow-500"/>点击卡片管理
                    </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {groups.map(group => {
                  const status = getGroupStatus(group.avgStars);
                  const progress = Math.min((group.avgStars / 15) * 100, 100);
                  const bonusKey = `${group.id}-${selectedDay}`;
                  const hasBonus = teamBonuses[bonusKey];
                  
                  return (
                    <button 
                      key={group.id} 
                      onClick={() => setActiveGroupId(group.id)}
                      className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-white hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group text-left relative overflow-hidden"
                    >
                      <div className={`absolute top-0 right-0 w-24 h-24 ${status.bg} opacity-20 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-125`}></div>
                      
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                          <h3 className="font-bold text-xl flex items-center text-slate-700 group-hover:text-indigo-700 transition-colors">
                              {group.name}
                              {hasBonus && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-r from-yellow-200 to-amber-300 text-amber-800 shadow-sm animate-pulse-glow border border-amber-200" title="今日共同富裕达成！">
                                    <Coins size={12} className="mr-1 fill-amber-700" /> 共同富裕
                                </span>
                              )}
                          </h3>
                          <span className={`text-[10px] px-2 py-1 rounded-full border border-current opacity-80 font-bold mt-2 inline-block ${status.color} bg-white/50`}>{status.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-4xl font-black text-slate-800 tracking-tighter group-hover:text-indigo-600 transition-colors">{group.totalStars}</span>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mt-1">Total Stars</span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-slate-100 rounded-full h-3 mb-4 relative z-10 overflow-hidden shadow-inner">
                        <div className={`h-3 rounded-full transition-all duration-1000 ${group.avgStars >= 15 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 'bg-gradient-to-r from-indigo-400 to-purple-500'}`} style={{ width: `${progress}%` }}></div>
                      </div>
                      
                      <div className="flex justify-between items-end relative z-10">
                        <div className="flex -space-x-2 pl-2">
                          {group.students.map(s => (
                            <div key={s.id} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm transition-transform hover:-translate-y-1 hover:z-20 ${s.stars>=15?'bg-amber-100 text-amber-700':s.stars>=1?'bg-indigo-50 text-indigo-700':'bg-slate-100 text-slate-400'}`} title={s.name}>
                              {s.name[0]}
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-indigo-400 font-bold flex items-center group-hover:translate-x-1 transition-transform bg-indigo-50 px-2 py-1 rounded-lg group-hover:bg-indigo-100">进入战队 <ChevronRight size={14}/></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prize Pools */}
            <div>
              <div className="flex items-center justify-between mb-6 px-2 mt-12">
                <h2 className="text-2xl font-black text-slate-800 flex items-center"><Award className="mr-3 text-pink-500" size={28}/> 幸运奖池</h2>
                <div className="text-sm font-medium text-slate-400 flex items-center bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">👆 点击开启扭蛋</div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                {Object.keys(currentPoolMeta).filter(key => key !== 'destiny').map((key) => {
                  const meta = currentPoolMeta[key];
                  const poolItems = prizes[key] || [];
                  return (
                    <button key={key} onClick={() => openGachapon(key)} className={`relative bg-white p-6 rounded-3xl shadow-lg border-2 ${meta.shadow} border-white hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 text-center group overflow-hidden`}>
                      <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${meta.gradient}`}></div>
                      
                      {key === 'bronze' && <div className="absolute top-4 right-4 text-pink-200 animate-bounce"><HelpCircle size={16} /></div>}
                      {key === 'silver' && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                              <div className="w-24 h-24 border border-purple-200 rounded-full animate-spin-slow absolute top-8"></div>
                              <div className="absolute top-10 right-8 text-purple-300 animate-pulse"><Sparkles size={14} /></div>
                          </div>
                      )}
                      {key === 'gold' && <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-100 rounded-full opacity-0 group-hover:opacity-50 transition-opacity blur-2xl"></div>}

                      <div className={`relative inline-flex items-center justify-center p-4 rounded-2xl bg-gradient-to-br ${meta.gradient} text-white mb-4 shadow-md z-10 group-hover:scale-110 transition-transform duration-300 ${key === 'bronze' ? 'group-hover:animate-wiggle' : ''} ${key === 'gold' ? 'group-hover:animate-pulse-glow' : ''}`}>
                          <TierIconWrapper icon={meta.icon} size={32} />
                      </div>
                      <div className={`text-xl font-black ${meta.iconColor.replace('text-white', key === 'bronze' ? 'text-pink-500' : key === 'silver' ? 'text-purple-600' : 'text-amber-500')} mb-1`}>{meta.title}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 relative z-10">{meta.slogan}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">需 {meta.cost} 颗星</div>
                      <div className="text-[10px] text-slate-500 bg-slate-50 rounded-lg p-2 leading-relaxed h-12 overflow-hidden">
                        {poolItems && poolItems.length > 0 ? (
                             `内含: ${poolItems.slice(0, 3).map(i => i.name.split('：')[0]).join('、')}...`
                        ) : (
                             "暂无奖品"
                        )}
                      </div>
                      <div className={`mt-4 text-xs font-bold text-white bg-gradient-to-r ${meta.gradient} py-3 rounded-xl shadow-md group-hover:shadow-lg transition-all active:scale-95`}>
                          <span className="relative z-10">点击抽奖</span>
                          {key === 'gold' && <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]"></div>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {appMode === 'final' && currentPoolMeta.destiny && (
                  <div className="w-full">
                     <button 
                        onClick={() => openGachapon('destiny')} 
                        className={`relative w-full bg-white p-6 rounded-3xl shadow-lg border-2 ${currentPoolMeta.destiny.shadow} border-white hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 text-center group overflow-hidden flex flex-col items-center justify-center`}
                      >
                        <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${currentPoolMeta.destiny.gradient}`}></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-100 rounded-full opacity-50 blur-xl"></div>
                        <div className="absolute top-4 right-10 text-cyan-200 animate-pulse delay-700"><Star size={24} /></div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                          <div className={`relative inline-flex items-center justify-center p-5 rounded-2xl bg-gradient-to-br ${currentPoolMeta.destiny.gradient} text-white shadow-md z-10 group-hover:rotate-12 transition-transform duration-500`}>
                              <TierIconWrapper icon={currentPoolMeta.destiny.icon} size={40} />
                          </div>
                          <div className="text-center sm:text-left">
                             <div className={`text-2xl font-black text-slate-800 mb-1`}>{currentPoolMeta.destiny.title}</div>
                             <div className="text-sm font-bold text-cyan-500 uppercase tracking-widest mb-1">{currentPoolMeta.destiny.slogan}</div>
                             <div className="text-xs text-slate-400">需 {currentPoolMeta.destiny.cost} 颗星 · 包含全服奖品 + 30% 搞怪惩罚！</div>
                          </div>
                          <div className={`mt-4 sm:mt-0 px-8 py-3 text-sm font-bold text-white bg-gradient-to-r ${currentPoolMeta.destiny.gradient} rounded-xl shadow-md group-hover:shadow-lg transition-all active:scale-95`}>
                              挑战命运 (概率一览: 👑10% | 🔮20% | 🎁40% | 🤡30%)
                          </div>
                        </div>
                      </button>
                  </div>
              )}
            </div>

            {/* Lucky History Ticker */}
            <div className="mt-12 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center"><History className="mr-2 text-indigo-500" size={24}/> 🏆 幸运锦鲤榜</h2>
              
              <div className="relative h-48 overflow-hidden rounded-xl bg-slate-50/50 border border-slate-100">
                {lotteryHistory.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-slate-400 font-medium">暂无中奖记录，快来试试手气！</div>
                ) : (
                  <div className="absolute w-full animate-scroll-up">
                    {[...lotteryHistory, ...lotteryHistory].map((record, index) => (
                      <div key={`${record.id}-${index}`} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-0 hover:bg-white transition-colors">
                         <div className="flex items-center truncate">
                           <span className="font-bold text-indigo-700 mr-2">{record.studentName}</span>
                           <span className="text-xs text-slate-400 mr-2">在</span>
                           <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">{record.tierTitle}</span>
                           <span className="text-xs text-slate-400 mx-2">抽中了</span>
                         </div>
                         <div className="font-bold text-rose-500 text-sm whitespace-nowrap">{record.prize}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex items-center justify-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                <Megaphone size={18} className="text-orange-500 mr-2 animate-bounce" />
                <span className="text-sm font-bold text-orange-700 tracking-wide">越努力，越幸运！下一位传说级锦鲤就是你！</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-indigo-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center"><Edit2 className="mr-2 text-indigo-500"/> 成绩录入控制台</h2>
                <p className="text-sm text-slate-500 mt-1">当前操作日期：<span className="font-bold text-indigo-600">第 {selectedDay} 天</span></p>
                
                <button 
                    onClick={() => setViewMode('team_manage')}
                    className="mt-2 text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5 rounded-lg font-bold flex items-center w-fit transition-colors"
                >
                    <Settings size={14} className="mr-1"/> 进入战队管理
                </button>
              </div>
              <div className="flex items-center bg-slate-100 rounded-xl p-1">
                <select value={selectedDay} onChange={(e) => setSelectedDay(Number(e.target.value))} className="bg-transparent border-none text-slate-700 font-bold text-lg focus:ring-0 cursor-pointer py-1 px-3 outline-none">
                    {Array.from({length: maxDay}, (_, i) => (<option key={i+1} value={i+1}>第 {i+1} 天</option>))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              <button onClick={() => batchSetScore(1)} className="flex-shrink-0 px-6 py-3 bg-emerald-100 text-emerald-700 font-bold rounded-xl border border-emerald-200 hover:bg-emerald-200 transition-colors shadow-sm active:scale-95 flex items-center"><CheckCircle2 size={18} className="mr-2"/> 全员全对 (1星)</button>
              <button onClick={() => batchSetScore(0.5)} className="flex-shrink-0 px-6 py-3 bg-amber-100 text-amber-700 font-bold rounded-xl border border-amber-200 hover:bg-amber-200 transition-colors shadow-sm active:scale-95 flex items-center"><CheckCircle2 size={18} className="mr-2"/> 全员订正 (0.5星)</button>
              <button onClick={() => batchSetScore(0)} className="flex-shrink-0 px-6 py-3 bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 hover:bg-rose-200 transition-colors shadow-sm active:scale-95 flex items-center"><RotateCcw size={18} className="mr-2"/> 重置当天</button>
            </div>

            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-200 rounded-full opacity-50 blur-xl"></div>
                <h3 className="text-sm font-bold text-indigo-800 mb-4 flex items-center relative z-10"><Save size={18} className="mr-2"/> 数据安全中心</h3>
                <div className="flex gap-4 relative z-10">
                    <button onClick={handleExportData} className="flex-1 py-3 px-4 bg-white border border-indigo-200 rounded-xl text-indigo-700 text-sm font-bold hover:bg-indigo-50 flex items-center justify-center transition-all shadow-sm hover:shadow-md"><Download size={18} className="mr-2"/> 💾 导出备份</button>
                    <button onClick={handleImportClick} className="flex-1 py-3 px-4 bg-white border border-indigo-200 rounded-xl text-indigo-700 text-sm font-bold hover:bg-indigo-50 flex items-center justify-center transition-all shadow-sm hover:shadow-md"><Upload size={18} className="mr-2"/> 📂 恢复数据</button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                </div>
                <p className="text-[10px] text-indigo-400 mt-3 text-center font-medium">建议每周五导出一次备份，文件可存至U盘或微信</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map(student => {
                const score = student.history[selectedDay - 1] || 0;
                const totalEarned = student.history.reduce((a, b) => a + (b || 0), 0);
                return (
                  <div key={student.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3 hover:shadow-md transition-shadow group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center"><span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 text-sm flex items-center justify-center font-bold mr-3 border border-indigo-100">{student.id}</span><span className="font-bold text-slate-700">{student.name}</span></div>
                      <div className="flex space-x-1">
                        <button onClick={() => updateScoreDirectly(student.id, selectedDay, 1)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${score === 1 ? 'bg-emerald-500 text-white shadow-lg ring-2 ring-emerald-200' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}`}><Star size={16} fill="currentColor" /></button>
                        <button onClick={() => updateScoreDirectly(student.id, selectedDay, 0.5)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-xs font-bold ${score === 0.5 ? 'bg-amber-400 text-white shadow-lg ring-2 ring-amber-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>½</button>
                        <button onClick={() => updateScoreDirectly(student.id, selectedDay, 0)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${score === 0 ? 'bg-rose-500 text-white shadow-lg ring-2 ring-rose-200' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}`}><X size={16} /></button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-500">
                        <div className="flex items-center">
                            <span className="mr-1">📅 今日:</span>
                            <span className={`font-bold ${score > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>{score}</span>
                        </div>
                        <div className="h-3 w-px bg-slate-200 mx-2"></div>
                        <div className="flex items-center">
                            <span className="mr-1">🏛️ 历史:</span>
                            <span className="font-bold text-amber-500">{totalEarned}</span>
                        </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
      <footer className="text-center text-slate-400 text-xs py-8 font-medium relative z-10"><p>速度与激情 (Speed and Passion) 504班专属</p><p className="opacity-70 mt-1">Design by 金老师 & AI Assistant</p></footer>
    </div>
  );
}
