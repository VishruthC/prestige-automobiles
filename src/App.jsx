import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, 
  Menu, 
  X, 
  LogOut, 
  PlusCircle, 
  Star,
  ChevronRight, 
  Info, 
  Award, 
  Globe, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Heart,
  Filter,
  ArrowUpDown,
  Search,
  ArrowLeft,
  Send
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithCustomToken,
  signInAnonymously
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  serverTimestamp, 
  deleteDoc, 
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';

// --- Theme Constants ---
const THEME = {
  colors: {
    cream: '#F9F5EB',
    paper: '#EBE5CE',
    leather: '#5D4037',
    gold: '#C5A059',
    burgundy: '#722F37',
    charcoal: '#1A1A1A',
    offWhite: '#FDFBF7',
    slate: '#2F4F4F'
  },
  fonts: {
    heading: '"Playfair Display", serif',
    body: '"Lora", serif',
  }
};

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Admin Configuration ---
const ADMIN_EMAIL = 'admin@prestige.com';
const isAdmin = (user) => user && user.email === ADMIN_EMAIL;

// --- Assets ---
const NOISE_PATTERN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`;

const INITIAL_CARS = [
  {
    year: 1967,
    make: "Ford",
    model: "Mustang Shelby GT500",
    price: 185000, 
    category: "Muscle",
    description: "A pristine example of American muscle history. Wimbledon White with Guardsman Blue stripes. Fully restored to concours condition by marque specialists.",
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"
  },
  {
    year: 1955,
    make: "Mercedes-Benz",
    model: "300 SL Gullwing",
    price: 1450000, 
    category: "Sports",
    description: "The iconic Gullwing. Silver metallic paint with original red leather interior. Matching numbers engine and chassis. A true investment grade vehicle.",
    imageUrl: "https://images.unsplash.com/photo-1566008872470-dc628f5d450f?auto=format&fit=crop&q=80&w=800"
  },
  {
    year: 1961,
    make: "Jaguar",
    model: "E-Type Series 1",
    price: 225000, 
    category: "Convertible",
    description: "Enzo Ferrari called it 'the most beautiful car ever made'. Finished in British Racing Green with tan hide. Includes original tool roll and heritage certificate.",
    imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800"
  }
];

// --- UI Components ---

const NoiseOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-[100] mix-blend-multiply opacity-40" style={{ backgroundImage: NOISE_PATTERN }}></div>
);

const SectionSeparator = () => (
  <div className="flex items-center justify-center my-16 opacity-40">
    <div className="h-px w-24 bg-current" style={{ color: THEME.colors.gold }}></div>
    <div className="mx-4 text-2xl" style={{ color: THEME.colors.gold }}>✦</div>
    <div className="h-px w-24 bg-current" style={{ color: THEME.colors.gold }}></div>
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) => {
  const baseStyle = "px-8 py-3 transition-all duration-500 font-serif tracking-[0.15em] disabled:opacity-50 disabled:cursor-not-allowed text-sm relative overflow-hidden group flex items-center justify-center";
  
  const variants = {
    primary: `bg-[${THEME.colors.burgundy}] text-[${THEME.colors.cream}] border border-[${THEME.colors.burgundy}] hover:bg-[${THEME.colors.charcoal}] hover:border-[${THEME.colors.charcoal}] uppercase shadow-md`,
    outline: `bg-transparent text-[${THEME.colors.leather}] border border-[${THEME.colors.leather}] hover:bg-[${THEME.colors.leather}] hover:text-[${THEME.colors.cream}] uppercase`,
    text: `text-[${THEME.colors.leather}] hover:text-[${THEME.colors.burgundy}] underline decoration-[${THEME.colors.gold}] decoration-1 underline-offset-8 uppercase text-xs`
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      style={{ fontFamily: THEME.fonts.heading }}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
};

const Input = ({ label, type = "text", value, onChange, placeholder, required = false }) => (
  <div className="mb-6 group">
    <label className="block text-xs font-bold mb-2 uppercase tracking-[0.2em]" style={{ color: THEME.colors.leather, fontFamily: THEME.fonts.heading }}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-3 bg-[#FDFBF7] border focus:outline-none transition-all duration-300"
      style={{ 
        borderColor: THEME.colors.paper,
        fontFamily: THEME.fonts.body,
        color: THEME.colors.charcoal
      }}
    />
    <div className="h-0.5 bg-[${THEME.colors.gold}] w-0 group-hover:w-full transition-all duration-500 ease-out" style={{ backgroundColor: THEME.colors.gold }}></div>
  </div>
);

const Navbar = ({ user, setView, view, isTransparent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const tabsRef = useRef({});

  const navItems = [
    { id: 'inventory', label: 'Collection' },
    ...(user && !isAdmin(user) ? [{ id: 'favorites', label: 'My Garage' }] : []),
    { id: 'home', label: 'Services' },
    ...(isAdmin(user) ? [{ id: 'add-car', label: 'Consign' }] : [])
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const activeTab = tabsRef.current[view];
    if (activeTab) {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
        opacity: 1
      });
    } else {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [view, user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setView('home');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isSolid = !isTransparent || scrolled;
  const navStyle = {
    backgroundColor: isSolid ? THEME.colors.cream : 'rgba(0,0,0,0.2)',
    borderBottom: isSolid ? `1px solid ${THEME.colors.gold}` : 'none',
    backdropFilter: isSolid ? 'none' : 'blur(2px)',
    transition: 'all 0.5s ease'
  };

  const textColor = isSolid ? THEME.colors.leather : '#F9F5EB';
  const logoColor = isSolid ? THEME.colors.charcoal : '#FFFFFF';
  const logoAccent = isSolid ? THEME.colors.burgundy : '#C5A059';
  const borderColor = isSolid ? 'border-gray-300' : 'border-white/30';
  const lineColor = isSolid ? THEME.colors.burgundy : '#C5A059';

  return (
    <nav className={`w-full py-6 px-6 md:px-12 fixed top-0 z-50 ${isSolid ? 'shadow-md py-4' : ''}`} 
      style={navStyle}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div 
          onClick={() => setView('home')}
          className="cursor-pointer group flex flex-col items-center"
        >
          <h1 className="text-2xl md:text-3xl font-bold tracking-[0.2em] uppercase transition-colors duration-500" style={{ fontFamily: THEME.fonts.heading, color: logoColor }}>
            Prestige
          </h1>
          <span className="text-xs tracking-[0.6em] uppercase mt-1 transition-colors duration-500" style={{ color: logoAccent, fontFamily: THEME.fonts.heading }}>Automobiles</span>
        </div>

        <div className="hidden md:flex items-center gap-12 relative">
          {navItems.map((item) => (
            <button
              key={item.id}
              ref={el => tabsRef.current[item.id] = el}
              onClick={() => setView(item.id)}
              className="text-sm tracking-widest uppercase transition-colors duration-300 py-2"
              style={{ 
                fontFamily: THEME.fonts.heading, 
                color: view === item.id ? (isSolid ? THEME.colors.burgundy : '#C5A059') : textColor 
              }}
            >
              {item.label}
            </button>
          ))}

          <div 
            className="absolute bottom-0 h-[2px] transition-all duration-500 ease-out pointer-events-none"
            style={{ 
              left: indicatorStyle.left, 
              width: indicatorStyle.width, 
              opacity: indicatorStyle.opacity,
              backgroundColor: lineColor
            }}
          />

          {user && isAdmin(user) ? (
            <div className={`flex items-center gap-4 border-l pl-8 ${borderColor}`}>
              <Button variant="primary" onClick={handleSignOut} className="text-xs py-2 px-6">Logout</Button>
            </div>
          ) : (
            <div className={`flex items-center gap-4 border-l pl-8 ${borderColor}`}>
              <Button variant="primary" onClick={() => setView('login')} className="text-xs py-2 px-6">Login</Button>
            </div>
          )}
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-2xl" style={{ color: textColor }}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full h-screen py-12 shadow-xl" style={{ backgroundColor: THEME.colors.cream }}>
          <div className="flex flex-col items-center space-y-8">
            <button onClick={() => { setView('inventory'); setIsOpen(false); }} className="text-xl font-serif" style={{ color: THEME.colors.leather }}>The Collection</button>
            <button onClick={() => { setView('home'); setIsOpen(false); }} className="text-xl font-serif" style={{ color: THEME.colors.leather }}>Our Services</button>
            {user && isAdmin(user) ? (
              <>
                 <button onClick={() => { setView('add-car'); setIsOpen(false); }} className="text-xl font-serif" style={{ color: THEME.colors.leather }}>Consign Vehicle</button>
                 <Button variant="primary" onClick={() => { handleSignOut(); setIsOpen(false); }}>Log Out</Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => { setView('login'); setIsOpen(false); }}>Login</Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const AuthForm = ({ type, setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (type === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setView('inventory');
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-32 md:pt-40">
      <div className="w-full max-w-md p-12 relative bg-white shadow-2xl border border-stone-200">
        <div className="absolute top-4 left-4 right-4 bottom-4 border pointer-events-none opacity-30" style={{ borderColor: THEME.colors.gold }}></div>
        
        <div className="text-center mb-10">
          <div className="inline-block p-3 rounded-full mb-4" style={{ backgroundColor: THEME.colors.cream }}>
            <Car size={32} color={THEME.colors.leather} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-widest" style={{ color: THEME.colors.charcoal, fontFamily: THEME.fonts.heading }}>
            {type === 'login' ? 'Concierge' : 'Registry'}
          </h2>
          <p className="mt-2 text-sm italic opacity-60" style={{ fontFamily: THEME.fonts.body }}>Authorized Personnel Only</p>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-center text-red-900 bg-red-50 border border-red-100 font-serif">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input label="Identity" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Passkey" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          
          <div className="mt-10 pt-6 border-t border-dashed border-gray-300">
            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Authenticating...' : (type === 'login' ? 'Access Portal' : 'Submit Application')}
            </Button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setView(type === 'login' ? 'signup' : 'login')}
            className="text-xs uppercase tracking-widest hover:text-[${THEME.colors.burgundy}] transition-colors"
            style={{ color: THEME.colors.leather, fontFamily: THEME.fonts.heading }}
          >
            {type === 'login' ? "Request Membership" : "Return to Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

const InquireForm = ({ car, setView }) => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      message: `I am interested in the ${car?.year} ${car?.make} ${car?.model}. Please provide more information.`
    });
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      
      // Simulate network request or actual DB save if needed
      try {
        const collectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'inquiries');
        await addDoc(collectionRef, {
            ...formData,
            carId: car?.id || 'unknown',
            carName: `${car?.year} ${car?.make} ${car?.model}`,
            createdAt: serverTimestamp()
        });
        setSent(true);
      } catch (err) {
        console.error("Error sending inquiry:", err);
      } finally {
        setLoading(false);
      }
    };
  
    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="max-w-xl w-full bg-white p-12 text-center shadow-2xl border border-stone-200">
                    <div className="mb-6 inline-block p-4 rounded-full bg-[#F9F5EB]">
                        <Send size={40} className="text-[#C5A059]" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 uppercase tracking-widest" style={{ fontFamily: THEME.fonts.heading }}>Inquiry Received</h2>
                    <p className="text-stone-500 mb-8 font-serif">Thank you for your interest. A Prestige concierge will contact you shortly regarding the {car?.make} {car?.model}.</p>
                    <Button onClick={() => setView('inventory')} variant="primary">Return to Collection</Button>
                </div>
            </div>
        );
    }
  
    return (
      <div className="min-h-screen pt-32 md:pt-40 pb-12 px-4">
        <div className="max-w-2xl mx-auto p-12 bg-white shadow-xl relative border border-stone-200">
           <button onClick={() => setView('inventory')} className="absolute top-8 left-8 text-stone-400 hover:text-[#C5A059] transition-colors">
               <ArrowLeft size={24} />
           </button>
  
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2 uppercase tracking-widest" style={{ fontFamily: THEME.fonts.heading, color: THEME.colors.charcoal }}>
              Request Details
            </h2>
            <p className="text-sm font-serif text-[#C5A059] uppercase tracking-widest mt-4">
                {car?.year} {car?.make} {car?.model}
            </p>
          </div>
  
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input label="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="e.g. Eleanor Vance" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Input label="Email Address" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required placeholder="name@example.com" />
                 <Input label="Phone Number" type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+1 (555) 000-0000" />
            </div>
            
            <div className="mb-8">
              <label className="block text-xs font-bold mb-2 uppercase tracking-[0.2em]" style={{ color: THEME.colors.leather, fontFamily: THEME.fonts.heading }}>Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-3 bg-[#FDFBF7] border focus:outline-none h-32 resize-none leading-relaxed"
                style={{ borderColor: THEME.colors.paper, fontFamily: THEME.fonts.body, color: THEME.colors.charcoal }}
              />
            </div>
            
            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Sending Request...' : 'Submit Inquiry'}
            </Button>
          </form>
        </div>
      </div>
    );
};

const AddCarForm = ({ setView }) => {
  const [formData, setFormData] = useState({
    make: '', model: '', year: '', price: '', category: 'Classic', description: '', imageUrl: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const collectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'inventory');
      await addDoc(collectionRef, {
        ...formData,
        price: Number(formData.price),
        year: Number(formData.year),
        createdAt: serverTimestamp()
      });
      setView('inventory');
    } catch (error) {
      console.error("Error adding car:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 md:pt-40 pb-12 px-4">
      <div className="max-w-3xl mx-auto p-12 bg-white shadow-xl relative border border-stone-200">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-2 uppercase tracking-widest" style={{ fontFamily: THEME.fonts.heading, color: THEME.colors.charcoal }}>
            Vehicle Consignment
          </h2>
          <div className="h-1 w-24 mx-auto" style={{ backgroundColor: THEME.colors.gold }}></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input label="Marque (Make)" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} required placeholder="e.g. Rolls-Royce" />
            <Input label="Model Designation" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} required placeholder="e.g. Silver Ghost" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Input label="Model Year" type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} required placeholder="1925" />
            
            <Input 
                label="Valuation ($)" 
                type="number" 
                value={formData.price} 
                onChange={e => setFormData({...formData, price: e.target.value})} 
                required 
                placeholder="450000" 
            />
            
             <div className="mb-6">
              <label className="block text-xs font-bold mb-2 uppercase tracking-[0.2em]" style={{ color: THEME.colors.leather, fontFamily: THEME.fonts.heading }}>
                Classification
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-[#FDFBF7] border focus:outline-none"
                style={{ borderColor: THEME.colors.paper, fontFamily: THEME.fonts.body, color: THEME.colors.charcoal }}
              >
                <option>Classic</option>
                <option>Muscle</option>
                <option>Sports</option>
                <option>Pre-War</option>
                <option>Luxury</option>
                <option>Convertible</option>
              </select>
            </div>
          </div>
          <Input label="Photograph URL" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://..." />
          <div className="mb-8">
            <label className="block text-xs font-bold mb-2 uppercase tracking-[0.2em]" style={{ color: THEME.colors.leather, fontFamily: THEME.fonts.heading }}>Provenance & Details</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 bg-[#FDFBF7] border focus:outline-none h-40 resize-none leading-relaxed"
              style={{ borderColor: THEME.colors.paper, fontFamily: THEME.fonts.body, color: THEME.colors.charcoal }}
              placeholder="Describe the vehicle's history, condition, and notable features..."
            />
          </div>
          <div className="flex justify-between items-center pt-8 border-t border-stone-100">
            <Button variant="text" onClick={() => setView('inventory')}>Cancel Request</Button>
            <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Processing...' : 'Submit to Catalog'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CarCard = ({ car, user, isFavorite, toggleFavorite, onInquire }) => {
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!user || !car.id) return;
    if (confirm("Permanently remove this vehicle from the archives?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'inventory', car.id));
      } catch (err) {
        console.error("Error deleting", err);
      }
    }
  };

  return (
    <div className="group bg-white shadow-xl transition-all duration-500 hover:shadow-2xl border border-stone-200 hover:border-stone-300 flex flex-col h-full">
      <div className="relative h-72 overflow-hidden border-b-4" style={{ borderColor: THEME.colors.gold }}>
        <img 
          src={car.imageUrl || 'https://via.placeholder.com/800x600?text=No+Image+Available'} 
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-1000 ease-in-out group-hover:scale-110 filter sepia-[0.15] group-hover:sepia-0"
          onError={(e) => { e.target.src = 'https://placehold.co/800x600/5D4037/C5A059?text=Prestige+Classics'; }}
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
        
        {/* Price Badge */}
        <div className="absolute top-0 right-0 px-6 py-2 shadow-lg z-10" style={{ backgroundColor: THEME.colors.cream }}>
           <span className="text-sm font-bold tracking-widest" style={{ color: THEME.colors.charcoal, fontFamily: THEME.fonts.heading }}>
             {car.price?.toLocaleString('en-US', {
               style: 'currency',
               currency: 'USD',
               maximumFractionDigits: 0
             })}
           </span>
        </div>

        {/* Favorite Button - Only for non-admin users to keep UI clean */}
        {user && !isAdmin(user) && (
          <button 
            onClick={(e) => { e.stopPropagation(); toggleFavorite(car.id); }}
            className="absolute bottom-4 right-4 p-3 rounded-full bg-white/90 shadow-lg hover:bg-white transition-all transform hover:scale-110 z-20"
          >
            <Heart 
              size={18} 
              className={`transition-colors duration-300 ${isFavorite ? 'fill-[#722F37] text-[#722F37]' : 'text-[#1A1A1A]'}`} 
            />
          </button>
        )}

        {isAdmin(user) && (
           <button 
             onClick={handleDelete}
             className="absolute top-4 left-4 bg-white/90 text-red-900 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-30"
           >
             <LogOut size={16} />
           </button>
        )}
      </div>
      
      <div className="p-8 relative bg-white flex flex-col flex-grow">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-1 border border-stone-200 shadow-sm text-[10px] uppercase tracking-[0.2em]" style={{ color: THEME.colors.gold, fontFamily: THEME.fonts.heading }}>
          {car.category}
        </div>

        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-1 tracking-wide" style={{ fontFamily: THEME.fonts.heading, color: THEME.colors.charcoal }}>
            {car.make}
          </h3>
          <p className="text-sm uppercase tracking-[0.2em] mb-4" style={{ color: THEME.colors.leather, fontFamily: THEME.fonts.heading }}>
            {car.year} • {car.model}
          </p>
          <div className="h-px w-12 bg-gray-200 mx-auto"></div>
        </div>

        <p className="text-sm leading-7 mb-8 text-gray-600 text-center line-clamp-3 flex-grow" style={{ fontFamily: THEME.fonts.body }}>
          {car.description}
        </p>
        
        <div className="flex justify-center mt-auto">
          <button 
            onClick={() => onInquire(car)}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] group-hover:gap-4 transition-all duration-300 py-2 border-b border-transparent hover:border-[#722F37]" 
            style={{ color: THEME.colors.burgundy, fontFamily: THEME.fonts.heading }}
          >
            Inquire <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const FilterBar = ({ filters, setFilters }) => {
    return (
        <div className="bg-white p-6 mb-12 shadow-sm border border-stone-100 flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="flex items-center gap-2 text-[#C5A059]">
                    <Filter size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Filter</span>
                 </div>
                 <select 
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="bg-[#FDFBF7] border border-stone-200 px-4 py-2 text-sm font-serif min-w-[150px] focus:outline-none focus:border-[#C5A059]"
                 >
                    <option value="All">All Categories</option>
                    <option value="Classic">Classic</option>
                    <option value="Sports">Sports</option>
                    <option value="Muscle">Muscle</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Convertible">Convertible</option>
                 </select>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2 text-[#C5A059]">
                    <ArrowUpDown size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Sort</span>
                 </div>
                 <select 
                    value={filters.sort}
                    onChange={(e) => setFilters({...filters, sort: e.target.value})}
                    className="bg-[#FDFBF7] border border-stone-200 px-4 py-2 text-sm font-serif min-w-[200px] focus:outline-none focus:border-[#C5A059]"
                 >
                    <option value="newest">Newest Arrivals</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="year_desc">Year: Newest First</option>
                    <option value="year_asc">Year: Oldest First</option>
                 </select>
            </div>
        </div>
    )
}

const Inventory = ({ user, setView, showFavoritesOnly = false, onInquire }) => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [filters, setFilters] = useState({ category: 'All', sort: 'newest' });

  // Fetch Inventory - Using a robust method that doesn't strictly depend on user state for UI blocking
  useEffect(() => {
    // We attempt to fetch. If auth isn't ready, the onSnapshot might fail or wait.
    // The main App component ensures anonymous auth is triggered.
    
    setLoading(true);
    const collectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'inventory');
    const q = query(collectionRef); 

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCars(fetchedCars);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching inventory:", error);
      // Don't show error to user, just stop loading. Auth might be still initializing.
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]); // Re-run if user state changes (e.g., from anon to logged in)

  // Fetch User Favorites (Simulated persistence for logged in users)
  useEffect(() => {
      if (user && !isAdmin(user)) {
          const fetchFavorites = async () => {
              try {
                const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'userdata', 'favorites');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setFavorites(docSnap.data().itemIds || []);
                }
              } catch (e) {
                  console.error("Error fetching favorites", e);
              }
          }
          fetchFavorites();
      } else {
        setFavorites([]); // Clear favorites on logout
      }
  }, [user]);

  // Apply Filters & Sorting
  useEffect(() => {
      let result = [...cars];

      // 1. Filter by Favorites (if mode active)
      if (showFavoritesOnly) {
          result = result.filter(car => favorites.includes(car.id));
      }

      // 2. Filter by Category
      if (filters.category !== 'All') {
          result = result.filter(car => car.category === filters.category);
      }

      // 3. Sort
      result.sort((a, b) => {
          switch (filters.sort) {
              case 'price_asc': return a.price - b.price;
              case 'price_desc': return b.price - a.price;
              case 'year_asc': return a.year - b.year;
              case 'year_desc': return b.year - a.year;
              default: return 0; // Newest (by creation) is default usually, or unsorted
          }
      });

      setFilteredCars(result);
  }, [cars, filters, favorites, showFavoritesOnly]);

  const toggleFavorite = async (carId) => {
      if (!user) {
        // Should not happen often with anon auth, but just in case
        return;
      }
      
      let newFavorites;
      if (favorites.includes(carId)) {
          newFavorites = favorites.filter(id => id !== carId);
      } else {
          newFavorites = [...favorites, carId];
      }
      
      setFavorites(newFavorites);

      // Persist to Firestore
      try {
          const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'userdata', 'favorites');
          await setDoc(docRef, { itemIds: newFavorites }, { merge: true });
      } catch (e) {
          console.error("Error saving favorites", e);
      }
  };

  const seedDatabase = async () => {
    try {
      setLoading(true);
      const collectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'inventory');
      for (const car of INITIAL_CARS) {
        await addDoc(collectionRef, { ...car, createdAt: serverTimestamp() });
      }
    } catch (e) {
      console.error("Error seeding", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && cars.length === 0) return <div className="min-h-screen flex items-center justify-center font-serif text-xl tracking-widest uppercase animate-pulse" style={{ color: THEME.colors.gold }}>Opening Archives...</div>;

  return (
    <div className="min-h-screen pt-32 md:pt-40 pb-20 px-6" style={{ backgroundColor: THEME.colors.cream }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 relative">
          <span className="text-xs font-bold tracking-[0.4em] uppercase text-stone-400 block mb-4">Established 1964</span>
          <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: THEME.fonts.heading, color: THEME.colors.charcoal }}>
            {showFavoritesOnly ? "The Private Garage" : "The Collection"}
          </h2>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto italic" style={{ fontFamily: THEME.fonts.body }}>
            {showFavoritesOnly 
                ? "Your curated selection of automotive excellence." 
                : "\"Cars are the sculptures of our everyday lives.\" — Chris Bangle"}
          </p>
          {user && isAdmin(user) && !showFavoritesOnly && (
              <div className="mt-8">
                <Button onClick={() => setView('add-car')} variant="primary" className="text-xs">
                  <PlusCircle size={14} className="inline mr-2 mb-0.5" /> Consign Vehicle
                </Button>
              </div>
          )}
        </div>

        <FilterBar filters={filters} setFilters={setFilters} />

        {filteredCars.length === 0 && !loading ? (
          <div className="text-center py-24 border border-stone-300 bg-white shadow-sm max-w-2xl mx-auto p-12">
            <div className="mb-6 inline-block p-4 rounded-full bg-stone-50">
              <Car size={48} className="opacity-40" style={{ color: THEME.colors.leather }} />
            </div>
            <h3 className="text-2xl mb-4 uppercase tracking-widest" style={{ fontFamily: THEME.fonts.heading, color: THEME.colors.charcoal }}>
                {showFavoritesOnly ? "Garage Empty" : "Archives Empty"}
            </h3>
            <p className="mb-10 text-stone-500 font-serif">
                {showFavoritesOnly ? "You haven't selected any vehicles for your private collection yet." : "No vehicles match your current search criteria."}
            </p>
            <div className="flex justify-center gap-6">
               {isAdmin(user) && !showFavoritesOnly && <Button onClick={seedDatabase} variant="text">Restore Demo Collection</Button>}
               {isAdmin(user) && !showFavoritesOnly && <Button onClick={() => setView('add-car')} variant="outline">Manual Entry</Button>}
               {showFavoritesOnly && <Button onClick={() => setView('inventory')} variant="primary">Browse Collection</Button>}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredCars.map(car => (
              <CarCard 
                key={car.id} 
                car={car} 
                user={user} 
                isFavorite={favorites.includes(car.id)}
                toggleFavorite={toggleFavorite}
                onInquire={onInquire}
              />
            ))}
          </div>
        )}
        
        <SectionSeparator />
        
        <div className="text-center text-stone-500 text-sm font-serif italic">
          Viewing by appointment only. Please contact our concierge to arrange a private showing.
        </div>
      </div>
    </div>
  );
};

const Features = () => (
  <div className="py-24 bg-white border-t border-stone-200">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
        <div className="flex flex-col items-center">
          <div className="mb-6 text-[#C5A059]">
            <Award size={40} strokeWidth={1} />
          </div>
          <h3 className="text-xl font-bold mb-4 uppercase tracking-[0.2em]" style={{ fontFamily: THEME.fonts.heading, color: THEME.colors.charcoal }}>Authenticity</h3>
          <p className="text-stone-500 leading-loose" style={{ fontFamily: THEME.fonts.body }}>Every vehicle in our collection undergoes a rigorous 150-point inspection and historical verification process by our in-house historians.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="mb-6 text-[#C5A059]">
            <Globe size={40} strokeWidth={1} />
          </div>
          <h3 className="text-xl font-bold mb-4 uppercase tracking-[0.2em]" style={{ fontFamily: THEME.fonts.heading, color: THEME.colors.charcoal }}>Global Logistics</h3>
          <p className="text-stone-500 leading-loose" style={{ fontFamily: THEME.fonts.body }}>We handle white-glove delivery to any destination worldwide, including customs clearance and climate-controlled transport.</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="mb-6 text-[#C5A059]">
            <ShieldCheck size={40} strokeWidth={1} />
          </div>
          <h3 className="text-xl font-bold mb-4 uppercase tracking-[0.2em]" style={{ fontFamily: THEME.fonts.heading, color: THEME.colors.charcoal }}>Concierge Care</h3>
          <p className="text-stone-500 leading-loose" style={{ fontFamily: THEME.fonts.body }}>From storage and maintenance to rally preparation, our dedicated team ensures your investment remains in concours condition.</p>
        </div>
      </div>
    </div>
  </div>
);

const Hero = ({ setView }) => (
  <div className="relative h-screen flex items-center justify-center overflow-hidden">
    {/* Background Image with Slow Zoom Effect */}
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-black/40 z-10 mix-blend-multiply"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-[#F9F5EB] z-10"></div>
      {/* Updated Image: User provided URL */}
      <img 
        src="https://cdn.luxe.digital/media/20230206153646/best-classic-cars-vintage-Mercedes-300SL-Gullwing-luxe-digital.jpg.webp" 
        alt="Vintage Mercedes 300SL Gullwing" 
        className="w-full h-full object-cover animate-pan-slow"
        style={{ animation: 'pan 30s infinite alternate linear' }}
        onError={(e) => { 
            // Fallback if the specific local file isn't found in the environment
            e.target.onerror = null; 
            e.target.src = "https://cdn.luxe.digital/media/20230206153646/best-classic-cars-vintage-Mercedes-300SL-Gullwing-luxe-digital.jpg.webp"; 
        }}
      />
      <style>{`
        @keyframes pan {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
      `}</style>
    </div>

    {/* Content */}
    <div className="relative z-20 text-center px-6 max-w-5xl mt-16">
      <div className="mb-8 flex items-center justify-center gap-4 text-white/90 uppercase tracking-[0.3em] text-xs md:text-sm font-bold">
         <div className="h-px w-12 bg-white/50"></div>
         <span>Vintage Icons</span>
         <div className="h-px w-12 bg-white/50"></div>
      </div>
      
      <h1 className="text-6xl md:text-8xl lg:text-9xl mb-8 leading-[0.9] text-[#F9F5EB] drop-shadow-2xl" style={{ fontFamily: THEME.fonts.heading, fontWeight: 400 }}>
        Spirit of <br/> 
        <i className="font-serif text-[#C5A059]">The Road</i>
      </h1>
      
      <p className="text-xl md:text-2xl mb-12 font-light tracking-wide text-gray-200 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: THEME.fonts.body }}>
        Rediscover the romance of driving. Where every curve tells a story and every engine sings a song of freedom.
      </p>
      
      <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
        <button 
          onClick={() => setView('inventory')}
          className="group px-10 py-4 bg-[#722F37] text-[#F9F5EB] text-sm transition-all duration-500 uppercase tracking-[0.2em] hover:bg-white hover:text-[#1A1A1A] relative overflow-hidden"
          style={{ fontFamily: THEME.fonts.heading }}
        >
          <span className="relative z-10">View The Collection</span>
        </button>
        <button 
          onClick={() => setView('login')}
          className="text-white hover:text-[#C5A059] uppercase tracking-[0.2em] text-sm border-b border-transparent hover:border-[#C5A059] pb-1 transition-all duration-300"
          style={{ fontFamily: THEME.fonts.heading }}
        >
          Member Access
        </button>
      </div>
    </div>
    
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce text-white/50">
       <span className="text-[10px] uppercase tracking-[0.3em] block mb-2">Scroll</span>
       <div className="w-px h-12 bg-white/30 mx-auto"></div>
    </div>
  </div>
);

const Footer = () => (
  <footer className="pt-24 pb-12 px-6 bg-[#1A1A1A] text-stone-400 border-t-4" style={{ borderColor: THEME.colors.gold }}>
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
        <div className="col-span-1 md:col-span-1">
           <h1 className="text-3xl font-bold tracking-[0.1em] uppercase text-white mb-6" style={{ fontFamily: THEME.fonts.heading }}>
            Prestige
          </h1>
          <p className="leading-loose text-sm font-serif mb-8 text-stone-500">
            For over sixty years, Prestige Classics has been the premier destination for investment-grade vintage automobiles.
          </p>
          <div className="flex gap-6">
            <Mail size={20} className="hover:text-white cursor-pointer transition-colors" />
            <Phone size={20} className="hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>
        
        <div>
          <h4 className="text-xs font-bold mb-8 text-white uppercase tracking-[0.2em]" style={{ fontFamily: THEME.fonts.heading }}>Showroom</h4>
          <ul className="space-y-4 font-serif text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={16} className="mt-1 text-[#C5A059]" />
              <span>1964 Heritage Lane<br />Monterey, CA 93940</span>
            </li>
            <li className="flex items-start gap-3">
              <Clock size={16} className="mt-1 text-[#C5A059]" />
              <span>Mon - Fri: 09:00 - 18:00<br />Sat: 10:00 - 16:00</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold mb-8 text-white uppercase tracking-[0.2em]" style={{ fontFamily: THEME.fonts.heading }}>Legal</h4>
          <ul className="space-y-4 font-serif text-sm">
            <li className="hover:text-[#C5A059] cursor-pointer transition-colors">Privacy Policy</li>
            <li className="hover:text-[#C5A059] cursor-pointer transition-colors">Terms of Consignment</li>
            <li className="hover:text-[#C5A059] cursor-pointer transition-colors">Accessibility</li>
          </ul>
        </div>

        <div>
           <h4 className="text-xs font-bold mb-8 text-white uppercase tracking-[0.2em]" style={{ fontFamily: THEME.fonts.heading }}>Newsletter</h4>
           <p className="text-xs font-serif mb-4 text-stone-500">Subscribe for auction results and new arrivals.</p>
           <div className="flex border-b border-stone-700 pb-2">
             <input type="email" placeholder="Email Address" className="bg-transparent w-full focus:outline-none text-sm text-white font-serif placeholder-stone-600" />
             <button className="text-[#C5A059] hover:text-white uppercase text-xs tracking-widest">Join</button>
           </div>
        </div>
      </div>
      
      <div className="border-t border-stone-800 pt-12 flex flex-col md:flex-row justify-between items-center text-xs tracking-widest uppercase text-stone-600">
        <div>© {new Date().getFullYear()} Prestige Automobiles. All Rights Reserved.</div>
        <div className="mt-4 md:mt-0 flex gap-8">
           <span>Instagram</span>
           <span>Facebook</span>
           <span>Artsy</span>
        </div>
      </div>
    </div>
  </footer>
);

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); 
  const [authInitialized, setAuthInitialized] = useState(false);
  const [inquireCar, setInquireCar] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      // NOTE: We keep this hidden authentication to ensure the database connection 
      // is secure and stable, but to the user, the site appears completely public.
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
      setAuthInitialized(true);
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleInquire = (car) => {
      setInquireCar(car);
      setView('inquire');
  };

  if (!authInitialized) return null;

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-[#722F37] selection:text-white">
      <NoiseOverlay />
      
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500&display=swap');
          
          body {
            background-color: ${THEME.colors.cream};
            color: ${THEME.colors.charcoal};
          }
        `}
      </style>

      {/* Pass transparency prop only for 'home' view */}
      <Navbar user={user} setView={setView} view={view} isTransparent={view === 'home'} />

      <main className="flex-grow">
        {view === 'home' && (
          <>
            <Hero setView={setView} />
            <SectionSeparator />
            <Features />
          </>
        )}
        {view === 'inventory' && <Inventory user={user} setView={setView} onInquire={handleInquire} />}
        {view === 'favorites' && <Inventory user={user} setView={setView} showFavoritesOnly={true} onInquire={handleInquire} />}
        {view === 'inquire' && <InquireForm car={inquireCar} setView={setView} />}
        
        {view === 'login' && <AuthForm type="login" setView={setView} />}
        {view === 'signup' && <AuthForm type="signup" setView={setView} />}
        
        {view === 'add-car' && (
           isAdmin(user) ? <AddCarForm setView={setView} /> : 
           (user ? <Inventory user={user} setView={setView} onInquire={handleInquire} /> : <AuthForm type="login" setView={setView} />)
        )}
      </main>

      <Footer />
    </div>
  );
}