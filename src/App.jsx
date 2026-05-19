import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi, Settings, Gauge, RotateCcw, Activity, Zap, Dumbbell,
  ArrowLeftRight, Play, Square, Check, ChevronRight, Timer,
  Signal, Lock, Unlock, Ruler, SlidersHorizontal, Home,
  Power, RefreshCw, CircleDot, Menu as MenuIcon
} from "lucide-react";

const modes = [
  { id: "resisted", label: "Resisted Sprint", desc: "Dirençli sprint antrenmanı", icon: Dumbbell },
  { id: "assisted", label: "Assisted Sprint", desc: "Destekli hız geliştirme", icon: Zap },
  { id: "direction", label: "Change Direction", desc: "Yön değiştirme çalışması", icon: ArrowLeftRight },
  { id: "reps", label: "Reps", desc: "Tekrar bazlı antrenman", icon: RefreshCw },
  { id: "isokinetic", label: "Isokinetic", desc: "Sabit hız / kontrollü direnç", icon: Gauge },
  { id: "open", label: "Open Training", desc: "Serbest ölçüm modu", icon: Activity },
];

const loadOptions = [1, 2, 3, 5, 8, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50];
const pulleyOptions = [
  { label: "1:1", value: "1:1", desc: "Standart bağlantı" },
  { label: "2:1", value: "2:1", desc: "Çift makara / daha yumuşak his" },
  { label: "4:1", value: "4:1", desc: "Hassas düşük yük kontrolü" },
];
const returnOptions = [
  { label: "Slow", value: "Slow", desc: "Güvenli geri sarım" },
  { label: "Medium", value: "Medium", desc: "Standart kullanım" },
  { label: "Fast", value: "Fast", desc: "Hızlı reset" },
];
const distanceOptions = [5, 10, 15, 20, 30, 40, 50, 100];

function Button({ children, className = "", ...props }) {
  return <button className={`inline-flex items-center justify-center rounded-2xl px-5 py-4 font-black transition active:scale-[0.98] ${className}`} {...props}>{children}</button>;
}

function Card({ children, className = "" }) {
  return <div className={`rounded-[2rem] border shadow-2xl ${className}`}>{children}</div>;
}

function Pill({ children, active = false }) {
  return <div className={`rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${active ? "bg-yellow-400 text-black" : "bg-white/10 text-white/70"}`}>{children}</div>;
}

function MetricCard({ label, value, unit, icon: Icon }) {
  return (
    <Card className="border-white/10 bg-white/[0.06] text-white">
      <div className="flex items-center justify-between p-4">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-white/40">{label}</div>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-3xl font-black">{value}</span>
            <span className="pb-1 text-sm font-semibold text-white/50">{unit}</span>
          </div>
        </div>
        <div className="rounded-2xl bg-yellow-400/15 p-3 text-yellow-300"><Icon size={22} /></div>
      </div>
    </Card>
  );
}

function OptionModal({ title, subtitle, open, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ scale: 0.92, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.92, y: 20, opacity: 0 }} className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#121212] text-white shadow-2xl">
            <div className="border-b border-white/10 bg-white/[0.04] p-6">
              <div className="text-sm uppercase tracking-[0.3em] text-yellow-300">Setting</div>
              <h2 className="mt-2 text-3xl font-black">{title}</h2>
              <p className="mt-1 text-white/55">{subtitle}</p>
            </div>
            <div className="p-6">{children}</div>
            <div className="flex justify-end border-t border-white/10 p-4">
              <Button onClick={onClose} className="bg-yellow-400 px-8 py-5 text-black hover:bg-yellow-300">Done <Check className="ml-2" size={18} /></Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState("resisted");
  const [load, setLoad] = useState(10);
  const [pulley, setPulley] = useState("1:1");
  const [returnSpeed, setReturnSpeed] = useState("Medium");
  const [distance, setDistance] = useState(20);
  const [stage, setStage] = useState("R1");
  const [running, setRunning] = useState(false);
  const [wifiConnected, setWifiConnected] = useState(false);
  const [wifiName, setWifiName] = useState("Sprint-Demo-AP");
  const [zeroReady, setZeroReady] = useState(false);
  const [modal, setModal] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [countdownPurpose, setCountdownPurpose] = useState(null);
  const [liveDistance, setLiveDistance] = useState(0);
  const [liveSpeed, setLiveSpeed] = useState(0);

  const activeMode = useMemo(() => modes.find((m) => m.id === mode), [mode]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setLiveSpeed(() => Number((6 + Math.random() * 3.2 + load / 20).toFixed(1)));
      setLiveDistance((v) => {
        const next = Math.min(distance, v + 0.35 + Math.random() * 0.5);
        if (next >= distance) setRunning(false);
        return Number(next.toFixed(1));
      });
    }, 650);
    return () => clearInterval(t);
  }, [running, distance, load]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      const t = setTimeout(() => {
        if (countdownPurpose === "start") {
          setLiveDistance(0); setRunning(true); setStage("R1"); setScreen("home");
        }
        if (countdownPurpose === "zero") {
          setZeroReady(true); setScreen("zero");
        }
        setCountdown(null); setCountdownPurpose(null);
      }, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, countdownPurpose]);

  const startCountdown = (purpose) => { setCountdownPurpose(purpose); setCountdown(3); setScreen("countdown"); };

  const BottomSetting = ({ label, value, icon: Icon, onClick }) => (
    <button onClick={onClick} className="group flex min-h-[88px] flex-1 items-center justify-between rounded-3xl border border-white/10 bg-white/[0.06] px-5 text-left transition hover:border-yellow-300/60 hover:bg-yellow-300/10">
      <div><div className="text-xs uppercase tracking-[0.24em] text-white/40">{label}</div><div className="mt-2 text-2xl font-black text-white">{value}</div></div>
      <div className="rounded-2xl bg-black/40 p-3 text-yellow-300 transition group-hover:bg-yellow-400 group-hover:text-black"><Icon size={22} /></div>
    </button>
  );

  const HomeScreen = () => (
    <div className="grid min-h-screen grid-cols-1 gap-5 p-4 text-white xl:grid-cols-[1fr_210px] xl:p-5">
      <main className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-black shadow-xl shadow-yellow-400/20"><Gauge size={30} /></div>
            <div><div className="text-sm uppercase tracking-[0.35em] text-yellow-300">Sprint Control</div><h1 className="text-3xl font-black">Premium Training Console</h1></div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill active={wifiConnected}>{wifiConnected ? wifiName : "Offline Demo"}</Pill>
            <Button onClick={() => setScreen("menu")} className="bg-white/10 py-4 text-white hover:bg-white/20"><MenuIcon className="mr-2" size={18}/> Menu</Button>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <Card className="relative overflow-hidden border-white/10 bg-[#f4f1e8] text-black">
            <div className="flex h-full min-h-[520px] flex-col justify-between p-6 lg:p-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div><div className="text-sm font-black uppercase tracking-[0.3em] text-black/40">Current Mode</div><div className="mt-2 text-3xl font-black">{activeMode?.label}</div></div>
                <div className={`w-fit rounded-full px-5 py-2 text-sm font-black ${running ? "bg-green-500 text-white" : "bg-black text-white"}`}>{running ? "RUNNING" : "READY"}</div>
              </div>
              <div className="py-8">
                <div className="text-[6rem] font-black leading-none tracking-[-0.08em] sm:text-[8rem] lg:text-[9rem]">{liveSpeed.toFixed(1)}</div>
                <div className="ml-2 text-2xl font-black uppercase tracking-[0.2em] text-black/45 lg:text-3xl">m/s speed</div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-3xl bg-black p-5 text-white"><div className="text-xs uppercase tracking-[0.2em] text-white/40">Distance</div><div className="mt-2 text-4xl font-black">{liveDistance.toFixed(1)}<span className="text-lg text-white/50"> / {distance}m</span></div></div>
                <div className="rounded-3xl bg-black/10 p-5"><div className="text-xs uppercase tracking-[0.2em] text-black/40">Load</div><div className="mt-2 text-4xl font-black">{load}<span className="text-lg text-black/45"> kg</span></div></div>
                <div className="rounded-3xl bg-yellow-400 p-5"><div className="text-xs uppercase tracking-[0.2em] text-black/50">Pulley</div><div className="mt-2 text-4xl font-black">{pulley}</div></div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col gap-5">
            <MetricCard label="Target" value={distance} unit="m" icon={Ruler} />
            <MetricCard label="Return" value={returnSpeed} unit="" icon={RotateCcw} />
            <MetricCard label="Power" value={Math.round(liveSpeed * load * 2.6)} unit="W" icon={Zap} />
            <Card className="flex-1 border-white/10 bg-white/[0.06] text-white">
              <div className="flex h-full flex-col justify-between p-5">
                <div><div className="text-xs uppercase tracking-[0.25em] text-white/40">Run / Stage</div><div className="mt-4 grid grid-cols-3 gap-2">{["R1", "R2", "R3"].map((s) => <button key={s} onClick={() => setStage(s)} className={`rounded-2xl py-5 text-2xl font-black ${stage === s ? "bg-yellow-400 text-black" : "bg-black/35 text-white/50"}`}>{s}</button>)}</div></div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Button onClick={() => startCountdown("start")} className="bg-yellow-400 py-6 text-black hover:bg-yellow-300"><Play className="mr-2" size={20} /> Start</Button>
                  <Button onClick={() => setRunning(false)} className="bg-red-500/90 py-6 text-white hover:bg-red-500"><Square className="mr-2" size={18} /> Stop</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <BottomSetting label="Load" value={`${load} kg`} icon={Dumbbell} onClick={() => setModal("load")} />
          <BottomSetting label="Pulley / Gear" value={pulley} icon={SlidersHorizontal} onClick={() => setModal("pulley")} />
          <BottomSetting label="Line Return" value={returnSpeed} icon={RotateCcw} onClick={() => setModal("return")} />
          <BottomSetting label="Measurement" value={`${distance} m`} icon={Ruler} onClick={() => setModal("distance")} />
        </div>
      </main>

      <aside className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 md:grid-cols-2 xl:flex xl:flex-col">
        <button onClick={() => setScreen("home")} className="rounded-3xl bg-yellow-400 p-5 text-left font-black text-black"><Home className="mb-3" /> Home</button>
        <button onClick={() => setScreen("menu")} className="rounded-3xl bg-white/10 p-5 text-left font-black text-white hover:bg-white/20"><Activity className="mb-3 text-yellow-300" /> Training Menu</button>
        <button onClick={() => setScreen("zero")} className="rounded-3xl bg-white/10 p-5 text-left font-black text-white hover:bg-white/20"><CircleDot className="mb-3 text-yellow-300" /> Zero Position</button>
        <button onClick={() => setScreen("wifi")} className="rounded-3xl bg-white/10 p-5 text-left font-black text-white hover:bg-white/20"><Wifi className="mb-3 text-yellow-300" /> Wi‑Fi / Settings</button>
        <div className="rounded-3xl bg-black/40 p-5 xl:mt-auto"><div className="text-xs uppercase tracking-[0.25em] text-white/35">Device</div><div className="mt-2 text-lg font-black">STM32 + ESP32 Demo</div><div className="mt-3 flex items-center gap-2 text-sm text-white/50"><Signal size={16} /> Local Web UI</div></div>
      </aside>
    </div>
  );

  const MenuScreen = () => (
    <div className="min-h-screen p-6 text-white">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><div className="text-sm uppercase tracking-[0.35em] text-yellow-300">Training Modes</div><h1 className="text-5xl font-black">Select Training</h1></div><Button onClick={() => setScreen("home")} className="bg-white/10 text-white hover:bg-white/20">Back Home</Button></div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {modes.map((m) => { const Icon = m.icon; const active = mode === m.id; return <motion.button whileHover={{ y: -4 }} key={m.id} onClick={() => { setMode(m.id); setScreen("home"); }} className={`min-h-[210px] rounded-[2rem] border p-6 text-left shadow-2xl ${active ? "border-yellow-300 bg-yellow-400 text-black" : "border-white/10 bg-white/[0.06] text-white hover:bg-white/[0.1]"}`}><div className={`mb-8 inline-flex rounded-2xl p-4 ${active ? "bg-black text-yellow-300" : "bg-yellow-400/15 text-yellow-300"}`}><Icon size={34} /></div><div className="text-3xl font-black">{m.label}</div><div className={`mt-3 text-base ${active ? "text-black/65" : "text-white/50"}`}>{m.desc}</div></motion.button>; })}
        <button onClick={() => setScreen("wifi")} className="min-h-[210px] rounded-[2rem] border border-white/10 bg-black/35 p-6 text-left text-white hover:bg-white/[0.08]"><div className="mb-8 inline-flex rounded-2xl bg-yellow-400/15 p-4 text-yellow-300"><Settings size={34} /></div><div className="text-3xl font-black">Settings / Wi‑Fi</div><div className="mt-3 text-white/50">Ağ bağlantısı, cihaz ayarları ve demo bağlantıları</div></button>
        <button onClick={() => setScreen("zero")} className="min-h-[210px] rounded-[2rem] border border-white/10 bg-black/35 p-6 text-left text-white hover:bg-white/[0.08]"><div className="mb-8 inline-flex rounded-2xl bg-yellow-400/15 p-4 text-yellow-300"><CircleDot size={34} /></div><div className="text-3xl font-black">Zero Position</div><div className="mt-3 text-white/50">Başlangıç pozisyonunu kalibre et</div></button>
      </div>
    </div>
  );

  const WifiScreen = () => (
    <div className="min-h-screen p-6 text-white">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><div className="text-sm uppercase tracking-[0.35em] text-yellow-300">Connection</div><h1 className="text-5xl font-black">Wi‑Fi / Settings</h1></div><Button onClick={() => setScreen("home")} className="bg-white/10 text-white hover:bg-white/20">Back Home</Button></div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_0.8fr]">
        <Card className="border-white/10 bg-white/[0.06] text-white"><div className="p-6"><div className="mb-5 text-2xl font-black">Available Networks</div>{["Sprint-Demo-AP", "Hotel-Lobby", "Coach-Tablet", "Mobile-Hotspot"].map((n, i) => <button key={n} onClick={() => { setWifiName(n); setWifiConnected(true); }} className="mb-3 flex w-full items-center justify-between rounded-3xl bg-black/35 p-5 text-left hover:bg-yellow-400/10"><div className="flex items-center gap-4"><Wifi className="text-yellow-300" /><div><div className="text-xl font-black">{n}</div><div className="text-sm text-white/45">{i === 0 ? "ESP32 Access Point" : "Saved / Demo network"}</div></div></div>{wifiConnected && wifiName === n ? <Unlock className="text-green-400" /> : <Lock className="text-white/35" />}</button>)}</div></Card>
        <Card className="border-white/10 bg-[#f4f1e8] text-black"><div className="p-7"><div className="text-sm font-black uppercase tracking-[0.3em] text-black/45">Status</div><div className="mt-4 flex items-center gap-4"><div className={`rounded-3xl p-5 ${wifiConnected ? "bg-green-500 text-white" : "bg-black text-white"}`}><Power size={34} /></div><div><div className="text-3xl font-black">{wifiConnected ? "Connected" : "Offline"}</div><div className="text-black/55">{wifiConnected ? wifiName : "Demo local mode"}</div></div></div><div className="mt-8 space-y-3"><div className="rounded-3xl bg-black/10 p-5"><b>Device IP:</b> 192.168.4.1</div><div className="rounded-3xl bg-black/10 p-5"><b>Protocol:</b> HTTP + UART Command Bridge</div><div className="rounded-3xl bg-black/10 p-5"><b>Target:</b> ESP32 → STM32 → PLC/Servo</div></div><Button onClick={() => setWifiConnected(false)} className="mt-7 w-full bg-black py-6 text-white hover:bg-black/80">Disconnect</Button></div></Card>
      </div>
    </div>
  );

  const ZeroScreen = () => (
    <div className="flex min-h-screen items-center justify-center p-6 text-white"><Card className="w-full max-w-4xl border-white/10 bg-white/[0.06] text-white"><div className="p-10 text-center"><div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-yellow-400 text-black"><CircleDot size={52} /></div><div className="text-sm uppercase tracking-[0.35em] text-yellow-300">Calibration</div><h1 className="mt-3 text-5xl font-black">Zero Position Setup</h1><p className="mx-auto mt-4 max-w-2xl text-lg text-white/55">Sporcu başlangıç noktasına geçer. Sistem 3‑2‑1 geri sayımından sonra mevcut konumu sıfır referansı olarak kaydeder.</p><div className="mt-8 rounded-[2rem] bg-black/35 p-6"><div className="text-sm uppercase tracking-[0.25em] text-white/35">Current Status</div><div className={`mt-3 text-3xl font-black ${zeroReady ? "text-green-400" : "text-yellow-300"}`}>{zeroReady ? "Zero Position Ready" : "Waiting for Calibration"}</div></div><div className="mt-8 flex flex-wrap justify-center gap-4"><Button onClick={() => startCountdown("zero")} className="bg-yellow-400 px-9 py-6 text-black hover:bg-yellow-300">Start Zero Countdown</Button><Button onClick={() => setScreen("home")} className="bg-white/10 px-9 py-6 text-white hover:bg-white/20">Back Home</Button></div></div></Card></div>
  );

  const CountdownScreen = () => (
    <div className="flex min-h-screen items-center justify-center bg-black text-white"><div className="text-center"><div className="mb-8 text-sm uppercase tracking-[0.45em] text-yellow-300">{countdownPurpose === "zero" ? "Zero Position" : "Training Starts"}</div><motion.div key={countdown} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[10rem] font-black leading-none text-yellow-400 sm:text-[18rem]">{countdown === 0 ? "GO" : countdown}</motion.div><div className="mt-8 text-2xl font-semibold text-white/50">Hazır pozisyona geçin</div></div></div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#2b2b2b,black_45%,#050505)]">
      {screen === "home" && <HomeScreen />}
      {screen === "menu" && <MenuScreen />}
      {screen === "wifi" && <WifiScreen />}
      {screen === "zero" && <ZeroScreen />}
      {screen === "countdown" && <CountdownScreen />}

      <OptionModal title="Load Selection" subtitle="Sporcuya uygulanacak direnç/yük değerini seçin." open={modal === "load"} onClose={() => setModal(null)}>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">{loadOptions.map((v) => <button key={v} onClick={() => setLoad(v)} className={`rounded-2xl py-5 text-2xl font-black ${load === v ? "bg-yellow-400 text-black" : "bg-white/10 text-white hover:bg-white/20"}`}>{v}<span className="text-sm opacity-60"> kg</span></button>)}</div>
      </OptionModal>
      <OptionModal title="Gear / Pulley Selection" subtitle="Makara oranını seçerek yük hissini ve kablo davranışını ayarlayın." open={modal === "pulley"} onClose={() => setModal(null)}>
        <div className="grid gap-3">{pulleyOptions.map((p) => <button key={p.value} onClick={() => setPulley(p.value)} className={`rounded-3xl p-5 text-left ${pulley === p.value ? "bg-yellow-400 text-black" : "bg-white/10 text-white hover:bg-white/20"}`}><div className="text-3xl font-black">{p.label}</div><div className="mt-1 opacity-60">{p.desc}</div></button>)}</div>
      </OptionModal>
      <OptionModal title="Line Return Speed" subtitle="Test sonrası ipin geri sarım hızını seçin." open={modal === "return"} onClose={() => setModal(null)}>
        <div className="grid gap-3 sm:grid-cols-3">{returnOptions.map((r) => <button key={r.value} onClick={() => setReturnSpeed(r.value)} className={`rounded-3xl p-6 text-left ${returnSpeed === r.value ? "bg-yellow-400 text-black" : "bg-white/10 text-white hover:bg-white/20"}`}><div className="text-3xl font-black">{r.label}</div><div className="mt-2 opacity-60">{r.desc}</div></button>)}</div>
      </OptionModal>
      <OptionModal title="Measurement Distance" subtitle="Sprint testinin hedef mesafesini belirleyin." open={modal === "distance"} onClose={() => setModal(null)}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{distanceOptions.map((d) => <button key={d} onClick={() => setDistance(d)} className={`rounded-2xl py-6 text-3xl font-black ${distance === d ? "bg-yellow-400 text-black" : "bg-white/10 text-white hover:bg-white/20"}`}>{d}<span className="text-sm opacity-60"> m</span></button>)}</div>
      </OptionModal>
    </div>
  );
}
