import React, { useState, useRef, useEffect } from 'react';
import Game from './components/Game';
import ChapterArtwork from './components/ChapterArtwork';
import { GameState, InventoryItem, EquippedState, Rarity, EquipmentType, Skin, UserProfile } from './types';
import { SKINS, CHAPTERS, rarityProgression } from './constants';
import { 
  Play, Trophy, Skull, User, Settings, ShoppingCart, 
  Gem, Coins, Package, 
  Sword, Shield, Footprints, Shirt, Box, Hammer, Trash2, Layers,
  Key, Clock, Scroll, FileText, Sparkles, X, ArrowRight, CheckCircle, Crown, Lock, ArrowLeft, Gift, Star, Hand, BookOpen, Calculator,
  Flame, Snowflake, Ghost, Crosshair, Aperture
} from 'lucide-react';
import ItemIcon from './components/ItemIcon';
import { ITEM_VARIANTS } from './data/ItemData';

// Helper to get random item name from data
const getRandomItemName = (type: EquipmentType): string => {
  const allNames = Object.keys(ITEM_VARIANTS);
  const names: Record<EquipmentType, string[]> = {
    WEAPON: ['Baseball Bat', 'Katana', 'Shotgun', 'Revolver', 'Kunai', 'Magic Staff'],
    NECKLACE: ['Emerald Necklace', 'Thorn Necklace', 'Metal Necklace', 'Bone Necklace', 'Crystal Talisman', 'Golden Chain'],
    GLOVES: ['Leather Gloves', 'Shining Gloves', 'Destroyer Gloves', 'Military Gloves', "Ruler's Gloves", 'Void Gauntlets'],
    SUIT: ['Metal Suit', 'Traveler Cloak', 'Bulletproof Vest', 'Military Uniform', 'Shadow Tunic', 'Full Plate'],
    BELT: ['Energy Belt', 'Leather Belt', 'Fashion Belt', 'Military Belt', 'Champion Belt', 'Assassin Sash'],
    BOOTS: ['Military Boots', 'Energy Runners', 'Prosthetic Leg', 'High Boots', 'Ninja Tabi', 'Iron Greaves']
  };
  const list = names[type] || [];
  return list[Math.floor(Math.random() * list.length)] || 'Unknown';
};

const CharacterPreview = ({ skinId }: { skinId: string }) => {
    const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
    
    // Renders the specific visual for the skin type
    const renderSkinVisual = () => {
        const type = skin.effectType;

        if (type === 'FIRE') {
            return (
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-orange-500 blur-[60px] opacity-40 animate-pulse"></div>
                    <div className="relative z-10 w-40 h-40 flex items-center justify-center animate-[bounce_3s_infinite]">
                        <Flame className="w-full h-full text-orange-500 fill-yellow-500 drop-shadow-[0_0_25px_rgba(234,88,12,0.8)] filter contrast-125" strokeWidth={1} />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 bg-yellow-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        </div>
                    </div>
                    {/* Floating Embers */}
                    <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                    <div className="absolute bottom-10 left-0 w-2 h-2 bg-red-500 rounded-full animate-ping delay-150"></div>
                    <div className="absolute inset-[-20px] border-t-4 border-orange-600 rounded-full animate-[spin_3s_linear_infinite] opacity-60"></div>
                </div>
            );
        }
        
        if (type === 'ICE') {
            return (
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-cyan-400 blur-[50px] opacity-30"></div>
                    <div className="relative z-10 w-36 h-36 flex items-center justify-center">
                        <Snowflake className="w-full h-full text-cyan-200 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)] animate-[spin_10s_linear_infinite]" strokeWidth={1} />
                        <Snowflake className="absolute w-20 h-20 text-white opacity-80 animate-[spin_5s_linear_infinite_reverse]" strokeWidth={2} />
                    </div>
                    {/* Ice Shards */}
                    <div className="absolute inset-[-10px] border-2 border-cyan-300 rounded-full opacity-40 animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[2px] bg-gradient-to-r from-transparent via-cyan-200 to-transparent rotate-45"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[2px] bg-gradient-to-r from-transparent via-cyan-200 to-transparent -rotate-45"></div>
                </div>
            );
        }

        if (type === 'VOID') {
            return (
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-purple-900 blur-[60px] opacity-50"></div>
                    <div className="relative z-10 w-36 h-36 bg-black rounded-full flex items-center justify-center shadow-[0_0_50px_#7c3aed] border-4 border-purple-800 overflow-hidden">
                        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] opacity-20 animate-[spin_4s_linear_infinite]"></div>
                        <Aperture className="w-24 h-24 text-purple-500 animate-[spin_8s_linear_infinite]" strokeWidth={1} />
                        <div className="absolute w-10 h-10 bg-black rounded-full shadow-[0_0_20px_#000]"></div>
                    </div>
                    <div className="absolute inset-[-30px] border border-purple-500/30 rounded-full animate-ping"></div>
                </div>
            );
        }

        if (type === 'MECHA') {
            return (
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-blue-500 blur-[40px] opacity-20"></div>
                    <div className="relative z-10 w-40 h-40 flex items-center justify-center">
                        <Crosshair className="w-full h-full text-blue-400 drop-shadow-[0_0_10px_#3b82f6] animate-[spin_20s_linear_infinite]" strokeWidth={0.5} />
                        <div className="absolute inset-0 border-4 border-dashed border-blue-300 rounded-full animate-[spin_10s_linear_infinite_reverse] opacity-50"></div>
                        <div className="absolute inset-[20%] border-2 border-cyan-400 rounded-lg animate-pulse"></div>
                        <Shield className="absolute w-16 h-16 text-white fill-blue-900/50" />
                    </div>
                    {/* Scanning Line */}
                    <div className="absolute inset-0 overflow-hidden rounded-full">
                        <div className="w-full h-1 bg-cyan-400 blur-sm animate-[ping_2s_infinite]"></div>
                    </div>
                </div>
            );
        }

        if (type === 'GHOST') {
            return (
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-green-500 blur-[50px] opacity-30"></div>
                    <div className="relative z-10 w-36 h-36 flex items-center justify-center animate-[bounce_2s_infinite]">
                        <Ghost className="w-full h-full text-green-400 fill-green-900/50 drop-shadow-[0_0_15px_#4ade80]" strokeWidth={1.5} />
                    </div>
                    <div className="absolute bottom-0 w-24 h-4 bg-green-500/50 blur-lg rounded-[100%] animate-pulse"></div>
                    <div className="absolute -top-4 -right-4 w-4 h-4 bg-green-300 rounded-full animate-ping"></div>
                </div>
            );
        }

        if (type === 'GOLD') {
            return (
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-yellow-500 blur-[50px] opacity-40"></div>
                    <div className="relative z-10 w-36 h-36 flex items-center justify-center">
                        <div className="absolute inset-0 border-[6px] border-yellow-300 rounded-full border-t-transparent animate-[spin_2s_linear_infinite]"></div>
                        <Crown className="w-24 h-24 text-yellow-300 fill-yellow-500 drop-shadow-[0_0_20px_#facc15]" strokeWidth={2} />
                    </div>
                    <Sparkles className="absolute top-0 right-0 w-8 h-8 text-yellow-100 animate-pulse" />
                    <Sparkles className="absolute bottom-0 left-0 w-6 h-6 text-yellow-200 animate-pulse delay-75" />
                </div>
            );
        }

        if (type === 'BLOOD') {
            return (
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-red-900 blur-[60px] opacity-60"></div>
                    <div className="relative z-10 w-40 h-40 flex items-center justify-center">
                        <Sword className="w-32 h-32 text-red-600 fill-red-900 rotate-45 drop-shadow-[0_0_15px_#dc2626]" strokeWidth={1} />
                        <Sword className="absolute w-32 h-32 text-red-600 fill-red-900 -rotate-45 drop-shadow-[0_0_15px_#dc2626] opacity-70" strokeWidth={1} />
                    </div>
                    <div className="absolute inset-0 border-2 border-red-500 rounded-full animate-ping opacity-30"></div>
                </div>
            );
        }

        if (type === 'LIGHTNING') {
             // ... Lightning Render (omitted for brevity, assume similar logic)
             return null;
        }

        if (type === 'PIXEL') {
            return (
                <div className="relative flex items-center justify-center group">
                    <div className="absolute inset-0 bg-pink-500 blur-[40px] opacity-30"></div>
                    <div className="relative z-10 w-32 h-32 bg-gray-900 border-4 border-cyan-400 flex items-center justify-center shadow-[5px_5px_0px_#ec4899]">
                        <User className="w-20 h-20 text-cyan-400" />
                        <div className="absolute inset-0 bg-scanline opacity-10 pointer-events-none"></div>
                    </div>
                    <div className="absolute -top-4 -left-4 w-4 h-4 bg-yellow-400 animate-bounce"></div>
                    <div className="absolute -bottom-4 -right-4 w-4 h-4 bg-green-400 animate-bounce delay-75"></div>
                </div>
            );
        }

        if (type === 'TOXIC') {
             return (
                <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-lime-500 blur-[50px] opacity-40"></div>
                    <div className="relative z-10 w-36 h-36 flex items-center justify-center animate-[pulse_3s_infinite]">
                        <div className="absolute inset-0 bg-lime-900/50 rounded-full blur-md"></div>
                        <Skull className="w-24 h-24 text-lime-400 drop-shadow-[0_0_15px_#a3e635]" />
                    </div>
                    <div className="absolute inset-0 flex justify-center items-center">
                         <div className="w-40 h-40 border-4 border-dotted border-lime-600 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    </div>
                    <div className="absolute top-0 w-3 h-3 bg-lime-300 rounded-full animate-ping"></div>
                </div>
            );
        }

        // Default Skin
        return (
            <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-500 blur-[40px] opacity-30"></div>
                <div className="relative z-10 w-36 h-36 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gray-800 rounded-full border-4 border-gray-600"></div>
                    <User className="relative z-10 w-24 h-24 text-gray-300" />
                </div>
            </div>
        );
    };

    return (
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center transition-all duration-300">
            {/* The Visual Render */}
            {renderSkinVisual()}

            {/* Name Tag */}
            <div className={`absolute -bottom-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg transform translate-y-2 border z-20 ${
                skin.rarity === 'MYTHIC' ? 'bg-purple-900 text-purple-100 border-purple-500 shadow-purple-500/50' : 
                (skin.rarity === 'LEGENDARY' ? 'bg-red-900 text-red-100 border-red-500 shadow-red-500/50' : 
                (skin.rarity === 'EPIC' ? 'bg-yellow-900 text-yellow-100 border-yellow-500 shadow-yellow-500/50' : 'bg-gray-800 text-gray-300 border-gray-600'))
            }`}>
                {skin.name}
            </div>
        </div>
    );
};

// Simplified Slot Component that wraps ItemIcon
const EquipmentSlot: React.FC<{ slotType: EquipmentType; item: InventoryItem | null; onUnequip: (slot: EquipmentType) => void; }> = ({ slotType, item, onUnequip }) => {
    let DefaultIcon = Box;
    if (slotType === 'WEAPON') DefaultIcon = Sword;
    if (slotType === 'NECKLACE') DefaultIcon = Gem;
    if (slotType === 'GLOVES') DefaultIcon = Hand;
    if (slotType === 'SUIT') DefaultIcon = Shirt;
    if (slotType === 'BELT') DefaultIcon = Shield;
    if (slotType === 'BOOTS') DefaultIcon = Footprints;

    if (!item) {
        return (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-gray-700 bg-gray-800/50 flex items-center justify-center shadow-inner">
                <DefaultIcon className="w-6 h-6 text-gray-600" />
            </div>
        );
    }

    return (
        <ItemIcon 
            name={item.name} 
            rarity={item.rarity} 
            size="md" 
            onClick={() => onUnequip(slotType)} 
            showName={true}
        />
    );
};

const InventorySlot: React.FC<{ item: InventoryItem; onClick?: () => void; isSelected?: boolean }> = ({ item, onClick, isSelected }) => {
    return (
        <div className="relative" onClick={onClick}>
            <ItemIcon name={item.name} rarity={item.rarity} size="md" />
            {isSelected && (
                <div className="absolute inset-0 border-2 border-red-500 rounded-xl bg-red-500/20 z-20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-red-500 fill-white" />
                </div>
            )}
        </div>
    );
};

type MergeSummary = { from: InventoryItem, to: InventoryItem, count: number }[];

const Header = ({ currentUser, keys, gold, gems, onAddCurrency }: { currentUser: UserProfile | null; keys: number; gold: number; gems: number; onAddCurrency: () => void; }) => {
  if (!currentUser) return null;
  return (
    <div className="p-3 flex justify-between items-center bg-gray-800 flex-shrink-0 border-b border-gray-700/50 shadow-md z-30 relative">
      <div className="bg-gray-900/80 px-3 py-1.5 rounded-xl flex items-center gap-2 border border-gray-600"><User className="w-6 h-6 text-blue-400" /><div><div className="font-bold text-sm text-white">{currentUser.username}</div><div className="text-[10px] text-gray-400">LV.{currentUser.accountLevel} Survivor</div></div></div>
      <div className="flex items-center gap-2">
        <div className="bg-gray-900/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-gray-600"><Key className="w-4 h-4 text-purple-400" /><span className="font-bold text-sm text-white">{keys}</span></div>
        <div className="bg-gray-900/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-gray-600"><Coins className="w-4 h-4 text-yellow-400" /><span className="font-bold text-sm text-white">{gold.toLocaleString()}</span><button onClick={onAddCurrency} className="w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-green-400">+</button></div>
        <div className="bg-gray-900/80 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-gray-600"><Gem className="w-4 h-4 text-green-400" /><span className="font-bold text-sm text-white">{gems.toLocaleString()}</span><button onClick={onAddCurrency} className="w-4 h-4 bg-green-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-green-400">+</button></div>
      </div>
    </div>
  );
};

const SurvivorGameApp: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [activeTab, setActiveTab] = useState<'SHOP' | 'EQUIPMENT' | 'HOME' | 'RANKING' | 'SETTINGS'>('HOME');
  const [finalScore, setFinalScore] = useState(0);
  const [activeModal, setActiveModal] = useState<'NONE' | 'MERGE' | 'DISMANTLE' | 'WARDROBE' | 'RARITY_GUIDE'>('NONE');
  const [selectedChapterId, setSelectedChapterId] = useState(1);
  const [unlockedChapter, setUnlockedChapter] = useState(1);
  const [gold, setGold] = useState(50000);
  const [gems, setGems] = useState(1250);
  const [keys, setKeys] = useState(3);
  const [purchasedDaily, setPurchasedDaily] = useState<string[]>([]);
  const [gachaLevel, setGachaLevel] = useState(1);
  const [gachaXp, setGachaXp] = useState(0);
  const [gachaResults, setGachaResults] = useState<InventoryItem[] | null>(null);
  const lastGachaPullRef = useRef<{ type: 'GEM' | 'KEY', costPerUnit: number, count: number } | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [dismantleSelection, setDismantleSelection] = useState<Set<string>>(new Set());
  const [dismantleConfirmMode, setDismantleConfirmMode] = useState(false);
  const [mergeResults, setMergeResults] = useState<MergeSummary | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [ownedSkins, setOwnedSkins] = useState<string[]>(['skin_default']);
  const [equippedSkinId, setEquippedSkinId] = useState<string>('skin_default');
  const [equipped, setEquipped] = useState<EquippedState>({
    WEAPON: { id: 'init_w', type: 'WEAPON', rarity: 'COMMON', name: 'Kunai' },
    NECKLACE: null, GLOVES: null, SUIT: { id: 'init_s', type: 'SUIT', rarity: 'COMMON', name: 'Traveler Cloak' }, BELT: null, BOOTS: null,
  });
  const [customGemAmount, setCustomGemAmount] = useState(100);
  const [purchaseConfirmation, setPurchaseConfirmation] = useState<{ gems: number, price: string } | null>(null);
  const GEM_PRICE_IN_WON = 20;
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => { const initAudio = () => { if (!audioContextRef.current) { try { audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch (e) { console.error("Web Audio API is not supported"); } } if (audioContextRef.current && audioContextRef.current.state === 'suspended') { audioContextRef.current.resume(); } window.removeEventListener('click', initAudio); window.removeEventListener('touchstart', initAudio); }; window.addEventListener('click', initAudio); window.addEventListener('touchstart', initAudio); return () => { window.removeEventListener('click', initAudio); window.removeEventListener('touchstart', initAudio); if (audioContextRef.current && audioContextRef.current.state !== 'closed') { audioContextRef.current.close().catch(console.error); audioContextRef.current = null; } }; }, []);
  const showNotification = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };
  const playShopSound = (type: 'click' | 'purchase' | 'free_claim') => { if (!audioContextRef.current) return; const ctx = audioContextRef.current; const t = ctx.currentTime; switch (type) { case 'click': { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(440, t); gain.gain.setValueAtTime(0.2, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1); osc.connect(gain).connect(ctx.destination); osc.start(t); osc.stop(t + 0.1); break; } case 'purchase': { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(1046, t); gain.gain.setValueAtTime(0.2, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1); osc.connect(gain).connect(ctx.destination); osc.start(t); osc.stop(t + 0.1); break; } case 'free_claim': { [523, 659, 783].forEach((freq, i) => { const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(freq, t + i * 0.08); gain.gain.setValueAtTime(0.2, t + i * 0.08); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3); osc.connect(gain).connect(ctx.destination); osc.start(t + i * 0.08); osc.stop(t + 0.3); }); break; } } };
  
  useEffect(() => { const storedUsers = JSON.parse(localStorage.getItem('survivor_users') || '{}'); const defaultUsername = 'Player'; let user = storedUsers[defaultUsername]; if (!user) { user = { username: defaultUsername, highScore: 0, gold: 5000, gems: 300, keys: 1, accountLevel: 1, accountXp: 0, gachaLevel: 1, gachaXp: 0, inventory: [], equipped: { WEAPON: { id: 'init_w', type: 'WEAPON', rarity: 'COMMON', name: 'Kunai' }, NECKLACE: null, GLOVES: null, SUIT: { id: 'init_s', type: 'SUIT', rarity: 'COMMON', name: 'Traveler Cloak' }, BELT: null, BOOTS: null, }, ownedSkins: ['skin_default'], equippedSkinId: 'skin_default', purchasedDaily: [], unlockedChapter: 1, }; storedUsers[defaultUsername] = user; localStorage.setItem('survivor_users', JSON.stringify(storedUsers)); } loadUserData(user); }, []);
  const loadUserData = (user: UserProfile) => { setCurrentUser(user); setGold(user.gold); setGems(user.gems); setKeys(user.keys); setInventory(user.inventory); setEquipped(user.equipped); setOwnedSkins(user.ownedSkins); setEquippedSkinId(user.equippedSkinId); setPurchasedDaily(user.purchasedDaily || []); setGachaLevel(user.gachaLevel || 1); setGachaXp(user.gachaXp || 0); setUnlockedChapter(user.unlockedChapter || 1); setSelectedChapterId(user.unlockedChapter || 1); };
  const saveUserData = () => { if (!currentUser) return; const updatedUser: UserProfile = { ...currentUser, gold, gems, keys, inventory, equipped, ownedSkins, equippedSkinId, purchasedDaily, gachaLevel, gachaXp, unlockedChapter, }; const storedUsers = JSON.parse(localStorage.getItem('survivor_users') || '{}'); storedUsers[currentUser.username] = updatedUser; localStorage.setItem('survivor_users', JSON.stringify(storedUsers)); setCurrentUser(updatedUser); };
  const isInitialMount = useRef(true); useEffect(() => { if (isInitialMount.current) { isInitialMount.current = false; return; } const handler = setTimeout(() => { saveUserData(); }, 1000); return () => { clearTimeout(handler); }; }, [ gold, gems, keys, inventory, equipped, ownedSkins, equippedSkinId, purchasedDaily, gachaLevel, gachaXp, unlockedChapter, currentUser ]);

  const calculateStats = () => {
      let attack = 1250;
      let hp = 5400;
      const baseStats: Record<EquipmentType, { atk: number; hp: number }> = { WEAPON: { atk: 300, hp: 0 }, NECKLACE: { atk: 150, hp: 150 }, GLOVES: { atk: 250, hp: 0 }, SUIT: { atk: 0, hp: 1000 }, BELT: { atk: 0, hp: 600 }, BOOTS: { atk: 0, hp: 400 }, };
      const rarityMultipliers: Record<Rarity, number> = { COMMON: 1, MAGIC: 2, EXQUISITE: 4, RARE: 8, EXCELLENT: 15, EPIC: 25, LEGEND: 50, ETERNAL: 100, TRANSCENDENT: 200, GOLDEN: 500, FOREVER: 1000 };
      (Object.values(equipped) as (InventoryItem | null)[]).forEach(item => { if (!item) return; const itemBase = baseStats[item.type]; const multiplier = rarityMultipliers[item.rarity]; attack += itemBase.atk * multiplier; hp += itemBase.hp * multiplier; });
      return { totalAttack: Math.floor(attack), totalHp: Math.floor(hp) };
  };
  const { totalAttack, totalHp } = calculateStats();

  const startGame = () => { setGameState(GameState.PLAYING); };
  const handleGameOver = (score: number, isVictory: boolean = false, level: number = 1) => { setFinalScore(score); setGameState(isVictory ? GameState.VICTORY : GameState.GAME_OVER); const levelBonus = level * 50; const chapterMultiplier = 1 + (selectedChapterId - 1) * 0.5; const goldReward = Math.floor((Math.floor(score / 10) + levelBonus + (isVictory ? (5000 + selectedChapterId * 5000) : 0)) * chapterMultiplier); setGold(prev => prev + goldReward); const gemReward = isVictory ? (20 + selectedChapterId * 10) : 0; if (gemReward > 0) { setGems(prev => prev + gemReward); } if (isVictory) { const nextChapterId = selectedChapterId + 1; if (nextChapterId > unlockedChapter && CHAPTERS.find(c => c.id === nextChapterId)) { setUnlockedChapter(nextChapterId); } } if (currentUser) { const newHighScore = Math.max(currentUser.highScore, score); const xpGained = Math.floor(score / 50); let currentLevel = currentUser.accountLevel || 1; let currentXp = (currentUser.accountXp || 0) + xpGained; let xpForNextLevel = currentLevel * 1000; while (currentXp >= xpForNextLevel) { currentXp -= xpForNextLevel; currentLevel++; xpForNextLevel = currentLevel * 1000; } setCurrentUser(prevUser => prevUser ? ({ ...prevUser, highScore: newHighScore, accountLevel: currentLevel, accountXp: currentXp, }) : null); } };
  const returnToMenu = () => { setGameState(GameState.MENU); setActiveTab('HOME'); setSelectedChapterId(unlockedChapter); saveUserData(); };
  const handleGoldGained = (amount: number) => { setGold(prev => prev + amount); };
  const handleResetData = () => { if(confirm('모든 데이터를 초기화하시겠습니까?')) { localStorage.removeItem('survivor_users'); location.reload(); } };
  
  const generateRandomItem = (currentGachaLevel: number, guaranteedRarity?: Rarity): InventoryItem => { 
      const types: EquipmentType[] = ['WEAPON', 'NECKLACE', 'GLOVES', 'SUIT', 'BELT', 'BOOTS']; 
      const type = types[Math.floor(Math.random() * types.length)]; 
      let rarity: Rarity = 'COMMON'; 
      if (guaranteedRarity) { rarity = guaranteedRarity; } 
      else { 
          const rarityBonus = (currentGachaLevel - 1) * 0.002; 
          const roll = Math.random(); 
          if (roll > 0.999) rarity = 'LEGEND'; else if (roll > 0.99) rarity = 'EPIC'; else if (roll > 0.97) rarity = 'EXCELLENT'; else if (roll > 0.90 - rarityBonus) rarity = 'RARE'; else if (roll > 0.75 - rarityBonus * 2) rarity = 'EXQUISITE'; else if (roll > 0.50 - rarityBonus * 3) rarity = 'MAGIC'; else rarity = 'COMMON'; 
      } 
      const name = getRandomItemName(type);
      return { id: Math.random().toString(36).substr(2, 9), type, rarity, name, }; 
  };

  const addItemToInventory = (item: InventoryItem) => { setInventory(prev => [item, ...prev]); };
  const getNextRarity = (r: Rarity): Rarity | null => { const currentIndex = rarityProgression.indexOf(r); if (currentIndex > -1 && currentIndex < rarityProgression.length - 1) { return rarityProgression[currentIndex + 1]; } return null; };
  const getItemsNeededForMerge = (rarity: Rarity): number => { const highTier: Rarity[] = ['TRANSCENDENT', 'GOLDEN']; const midTier: Rarity[] = ['EPIC', 'LEGEND', 'ETERNAL']; if (highTier.includes(rarity)) return 7; if (midTier.includes(rarity)) return 5; return 3; };
  const handleDailyPurchase = (id: string, costType: 'GOLD' | 'GEM' | 'FREE', cost: number, rewardDesc: string) => { playShopSound('click'); if (purchasedDaily.includes(id)) return; const processPurchase = () => { setPurchasedDaily(prev => [...prev, id]); if (id.includes('equip') || id.includes('scroll') || id.includes('design') || id.includes('blueprint')) { const newItem = generateRandomItem(gachaLevel, 'COMMON'); addItemToInventory(newItem); showNotification(`${rewardDesc} 구매 완료!`); } else { showNotification(`${rewardDesc} 구매 완료!`); } }; if (costType === 'FREE') { setGold(prev => prev + cost); playShopSound('free_claim'); processPurchase(); return; } if (costType === 'GOLD') { if (gold >= cost) { setGold(prev => prev - cost); playShopSound('purchase'); processPurchase(); } else { alert("골드가 부족합니다!"); } } else if (costType === 'GEM') { if (gems >= cost) { setGems(prev => prev - cost); playShopSound('purchase'); processPurchase(); } else { alert("보석이 부족합니다!"); } } };
  const handleSupplyOpen = (type: 'GEM' | 'KEY', costPerUnit: number, count: number = 1) => { playShopSound('click'); lastGachaPullRef.current = { type, costPerUnit, count }; let newItems: InventoryItem[] = []; const totalCost = costPerUnit * count; if (type === 'GEM') { if (gems < totalCost) { alert("보석이 부족합니다!"); return; } setGems(prev => prev - totalCost); } else { if (keys < totalCost) { alert("열쇠가 부족합니다!"); return; } setKeys(prev => prev - totalCost); } playShopSound('purchase'); for (let i = 0; i < count; i++) { newItems.push(generateRandomItem(gachaLevel)); } const xpGained = count * 10; let currentXp = gachaXp + xpGained; let currentLevel = gachaLevel; let xpForNextLevel = currentLevel * 50 + 100; while (currentXp >= xpForNextLevel) { currentXp -= xpForNextLevel; currentLevel++; xpForNextLevel = currentLevel * 50 + 100; } setGachaLevel(currentLevel); setGachaXp(currentXp); setInventory(prev => [...newItems, ...prev]); setGachaResults(newItems); };
  
  const handleCustomGemCharge = () => { playShopSound('click'); const money = customGemAmount; const gemsToBuy = Math.floor(money / GEM_PRICE_IN_WON); if (money < 2000) { alert('최소 2,000원 (100 보석)부터 충전 가능합니다.'); return; } setPurchaseConfirmation({ gems: gemsToBuy, price: `₩ ${money.toLocaleString()}` }); };
  const handleChargeGem = (amount: number, price: string) => { playShopSound('click'); setPurchaseConfirmation({ gems: amount, price }); };
  const finalizePurchase = () => { if (purchaseConfirmation) { playShopSound('purchase'); setGems(prev => prev + purchaseConfirmation.gems); showNotification(`${purchaseConfirmation.gems.toLocaleString()}개의 보석 구매 완료!`); setPurchaseConfirmation(null); } };
  const handleBuySkin = (skin: Skin) => { playShopSound('click'); if (gold >= skin.price) { setGold(prev => prev - skin.price); setOwnedSkins(prev => [...prev, skin.id]); playShopSound('purchase'); showNotification(`${skin.name} 구매 완료!`); } else { alert('골드가 부족합니다.'); } };
  const handleEquipSkin = (skinId: string) => { playShopSound('click'); setEquippedSkinId(skinId); };
  const handleEquipItem = (item: InventoryItem) => { playShopSound('click'); const slot = item.type; const currentEquipped = equipped[slot]; const newInventory = inventory.filter(i => i.id !== item.id); if (currentEquipped) { newInventory.push(currentEquipped); } setInventory(newInventory); setEquipped(prev => ({ ...prev, [slot]: item })); };
  const handleUnequipItem = (slot: EquipmentType) => { playShopSound('click'); const item = equipped[slot]; if (!item) return; setEquipped(prev => ({ ...prev, [slot]: null })); setInventory(prev => [item, ...prev]); };
  const handleEquipBest = () => { playShopSound('click'); const allItems = [...inventory, ...Object.values(equipped).filter((i): i is InventoryItem => i !== null)]; const slots: EquipmentType[] = ['WEAPON', 'NECKLACE', 'GLOVES', 'SUIT', 'BELT', 'BOOTS']; const newEquipped: EquippedState = { ...equipped }; const remainingItems: InventoryItem[] = []; const usedIds = new Set<string>(); const getScore = (item: InventoryItem) => { const rarityScore: Record<Rarity, number> = { 'FOREVER': 11, 'GOLDEN': 10, 'TRANSCENDENT': 9, 'ETERNAL': 8, 'LEGEND': 7, 'EPIC': 6, 'EXCELLENT': 5, 'RARE': 4, 'EXQUISITE': 3, 'MAGIC': 2, 'COMMON': 1 }; return (rarityScore[item.rarity] * 1000); }; slots.forEach(slot => { const candidates = allItems.filter(i => i.type === slot); if (candidates.length > 0) { candidates.sort((a, b) => getScore(b) - getScore(a)); const best = candidates[0]; newEquipped[slot] = best; usedIds.add(best.id); } else { newEquipped[slot] = null; } }); allItems.forEach(item => { if (!usedIds.has(item.id)) { remainingItems.push(item); } }); setEquipped(newEquipped); setInventory(remainingItems); };
  const getMergeableGroups = (currentInventory: InventoryItem[]) => { const groups: Record<string, InventoryItem[]> = {}; currentInventory.forEach(item => { const key = `${item.name}|${item.rarity}|${item.type}`; if (!groups[key]) groups[key] = []; groups[key].push(item); }); return groups; };
  const handleAutoMerge = () => { playShopSound('click'); let finalSummary: MergeSummary = []; let didAnythingMerge = false; setInventory(currentInventory => { let inventoryToProcess = [...currentInventory]; let didMergeInPass = true; while (didMergeInPass) { didMergeInPass = false; const groups = getMergeableGroups(inventoryToProcess); let newItems: InventoryItem[] = []; let idsToRemove = new Set<string>(); let passSummary: MergeSummary = []; Object.values(groups).forEach(items => { const itemTemplate = items[0]; const { name, rarity, type } = itemTemplate; const itemsNeeded = getItemsNeededForMerge(rarity); if (items.length < itemsNeeded) return; const nextRarity = getNextRarity(rarity); if (!nextRarity) return; didMergeInPass = true; didAnythingMerge = true; const mergeCycles = Math.floor(items.length / itemsNeeded); items.slice(0, mergeCycles * itemsNeeded).forEach(item => idsToRemove.add(item.id)); const mergedItemTemplate = { id: '', type, name, rarity: nextRarity }; for (let i = 0; i < mergeCycles; i++) { newItems.push({ ...mergedItemTemplate, id: Math.random().toString(36).substr(2, 9) }); } passSummary.push({ from: itemTemplate, to: mergedItemTemplate, count: mergeCycles }); }); if (didMergeInPass) { inventoryToProcess = [...inventoryToProcess.filter(item => !idsToRemove.has(item.id)), ...newItems]; finalSummary.push(...passSummary); } } return inventoryToProcess; }); if (didAnythingMerge) { playShopSound('purchase'); setMergeResults(finalSummary); } else { alert("합성 가능한 아이템이 없습니다."); } };
  const getDismantleValue = (item: InventoryItem): number => { const base: Record<Rarity, number> = { COMMON: 100, MAGIC: 200, EXQUISITE: 400, RARE: 800, EXCELLENT: 2000, EPIC: 5000, LEGEND: 15000, ETERNAL: 50000, TRANSCENDENT: 150000, GOLDEN: 500000, FOREVER: 1500000 }; return base[item.rarity] || 0; };
  const executeDismantle = () => { playShopSound('purchase'); const itemsToRemove = inventory.filter(item => dismantleSelection.has(item.id)); if (itemsToRemove.length === 0) { setDismantleConfirmMode(false); return; } const calculatedGold = itemsToRemove.reduce((sum, item) => sum + getDismantleValue(item), 0); setInventory(prevInventory => prevInventory.filter(item => !dismantleSelection.has(item.id))); setGold(prevGold => prevGold + calculatedGold); showNotification(`${itemsToRemove.length}개 아이템 분해 완료! +${calculatedGold.toLocaleString()} 골드`); setDismantleSelection(new Set()); setDismantleConfirmMode(false); setActiveModal('NONE'); };

  const renderMergeResultModal = () => { if (!mergeResults) return null; return ( <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-in fade-in zoom-in duration-300"> <div className="w-full max-w-lg flex flex-col items-center bg-[#1F2937] rounded-2xl border border-gray-600 shadow-2xl overflow-hidden max-h-[90vh]"> <h2 className="text-2xl font-black text-white p-4 drop-shadow-lg w-full text-center border-b border-gray-700"> 합성 결과 </h2> <div className="flex-1 w-full overflow-y-auto custom-scrollbar p-4 space-y-3"> {mergeResults.map((result, idx) => ( <div key={idx} className="bg-gray-800/50 p-3 rounded-xl flex items-center justify-between gap-2"> <div className="flex items-center gap-2"> <ItemIcon name={result.from.name} rarity={result.from.rarity} size="sm" /> <div className="font-bold text-sm text-gray-300">{result.from.name}</div> </div> <div className="flex items-center gap-2"> <ArrowRight className="w-5 h-5 text-green-500" /> <div className="bg-green-600 text-white font-bold text-xs px-2 py-1 rounded-full"> x{result.count} </div> <ItemIcon name={result.to.name} rarity={result.to.rarity} size="sm" /> </div> </div> ))} </div> <div className="p-4 bg-gray-800/50 w-full border-t border-gray-700"> <button onClick={() => { playShopSound('click'); setMergeResults(null); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold py-3 rounded-xl shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all" > 확인 </button> </div> </div> </div> ); };
  const renderWardrobeModal = () => ( <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200"> <div className="bg-[#1F2937] w-full max-w-md rounded-2xl border border-gray-600 shadow-2xl overflow-hidden flex flex-col h-[80vh]"> <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center"> <div className="flex items-center gap-2"> <Shirt className="w-5 h-5 text-purple-400" /> <h2 className="font-bold text-lg text-white">의상실</h2> </div> <button onClick={() => { playShopSound('click'); setActiveModal('NONE'); }} className="p-1 hover:bg-gray-700 rounded-full"> <X className="w-5 h-5 text-gray-400" /> </button> </div> <div className="p-6 flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] border-b border-gray-700 relative overflow-hidden h-64"> <div className={`absolute inset-0 opacity-20 ${SKINS.find(s => s.id === equippedSkinId)?.rarity === 'MYTHIC' ? 'bg-yellow-500 animate-pulse' : SKINS.find(s => s.id === equippedSkinId)?.rarity === 'LEGENDARY' ? 'bg-red-500 animate-pulse' : 'bg-transparent'}`}></div> <CharacterPreview skinId={equippedSkinId} /> <h3 className="text-xl font-bold mt-4 text-white z-10">{SKINS.find(s => s.id === equippedSkinId)?.name}</h3> </div> <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-gray-900"> <div className="space-y-3"> {SKINS.map((skin) => ( <div key={skin.id} className={`p-3 rounded-xl border flex flex-col gap-2 transition-all ${equippedSkinId === skin.id ? 'ring-2 ring-green-500 bg-gray-800' : 'bg-gray-700 border-gray-600'}`}> <div className="flex items-center justify-between"> <div className="flex items-center gap-4"> <div className="w-12 h-12 rounded-lg bg-black/40 flex items-center justify-center border border-gray-600 relative overflow-hidden"> <User className="w-8 h-8 relative z-10" style={{ color: skin.primaryColor }} /> </div> <div> <h4 className="font-bold text-gray-100">{skin.name}</h4> <span className="text-[9px] px-1.5 rounded font-bold uppercase bg-black/30 text-gray-400">{skin.rarity}</span> </div> </div> {ownedSkins.includes(skin.id) ? ( <button onClick={() => handleEquipSkin(skin.id)} disabled={equippedSkinId === skin.id} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${equippedSkinId === skin.id ? 'bg-green-600 text-white cursor-default' : 'bg-gray-600 hover:bg-gray-500 text-white'}`}>{equippedSkinId === skin.id ? '착용 중' : '장착'}</button> ) : ( <button onClick={() => handleBuySkin(skin)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-600 hover:bg-yellow-500 text-white flex items-center gap-1"><Coins className="w-3 h-3" />{skin.price.toLocaleString()}</button> )} </div> <p className="text-[10px] text-gray-400 italic px-1">{skin.description}</p> </div> ))} </div> </div> </div> </div> );
  const renderMergeModal = () => { const groups = getMergeableGroups(inventory); const mergeableKeys = Object.keys(groups).filter(key => { const itemGroup = groups[key]; const { rarity } = itemGroup[0]; const itemsNeeded = getItemsNeededForMerge(rarity); if (itemGroup.length < itemsNeeded) return false; if (rarity === 'FOREVER') return false; return true; }); return ( <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200"> <div className="bg-[#1F2937] w-full max-w-sm rounded-2xl border border-gray-600 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"> <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center"> <div className="flex items-center gap-2"> <Hammer className="w-5 h-5 text-yellow-400" /> <h2 className="font-bold text-lg text-white">장비 합성</h2> </div> <button onClick={() => { playShopSound('click'); setActiveModal('NONE'); }} className="p-1 hover:bg-gray-700 rounded-full"> <X className="w-5 h-5 text-gray-400" /> </button> </div> <div className="p-4 overflow-y-auto custom-scrollbar flex-1"> {mergeableKeys.length === 0 ? ( <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-2"> <Box className="w-12 h-16 opacity-20" /> <p>합성 가능한 아이템이 없습니다.</p> </div> ) : ( <div className="space-y-3"> {mergeableKeys.map(key => { const fromItem = groups[key][0]; const nextRarity = getNextRarity(fromItem.rarity); if (!nextRarity) return null; const toItem = { ...fromItem, rarity: nextRarity }; const itemsNeeded = getItemsNeededForMerge(fromItem.rarity); return ( <div key={key} className="bg-gray-900/50 p-3 rounded-xl border border-gray-700 flex items-center justify-between"> <div className="flex items-center gap-2 flex-1"> <ItemIcon name={fromItem.name} rarity={fromItem.rarity} size="sm" /> <div className="flex flex-col"> <span className="font-bold text-gray-200 text-sm truncate">{fromItem.name}</span> <span className="text-gray-400 text-xs">x {itemsNeeded}</span> </div> </div> <ArrowRight className="w-6 h-6 text-green-500 mx-2 shrink-0" /> <div className="flex items-center gap-2 flex-1 justify-end"> <div className="flex flex-col text-right"> <span className="font-bold text-white text-sm truncate">{toItem.name}</span> <span className="text-green-400 text-xs">등급 상승!</span> </div> <ItemIcon name={toItem.name} rarity={toItem.rarity} size="sm" /> </div> </div> ); })} </div> )} </div> <div className="p-4 bg-gray-800 border-t border-gray-700"> <button onClick={handleAutoMerge} disabled={mergeableKeys.length === 0} className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${mergeableKeys.length === 0 ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-500 text-white border-b-4 border-yellow-800 active:border-b-0 active:translate-y-1'}`} > <Hammer className="w-4 h-4" /> 모두 합성 </button> </div> </div> </div> ); };
  const renderDismantleModal = () => { const equippedValues = Object.values(equipped) as (InventoryItem | null)[]; const equippedIds = new Set(equippedValues.filter((i): i is InventoryItem => i !== null).map(i => i.id)); const nonDismantleRarities: Rarity[] = ['ETERNAL', 'TRANSCENDENT', 'GOLDEN', 'FOREVER']; const dismantleableItems = inventory.filter(item => !equippedIds.has(item.id) && !nonDismantleRarities.includes(item.rarity)); const handleToggleSelection = (itemId: string) => { setDismantleConfirmMode(false); setDismantleSelection(prev => { const newSelection = new Set(prev); if (newSelection.has(itemId)) { newSelection.delete(itemId); } else { newSelection.add(itemId); } return newSelection; }); }; const handleSelectByRarity = (rarity: Rarity) => { playShopSound('click'); setDismantleConfirmMode(false); const itemsToSelect = dismantleableItems.filter(item => item.rarity === rarity).map(item => item.id); setDismantleSelection(prev => new Set([...prev, ...itemsToSelect])); }; const handleSelectAll = () => { playShopSound('click'); setDismantleConfirmMode(false); if (dismantleSelection.size >= dismantleableItems.length && dismantleableItems.length > 0) { setDismantleSelection(new Set()); } else { setDismantleSelection(new Set(dismantleableItems.map(i => i.id))); } }; const estimatedGold = Array.from(dismantleSelection).reduce((sum: number, id: string) => { const item = inventory.find(i => i.id === id); return sum + (item ? getDismantleValue(item) : 0); }, 0); const allSelected = dismantleSelection.size >= dismantleableItems.length && dismantleableItems.length > 0; return ( <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200"> <div className="bg-[#181f2a] w-full max-w-lg rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"> <div className="p-4 bg-gray-800/20 border-b border-gray-700/50 flex justify-between items-center flex-shrink-0"> <div className="flex items-center gap-2"> <Trash2 className="w-5 h-5 text-red-400" /> <h2 className="font-bold text-lg text-white">장비 분해</h2> </div> <button onClick={() => { playShopSound('click'); setActiveModal('NONE'); setDismantleSelection(new Set()); setDismantleConfirmMode(false); }} className="p-1 hover:bg-gray-700 rounded-full"> <X className="w-5 h-5 text-gray-400" /> </button> </div> <div className="p-2 bg-red-900/80 text-center text-sm text-red-200 flex-shrink-0"> 주의: 분해된 아이템은 복구할 수 없습니다. </div> <div className="p-2 flex-shrink-0 border-b border-gray-700/50 flex items-center gap-2"> <span className="text-xs text-gray-400">등급 선택:</span> {(['COMMON', 'MAGIC', 'EXQUISITE', 'RARE'] as Rarity[]).map(r => ( <button key={r} onClick={() => handleSelectByRarity(r)} className="text-xs font-bold px-2 py-1 rounded border" style={{ color: {COMMON: '#a0aec0', MAGIC: '#4ade80', EXQUISITE: '#60a5fa', RARE: '#a78bfa'}[r], borderColor: {COMMON: '#a0aec0', MAGIC: '#4ade80', EXQUISITE: '#60a5fa', RARE: '#a78bfa'}[r], }} > {r} </button> ))} </div> <div className="flex-1 p-4 overflow-y-auto"> {dismantleableItems.length === 0 ? ( <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-2"> <Box className="w-16 h-16 opacity-20" /> <p className="font-bold">분해할 아이템이 없습니다.</p> </div> ) : ( <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2"> {dismantleableItems.map(item => ( <InventorySlot key={item.id} item={item} onClick={() => handleToggleSelection(item.id)} isSelected={dismantleSelection.has(item.id)} /> ))} </div> )} </div> <div className="p-4 bg-gray-800/30 border-t border-gray-700/50 flex-shrink-0"> <div className="flex justify-between items-center mb-4"> <div className="text-sm text-gray-400"> {dismantleSelection.size > 0 ? ( <span className="text-white font-bold">{dismantleSelection.size}개 선택됨</span> ) : ( <span>아이템을 선택해주세요</span> )} </div> <button onClick={handleSelectAll} className="text-xs font-bold text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-lg transition-colors border border-gray-600"> {allSelected ? '전체 해제' : '전체 선택'} </button> </div> {dismantleConfirmMode ? ( <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-2 fade-in duration-200"> <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center mb-1"> <p className="text-red-400 font-bold text-sm mb-1">정말 분해하시겠습니까?</p> <p className="text-xs text-gray-400">분해한 장비는 복구할 수 없습니다.</p> </div> <div className="flex gap-2"> <button onClick={() => setDismantleConfirmMode(false)} className="flex-1 py-4 rounded-xl font-bold bg-gray-700 hover:bg-gray-600 text-gray-300 transition-all" > 취소 </button> <button onClick={executeDismantle} className="flex-[2] py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-red-900/50 transition-all bg-red-600 hover:bg-red-500 text-white border-b-4 border-red-800 active:border-b-0 active:translate-y-1" > <Trash2 className="w-5 h-5" /> <span>확인</span> </button> </div> </div> ) : ( <button onClick={() => { if (dismantleSelection.size > 0) { playShopSound('click'); setDismantleConfirmMode(true); } }} disabled={dismantleSelection.size === 0} className={`w-full relative overflow-hidden group py-4 px-5 rounded-2xl font-bold shadow-xl transition-all duration-300 border-b-4 active:border-b-0 active:translate-y-1 ${dismantleSelection.size === 0 ? 'bg-gray-800 border-gray-900 text-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-red-600 to-rose-600 border-red-900 hover:from-red-500 hover:to-rose-500 text-white shadow-red-900/30'}`} > <div className="flex items-center justify-between relative z-10"> <div className="flex items-center gap-3"> <div className={`p-2.5 rounded-xl ${dismantleSelection.size > 0 ? 'bg-black/20' : 'bg-gray-700/50'}`}> <Trash2 className={`w-6 h-6 ${dismantleSelection.size > 0 ? 'text-white' : 'text-gray-500'}`} /> </div> <div className="flex flex-col items-start"> <span className={`text-xs font-bold uppercase tracking-wider ${dismantleSelection.size > 0 ? 'text-red-200' : 'text-gray-500'}`}>Dismantle</span> <span className={`text-lg font-black ${dismantleSelection.size > 0 ? 'text-white' : 'text-gray-500'}`}>분해하기</span> </div> </div> {dismantleSelection.size > 0 ? ( <div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm"> <div className="text-right"> <span className="text-[10px] text-yellow-200 block font-bold">ESTIMATED</span> <div className="flex items-center justify-end gap-1"> <span className="text-yellow-400 font-black text-xl">+{estimatedGold.toLocaleString()}</span> </div> </div> <div className="bg-yellow-500/20 p-1.5 rounded-full border border-yellow-500/50"> <Coins className="w-5 h-5 text-yellow-400 fill-yellow-400" /> </div> </div> ) : ( <div className="text-gray-600 font-bold text-sm bg-gray-900/30 px-3 py-1.5 rounded-lg"> 선택 대기중 </div> )} </div> </button> )} </div> </div> </div> ); };
  const renderRarityGuideModal = () => { return ( <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200"> <div className="bg-[#1F2937] w-full max-w-xs rounded-2xl border border-gray-600 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"> <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center"> <div className="flex items-center gap-2"> <BookOpen className="w-5 h-5 text-blue-400" /> <h2 className="font-bold text-lg text-white">장비 등급표</h2> </div> <button onClick={() => { playShopSound('click'); setActiveModal('NONE'); }} className="p-1 hover:bg-gray-700 rounded-full"> <X className="w-5 h-5 text-gray-400" /> </button> </div> <div className="p-4 overflow-y-auto custom-scrollbar flex-1 space-y-2"> {rarityProgression.map(rarity => ( <div key={rarity} className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg border border-gray-700"> <div className="w-8 h-8 flex-shrink-0 rounded-md flex items-center justify-center"> <ItemIcon name="Kunai" rarity={rarity} size="sm" /> </div> <span className="font-bold text-white">{rarity}</span> </div> ))} </div> <div className="p-4 bg-gray-800 border-t border-gray-700"> <button onClick={() => { playShopSound('click'); setActiveModal('NONE'); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg">확인</button> </div> </div> </div> ); };
  const renderRankingPage = () => { const dummyUsers = [ { name: 'UnknownUser', score: 999999 }, { name: 'SlayerX', score: 540200 }, { name: 'ZombieKing', score: 480100 }, { name: 'Swift', score: 320500 }, { name: 'Rookie', score: 150200 }, { name: 'Survivor', score: 80400 }, ]; const leaderboard = [ { name: currentUser?.username || 'Player', score: currentUser?.highScore || 0 }, ...dummyUsers ].sort((a,b) => b.score - a.score); return ( <div className="p-4 sm:p-6 w-full max-w-2xl mx-auto flex flex-col"> <div className="flex items-center gap-3 mb-6"> <Trophy className="w-8 h-8 text-yellow-400" /> <h1 className="text-3xl font-black text-white">랭킹</h1> </div> <div className="bg-gray-800/50 rounded-xl border border-gray-700 shadow-lg flex-1 overflow-y-auto custom-scrollbar"> {leaderboard.map((user, index) => ( <div key={index} className={`flex items-center p-3 gap-4 border-b border-gray-700 last:border-b-0 ${ user.name === currentUser?.username ? 'bg-blue-900/30' : '' }`}> <span className={`w-8 text-center text-lg font-bold ${ index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-yellow-600' : 'text-gray-500' }`}>{index + 1}</span> <div className="flex items-center gap-3"> {index < 3 ? <Crown className={`w-5 h-5 ${ index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : 'text-yellow-600' }`} /> : <User className="w-5 h-5 text-gray-500" />} <span className="font-semibold text-white">{user.name}</span> </div> <span className="ml-auto font-mono text-xl text-yellow-300">{user.score.toLocaleString()}</span> </div> ))} </div> </div> ) };
  const renderSettingsPage = () => ( <div className="p-4 sm:p-6 w-full max-w-2xl mx-auto flex flex-col h-full"> <div className="flex items-center gap-3 mb-6"> <Settings className="w-8 h-8 text-gray-400" /> <h1 className="text-3xl font-black text-white">설정</h1> </div> <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 space-y-4"> <h3 className="font-bold text-lg text-white">데이터 관리</h3> <p className="text-sm text-gray-400"> 게임 진행 상황은 브라우저 로컬 스토리지에 저장됩니다. </p> <button onClick={handleResetData} className="w-full py-4 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800/50 rounded-xl font-bold transition-colors"> 데이터 초기화 </button> </div> </div> );
  const formatNumber = (num: number) => { if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'; if (num >= 1000) return (num / 1000).toFixed(1) + 'K'; return num.toString(); };

  const renderShop = () => { const supplyOptions = [ { count: 1, cost: 300, icon: Box, tag: null, color: 'from-purple-800/80 to-indigo-900/80', borderColor: 'border-purple-600/50' }, { count: 10, cost: 3000, icon: Layers, tag: null, color: 'from-purple-800/80 to-indigo-900/80', borderColor: 'border-purple-600/50' }, { count: 100, cost: 30000, icon: Box, tag: 'FLEX', color: 'from-yellow-500/80 to-orange-700/80', borderColor: 'border-yellow-400' }, { count: 1000, cost: 300000, icon: Star, tag: 'GOD', color: 'from-red-500/80 to-pink-700/80', borderColor: 'border-red-400' }, { count: 10000, cost: 3000000, icon: Sparkles, tag: 'UNIVERSE', color: 'from-cyan-400/80 to-blue-600/80', borderColor: 'border-cyan-300' }, ]; const dailyShopItems = [ { id: 'daily_free_gold', title: '무료 골드', icon: Gift, cost: 5000, costType: 'FREE', buttonText: 'FREE', buttonColor: 'bg-green-600 hover:bg-green-500 border-b-2 border-green-800' }, { id: 'daily_scroll', title: '무기 스크롤', icon: Scroll, cost: 3000, costType: 'GOLD', buttonText: '3000', buttonColor: 'bg-yellow-700 hover:bg-yellow-600 border-b-2 border-yellow-900' }, { id: 'daily_random_equip', title: '랜덤 장비', icon: FileText, cost: 200, costType: 'GEM', buttonText: '200', buttonColor: 'bg-teal-600 hover:bg-teal-500 border-b-2 border-teal-800' } ]; const gemPackages = [ { gems: 500 }, { gems: 1200 }, { gems: 2500 }, { gems: 6500 }, ]; const xpForNextGachaLevel = gachaLevel * 50 + 100; const gachaProgress = (gachaXp / xpForNextGachaLevel) * 100; return ( <div className="p-4 sm:p-6 w-full max-w-4xl mx-auto flex flex-col bg-gray-900"> <div className="bg-black/30 p-4 rounded-2xl border border-purple-500/30 mb-8"> <div className="flex items-center justify-between mb-4"> <div> <h1 className="text-3xl font-black text-white tracking-wider">EDF SUPPLY</h1> <p className="text-yellow-300 font-bold">S급 장비 획득 확률 UP!</p> </div> <div className="flex items-center gap-2 text-sm text-gray-300"> <Trash2 className="w-4 h-4" /> 자동 분해 </div> </div> <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4"> {supplyOptions.map(opt => { const Icon = opt.icon; return ( <button key={opt.count} onClick={() => handleSupplyOpen('GEM', opt.cost / opt.count, opt.count)} className={`relative group p-4 bg-gradient-to-br ${opt.color} rounded-lg text-white font-bold flex flex-col items-center justify-center gap-2 border-2 ${opt.borderColor} transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20`}> {opt.tag && <div className={`absolute -top-2 text-xs px-3 py-0.5 rounded-full font-black ${ opt.tag === 'FLEX' ? 'bg-yellow-400 text-black' : opt.tag === 'GOD' ? 'bg-red-400 text-white' : 'bg-cyan-300 text-black' }`}>{opt.tag}</div>} <Icon className={`w-10 h-10 mb-2 transition-transform group-hover:rotate-12 ${opt.icon === Sparkles || opt.icon === Star ? 'text-yellow-200' : 'text-white/80'}`} strokeWidth={1.5} /> <span className="text-lg">{opt.count}회 열기</span> <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full"> <Gem className="w-4 h-4 text-green-300" /> <span>{formatNumber(opt.cost)}</span> </div> </button> )})} </div> <div className="bg-black/20 p-2 rounded-lg flex items-center gap-3 mb-4"> <span className="font-bold text-sm text-white flex-shrink-0">Lv.{gachaLevel}</span> <div className="w-full bg-gray-700 rounded-full h-5 relative overflow-hidden"> <div className="absolute inset-0 bg-purple-600 h-full transition-all duration-300" style={{ width: `${gachaProgress}%` }}></div> <span className="absolute inset-0 text-white text-xs font-bold flex items-center justify-center drop-shadow-md"> {gachaXp} / {xpForNextGachaLevel} </span> </div> <button className="w-5 h-5 bg-gray-600 text-white rounded-full text-xs font-bold flex-shrink-0 hover:bg-gray-500">i</button> </div> <div className="bg-black/20 p-3 rounded-lg flex items-center justify-between"> <div className="flex items-center gap-2"> <Key className="w-6 h-6 text-yellow-400" /> <span className="font-bold text-lg text-white">황금 열쇠: {keys}</span> </div> <button onClick={() => handleSupplyOpen('KEY', 1, 1)} disabled={keys < 1} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-8 py-2 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed"> 열쇠로 열기 </button> </div> </div> <div className="mb-8"> <div className="flex items-center gap-2 mb-3"> <Clock className="w-5 h-5 text-gray-400" /> <h2 className="text-xl font-bold text-white">일일 상점</h2> </div> <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {dailyShopItems.map(item => { const Icon = item.icon; const isPurchased = purchasedDaily.includes(item.id); return ( <div key={item.id} className="bg-gray-800/70 p-4 rounded-xl border border-gray-700 flex flex-col items-center text-center"> <div className="w-16 h-16 rounded-full bg-gray-900/50 flex items-center justify-center mb-3 border-2 border-gray-600"> <Icon className="w-8 h-8 text-gray-300" /> </div> <h3 className="font-bold text-white mb-4 flex-1">{item.title}</h3> <button onClick={() => { if (item.costType === 'GOLD') handleDailyPurchase(item.id, 'GOLD', item.cost, item.title); if (item.costType === 'GEM') handleDailyPurchase(item.id, 'GEM', item.cost, item.title); if (item.costType === 'FREE') handleDailyPurchase(item.id, 'FREE', item.cost, item.title); }} disabled={isPurchased} className={`w-full py-2 rounded-lg font-bold text-white transition-colors ${item.buttonColor} ${isPurchased ? 'bg-gray-600 !border-gray-600 cursor-not-allowed' : ''}`} > {isPurchased ? '획득 완료' : ( <div className="flex items-center justify-center gap-1"> {item.costType === 'GOLD' && <Coins className="w-4 h-4" />} {item.costType === 'GEM' && <Gem className="w-4 h-4" />} {item.costType === 'FREE' && <span>FREE</span>} {item.costType !== 'FREE' && <span>{formatNumber(item.cost)}</span>} </div> )} </button> </div> ); })} </div> </div> <div className="mt-8"> <div className="flex items-center gap-2 mb-3"> <Gem className="w-5 h-5 text-green-400" /> <h2 className="text-xl font-bold text-white">보석 상점</h2> </div> <div className="grid grid-cols-2 md:grid-cols-4 gap-4"> {gemPackages.map(option => { const price = option.gems * GEM_PRICE_IN_WON; return ( <button key={option.gems} onClick={() => handleChargeGem(option.gems, `₩ ${price.toLocaleString()}`)} className="bg-gray-800/70 p-4 rounded-xl border border-gray-700 hover:border-green-500 transition-colors flex flex-col items-center text-center gap-2" > <Gem className="w-10 h-10 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]" /> <h3 className="font-bold text-white text-lg">{option.gems.toLocaleString()}</h3> <div className="mt-auto w-full py-2 rounded-lg font-bold text-white bg-green-700 hover:bg-green-600 transition-colors"> ₩ {price.toLocaleString()} </div> </button> ); })} </div> <div className="mt-8"> <div className="flex items-center gap-2 mb-4"> <Calculator className="w-5 h-5 text-gray-400" /> <h2 className="text-lg font-bold text-white">금액 직접 입력 충전</h2> </div> <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg p-1"> <div className="flex-1 flex items-center px-4 py-2 gap-3"> <span className="text-gray-500 font-bold">$</span> <input type="number" value={customGemAmount} onChange={(e) => setCustomGemAmount(Math.max(0, parseInt(e.target.value) || 0))} className="bg-transparent border-none focus:outline-none text-white w-full font-bold text-lg placeholder-gray-600" placeholder="충전할 금액 (KRW)" /> <span className="text-gray-400 text-sm whitespace-nowrap flex items-center gap-1"> <Gem className="w-3 h-3 text-green-400" /> {Math.floor(customGemAmount / GEM_PRICE_IN_WON).toLocaleString()} 개 </span> </div> <button onClick={handleCustomGemCharge} className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-md transition-colors" > 충전하기 </button> </div> <p className="text-xs text-gray-500 mt-2 ml-1">* 20원당 1보석으로 자동 환산됩니다.</p> </div> </div> </div> ); };
  const renderEquipment = () => { const MAX_INVENTORY_DISPLAY = 240; const getScore = (item: InventoryItem) => { const rarityScore: Record<Rarity, number> = { 'FOREVER': 11, 'GOLDEN': 10, 'TRANSCENDENT': 9, 'ETERNAL': 8, 'LEGEND': 7, 'EPIC': 6, 'EXCELLENT': 5, 'RARE': 4, 'EXQUISITE': 3, 'MAGIC': 2, 'COMMON': 1 }; return rarityScore[item.rarity]; }; const sortedInventory = [...inventory].sort((a, b) => getScore(b) - getScore(a)); return ( <div className="w-full flex flex-col sm:flex-row gap-4 p-4"> <div className="w-full sm:w-1/3 flex flex-col gap-4"> <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex flex-col items-center flex-shrink-0 relative z-0"> <CharacterPreview skinId={equippedSkinId} /> <button onClick={(e) => { e.stopPropagation(); playShopSound('click'); setActiveModal('WARDROBE'); }} className="mt-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors relative z-20 shadow-lg active:scale-95" > <Shirt className="w-4 h-4" /> 의상 변경 </button> </div> <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex-shrink-0"> <h3 className="text-lg font-bold mb-3 text-white">능력치</h3> <div className="space-y-2 text-sm"> <div className="flex justify-between"> <span className="text-gray-400">공격</span> <span className="font-bold text-white">{totalAttack.toLocaleString()}</span> </div> <div className="flex justify-between"> <span className="text-gray-400">최대 HP</span> <span className="font-bold text-white">{totalHp.toLocaleString()}</span> </div> </div> </div> <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex-1 sm:flex-auto"> <h3 className="text-lg font-bold mb-3 text-white">장착된 장비</h3> <div className="grid grid-cols-3 gap-x-4 gap-y-8"> {(Object.keys(equipped) as EquipmentType[]).map(slot => ( <EquipmentSlot key={slot} slotType={slot} item={equipped[slot]} onUnequip={handleUnequipItem} /> ))} </div> </div> </div> <div className="w-full sm:w-2/3 bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex flex-col"> <div className="flex justify-between items-center mb-4"> <h2 className="text-xl font-bold text-white">인벤토리 ({inventory.length})</h2> <div className="flex gap-2"> <button onClick={() => { playShopSound('click'); setActiveModal('RARITY_GUIDE'); }} className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1"><BookOpen className="w-3 h-3"/>등급표</button> <button onClick={handleEquipBest} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1"><Sparkles className="w-3 h-3"/>최강 장비</button> <button onClick={() => { playShopSound('click'); setActiveModal('MERGE'); }} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1"><Hammer className="w-3 h-3"/>합성</button> <button onClick={() => { playShopSound('click'); setActiveModal('DISMANTLE'); }} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1"><Trash2 className="w-3 h-3"/>분해</button> </div> </div> <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2"> {inventory.length === 0 ? ( <div className="flex flex-col items-center justify-center h-full text-gray-600"> <Package className="w-16 h-16" /> <p>인벤토리가 비어 있습니다.</p> </div> ) : ( <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2"> {sortedInventory.slice(0, MAX_INVENTORY_DISPLAY).map(item => ( <InventorySlot key={item.id} item={item} onClick={() => handleEquipItem(item)} /> ))} {inventory.length > MAX_INVENTORY_DISPLAY && ( <div className="col-span-full text-center py-4 text-gray-500"> ... 그 외 {inventory.length - MAX_INVENTORY_DISPLAY}개 아이템 </div> )} </div> )} </div> </div> </div> ); };
  const renderHome = () => { if (!currentUser) return null; const currentChapter = CHAPTERS.find(c => c.id === selectedChapterId) || CHAPTERS[0]; return ( <div className="w-full flex-1 flex flex-col justify-center items-center p-4 relative text-center"> <div className="absolute inset-0 bg-gray-900 z-0"></div> <div className="flex-1 flex flex-col justify-center items-center w-full max-w-4xl relative z-10"> <h1 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg mb-2">{currentChapter.name}</h1> <p className="text-sm md:text-base text-gray-300 mb-6 max-w-md">{currentChapter.description}</p> <div className="w-full h-1/2 min-h-[200px] max-h-[40vh] mb-6 flex items-center justify-center"> <ChapterArtwork chapterId={selectedChapterId} /> </div> <button onClick={startGame} className="bg-blue-600 hover:bg-blue-500 text-white text-xl font-bold py-4 px-16 rounded-full shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-3 animate-pulse" > START <Play className="w-6 h-6 fill-current" /> </button> </div> <button onClick={() => setSelectedChapterId(p => Math.max(1, p-1))} className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 bg-black/30 p-3 rounded-full hover:bg-white/20 transition-colors z-20" > <ArrowLeft className="w-6 h-6 text-white"/> </button> <button onClick={() => setSelectedChapterId(p => Math.min(unlockedChapter, p+1))} className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 bg-black/30 p-3 rounded-full hover:bg-white/20 transition-colors z-20" > {selectedChapterId < unlockedChapter ? <ArrowRight className="w-6 h-6 text-white"/> : <Lock className="w-6 h-6 text-gray-500"/>} </button> </div> ); };
  const renderContent = () => { switch(activeTab) { case 'SHOP': return renderShop(); case 'EQUIPMENT': return renderEquipment(); case 'RANKING': return renderRankingPage(); case 'SETTINGS': return renderSettingsPage(); case 'HOME': default: return renderHome(); } };
  
  if (gameState === GameState.PLAYING || gameState === GameState.PAUSED || gameState === GameState.TREASURE_OPENING || gameState === GameState.STATUS_MENU) { 
      const currentChapter = CHAPTERS.find(c => c.id === selectedChapterId) || CHAPTERS[0]; 
      return (
        <div className="w-full h-full relative overflow-hidden bg-black">
          <Game 
              onGameOver={handleGameOver} 
              gameState={gameState} 
              setGameState={setGameState} 
              initialStats={{ hp: totalHp, attack: totalAttack }} 
              equippedWeaponName={equipped.WEAPON?.name} 
              equippedSkinId={equippedSkinId} 
              onGoldGained={handleGoldGained} 
              chapterTheme={currentChapter.theme}
              chapterId={currentChapter.id}
          />
        </div>
      ); 
  }
  
  if (gameState === GameState.GAME_OVER || gameState === GameState.VICTORY) { const isVictory = gameState === GameState.VICTORY; const scoreGold = Math.floor(finalScore / 10); const bonusGold = isVictory ? (5000 + selectedChapterId * 5000) : 0; const displayGold = scoreGold + bonusGold; const gemReward = isVictory ? (20 + selectedChapterId * 10) : 0; return ( <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-4 animate-in fade-in"> <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 text-center max-w-sm w-full"> {isVictory ? ( <> <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 drop-shadow-[0_0_10px_#facc15]" /> <h1 className="text-4xl font-black text-yellow-300 mb-2">VICTORY</h1> <p className="text-yellow-500 mb-6">챕터를 클리어했습니다!</p> </> ) : ( <> <Skull className="w-16 h-16 text-red-500 mx-auto mb-4" /> <h1 className="text-4xl font-black text-red-400 mb-2">GAME OVER</h1> <p className="text-gray-400 mb-6">생존에 실패했습니다.</p> </> )} <div className="bg-gray-900/50 p-4 rounded-xl space-y-3 mb-8"> <div className="flex justify-between text-lg"> <span>최종 점수:</span> <span className="font-bold text-white">{finalScore.toLocaleString()}</span> </div> <div className="flex justify-between items-center text-lg"> <span>획득 골드:</span> <div className="flex items-center gap-1 font-bold text-yellow-400"> <Coins className="w-5 h-5" /> <span>+{displayGold.toLocaleString()}+</span> </div> </div> {isVictory && ( <div className="flex justify-between items-center text-lg"> <span>획득 보석:</span> <div className="flex items-center gap-1 font-bold text-green-400"> <Gem className="w-5 h-5" /> <span>+{gemReward.toLocaleString()}</span> </div> </div> )} </div> <button onClick={returnToMenu} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg text-lg"> 메인으로 </button> </div> </div> ); }
  
  const showHeader = gameState === GameState.MENU;

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 overflow-hidden relative">
      {notification && (<div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[100] bg-black/80 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300"><CheckCircle className="w-5 h-5 text-green-400" /><span className="font-bold text-sm">{notification}</span></div>)}
      {showHeader && (<Header currentUser={currentUser} keys={keys} gold={gold} gems={gems} onAddCurrency={() => setActiveTab('SHOP')} />)}
      <main className="flex-1 overflow-y-auto flex">{renderContent()}</main>
      <footer className="w-full flex justify-around items-center bg-gray-800 border-t-2 border-gray-700 p-2 flex-shrink-0 relative z-30"> {[ { id: 'SHOP', label: '상점', icon: ShoppingCart }, { id: 'EQUIPMENT', label: '장비', icon: Shield }, { id: 'HOME', label: '출격', icon: Play, isCentral: true }, { id: 'RANKING', label: '랭킹', icon: Trophy }, { id: 'SETTINGS', label: '설정', icon: Settings }, ].map(({ id, label, icon: Icon, isCentral }) => ( <button key={id} onClick={() => { playShopSound('click'); setActiveTab(id as any); }} className={`flex flex-col items-center justify-center transition-colors text-xs ${isCentral ? 'w-16 h-16' : 'w-16 h-14'} ${activeTab === id ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`} > {isCentral ? ( <div className={`w-16 h-16 rounded-full flex items-center justify-center transform -translate-y-4 shadow-lg border-2 border-gray-900 ${activeTab === id ? 'bg-yellow-500' : 'bg-blue-600'} `}> <Icon className="w-8 h-8 text-white fill-current" /> </div> ) : ( <> <Icon className="w-6 h-6 mb-1" /> <span>{label}</span> </> )} </button> ))} </footer>
      {gachaResults && (<div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200"><div className="bg-[#1F2937] w-full max-w-2xl rounded-2xl border border-gray-600 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"><h2 className="text-center p-3 text-2xl font-black text-yellow-300 border-b border-gray-700 bg-gray-800">보급 결과</h2>{gachaResults.length < 100 ? (<div className="p-4 grid grid-cols-5 sm:grid-cols-8 gap-2 overflow-y-auto custom-scrollbar">{gachaResults.map((item, index) => (<InventorySlot key={index} item={item} />))}</div>) : (<div className="p-4 flex-1 overflow-y-auto custom-scrollbar"><div className="bg-gray-800/50 p-4 rounded-xl mb-4"><h3 className="text-lg font-bold text-white mb-3 text-center">획득 요약</h3><div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">{(['LEGEND', 'EPIC', 'EXCELLENT', 'RARE', 'EXQUISITE', 'MAGIC', 'COMMON'] as Rarity[]).map(r => { const count = gachaResults.filter(i => i.rarity === r).length; if (count === 0) return null; return (<div key={r} className="bg-gray-900 p-2 rounded-lg"><p className="font-bold text-sm" style={{color: {LEGEND: '#ef4444', EPIC: '#f97316', EXCELLENT: '#ca8a04', RARE: '#a855f7', EXQUISITE: '#3b82f6', MAGIC: '#84cc16', COMMON: '#9ca3af'}[r]}}>{r}</p><p className="text-white text-lg font-mono">{count}개</p></div>) }).filter(Boolean)}</div></div><h3 className="text-md font-bold text-gray-300 mb-2 text-center">주요 획득 아이템 (EPIC 이상)</h3><div className="p-2 grid grid-cols-5 sm:grid-cols-8 gap-2">{gachaResults.filter(item => ['EPIC', 'LEGEND'].includes(item.rarity)).map((item, index) => (<InventorySlot key={index} item={item} />))}</div></div>)}<div className="p-3 bg-gray-800 border-t border-gray-700 flex gap-3"><button onClick={() => { playShopSound('click'); setGachaResults(null); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg">확인</button>{lastGachaPullRef.current && (<button onClick={() => handleSupplyOpen(lastGachaPullRef.current!.type, lastGachaPullRef.current!.costPerUnit, lastGachaPullRef.current!.count)} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg">다시 뽑기 ({lastGachaPullRef.current.count}회)</button>)}</div></div></div>)}
      {activeModal === 'DISMANTLE' && renderDismantleModal()} {activeModal === 'MERGE' && renderMergeModal()} {activeModal === 'WARDROBE' && renderWardrobeModal()} {activeModal === 'RARITY_GUIDE' && renderRarityGuideModal()} {mergeResults && renderMergeResultModal()}
      {purchaseConfirmation && (<div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200"><div className="bg-[#1F2937] w-full max-w-xs rounded-2xl border border-gray-600 shadow-2xl p-6 text-center"><h2 className="text-xl font-bold text-white mb-2">구매 확인</h2><div className="flex items-center justify-center gap-2 text-2xl font-bold text-green-400 my-4"><Gem className="w-7 h-7" /><span>{purchaseConfirmation.gems.toLocaleString()}</span></div><p className="text-gray-400 mb-6">위 상품을 <span className="font-bold text-white">{purchaseConfirmation.price}</span>에 구매하시겠습니까?</p><div className="flex gap-3"><button onClick={() => { playShopSound('click'); setPurchaseConfirmation(null); }} className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 rounded-lg">취소</button><button onClick={finalizePurchase} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg">확인</button></div></div></div>)}
    </div>
  );
};

export default SurvivorGameApp;