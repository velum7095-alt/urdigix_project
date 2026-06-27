import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import { createPortal } from "react-dom";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface LineItem {
  d: string;
  q: number;
  p: number;
}

interface Quotation {
  id: string;
  client: string;
  email: string;
  svc: string;
  amt: number;
  stat: string;
  date: string;
  due: string;
  notes: string;
  items: LineItem[];
  disc: number;
  currency?: string;
}

interface Invoice {
  id: string;
  client: string;
  email: string;
  svc: string;
  amt: number;
  stat: string;
  due: string;
  notes: string;
  currency?: string;
}

interface Followup {
  id: number;
  client: string;
  contact: string;
  last: string;
  next: string;
  stat: string;
  notes: string;
  fb?: string;
  insta?: string;
  web?: string;
}

interface Contract {
  id: string;
  client: string;
  email: string;
  proj: string;
  val: number;
  start: string;
  end: string;
  stat: string;
  scope: string;
  terms: string;
  currency?: string;
}

interface CMSPage {
  id: number;
  title: string;
  slug: string;
  stat: string;
  upd: string;
}

interface Message {
  id: number;
  from: string;
  email: string;
  unread: boolean;
  thread: { s: 'c' | 'm'; t: string; ts: string }[];
}

type AuthUser = { email: string } | null;

interface AuthCtx {
  user: AuthUser;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
}

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthCtx>({
  user: null,
  login: () => false,
  logout: () => {},
});

const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(() => {
    try {
      const s = localStorage.getItem("crm_session");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });

  const login = (email: string, pass: string): boolean => {
    const e = email.trim().toLowerCase();
    if ((e === "admin" || e === "admin@urdigix.com") && pass === "password") {
      const u = { email: "admin@urdigix.com" };
      setUser(u);
      localStorage.setItem("crm_session", JSON.stringify(u));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("crm_session");
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split('T')[0];
const fmtKES = (n: number, curr = "USD") => {
  const syms: Record<string, string> = { USD: "$", KES: "KES ", INR: "₹", KSH: "KSh " };
  const sym = syms[curr.toUpperCase()] || "KES ";
  return sym + Number(n).toLocaleString();
};
const fmtDate = (d: string) => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHLY_REV = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
function LoginPage() {
  const { login, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const ok = login(email, pass);
      setLoading(false);
      if (ok) {
        toast({ title: "Welcome!", description: "Logged in successfully." });
        navigate("/", { replace: true });
      } else {
        toast({ title: "Login Failed", description: "Invalid username or password.", variant: "destructive" });
      }
    }, 400);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)" }}>
      <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "40px 48px", width: "100%", maxWidth: 400, backdropFilter: "blur(20px)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, background: "linear-gradient(135deg,#f97316,#ea580c)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>⚡</div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, margin: 0 }}><span style={{ color: "#f97316" }}>UR</span>DIGIX CRM</h1>
          <p style={{ color: "#94a3b8", marginTop: 8, fontSize: 14 }}>Sign in to your workspace</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Username</label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin"
              required
              style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 500, display: "block", marginBottom: 6 }}>Password</label>
            <input
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg,#f97316,#ea580c)", border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p style={{ color: "#64748b", fontSize: 12, textAlign: "center", marginTop: 20 }}>
          Default: admin / password
        </p>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("dashboard");

  // CRM Global State
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [cmsPages, setCmsPages] = useState<CMSPage[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [activeMsg, setActiveMsg] = useState(0);

  // Modals & Temp States
  const [modalType, setModalType] = useState<string | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Modal Fields (combined for simpler components)
  const [qClient, setQClient] = useState("");
  const [qEmail, setQEmail] = useState("");
  const [qSvc, setQSvc] = useState("Website Development");
  const [qDue, setQDue] = useState("");
  const [qDisc, setQDisc] = useState(0);
  const [qStat, setQStat] = useState("Draft");
  const [qNotes, setQNotes] = useState("");
  const [qItems, setQItems] = useState<LineItem[]>([{ d: "", q: 1, p: 0 }]);

  const [iClient, setIClient] = useState("");
  const [iEmail, setIEmail] = useState("");
  const [iSvc, setISvc] = useState("Website Development");
  const [iDue, setIDue] = useState("");
  const [iDisc, setIDisc] = useState(0);
  const [iStat, setIStat] = useState("Unpaid");
  const [iNotes, setINotes] = useState("");
  const [iItems, setIItems] = useState<LineItem[]>([{ d: "", q: 1, p: 0 }]);

  const [fuClient, setFuClient] = useState("");
  const [fuContact, setFuContact] = useState("");
  const [fuLast, setFuLast] = useState("");
  const [fuNext, setFuNext] = useState("");
  const [fuStat, setFuStat] = useState("New Lead");
  const [fuNotes, setFuNotes] = useState("");
  const [fuFb, setFuFb] = useState("");
  const [fuInsta, setFuInsta] = useState("");
  const [fuWeb, setFuWeb] = useState("");

  const [cClient, setCClient] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cProj, setCProj] = useState("");
  const [cVal, setCVal] = useState(0);
  const [cStat, setCStat] = useState("Draft");
  const [cStart, setCStart] = useState("");
  const [cEnd, setCEnd] = useState("");
  const [cScope, setCScope] = useState("");
  const [cTerms, setCTerms] = useState("");

  const [cmsTitle, setCmsTitle] = useState("");
  const [cmsSlug, setCmsSlug] = useState("");
  const [cmsStat, setCmsStat] = useState("Draft");
  const [qCurr, setQCurr] = useState("USD");
  const [iCurr, setICurr] = useState("USD");
  const [cCurr, setCCurr] = useState("USD");

  const [msgInp, setMsgInp] = useState("");
  
  // PDF State
  const [pdfHTML, setPdfHTML] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  const showToast = (title: string) => {
    toast({ title });
  };

  // Badge utility
  const renderBadge = (s: string) => {
    const cls = s.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, '');
    return <span className={`badge badge-${cls}`}>{s}</span>;
  };

  // Modal Handlers
  const handleOpenQuoteModal = (idx: number | null = null) => {
    if (idx !== null) {
      const q = quotes[idx];
      setQClient(q.client);
      setQEmail(q.email);
      setQSvc(q.svc);
      setQDue(q.due);
      setQDisc(q.disc);
      setQStat(q.stat);
      setQNotes(q.notes);
      setQItems(q.items.length > 0 ? q.items : [{ d: "", q: 1, p: 0 }]);
      setQCurr(q.currency || "KES");
      setEditIndex(idx);
    } else {
      setQClient("");
      setQEmail("");
      setQSvc("Website Development");
      setQDue(today());
      setQDisc(0);
      setQStat("Draft");
      setQNotes("");
      setQItems([{ d: "", q: 1, p: 0 }]);
      setQCurr("USD");
      setEditIndex(null);
    }
    setModalType("quote");
  };

  const handleSaveQuote = () => {
    const items = qItems.filter(it => it.d || it.p);
    const sub = items.reduce((a, x) => a + x.q * x.p, 0);
    const amt = Math.round(sub - (sub * qDisc / 100));
    
    const q: Quotation = {
      id: editIndex !== null ? quotes[editIndex].id : 'Q-' + String(quotes.length + 1).padStart(3, '0'),
      client: qClient || 'Unknown',
      email: qEmail,
      svc: qSvc,
      amt,
      disc: qDisc,
      items,
      stat: qStat,
      date: today(),
      due: qDue,
      notes: qNotes,
      currency: qCurr
    };

    if (editIndex !== null) {
      const nq = [...quotes];
      nq[editIndex] = q;
      setQuotes(nq);
    } else {
      setQuotes([q, ...quotes]);
    }
    setModalType(null);
    showToast("Quotation saved!");
  };

  const handleOpenInvoiceModal = () => {
    setIClient("");
    setIEmail("");
    setISvc("Website Development");
    setIDue(today());
    setIDisc(0);
    setIStat("Unpaid");
    setINotes("");
    setIItems([{ d: "", q: 1, p: 0 }]);
    setICurr("USD");
    setModalType("invoice");
  };

  const handleSaveInvoice = () => {
    const items = iItems.filter(it => it.d || it.p);
    const sub = items.reduce((a, x) => a + x.q * x.p, 0);
    const amt = Math.round(sub - (sub * iDisc / 100)) || 50000;

    const inv: Invoice = {
      id: 'INV-' + String(invoices.length + 1).padStart(3, '0'),
      client: iClient || 'Unknown',
      email: iEmail,
      svc: iSvc,
      amt,
      stat: iStat,
      due: iDue,
      notes: iNotes,
      currency: iCurr
    };

    setInvoices([inv, ...invoices]);
    setModalType(null);
    showToast("Invoice created!");
  };

  const handleOpenFollowupModal = (idx: number | null = null) => {
    if (idx !== null) {
      const f = followups[idx];
      setFuClient(f.client);
      setFuContact(f.contact);
      setFuLast(f.last);
      setFuNext(f.next);
      setFuStat(f.stat);
      setFuNotes(f.notes);
      setFuFb(f.fb || "");
      setFuInsta(f.insta || "");
      setFuWeb(f.web || "");
      setEditIndex(idx);
    } else {
      setFuClient("");
      setFuContact("");
      setFuLast(today());
      setFuNext(today());
      setFuStat("New Lead");
      setFuNotes("");
      setFuFb("");
      setFuInsta("");
      setFuWeb("");
      setEditIndex(null);
    }
    setModalType("followup");
  };

  const handleSaveFollowup = () => {
    const f: Followup = {
      id: editIndex !== null ? followups[editIndex].id : Date.now(),
      client: fuClient || 'Unknown',
      contact: fuContact,
      last: fuLast,
      next: fuNext,
      stat: fuStat,
      notes: fuNotes,
      fb: fuFb,
      insta: fuInsta,
      web: fuWeb
    };

    if (editIndex !== null) {
      const nf = [...followups];
      nf[editIndex] = f;
      setFollowups(nf);
    } else {
      setFollowups([f, ...followups]);
    }
    setModalType(null);
    showToast("Follow-up saved!");
  };

  const handleOpenContractModal = () => {
    setCClient("");
    setCEmail("");
    setCProj("");
    setCVal(0);
    setCStat("Draft");
    setCStart(today());
    setCEnd("");
    setCScope("");
    setCTerms("");
    setCCurr("USD");
    setModalType("contract");
  };

  const handleSaveContract = () => {
    const con: Contract = {
      id: 'CON-' + String(contracts.length + 1).padStart(3, '0'),
      client: cClient || 'Unknown',
      email: cEmail,
      proj: cProj,
      val: cVal,
      stat: cStat,
      start: cStart,
      end: cEnd,
      scope: cScope,
      terms: cTerms,
      currency: cCurr
    };
    setContracts([con, ...contracts]);
    setModalType(null);
    showToast("Contract saved!");
  };

  const handleOpenCmsModal = () => {
    setCmsTitle("");
    setCmsSlug("");
    setCmsStat("Draft");
    setModalType("cms");
  };

  const handleSaveCms = () => {
    const page: CMSPage = {
      id: Date.now(),
      title: cmsTitle || 'Untitled',
      slug: cmsSlug || '/untitled',
      stat: cmsStat,
      upd: today()
    };
    setCmsPages([page, ...cmsPages]);
    setModalType(null);
    showToast("Page saved!");
  };

  // Inline Actions
  const handleToggleCms = (idx: number) => {
    const next = [...cmsPages];
    next[idx].stat = next[idx].stat === 'Published' ? 'Draft' : 'Published';
    next[idx].upd = today();
    setCmsPages(next);
    showToast("Status updated");
  };

  const handleMarkPaid = (idx: number) => {
    const next = [...invoices];
    next[idx].stat = 'Paid';
    setInvoices(next);
    showToast("Invoice marked Paid!");
  };

  const handleDeleteQuote = (idx: number) => {
    if (window.confirm("Delete quotation?")) {
      setQuotes(quotes.filter((_, i) => i !== idx));
      showToast("Deleted");
    }
  };

  const handleDeleteInvoice = (idx: number) => {
    if (window.confirm("Delete?")) {
      setInvoices(invoices.filter((_, i) => i !== idx));
      showToast("Deleted");
    }
  };

  const handleDeleteFollowup = (idx: number) => {
    if (window.confirm("Delete?")) {
      setFollowups(followups.filter((_, i) => i !== idx));
      showToast("Deleted");
    }
  };

  const handleDeleteContract = (idx: number) => {
    if (window.confirm("Delete?")) {
      setContracts(contracts.filter((_, i) => i !== idx));
      showToast("Deleted");
    }
  };

  const handleDeleteCms = (idx: number) => {
    if (window.confirm("Delete?")) {
      setCmsPages(cmsPages.filter((_, i) => i !== idx));
      showToast("Deleted");
    }
  };

  const handleSendQuote = (idx: number) => {
    const next = [...quotes];
    next[idx].stat = 'Sent';
    setQuotes(next);
    showToast("Quote sent to " + next[idx].client);
  };

  const handleSendMsg = () => {
    if (!msgInp.trim()) return;
    const next = [...messages];
    next[activeMsg].thread.push({ s: 'm', t: msgInp, ts: 'Just now' });
    setMessages(next);
    setMsgInp("");
    showToast("Message sent!");
  };

  // PDF Print
  const handlePrintInvoice = (inv: Invoice) => {
    const html = `
      <div class="pdf-c" style="font-family:'Segoe UI',Arial,sans-serif;color:#1e293b;max-width:800px;margin:0 auto;padding:40px;line-height:1.5">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:40px;border-bottom:2px solid #f97316;padding-bottom:20px">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:36px;height:36px;background:linear-gradient(135deg,#f97316,#ea580c);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:bold">⚡</div>
            <div style="font-size:24px;font-weight:800;letter-spacing:-0.5px;color:#0f172a"><span style="color:#f97316">UR</span>DIGIX</div>
          </div>
          <div style="text-align:right">
            <h1 style="color:#f97316;margin:0;font-size:28px;font-weight:800;letter-spacing:1px">INVOICE</h1>
            <p style="margin:4px 0 0;color:#64748b;font-size:12px;font-weight:600">${inv.id}</p>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:40px">
          <div>
            <h3 style="color:#0f172a;font-size:13px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">From</h3>
            <p style="margin:0;font-weight:600;color:#334155">URDIGIX Digital Agency</p>
            <p style="margin:2px 0;color:#64748b;font-size:13px">Hyderabad, India</p>
            <p style="margin:2px 0;color:#64748b;font-size:13px">urdigix@gmail.com</p>
            <p style="margin:2px 0;color:#64748b;font-size:13px">+91 8142908550</p>
          </div>
          <div style="text-align:right">
            <h3 style="color:#0f172a;font-size:13px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Billed To</h3>
            <p style="margin:0;font-weight:600;color:#334155">${inv.client}</p>
            <p style="margin:2px 0;color:#64748b;font-size:13px">${inv.email}</p>
          </div>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:30px;font-size:13px">
          <thead>
            <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">
              <th style="padding:12px 16px;text-align:left;color:#475569;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Invoice No</th>
              <th style="padding:12px 16px;text-align:left;color:#475569;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Service</th>
              <th style="padding:12px 16px;text-align:left;color:#475569;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Due Date</th>
              <th style="padding:12px 16px;text-align:right;color:#475569;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid #f1f5f9">
              <td style="padding:12px 16px;color:#334155;font-family:monospace">${inv.id}</td>
              <td style="padding:12px 16px;color:#334155;font-weight:600">${inv.svc}</td>
              <td style="padding:12px 16px;color:#334155">${fd(inv.due)}</td>
              <td style="padding:12px 16px;text-align:right;font-weight:700;color:${inv.stat === 'Paid' ? '#22c55e' : '#f59e0b'}">${inv.stat}</td>
            </tr>
          </tbody>
        </table>
        <table style="width:100%;border-collapse:collapse;margin-bottom:40px;font-size:13px">
          <thead>
            <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">
              <th style="padding:12px 16px;text-align:left;color:#475569;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Description</th>
              <th style="padding:12px 16px;text-align:right;color:#475569;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid #f1f5f9">
              <td style="padding:16px;color:#334155">${inv.svc} Services & Support</td>
              <td style="padding:16px;text-align:right;color:#334155;font-weight:600">${inv.amt.toLocaleString()} KES</td>
            </tr>
            <tr style="background:#f8fafc;font-size:14px;font-weight:700">
              <td style="padding:16px;color:#0f172a">Total Amount Due</td>
              <td style="padding:16px;text-align:right;color:#f97316">${inv.amt.toLocaleString()} KES</td>
            </tr>
          </tbody>
        </table>
        <div style="background:#f8fafc;border-left:4px solid #f97316;padding:16px;border-radius:0 8px 8px 0;margin-bottom:60px">
          <h4 style="margin:0 0 6px;color:#0f172a;font-size:12px;text-transform:uppercase;letter-spacing:0.5px">Payment Terms & Notes</h4>
          <p style="margin:0;color:#64748b;font-size:12px">${inv.notes || 'Please settle this invoice within the due date. For bank transfers, use the registered bank details on file. Thank you for choosing URDIGIX.'}</p>
        </div>
        <div class="sig-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:80px;margin-top:60px">
          <div style="border-top:1px solid #cbd5e1;padding-top:8px;font-size:12px;color:#64748b">Client Signature<br/>Date: _______________</div>
          <div style="border-top:1px solid #cbd5e1;padding-top:8px;font-size:12px;color:#64748b;text-align:right">Authorized (URDIGIX Digital Agency)<br/>Date: _______________</div>
        </div>
      </div>
    `;
    setPdfHTML(html);
  };

  const handlePrintContract = (c: Contract) => {
    const html = `
      <div class="pdf-c">
        <h1>SERVICE AGREEMENT</h1>
        <p class="sub" style="text-align:center;color:#666;font-style:italic">URDIGIX Digital Agency &times; ${c.client}</p>
        <h2>Parties</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:16px">
          <div><strong>SERVICE PROVIDER</strong><br/>URDIGIX Digital Agency<br/>Hyderabad, India<br/>urdigix@gmail.com | +91 8142908550<br/>urdigix.com</div>
          <div><strong>CLIENT</strong><br/>${c.client}<br/>${c.email}</div>
        </div>
        <h2>Project Details</h2>
        <table>
          <tr><th>Project</th><td>${c.proj}</td></tr>
          <tr><th>Value</th><td>${kes(c.val)}</td></tr>
          <tr><th>Start Date</th><td>${fd(c.start)}</td></tr>
          <tr><th>End Date</th><td>${fd(c.end)}</td></tr>
          <tr><th>Status</th><td>${c.stat}</td></tr>
        </table>
        <h2>Scope of Work</h2>
        <p style="font-size:14px">${c.scope || 'As discussed and agreed.'}</p>
        <h2>Payment Terms</h2>
        <p style="font-size:14px">${c.terms || 'As agreed.'}</p>
        <h2>General Terms</h2>
        <p style="font-size:13px;line-height:1.9;color:#444">
          1. Service Provider agrees to complete work within agreed timeline.<br/>
          2. Client agrees to provide necessary content and feedback promptly.<br/>
          3. Scope changes require written agreement and may incur additional charges.<br/>
          4. Service Provider retains right to showcase work in portfolio.<br/>
          5. Both parties agree to maintain confidentiality of proprietary information.<br/>
          6. Disputes resolved through good-faith negotiation before legal action.
        </p>
        <h2>Signatures</h2>
        <div class="sig-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:40px">
          <div class="sig-box" style="border-top:1px solid #111;padding-top:8px;font-size:13px"><strong>CLIENT</strong><br/>${c.client}<br/><br/>Signature: _______________<br/>Date: _______________</div>
          <div class="sig-box" style="border-top:1px solid #111;padding-top:8px;font-size:13px"><strong>SERVICE PROVIDER</strong><br/>URDIGIX Digital Agency<br/><br/>Signature: _______________<br/>Date: _______________</div>
        </div>
        <p style="text-align:center;font-size:11px;color:#999;margin-top:40px">Generated by URDIGIX CRM &mdash; ${new Date().toLocaleDateString()}</p>
      </div>
    `;
    setPdfHTML(html);
  };

  useEffect(() => {
    if (pdfHTML) {
      window.print();
      setPdfHTML(null);
    }
  }, [pdfHTML]);

  // Date formatting shortcut
  const fd = (d: string) => fmtDate(d);
  const kes = (n: number, curr = "USD") => fmtKES(n, curr);

  // Common stats computations
  const totalPaidRevenue = invoices.filter(i => i.stat === 'Paid').reduce((s, i) => s + i.amt, 0);
  const pendingRevenue = invoices.filter(i => i.stat !== 'Paid').reduce((s, i) => s + i.amt, 0);
  const uniqueClients = new Set([...quotes.map(q => q.client), ...invoices.map(i => i.client)]).size;
  const activeContractsCount = contracts.filter(c => c.stat === 'Active').length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0d1117", color: "#e6edf3" }}>
      {/* ─── SIDEBAR ───────────────────────────────────────────────────────── */}
      <aside id="sidebar" style={{ width: 220, background: "#161b22", borderRight: "1px solid #30363d", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100 }}>
        <div className="logo" style={{ padding: "20px 16px", borderBottom: "1px solid #30363d", display: "flex", alignItems: "center", gap: 10 }}>
          <div className="logo-icon" style={{ width: 36, height: 36, background: "linear-gradient(135deg,#f97316,#ea580c)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#fff" }}>⚡</div>
          <div>
            <div className="logo-text" style={{ fontWeight: 800, fontSize: 15 }}><span style={{ color: "#f97316" }}>UR</span>DIGIX</div>
            <div className="logo-sub" style={{ fontSize: 10, color: "#8b949e" }}>CRM Workspace</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          <div className="nav-label" style={{ fontSize: 10, color: "#8b949e", fontWeight: 600, letterSpacing: 1, padding: "8px 8px 4px", textTransform: "uppercase" }}>Main</div>
          {[
            { id: "dashboard", label: "Dashboard", icon: <rect x="3" y="3" width="7" height="7" /> },
            { id: "quotations", label: "Quotations", icon: <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /> },
            { id: "invoices", label: "Invoices", icon: <rect x="2" y="5" width="20" height="14" rx="2" /> },
            { id: "followups", label: "Client Follow-ups", icon: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /> },
            { id: "contracts", label: "Contracts", icon: <path d="M20 7l-8-4-8 4m16 0v10l-8 4-8-4V7" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, cursor: "pointer",
                fontSize: "13.5px", border: "none", background: "none", width: "100%", textAlign: "left", marginBottom: 2
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                {tab.icon}
                {tab.id === "quotations" && <><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>}
                {tab.id === "invoices" && <line x1="2" y1="10" x2="22" y2="10" />}
                {tab.id === "followups" && <><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></>}
              </svg>
              {tab.label}
            </button>
          ))}
          <div className="nav-label" style={{ fontSize: 10, color: "#8b949e", fontWeight: 600, letterSpacing: 1, padding: "8px 8px 4px", textTransform: "uppercase", marginTop: 8 }}>Manage</div>
          {[
            { id: "cms", label: "CMS", icon: <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /> },
            { id: "messages", label: "Messages", icon: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /> },
            { id: "analytics", label: "Analytics", icon: <line x1="18" y1="20" x2="18" y2="10" /> },
            { id: "settings", label: "Settings", icon: <circle cx="12" cy="12" r="3" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, cursor: "pointer",
                fontSize: "13.5px", border: "none", background: "none", width: "100%", textAlign: "left", marginBottom: 2
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                {tab.icon}
                {tab.id === "cms" && <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />}
                {tab.id === "analytics" && <><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>}
                {tab.id === "settings" && <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />}
              </svg>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="nav-footer" style={{ padding: "12px 8px", borderTop: "1px solid #30363d" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px" }}>
            <div className="avatar" style={{ width: 34, height: 34, background: "linear-gradient(135deg,#f97316,#a855f7)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#fff" }}>AD</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Admin</div>
              <div style={{ fontSize: 11, color: "#8b949e", cursor: "pointer" }} onClick={handleLogout}>🚪 Sign Out</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ────────────────────────────────────────────────── */}
      <div id="main" style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        <div id="topbar" style={{ background: "#161b22", borderBottom: "1px solid #30363d", padding: "12px 28px", display: "flex", alignItems: "center", justifyBetween: "space-between", flexShrink: 0 }}>
          <div className="topbar-title" style={{ fontSize: 18, fontWeight: 700 }}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace("followups", "Follow-ups")}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: "auto" }}>
            <div style={{ fontSize: 12, color: "#8b949e" }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="avatar" style={{ width: 34, height: 34, background: "linear-gradient(135deg,#f97316,#a855f7)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#fff" }}>AD</div>
          </div>
        </div>

        <div id="content" style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          
          {/* ════ DASHBOARD ════ */}
          {activeTab === "dashboard" && (
            <div className="view active">
              <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
                <div className="stat-card orange"><div className="stat-label">Total Clients</div><div className="stat-value">{uniqueClients}</div><div className="stat-sub">Unique clients</div></div>
                <div className="stat-card green"><div className="stat-label">Paid Revenue</div><div className="stat-value" style={{ fontSize: 18 }}>{kes(totalPaidRevenue)}</div><div className="stat-sub">From paid invoices</div></div>
                <div className="stat-card blue"><div className="stat-label">Active Quotations</div><div className="stat-value">{quotes.filter(q => q.stat === 'Sent').length}</div><div className="stat-sub">Awaiting response</div></div>
                <div className="stat-card red"><div className="stat-label">Pending Amount</div><div className="stat-value" style={{ fontSize: 18 }}>{kes(pendingRevenue)}</div><div className="stat-sub">Unpaid + Overdue</div></div>
                <div className="stat-card purple"><div className="stat-label">Active Contracts</div><div className="stat-value">{activeContractsCount}</div><div className="stat-sub">Ongoing projects</div></div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, marginBottom: 20 }}>
                <div className="card">
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid #30363d", fontWeight: 700, fontSize: 14 }}>Monthly Revenue (KES)</div>
                  <div style={{ padding: "16px 20px" }}>
                    <div className="chart-bar-wrap">
                      {MONTHLY_REV.map((v, i) => {
                        const mx = Math.max(...MONTHLY_REV) || 1;
                        return <div key={i} className="chart-bar" style={{ height: Math.max(8, Math.round(v / mx * 80)) }} data-val={kes(v)} title={MONTHS[i]}></div>;
                      })}
                    </div>
                    <div className="chart-labels">{MONTHS.map(m => <span key={m}>{m}</span>)}</div>
                  </div>
                </div>
                <div className="card">
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid #30363d", fontWeight: 700, fontSize: 14 }}>Recent Activity</div>
                  <div className="activity-list">
                    <div style={{ padding: "16px", textAlign: "center", color: "#8b949e", fontSize: 13.5 }}>
                      No recent activity.
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="card">
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid #30363d", fontWeight: 700, fontSize: 14 }}>Recent Quotations</div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Client</th><th>Amount</th><th>Status</th></tr></thead>
                      <tbody>
                        {quotes.slice(0, 5).map((q, i) => (
                          <tr key={i}><td>{q.client}</td><td>{kes(q.amt, q.currency)}</td><td>{renderBadge(q.stat)}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="card">
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid #30363d", fontWeight: 700, fontSize: 14 }}>Pending Follow-ups</div>
                  <div className="table-wrap">
                    <table>
                      <thead><tr><th>Client</th><th>Due</th><th>Status</th></tr></thead>
                      <tbody>
                        {followups.slice(0, 5).map((f, i) => {
                          const late = new Date(f.next + 'T12:00:00') < new Date() && f.stat !== 'Closed Won' && f.stat !== 'Closed Lost';
                          return (
                            <tr key={i}>
                              <td>{f.client}</td>
                              <td style={{ color: late ? "var(--red)" : "inherit" }}>{late ? "⚠️ " : ""}{fd(f.next)}</td>
                              <td>{renderBadge(f.stat)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ QUOTATIONS ════ */}
          {activeTab === "quotations" && (
            <div className="view active">
              <div className="section-header">
                <div><div className="section-title">Quotations</div><div style={{ fontSize: 12, color: "#8b949e", marginTop: 2 }}>Manage client proposals</div></div>
                <button className="btn btn-primary" onClick={() => handleOpenQuoteModal(null)}>+ New Quotation</button>
              </div>
              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>ID</th><th>Client</th><th>Service</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                    <tbody>
                      {quotes.map((q, i) => (
                        <tr key={q.id}>
                          <td style={{ color: "var(--muted)", fontFamily: "monospace", fontSize: 12 }}>{q.id}</td>
                          <td><div style={{ fontWeight: 600 }}>{q.client}</div><div style={{ fontSize: 11, color: "#8b949e" }}>{q.email}</div></td>
                          <td>{q.svc}</td>
                          <td style={{ fontWeight: 700 }}>{kes(q.amt, q.currency)}</td>
                          <td>
                            <select
                              style={{ background: "transparent", border: "1px solid #30363d", color: "#e6edf3", borderRadius: 6, padding: "3px 6px", fontSize: 12, cursor: "pointer" }}
                              value={q.stat}
                              onChange={(e) => {
                                const next = [...quotes];
                                next[i].stat = e.target.value;
                                setQuotes(next);
                                showToast("Status updated");
                              }}
                            >
                              {['Draft', 'Sent', 'Accepted', 'Rejected'].map(s => <option key={s}>{s}</option>)}
                            </select>
                          </td>
                          <td style={{ color: "#8b949e", fontSize: 12 }}>{fd(q.date)}</td>
                          <td>
                            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => viewQ(i)}>View</button>
                              <button className="btn btn-ghost btn-sm" onClick={() => handleOpenQuoteModal(i)}>Edit</button>
                              <button className="btn btn-blue btn-sm" onClick={() => handleSendQuote(i)}>Send</button>
                              <button className="btn btn-red btn-sm" onClick={() => handleDeleteQuote(i)}>Del</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════ INVOICES ════ */}
          {activeTab === "invoices" && (
            <div className="view active">
              <div className="section-header">
                <div><div className="section-title">Invoices</div><div style={{ fontSize: 12, color: "#8b949e", marginTop: 2 }}>Track payments & billing</div></div>
                <button className="btn btn-primary" onClick={handleOpenInvoiceModal}>+ New Invoice</button>
              </div>
              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>ID</th><th>Client</th><th>Service</th><th>Amount</th><th>Status</th><th>Due Date</th><th>Actions</th></tr></thead>
                    <tbody>
                      {invoices.map((inv, i) => (
                        <tr key={inv.id}>
                          <td style={{ color: "var(--muted)", fontFamily: "monospace", fontSize: 12 }}>{inv.id}</td>
                          <td><div style={{ fontWeight: 600 }}>{inv.client}</div><div style={{ fontSize: 11, color: "#8b949e" }}>{inv.email}</div></td>
                          <td>{inv.svc}</td>
                          <td style={{ fontWeight: 700 }}>{kes(inv.amt, inv.currency)}</td>
                          <td>{renderBadge(inv.stat)}</td>
                          <td style={{ color: inv.stat === 'Overdue' ? "var(--red)" : "#8b949e" }}>{fd(inv.due)}</td>
                          <td>
                            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                              {inv.stat !== 'Paid' && <button className="btn btn-green btn-sm" onClick={() => handleMarkPaid(i)}>✓ Paid</button>}
                              <button className="btn btn-blue btn-sm" onClick={() => handlePrintInvoice(inv)}>⬇ PDF</button>
                              <button className="btn btn-red btn-sm" onClick={() => handleDeleteInvoice(i)}>Del</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════ FOLLOW-UPS ════ */}
          {activeTab === "followups" && (
            <div className="view active">
              <div className="section-header">
                <div><div className="section-title">Client Follow-ups</div><div style={{ fontSize: 12, color: "#8b949e", marginTop: 2 }}>Track leads and client relationships</div></div>
                <button className="btn btn-primary" onClick={() => handleOpenFollowupModal(null)}>+ Add Follow-up</button>
              </div>
              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Client</th><th>Contact</th><th>Last Contact</th><th>Next Follow-up</th><th>Status</th><th>Notes</th><th>Actions</th></tr></thead>
                    <tbody>
                      {followups.map((f, i) => {
                        const late = new Date(f.next + 'T12:00:00') < new Date() && f.stat !== 'Closed Won' && f.stat !== 'Closed Lost';
                        return (
                          <tr key={f.id} className={late ? "overdue" : ""}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{f.client}</div>
                              {late && <div style={{ fontSize: 10, color: "var(--red)", fontWeight: 600 }}>⚠ OVERDUE</div>}
                            </td>
                            <td style={{ fontSize: 12, color: "#8b949e" }}>
                              <div>{f.contact}</div>
                              <div style={{ display: "flex", gap: 8, marginTop: 4, fontSize: 11 }}>
                                {f.fb && <a href={f.fb} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", textDecoration: "none" }} title="Facebook">FB ↗</a>}
                                {f.insta && <a href={f.insta} target="_blank" rel="noopener noreferrer" style={{ color: "#a855f7", textDecoration: "none" }} title="Instagram">IG ↗</a>}
                                {f.web && <a href={f.web} target="_blank" rel="noopener noreferrer" style={{ color: "#f97316", textDecoration: "none" }} title="Website">WEB ↗</a>}
                              </div>
                            </td>
                            <td style={{ color: "#8b949e", fontSize: 12 }}>{fd(f.last)}</td>
                            <td style={{ color: late ? "var(--red)" : "inherit", fontWeight: late ? 700 : 400 }}>{fd(f.next)}</td>
                            <td>{renderBadge(f.stat)}</td>
                            <td style={{ maxWidth: 180, fontSize: 12, color: "#8b949e" }}>{f.notes}</td>
                            <td>
                              <div style={{ display: "flex", gap: 5 }}>
                                <button className="btn btn-ghost btn-sm" onClick={() => handleOpenFollowupModal(i)}>Edit</button>
                                <button className="btn btn-red btn-sm" onClick={() => handleDeleteFollowup(i)}>Del</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════ CONTRACTS ════ */}
          {activeTab === "contracts" && (
            <div className="view active">
              <div className="section-header">
                <div><div className="section-title">Contracts</div><div style={{ fontSize: 12, color: "#8b949e", marginTop: 2 }}>Client agreements</div></div>
                <button className="btn btn-primary" onClick={handleOpenContractModal}>+ New Contract</button>
              </div>
              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>ID</th><th>Client</th><th>Project</th><th>Value</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {contracts.map((c, i) => (
                        <tr key={c.id}>
                          <td style={{ color: "var(--muted)", fontFamily: "monospace", fontSize: 12 }}>{c.id}</td>
                          <td><div style={{ fontWeight: 600 }}>{c.client}</div><div style={{ fontSize: 11, color: "#8b949e" }}>{c.email}</div></td>
                          <td>{c.proj}</td>
                          <td style={{ fontWeight: 700 }}>{kes(c.val, c.currency)}</td>
                          <td style={{ color: "#8b949e", fontSize: 12 }}>{fd(c.start)}</td>
                          <td style={{ color: "#8b949e", fontSize: 12 }}>{fd(c.end)}</td>
                          <td>{renderBadge(c.stat)}</td>
                          <td>
                            <div style={{ display: "flex", gap: 5 }}>
                              <button className="btn btn-purple btn-sm" onClick={() => handlePrintContract(c)}>⬇ PDF</button>
                              <button className="btn btn-red btn-sm" onClick={() => handleDeleteContract(i)}>Del</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════ CMS ════ */}
          {activeTab === "cms" && (
            <div className="view active">
              <div className="section-header">
                <div className="section-title">Content Management</div>
                <button className="btn btn-primary" onClick={handleOpenCmsModal}>+ New Page</button>
              </div>
              <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
                <div className="stat-card blue"><div className="stat-label">Total Pages</div><div className="stat-value">{cmsPages.length}</div></div>
                <div className="stat-card green"><div className="stat-label">Published</div><div className="stat-value">{cmsPages.filter(p => p.stat === 'Published').length}</div></div>
                <div className="stat-card orange"><div className="stat-label">Drafts</div><div className="stat-value">{cmsPages.filter(p => p.stat === 'Draft').length}</div></div>
              </div>
              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Page Title</th><th>Slug</th><th>Status</th><th>Last Updated</th><th>Actions</th></tr></thead>
                    <tbody>
                      {cmsPages.map((p, i) => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 600 }}>{p.title}</td>
                          <td style={{ fontFamily: "monospace", fontSize: 12, color: "#8b949e" }}>{p.slug}</td>
                          <td>{renderBadge(p.stat)}</td>
                          <td style={{ color: "#8b949e", fontSize: 12 }}>{fd(p.upd)}</td>
                          <td>
                            <div style={{ display: "flex", gap: 5 }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => handleToggleCms(i)}>{p.stat === 'Published' ? 'Unpublish' : 'Publish'}</button>
                              <button className="btn btn-red btn-sm" onClick={() => handleDeleteCms(i)}>Del</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════ MESSAGES ════ */}
          {activeTab === "messages" && (
            <div className="view active">
              <div className="section-title" style={{ marginBottom: 16 }}>Client Messages</div>
              <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, height: "calc(100vh - 160px)" }}>
                <div className="card" style={{ overflowY: "auto", height: "100%", margin: 0 }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #30363d", fontSize: 13, fontWeight: 700 }}>
                    Inbox 
                    {messages.filter(m => m.unread).length > 0 && (
                      <span id="unread-badge" style={{ background: "var(--orange)", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 700, marginLeft: 6 }}>
                        {messages.filter(m => m.unread).length}
                      </span>
                    )}
                  </div>
                  <div id="msg-list">
                    {messages.map((m, i) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setActiveMsg(i);
                          const next = [...messages];
                          next[i].unread = false;
                          setMessages(next);
                        }}
                        style={{ padding: "12px 16px", borderBottom: "1px solid #30363d", cursor: "pointer", background: activeMsg === i ? "rgba(249,115,22,0.08)" : "transparent", transition: ".15s" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                          <span style={{ fontWeight: m.unread ? 700 : 500, fontSize: 13 }}>{m.from}</span>
                          {m.unread && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--orange)", flexShrink: 0 }}></span>}
                        </div>
                        <div style={{ fontSize: 11, color: "#8b949e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {m.thread[m.thread.length - 1].t}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%", margin: 0 }}>
                  <div id="msg-hdr" style={{ padding: "16px 20px", borderBottom: "1px solid #30363d" }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{messages[activeMsg].from}</div>
                    <div style={{ fontSize: 12, color: "#8b949e" }}>{messages[activeMsg].email}</div>
                  </div>
                  <div id="msg-body" style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                    {messages[activeMsg].thread.map((msg, idx) => (
                      <div key={idx} style={{ display: "flex", flexDirection: msg.s === 'm' ? "row-reverse" : "row", gap: 10, alignItems: "flex-end" }}>
                        <div style={{ background: msg.s === 'm' ? "var(--orange)" : "rgba(255,255,255,0.08)", color: msg.s === 'm' ? "#fff" : "#e6edf3", padding: "10px 14px", borderRadius: msg.s === 'm' ? "16px 16px 4px 16px" : "16px 16px 16px 4px", maxWidth: "65%", fontSize: "13.5px", lineHeight: 1.5 }}>
                          {msg.t}
                          <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: msg.s === 'm' ? "right" : "left" }}>{msg.ts}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: 16, borderTop: "1px solid #30363d", display: "flex", gap: 10 }}>
                    <input
                      id="msg-inp"
                      placeholder="Type a reply..."
                      value={msgInp}
                      onChange={(e) => setMsgInp(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendMsg(); }}
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #30363d", borderRadius: 8, padding: "9px 12px", color: "#e6edf3", fontSize: "13.5px", outline: "none", width: "100%" }}
                    />
                    <button className="btn btn-primary" onClick={handleSendMsg}>Send</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ ANALYTICS ════ */}
          {activeTab === "analytics" && (
            <div className="view active">
              <div className="section-title" style={{ marginBottom: 20 }}>Analytics Overview</div>
              <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
                <div className="stat-card orange"><div className="stat-label">Total Revenue</div><div className="stat-value">{kes(totalPaidRevenue)}</div><div className="stat-sub">Paid invoices</div></div>
                <div className="stat-card green"><div className="stat-label">Paid Invoices</div><div className="stat-value">{invoices.filter(i => i.stat === 'Paid').length}</div></div>
                <div className="stat-card red"><div className="stat-label">Overdue</div><div className="stat-value">{invoices.filter(i => i.stat === 'Overdue').length}</div></div>
                <div className="stat-card blue"><div className="stat-label">Win Rate</div><div className="stat-value">{Math.round(followups.filter(f => f.stat === 'Closed Won').length / followups.length * 100)}%</div></div>
                <div className="stat-card purple"><div className="stat-label">Avg Deal</div><div className="stat-value">{kes(invoices.length ? Math.round(invoices.reduce((s, i) => s + i.amt, 0) / invoices.length) : 0)}</div></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="card">
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid #30363d", fontWeight: 700, fontSize: 14 }}>Revenue by Month (KES)</div>
                  <div style={{ padding: "20px" }}>
                    <div className="chart-bar-wrap" style={{ height: 120 }}>
                      {MONTHLY_REV.map((v, i) => {
                        const mx = Math.max(...MONTHLY_REV) || 1;
                        return <div key={i} className="chart-bar" style={{ height: Math.max(8, Math.round(v / mx * 120)) }} data-val={kes(v)} title={MONTHS[i]}></div>;
                      })}
                    </div>
                    <div className="chart-labels">{MONTHS.map(m => <span key={m}>{m}</span>)}</div>
                  </div>
                </div>
                <div className="card">
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid #30363d", fontWeight: 700, fontSize: 14 }}>Lead Pipeline</div>
                  <div style={{ padding: "16px 20px" }}>
                    {[
                      { s: 'New Lead', col: 'var(--blue)' },
                      { s: 'In Progress', col: 'var(--orange)' },
                      { s: 'Proposal Sent', col: 'var(--purple)' },
                      { s: 'Negotiating', col: 'var(--yellow)' },
                      { s: 'Closed Won', col: 'var(--green)' },
                      { s: 'Closed Lost', col: 'var(--red)' }
                    ].map(stage => {
                      const cnt = followups.filter(f => f.stat === stage.s).length;
                      const pct = followups.length ? Math.round(cnt / followups.length * 100) : 0;
                      return (
                        <div key={stage.s} style={{ marginBottom: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                            <span>{stage.s}</span>
                            <span style={{ color: "#8b949e" }}>{cnt} ({pct}%)</span>
                          </div>
                          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 4, height: 8 }}>
                            <div style={{ background: stage.col, height: 8, borderRadius: 4, width: `${pct}%`, transition: ".5s" }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════ SETTINGS ════ */}
          {activeTab === "settings" && (
            <div className="view active">
              <div className="section-title" style={{ marginBottom: 20 }}>Settings</div>
              <div style={{ maxWidth: 560 }}>
                <div className="card" style={{ padding: 24, marginBottom: 20 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Agency Details</div>
                  <div className="form-group"><label>Agency Name</label><input defaultValue="URDIGIX Digital Agency" /></div>
                  <div className="form-group"><label>Email</label><input defaultValue="urdigix@gmail.com" /></div>
                  <div className="form-group"><label>Phone</label><input defaultValue="+91 8142908550" /></div>
                  <div className="form-group"><label>Website</label><input defaultValue="https://urdigix.com" /></div>
                  <div className="form-group"><label>Address</label><textarea defaultValue="Hyderabad, India" rows={2} /></div>
                  <button className="btn btn-primary" onClick={() => showToast("Settings saved!")}>Save Changes</button>
                </div>
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Account Security</div>
                  <div className="form-group"><label>Username</label><input defaultValue="admin" /></div>
                  <div className="form-group"><label>New Password</label><input type="password" placeholder="Leave blank to keep current" /></div>
                  <button className="btn btn-primary" onClick={() => showToast("Password updated!")}>Update Password</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ─── MODALS ─── */}
      {modalType === "quote" && (
        <div className="modal-overlay show">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editIndex !== null ? "Edit Quotation" : "New Quotation"}</div>
              <button className="modal-close" onClick={() => setModalType(null)}>×</button>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Client Name</label><input value={qClient} onChange={e => setQClient(e.target.value)} placeholder="Acme Corp" /></div>
              <div className="form-group"><label>Email</label><input value={qEmail} onChange={e => setQEmail(e.target.value)} type="email" /></div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Service</label>
                <select value={qSvc} onChange={e => setQSvc(e.target.value)}>
                  <option>Website Development</option><option>Social Media Management</option>
                  <option>Meta & Google Ads</option><option>Video Production</option>
                  <option>Email Marketing</option><option>WhatsApp Marketing</option>
                  <option>Brand Identity</option><option>SEO Package</option><option>Full Digital Package</option>
                </select>
              </div>
              <div className="form-group"><label>Due Date</label><input value={qDue} onChange={e => setQDue(e.target.value)} type="date" /></div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#8b949e", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Line Items</div>
            <div className="line-items">
              {qItems.map((it, idx) => (
                <div key={idx} className="line-item">
                  <input
                    placeholder="Description"
                    value={it.d}
                    onChange={e => {
                      const next = [...qItems];
                      next[idx].d = e.target.value;
                      setQItems(next);
                    }}
                    className="li-d"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={it.q}
                    onChange={e => {
                      const next = [...qItems];
                      next[idx].q = parseFloat(e.target.value) || 0;
                      setQItems(next);
                    }}
                    className="li-q"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={it.p || ""}
                    onChange={e => {
                      const next = [...qItems];
                      next[idx].p = parseFloat(e.target.value) || 0;
                      setQItems(next);
                    }}
                    className="li-p"
                  />
                  <button className="li-remove" onClick={() => setQItems(qItems.filter((_, i) => i !== idx))}>×</button>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => setQItems([...qItems, { d: "", q: 1, p: 0 }])}>+ Add Line Item</button>
            <div className="form-row">
              <div className="form-group"><label>Discount (%)</label><input type="number" value={qDisc} onChange={e => setQDisc(parseFloat(e.target.value) || 0)} min={0} max={100} /></div>
              <div className="form-group">
                <label>Currency</label>
                <select value={qCurr} onChange={e => setQCurr(e.target.value)}>
                  <option value="KES">KES (Shilling)</option>
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="KSH">KSH (KSh)</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={qStat} onChange={e => setQStat(e.target.value)}>
                <option>Draft</option><option>Sent</option><option>Accepted</option><option>Rejected</option>
              </select>
            </div>
            <div className="form-group"><label>Notes</label><textarea value={qNotes} onChange={e => setQNotes(e.target.value)} placeholder="Additional notes..." /></div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setModalType(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveQuote}>Save Quotation</button>
            </div>
          </div>
        </div>
      )}

      {modalType === "invoice" && (
        <div className="modal-overlay show">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">New Invoice</div>
              <button className="modal-close" onClick={() => setModalType(null)}>×</button>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Client Name</label><input value={iClient} onChange={e => setIClient(e.target.value)} placeholder="Acme Corp" /></div>
              <div className="form-group"><label>Email</label><input value={iEmail} onChange={e => setIEmail(e.target.value)} type="email" /></div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Service</label>
                <select value={iSvc} onChange={e => setISvc(e.target.value)}>
                  <option>Website Development</option><option>Social Media Management</option>
                  <option>Meta & Google Ads</option><option>Video Production</option>
                  <option>Email Marketing</option><option>Brand Identity</option><option>Full Digital Package</option>
                </select>
              </div>
              <div className="form-group"><label>Due Date</label><input value={iDue} onChange={e => setIDue(e.target.value)} type="date" /></div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#8b949e", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Line Items</div>
            <div className="line-items">
              {iItems.map((it, idx) => (
                <div key={idx} className="line-item">
                  <input
                    placeholder="Description"
                    value={it.d}
                    onChange={e => {
                      const next = [...iItems];
                      next[idx].d = e.target.value;
                      setIItems(next);
                    }}
                    className="li-d"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={it.q}
                    onChange={e => {
                      const next = [...iItems];
                      next[idx].q = parseFloat(e.target.value) || 0;
                      setIItems(next);
                    }}
                    className="li-q"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={it.p || ""}
                    onChange={e => {
                      const next = [...iItems];
                      next[idx].p = parseFloat(e.target.value) || 0;
                      setIItems(next);
                    }}
                    className="li-p"
                  />
                  <button className="li-remove" onClick={() => setIItems(iItems.filter((_, i) => i !== idx))}>×</button>
                </div>
              ))}
            </div>
            <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => setIItems([...iItems, { d: "", q: 1, p: 0 }])}>+ Add Line Item</button>
            <div className="form-row">
              <div className="form-group"><label>Discount (%)</label><input type="number" value={iDisc} onChange={e => setIDisc(parseFloat(e.target.value) || 0)} min={0} max={100} /></div>
              <div className="form-group">
                <label>Currency</label>
                <select value={iCurr} onChange={e => setICurr(e.target.value)}>
                  <option value="KES">KES (Shilling)</option>
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="KSH">KSH (KSh)</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={iStat} onChange={e => setIStat(e.target.value)}>
                <option>Unpaid</option><option>Paid</option><option>Overdue</option>
              </select>
            </div>
            <div className="form-group"><label>Notes</label><textarea value={iNotes} onChange={e => setINotes(e.target.value)} placeholder="Payment terms..." /></div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setModalType(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveInvoice}>Save Invoice</button>
            </div>
          </div>
        </div>
      )}

      {modalType === "followup" && (
        <div className="modal-overlay show">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Add / Edit Follow-up</div>
              <button className="modal-close" onClick={() => setModalType(null)}>×</button>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Client Name</label><input value={fuClient} onChange={e => setFuClient(e.target.value)} placeholder="Full Name" /></div>
              <div className="form-group"><label>Contact</label><input value={fuContact} onChange={e => setFuContact(e.target.value)} placeholder="email or phone" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Facebook Link</label><input value={fuFb} onChange={e => setFuFb(e.target.value)} placeholder="https://facebook.com/..." /></div>
              <div className="form-group"><label>Instagram Link</label><input value={fuInsta} onChange={e => setFuInsta(e.target.value)} placeholder="https://instagram.com/..." /></div>
            </div>
            <div className="form-group">
              <label>Website Link</label>
              <input value={fuWeb} onChange={e => setFuWeb(e.target.value)} placeholder="https://..." />
            </div>
            <div className="form-row">
              <div className="form-group"><label>Last Contact</label><input value={fuLast} onChange={e => setFuLast(e.target.value)} type="date" /></div>
              <div className="form-group"><label>Next Follow-up</label><input value={fuNext} onChange={e => setFuNext(e.target.value)} type="date" /></div>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={fuStat} onChange={e => setFuStat(e.target.value)}>
                <option>New Lead</option><option>In Progress</option><option>Proposal Sent</option>
                <option>Negotiating</option><option>Closed Won</option><option>Closed Lost</option>
              </select>
            </div>
            <div className="form-group"><label>Notes</label><textarea value={fuNotes} onChange={e => setFuNotes(e.target.value)} placeholder="Meeting notes, next actions..." /></div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setModalType(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveFollowup}>Save</button>
            </div>
          </div>
        </div>
      )}

      {modalType === "contract" && (
        <div className="modal-overlay show">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">New Contract</div>
              <button className="modal-close" onClick={() => setModalType(null)}>×</button>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Client Name</label><input value={cClient} onChange={e => setCClient(e.target.value)} placeholder="Company / Full Name" /></div>
              <div className="form-group"><label>Client Email</label><input value={cEmail} onChange={e => setCEmail(e.target.value)} type="email" /></div>
            </div>
            <div className="form-group"><label>Project Name</label><input value={cProj} onChange={e => setCProj(e.target.value)} placeholder="e.g. Full Website Redesign" /></div>
            <div className="form-row">
              <div className="form-group"><label>Value</label><input type="number" value={cVal || ""} onChange={e => setCVal(parseFloat(e.target.value) || 0)} placeholder="0" /></div>
              <div className="form-group">
                <label>Currency</label>
                <select value={cCurr} onChange={e => setCCurr(e.target.value)}>
                  <option value="KES">KES (Shilling)</option>
                  <option value="USD">USD ($)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="KSH">KSH (KSh)</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Start Date</label><input value={cStart} onChange={e => setCStart(e.target.value)} type="date" /></div>
              <div className="form-group"><label>End Date</label><input value={cEnd} onChange={e => setCEnd(e.target.value)} type="date" /></div>
            </div>
            <div className="form-group"><label>Scope of Work</label><textarea value={cScope} onChange={e => setCScope(e.target.value)} placeholder="Describe deliverables..." rows={3} /></div>
            <div className="form-group"><label>Payment Terms</label><textarea value={cTerms} onChange={e => setCTerms(e.target.value)} placeholder="e.g. 50% upfront..." rows={2} /></div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setModalType(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveContract}>Save Contract</button>
            </div>
          </div>
        </div>
      )}

      {modalType === "cms" && (
        <div className="modal-overlay show">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">New Page</div>
              <button className="modal-close" onClick={() => setModalType(null)}>×</button>
            </div>
            <div className="form-group"><label>Page Title</label><input value={cmsTitle} onChange={e => setCmsTitle(e.target.value)} placeholder="e.g. Services" /></div>
            <div className="form-group"><label>Slug</label><input value={cmsSlug} onChange={e => setCmsSlug(e.target.value)} placeholder="/services" /></div>
            <div className="form-group">
              <label>Status</label>
              <select value={cmsStat} onChange={e => setCmsStat(e.target.value)}>
                <option>Draft</option><option>Published</option>
              </select>
            </div>
            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setModalType(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveCms}>Save Page</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── STYLE OVERRIDE TAG FOR CRM DARK AESTHETIC ─── */}
      <style>{`
        body {
          background-color: #0d1117 !important;
          color: #e6edf3 !important;
        }
        .card {
          background: #1c2230;
          border: 1px solid #30363d;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        .table-wrap {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }
        th {
          padding: 12px 16px;
          text-align: left;
          font-size: 11px;
          color: #8b949e;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .5px;
          border-bottom: 1px solid #30363d;
          background: rgba(255,255,255,.02);
        }
        td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(48,54,61,.5);
          vertical-align: middle;
          color: #e6edf3;
        }
        tr:last-child td {
          border-bottom: none;
        }
        tr:hover td {
          background: rgba(255,255,255,.02);
        }
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        .badge-draft { background: rgba(139,148,158,.15); color: #8b949e; }
        .badge-sent, .badge-new-lead { background: rgba(59,130,246,.15); color: #60a5fa; }
        .badge-accepted, .badge-paid, .badge-active, .badge-closed-won { background: rgba(34,197,94,.15); color: #4ade80; }
        .badge-rejected, .badge-overdue, .badge-cancelled, .badge-closed-lost { background: rgba(239,68,68,.15); color: #f87171; }
        .badge-unpaid, .badge-negotiating { background: rgba(234,179,8,.15); color: #fbbf24; }
        .badge-completed { background: rgba(168,85,247,.15); color: #c084fc; }
        .badge-in-progress { background: rgba(249,115,22,.15); color: #fb923c; }
        .badge-proposal-sent { background: rgba(168,85,247,.15); color: #c084fc; }
        .badge-published { background: rgba(34,197,94,.15); color: #4ade80; }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: .15s;
        }
        .btn:hover { filter: brightness(1.1); }
        .btn-primary { background: #f97316; color: #fff; }
        .btn-ghost { background: rgba(255,255,255,.06); color: #e6edf3; border: 1px solid #30363d; }
        .btn-sm { padding: 4px 10px; font-size: 12px; border-radius: 6px; }
        .btn-red { background: rgba(239,68,68,.15); color: #f87171; border: 1px solid rgba(239,68,68,.2); }
        .btn-green { background: rgba(34,197,94,.15); color: #4ade80; border: 1px solid rgba(34,197,94,.2); }
        .btn-blue { background: rgba(59,130,246,.15); color: #60a5fa; border: 1px solid rgba(59,130,246,.2); }
        .btn-purple { background: rgba(168,85,247,.15); color: #c084fc; border: 1px solid rgba(168,85,247,.2); }

        .nav-item {
          color: #8b949e;
          transition: .15s;
        }
        .nav-item:hover {
          background: rgba(255,255,255,.06) !important;
          color: #e6edf3 !important;
        }
        .nav-item.active {
          background: rgba(249,115,22,.12) !important;
          color: #f97316 !important;
          font-weight: 600;
        }

        .stat-card {
          background: #1c2230;
          border: 1px solid #30363d;
          border-radius: 12px;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
        }
        .stat-card.orange::before { background: #f97316; }
        .stat-card.green::before { background: #22c55e; }
        .stat-card.blue::before { background: #3b82f6; }
        .stat-card.purple::before { background: #a855f7; }
        .stat-card.red::before { background: #ef4444; }

        .stat-label {
          font-size: 11px;
          color: #8b949e;
          font-weight: 600;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: .5px;
        }
        .stat-value {
          font-size: 26px;
          font-weight: 800;
          margin-bottom: 4px;
        }
        .stat-sub {
          font-size: 12px;
          color: #8b949e;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 700;
        }

        .modal-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.7);
          z-index: 1000;
          align-items: center;
          justify-content: center;
        }
        .modal-overlay.show {
          display: flex;
        }
        .modal {
          background: #1c2230;
          border: 1px solid #30363d;
          border-radius: 16px;
          width: 90%;
          max-width: 640px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 28px;
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .modal-title {
          font-size: 17px;
          font-weight: 700;
        }
        .modal-close {
          background: none;
          border: none;
          color: #8b949e;
          cursor: pointer;
          font-size: 24px;
          line-height: 1;
          padding: 0 4px;
        }
        .modal-close:hover {
          color: #e6edf3;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
        }
        .form-group label {
          font-size: 11px;
          font-weight: 600;
          color: #8b949e;
          text-transform: uppercase;
          letter-spacing: .5px;
        }
        .form-group input, .form-group select, .form-group textarea {
          background: rgba(255,255,255,.05);
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 9px 12px;
          color: #e6edf3;
          font-size: 13.5px;
          outline: none;
          width: 100%;
          transition: .15s;
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
          border-color: #f97316;
        }
        .form-group select option {
          background: #1c2230;
          color: #e6edf3;
        }
        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #30363d;
        }

        .line-items {
          margin-bottom: 16px;
        }
        .line-item {
          display: grid;
          grid-template-columns: 1fr 70px 110px 36px;
          gap: 8px;
          align-items: center;
          margin-bottom: 8px;
        }
        .line-item input {
          margin: 0;
          background: rgba(255,255,255,.05);
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 9px 12px;
          color: #e6edf3;
          font-size: 13.5px;
          outline: none;
        }
        .li-remove {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          font-size: 20px;
          padding: 4px;
          border-radius: 6px;
          line-height: 1;
        }
        .li-remove:hover {
          background: rgba(239,68,68,.1);
        }

        .activity-list {
          padding: 16px;
        }
        .activity-item {
          display: flex;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(48,54,61,.4);
        }
        .activity-item:last-child {
          border-bottom: none;
        }
        .activity-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 5px;
        }
        .activity-text {
          font-size: 13px;
        }
        .activity-time {
          font-size: 11px;
          color: #8b949e;
          margin-top: 2px;
        }

        .chart-bar-wrap {
          display: flex;
          align-items: flex-end;
          gap: 5px;
          height: 80px;
          padding: 0 4px;
        }
        .chart-bar {
          background: linear-gradient(to top,#f97316,#ea580c);
          border-radius: 4px 4px 0 0;
          flex: 1;
          min-width: 18px;
          cursor: pointer;
          position: relative;
        }
        .chart-bar:hover::after {
          content: attr(data-val);
          position: absolute;
          top: -26px;
          left: 50%;
          transform: translateX(-50%);
          background: #f97316;
          color: #fff;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
          z-index: 10;
        }
        .chart-labels {
          display: flex;
          gap: 5px;
          padding: 4px 4px 0;
          font-size: 10px;
          color: #8b949e;
        }
        .chart-labels span {
          flex: 1;
          text-align: center;
        }

        tr.overdue td {
          background: rgba(239,68,68,.04);
        }
        tr.overdue td:first-child {
          border-left: 2px solid #ef4444;
        }

        @media print {
          #root {
            display: none !important;
          }
          #pdf-print {
            display: block !important;
            background: #fff !important;
            color: #000 !important;
            width: 100%;
            height: auto;
            position: absolute;
            left: 0;
            top: 0;
            z-index: 99999;
          }
        }
      `}</style>

      {/* PDF PRINT AREA PORTAL */}
      {pdfHTML && createPortal(
        <div dangerouslySetInnerHTML={{ __html: pdfHTML }} />,
        document.getElementById("pdf-print")!
      )}
    </div>
  );
}

// ─── MAIN APP ROUTER ─────────────────────────────────────────────────────────
function AppContent() {
  const { user } = useAuth();
  
  return (
    <BrowserRouter basename={window.location.pathname.startsWith('/admin') ? '/admin' : '/'}>
      <Routes>
        <Route path="/" element={user ? <AdminPage /> : <Navigate to="/auth" replace />} />
        <Route path="/auth" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
