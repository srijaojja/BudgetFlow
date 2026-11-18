import React, { useEffect, useMemo, useState } from "react";
import {
    LayoutDashboard,
    ArrowLeftRight,
    Target,
    Tags,
    ChartNoAxesCombined,
    PiggyBank,
    Settings,
    LogOut,
    Wallet,
    Plus,
    Trash2,
    Menu,
    TrendingUp,
    TrendingDown,
    Moon,
    Sun,
    Search,
    Bell,
    CalendarDays,
    ChevronDown,
    ArrowUpRight,
    SlidersHorizontal
} from "lucide-react";

import {
    ResponsiveContainer,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend,
    BarChart,
    Bar
} from "recharts";

import { api, endpoints, listOf, money, today } from "./api";
import { CATEGORY_GROUPS, INCOME_CATEGORIES } from "./categories";

const NAV = [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["transactions", "Transactions", ArrowLeftRight],
    ["budgets", "Budget", Target],
    ["categories", "Categories", Tags],
    ["analytics", "Analytics", ChartNoAxesCombined],
    ["goals", "Goals", PiggyBank],
    ["settings", "Settings", Settings]
];

const COLORS = [
    "#8068ff",
    "#b9aaff",
    "#e4ddff",
    "#39383f",
    "#86858e",
    "#ceccd4"
];

function useStored(key, initial) {
    const [value, setValue] = useState(() => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : initial;
        } catch {
            return initial;
        }
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
}

function Notice({ error, message }) {
    return (
        <>
            {error && <div className="notice error">{error}</div>}
            {message && <div className="notice success">{message}</div>}
        </>
    );
}

function Auth({ onLogin }) {
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);

    function changeMode(next) {
        setMode(next);
        setError("");
        setMessage("");
    }

    async function submit(e) {
        e.preventDefault();
        setError("");
        setMessage("");
        setBusy(true);
        try {
            if (mode === "forgot") {
                await api("/api/auth/forgot-password", {
                    method: "POST", body: { email: form.email.trim() }
                });
                setMode("reset");
                setMessage("If this email is registered, a 6-digit reset code has been sent. Check your inbox and spam folder.");
                return;
            }
            if (mode === "reset") {
                await api("/api/auth/reset-password", {
                    method: "POST", body: { email: form.email.trim(), code: otp.trim(), newPassword }
                });
                setOtp("");
                setNewPassword("");
                setForm(previous => ({ ...previous, password: "" }));
                setMode("login");
                setMessage("Password updated. Sign in with your new password.");
                return;
            }
            const payload = mode === "login"
                ? { email: form.email, password: form.password }
                : form;
            const result = await api(endpoints[mode], { method: "POST", body: payload });
            const token = result?.token || result?.accessToken || result?.jwt || result?.data?.token;
            if (token) {
                localStorage.setItem("bf_token", token);
                onLogin(token);
            } else if (mode === "register") {
                setMode("login");
                setMessage("Registration successful. Please sign in.");
            } else {
                throw new Error("No JWT token found in login response.");
            }
        } catch (err) {
            setError(err.message || "Request failed. Please try again.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="auth-layout">
            <div className="auth-hero">
                <div className="brand">
                    <span className="logo-mark" style={{ background: "transparent", borderRadius: 12, overflow: "hidden" }}>
                        <img src="/piggy-bank-logo.png" alt="BudgetFlow piggy bank logo" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                    </span>
                    BudgetFlow
                </div>
                <div>
                    <h1>Make every rupee count.</h1>
                    <p>Plan your budget, understand your spending, and reach your savings goals.</p>
                    <div className="hero-decoration">₹</div>
                </div>
                <small>Personal finance made simple.</small>
            </div>
            <div className="auth-right">
                <form className="auth-form" onSubmit={submit}>
                    <span className="eyebrow">WELCOME TO BUDGETFLOW</span>
                    <h2>{mode === "login" ? "Welcome back" : mode === "register" ? "Create your account" : mode === "forgot" ? "Forgot password?" : "Reset your password"}</h2>
                    <p>{mode === "forgot" ? "Enter your registered email to receive a reset code." : mode === "reset" ? "Enter the 6-digit email code and your new password." : "Manage your finances in one beautiful workspace."}</p>
                    {mode === "register" && (
                        <label>Full name
                            <input required autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </label>
                    )}
                    <label>Email address
                        <input type="email" required autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </label>
                    {(mode === "login" || mode === "register") && (
                        <label>Password
                            <input type="password" minLength={8} required autoComplete={mode === "login" ? "current-password" : "new-password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                        </label>
                    )}
                    {mode === "reset" && (
                        <>
                            <label>6-digit email code
                                <input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} />
                            </label>
                            <label>New password
                                <input type="password" minLength={8} required autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            </label>
                        </>
                    )}
                    {mode === "login" && (
                        <button type="button" className="link-btn" style={{ alignSelf: "flex-end" }} onClick={() => changeMode("forgot")}>Forgot password?</button>
                    )}
                    <Notice error={error} message={message} />
                    <button className="btn primary" disabled={busy}>
                        {busy ? "Please wait..." : mode === "login" ? "Sign in" : mode === "register" ? "Register" : mode === "forgot" ? "Send reset code" : "Reset password"}
                    </button>
                    {mode === "reset" && (
                        <button type="button" className="link-btn" disabled={busy} onClick={() => changeMode("forgot")}>Request another code</button>
                    )}
                    <button type="button" className="link-btn" disabled={busy} onClick={() => changeMode(mode === "login" ? "register" : "login")}>
                        {mode === "login" ? "Don't have an account? Register" : mode === "register" ? "Already have an account? Sign in" : "Back to sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}

function Stat({ title, value }) {
    return (
        <div className="stat-card">
            <div className="stat-heading">
                <span>{title}</span>

            </div>

            <strong>{money(value)}</strong>

            <div className="stat-change">
                <span>Overview</span>
                <small>Your current finances</small>
            </div>
        </div>
    );
}

function TransactionTable({ items, categoryName, remove }) {
    if (!items.length) {
        return <div className="empty">No transactions yet.</div>;
    }

    return (
        <div className="table-scroll">
            <table>
                <thead>
                <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Transaction</th>
                    <th>Category</th>
                    <th>Type</th>
                    {remove && <th />}
                </tr>
                </thead>

                <tbody>
                {items.map((t, index) => (
                    <tr key={t.id ?? index}>
                        <td>{t.date || t.transactionDate || "—"}</td>

                        <td className="strong-cell">
                            {money(t.amount)}
                        </td>

                        <td>
                            {t.description || t.title || "Transaction"}
                        </td>

                        <td>{categoryName(t)}</td>

                        <td>
                <span
                    className={`pill ${String(t.type).toLowerCase()}`}
                >
                  {t.type}
                </span>
                        </td>

                        {remove && (
                            <td>
                                <button
                                    className="icon-btn danger"
                                    title="Delete transaction"
                                    onClick={() => remove(t.id)}
                                >
                                    <Trash2 size={17} />
                                </button>
                            </td>
                        )}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}


// Centered, accessible confirmation dialog for destructive actions.
function DeleteConfirmModal({ item, busy, onCancel, onConfirm }) {
    const dialogRef = React.useRef(null);

    useEffect(() => {
        if (!item) return;
        const previousFocus = document.activeElement;
        dialogRef.current?.focus();
        function handleKeyDown(event) {
            if (event.key === "Escape" && !busy) onCancel();
            if (event.key === "Tab") {
                const controls = dialogRef.current?.querySelectorAll("button:not(:disabled)");
                if (!controls?.length) return;
                const first = controls[0];
                const last = controls[controls.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            previousFocus?.focus?.();
        };
    }, [item, busy, onCancel]);

    if (!item) return null;
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999,
            background: "rgba(20, 17, 37, 0.58)", display: "flex",
            alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div ref={dialogRef} tabIndex={-1} role="alertdialog" aria-modal="true"
                aria-labelledby="bf-delete-title" aria-describedby="bf-delete-description"
                style={{ width: "100%", maxWidth: 420, padding: 32, boxSizing: "border-box",
                    background: "#fff", color: "#25213b", borderRadius: 22,
                    boxShadow: "0 24px 80px rgba(0,0,0,.26)", textAlign: "center", outline: "none" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                    <span style={{ display: "grid", placeItems: "center", width: 58, height: 58,
                        borderRadius: "50%", background: "#fff0f0", color: "#dc2626" }}>
                        <Trash2 size={27} />
                    </span>
                </div>
                <h2 id="bf-delete-title" style={{ margin: "0 0 12px", fontSize: 24 }}>
                    Delete {item.name}?
                </h2>
                <p id="bf-delete-description" style={{ color: "#77758b", lineHeight: 1.6, margin: 0 }}>
                    Are you sure you want to delete this item? This action cannot be undone.
                </p>
                <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
                    <button type="button" onClick={onCancel} disabled={busy}
                        style={{ flex: 1, padding: 13, border: 0, borderRadius: 12,
                            background: "#f0eef8", color: "#333047", fontWeight: 600,
                            cursor: busy ? "not-allowed" : "pointer" }}>
                        Cancel
                    </button>
                    <button type="button" onClick={onConfirm} disabled={busy}
                        style={{ flex: 1, padding: 13, border: 0, borderRadius: 12,
                            background: "#dc2626", color: "white", fontWeight: 600,
                            cursor: busy ? "not-allowed" : "pointer" }}>
                        {busy ? "Deleting..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function App() {
    const [token, setToken] = useState(
        localStorage.getItem("bf_token") || ""
    );

    const [page, setPage] = useState("dashboard");
    const [mobileMenu, setMobileMenu] = useState(false);

    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [dashboard, setDashboard] = useState({});
    const [user, setUser] = useState(null);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(null);

    const [goals, setGoals] = useStored("bf_goals", []);
    const [dark, setDark] = useStored("bf_dark", false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [readNotifications, setReadNotifications] = useStored("bf_read_notifications", []);
    const [dashboardMonth, setDashboardMonth] = useState(() => new Date().getMonth());
    const [dashboardYear, setDashboardYear] = useState(() => new Date().getFullYear());

    useEffect(() => {
        document.documentElement.classList.toggle("bf-dark", dark);
        document.body.classList.toggle("bf-dark", dark);
        return () => {
            document.documentElement.classList.remove("bf-dark");
            document.body.classList.remove("bf-dark");
        };
    }, [dark]);

    const [tx, setTx] = useState({
        description: "",
        amount: "",
        type: "EXPENSE",
        categoryId: "",
        date: today()
    });

    const [catName, setCatName] = useState("");
    const [catType, setCatType] = useState("EXPENSE");

    const [budget, setBudget] = useState({
        categoryId: "",
        amount: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const [goal, setGoal] = useState({
        name: "",
        target: "",
        saved: ""
    });

    async function refresh() {
        if (!token) return;

        const paths = [
            endpoints.transactions,
            endpoints.categories,
            endpoints.budgets
        ];

        const results = await Promise.allSettled(
            paths.map(path => api(path))
        );

        if (results[0].status === "fulfilled") {
            setTransactions(
                listOf(results[0].value, "transactions")
            );
        }

        if (results[1].status === "fulfilled") {
            setCategories(
                listOf(results[1].value, "categories")
            );
        }

        if (results[2].status === "fulfilled") {
            setBudgets(
                listOf(results[2].value, "budgets")
            );
        }



        const failures = results
            .map((r, i) =>
                r.status === "rejected"
                    ? `${
                        ["Transactions", "Categories", "Budgets"][i]
                    }: ${r.reason.message}`
                    : null
            )
            .filter(Boolean);

        setError(failures.join(" | "));
    }

    useEffect(() => {
        if (!token) {
            setUser(null);
            return;
        }

        refresh();
        let active = true;

        async function loadUser() {
            try {
                const data = await api(endpoints.me);
                if (active) setUser(data);
            } catch (err) {
                console.error("Failed to load user profile:", err);
            }
        }

        loadUser();
        return () => { active = false; };
    }, [token]);

    async function save(path, method, body) {
        setBusy(true);
        setError("");
        setMessage("");

        try {
            await api(path, {
                method,
                ...(body !== undefined ? { body } : {})
            });

            await refresh();
            setMessage("Saved successfully.");
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setBusy(false);
        }
    }

    function logout() {
        localStorage.removeItem("bf_token");
        setToken("");
        setUser(null);
        setTransactions([]);
        setCategories([]);
        setBudgets([]);
        setDashboard({});
    }

    function categoryName(item) {
        return (
            item.category?.name ||
            categories.find(
                c => String(c.id) === String(item.categoryId)
            )?.name ||
            "Other"
        );
    }

    const totals = useMemo(() => {
        const income = transactions
            .filter(t => String(t.type).toUpperCase() === "INCOME")
            .reduce((s, t) => s + Number(t.amount || 0), 0);

        const expense = transactions
            .filter(t => String(t.type).toUpperCase() === "EXPENSE")
            .reduce((s, t) => s + Number(t.amount || 0), 0);

        return {
            income,
            expense,
            balance: income - expense
        };
    }, [transactions]);

    const income = Number(
        dashboard?.totalIncome ??
        dashboard?.income ??
        totals.income
    );

    const expense = Number(
        dashboard?.totalExpense ??
        dashboard?.totalExpenses ??
        dashboard?.expense ??
        totals.expense
    );

    const balance = Number(
        dashboard?.balance ?? income - expense
    );

    // Net savings estimate: income remaining after expenses.
    // Savings-goal contributions are tracked separately in the Goals page.
    const saved = income - expense;

    const monthly = useMemo(() => {
        const now = new Date();

        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(
                now.getFullYear(),
                now.getMonth() - 6 + i,
                1
            );

            const group = transactions.filter(t => {
                const date = new Date(t.date || t.transactionDate);

                return (
                    !isNaN(date) &&
                    date.getMonth() === d.getMonth() &&
                    date.getFullYear() === d.getFullYear()
                );
            });

            const sum = type =>
                group
                    .filter(
                        t => String(t.type).toUpperCase() === type
                    )
                    .reduce(
                        (s, t) => s + Number(t.amount || 0),
                        0
                    );

            return {
                month: d.toLocaleString("en", { month: "short" }),
                Income: sum("INCOME"),
                Expense: sum("EXPENSE")
            };
        });
    }, [transactions]);

    const breakdown = useMemo(() => {
        const map = {};

        transactions
            .filter(
                t => String(t.type).toUpperCase() === "EXPENSE"
            )
            .forEach(t => {
                const name = categoryName(t);

                map[name] =
                    (map[name] || 0) + Number(t.amount || 0);
            });

        return Object.entries(map)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [transactions, categories]);

    function budgetSpent(b) {
        return transactions
            .filter(t => {
                const date = new Date(t.date || t.transactionDate);
                const id = t.categoryId ?? t.category?.id;

                return (
                    String(t.type).toUpperCase() === "EXPENSE" &&
                    String(id) ===
                    String(b.categoryId ?? b.category?.id) &&
                    date.getMonth() + 1 === Number(b.month) &&
                    date.getFullYear() === Number(b.year)
                );
            })
            .reduce(
                (sum, t) => sum + Number(t.amount || 0),
                0
            );
    }

    const filteredTransactions = transactions.filter(t => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return true;
        return [
            t.description, t.title, categoryName(t), t.type,
            t.date, t.transactionDate, String(t.amount ?? ""),
            money(t.amount ?? 0)
        ].some(value => String(value ?? "").toLowerCase().includes(query));
    });

    const notifications = [
        ...budgets.filter(b => {
            const limit = Number(b.amount ?? b.limitAmount ?? 0);
            return limit > 0 && budgetSpent(b) >= limit;
        }).map(b => ({
            id: `budget-${b.id ?? categoryName(b)}`,
            text: `${categoryName(b)} budget ${budgetSpent(b) > Number(b.amount ?? b.limitAmount ?? 0) ? "exceeded" : "reached"}: ${money(budgetSpent(b))} of ${money(b.amount ?? b.limitAmount ?? 0)}`,
            page: "budgets"
        })),
        ...(transactions.length === 0 ? [{
            id: "no-transactions", text: "Add your first transaction to track your spending.", page: "transactions"
        }] : []),
        ...(goals.length === 0 ? [{
            id: "no-goals", text: "Create a savings goal to start tracking your progress.", page: "goals"
        }] : [])
    ];
    const unreadCount = notifications.filter(n => !readNotifications.includes(n.id)).length;
    const displayMonth = new Date(dashboardYear, dashboardMonth, 1).toLocaleString("en-IN", { month: "long", year: "numeric" });
    const dashboardTransactions = transactions.filter(t => {
        const d = new Date(t.date || t.transactionDate);
        return !Number.isNaN(d.getTime()) && d.getMonth() === dashboardMonth && d.getFullYear() === dashboardYear;
    });
    const dashboardBreakdown = Object.entries(dashboardTransactions
        .filter(t => String(t.type).toUpperCase() === "EXPENSE")
        .reduce((acc, t) => {
            const name = categoryName(t);
            acc[name] = (acc[name] || 0) + Number(t.amount || 0);
            return acc;
        }, {}))
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    const dashboardExpense = dashboardBreakdown.reduce((sum, x) => sum + x.value, 0);

    if (!token) {
        return <Auth onLogin={setToken} />;
    }

    const pageTitle =
        NAV.find(n => n[0] === page)?.[1] || "Dashboard";

    return (
        <div className={`app ${dark ? "dark" : ""}`}>
            <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
                <div className="brand">
                    <span className="logo-mark" style={{ background: "transparent", borderRadius: 12, overflow: "hidden" }}><img src="/piggy-bank-logo.png" alt="BudgetFlow piggy bank logo" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} /></span>
                    BudgetFlow
                </div>

                <nav>
                    {NAV.map(([id, label, Icon]) => (
                        <button
                            key={id}
                            className={`nav-item ${
                                page === id ? "selected" : ""
                            }`}
                            onClick={() => {
                                setPage(id);
                                setMobileMenu(false);
                                setError("");
                                setMessage("");
                            }}
                        >
                            <Icon size={19} />
                            <span>{label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <button
                        className="nav-item"
                        onClick={() => setDark(!dark)}
                    >
                        {dark ? <Sun size={19} /> : <Moon size={19} />}
                        Appearance
                    </button>

                    <button className="nav-item" onClick={logout}>
                        <LogOut size={19} />
                        Log out
                    </button>
                </div>
            </aside>

            <main className="content">
                <header className="topbar">
                    <div className="topbar-title">
                        <button
                            className="icon-btn mobile-toggle"
                            onClick={() => setMobileMenu(!mobileMenu)}
                        >
                            <Menu />
                        </button>

                        <div>
                            <h1>
                                {page === "dashboard"
                                    ? "Welcome back!"
                                    : pageTitle}
                            </h1>

                            <p className="header-subtitle">
                                It is the best time to manage your finances
                            </p>
                        </div>
                    </div>

                    <div className="top-actions">
                        <button
                            className="round-icon"
                            title="Search transactions"
                            aria-label="Search transactions"
                            onClick={() => { setSearchOpen(open => !open); setNotificationsOpen(false); }}
                        >
                            <Search size={20} />
                        </button>

                        <button
                            className="round-icon"
                            title="Notifications"
                            aria-label={`Notifications (${unreadCount} unread)`}
                            onClick={() => { setNotificationsOpen(open => !open); setSearchOpen(false); }}
                            style={{ position: "relative" }}
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
                        </button>

                        <div className="profile-pill">
                            <div className="avatar">
                                {user?.name?.trim()?.charAt(0)?.toUpperCase() || "BF"}
                            </div>
                            <div>
                                <strong>{user?.name || "My account"}</strong>
                                <small>{user?.email || "BudgetFlow profile"}</small>
                            </div>
                        </div>
                    </div>
                </header>

                {searchOpen && (
                    <div className="header-search-panel">
                        <Search size={18} />
                        <input
                            autoFocus
                            aria-label="Search transactions"
                            placeholder="Search description, category, type or amount..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") setPage("transactions"); if (e.key === "Escape") setSearchOpen(false); }}
                        />
                        <button type="button" className="btn secondary" onClick={() => { setPage("transactions"); setSearchOpen(false); }}>View results ({filteredTransactions.length})</button>
                        <button type="button" className="icon-btn" aria-label="Close search" onClick={() => { setSearchOpen(false); setSearchQuery(""); }}>×</button>
                    </div>
                )}
                {notificationsOpen && (
                    <div className="notification-panel" role="region" aria-label="Notifications">
                        <div className="notification-heading">
                            <strong>Notifications {unreadCount > 0 ? `(${unreadCount} unread)` : ""}</strong>
                            <button type="button" className="link-btn" onClick={() => setReadNotifications(old => [...new Set([...old, ...notifications.map(n => n.id)])])}>Mark all read</button>
                        </div>
                        {notifications.length === 0 ? <p className="muted">You're all caught up.</p> : notifications.map(n => (
                            <button type="button" key={n.id} className={`notification-entry ${readNotifications.includes(n.id) ? "read" : "unread"}`}
                                onClick={() => { setReadNotifications(old => [...new Set([...old, n.id])]); setPage(n.page); setNotificationsOpen(false); }}>
                                {n.text}
                            </button>
                        ))}
                    </div>
                )}
                <div className="page-body">
                    <Notice error={error} message={message} />

                    {page === "dashboard" && (
                        <>
                            <div className="dashboard-controls">
                                <div className="date-controls">
                                    <button className="round-icon" title="Current month" onClick={() => { setDashboardMonth(new Date().getMonth()); setDashboardYear(new Date().getFullYear()); }}>
                                        <CalendarDays size={19} />
                                    </button>
                                    <label className="month-filter-label">
                                        <span>Dashboard month</span>
                                        <input type="month" value={`${dashboardYear}-${String(dashboardMonth + 1).padStart(2, "0")}`}
                                            onChange={e => { if (e.target.value) { const [y, m] = e.target.value.split("-").map(Number); setDashboardYear(y); setDashboardMonth(m - 1); } }} />
                                    </label>
                                </div>

                                <div className="widget-actions">
                                    <button
                                        className="outline-pill"
                                        onClick={() => setPage("settings")}
                                    >
                                        <SlidersHorizontal size={17} />
                                        Manage view
                                    </button>

                                    <button
                                        className="purple-pill"
                                        onClick={() => setPage("transactions")}
                                    >
                                        <Plus size={18} />
                                        Add transaction
                                    </button>
                                </div>
                            </div>

                            <div className="stats-grid">
                                <Stat
                                    title="Total balance"
                                    value={balance}
                                />

                                <Stat
                                    title="Income"
                                    value={income}
                                />

                                <Stat
                                    title="Expense"
                                    value={expense}
                                />

                                <Stat
                                    title="Total savings"
                                    value={saved}
                                />
                            </div>

                            <div className="dashboard-grid">
                                <section className="panel flow-panel">
                                    <div className="section-head">
                                        <h3>Money flow</h3>

                                        <div className="chart-tools">
                                            <span className="chart-legend-item">
                                                <span className="legend-dot primary-dot" />
                                                <span>Income</span>
                                            </span>
                                            <span className="chart-legend-item">
                                                <span className="legend-dot secondary-dot" />
                                                <span>Expense</span>
                                            </span>

                                            <span className="outline-pill small-pill">
                        This year
                        <ChevronDown size={13} />
                      </span>
                                        </div>
                                    </div>

                                    <div className="chart-box">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={monthly}
                                                barGap={3}
                                                barCategoryGap="26%"
                                            >
                                                <CartesianGrid
                                                    vertical={false}
                                                    stroke="#f1eff5"
                                                />

                                                <XAxis
                                                    dataKey="month"
                                                    axisLine={false}
                                                    tickLine={false}
                                                />

                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tickFormatter={v =>
                                                        v >= 1000
                                                            ? `${Math.round(v / 1000)}k`
                                                            : v
                                                    }
                                                />

                                                <Tooltip
                                                    formatter={v => money(v)}
                                                />

                                                <Bar
                                                    isAnimationActive={false}
                                                    dataKey="Income"
                                                    fill="#8068ff"
                                                    radius={[10, 10, 0, 0]}
                                                    maxBarSize={25}
                                                />

                                                <Bar
                                                    isAnimationActive={false}
                                                    dataKey="Expense"
                                                    fill="#bcb0ff"
                                                    radius={[10, 10, 0, 0]}
                                                    maxBarSize={25}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </section>

                                <section className="panel budget-panel">
                                    <div className="section-head">
                                        <h3>Budget</h3>

                                        <button
                                            className="round-icon"
                                            onClick={() => setPage("budgets")}
                                        >
                                            <ArrowUpRight size={21} />
                                        </button>
                                    </div>

                                    <div className="budget-chart-layout">
                                        <div className="budget-legend">
                                            {dashboardBreakdown.length ? (
                                                dashboardBreakdown.map((x, i) => (
                                                    <div key={x.name}>
                                                        <i
                                                            style={{
                                                                background:
                                                                    COLORS[i % COLORS.length]
                                                            }}
                                                        />
                                                        <span className="budget-legend-label">{x.name}</span>
                                                        <strong className="budget-legend-amount">{money(x.value)}</strong>
                                                    </div>
                                                ))
                                            ) : (
                                                <div>No expenses yet</div>
                                            )}
                                        </div>

                                        <div className="donut-wrap">
                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <PieChart>
                                                    <Pie
                                                        isAnimationActive={false}
                                                        data={
                                                            dashboardBreakdown.length
                                                                ? dashboardBreakdown
                                                                : [
                                                                    {
                                                                        name: "No expenses",
                                                                        value: 1
                                                                    }
                                                                ]
                                                        }
                                                        dataKey="value"
                                                        innerRadius="72%"
                                                        outerRadius="75%"
                                                        paddingAngle={4}
                                                        stroke="none"
                                                    >
                                                        {(dashboardBreakdown.length
                                                                ? dashboardBreakdown
                                                                : [{}]
                                                        ).map((_, i) => (
                                                            <Cell
                                                                key={i}
                                                                fill={
                                                                    dashboardBreakdown.length
                                                                        ? COLORS[i % COLORS.length]
                                                                        : "#eae7f4"
                                                                }
                                                            />
                                                        ))}
                                                    </Pie>

                                                    <Tooltip
                                                        formatter={v => money(v)}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>

                                            <div className="donut-center">
                                                <small>Total expenses</small>
                                                <strong>{money(dashboardExpense)}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="dashboard-grid bottom-grid">
                                <section className="panel transactions-panel">
                                    <div className="section-head">
                                        <h3>Recent transactions</h3>

                                        <button
                                            className="outline-pill small-pill"
                                            onClick={() => setPage("transactions")}
                                        >
                                            See all
                                            <ArrowUpRight size={15} />
                                        </button>
                                    </div>

                                    <TransactionTable
                                        items={transactions.slice(0, 4)}
                                        categoryName={categoryName}
                                    />
                                </section>

                                <section className="panel goals-panel">
                                    <div className="section-head">
                                        <h3>Saving goals</h3>

                                        <button
                                            className="round-icon"
                                            onClick={() => setPage("goals")}
                                        >
                                            <ArrowUpRight size={21} />
                                        </button>
                                    </div>

                                    {goals.length ? (
                                        goals.slice(0, 3).map(g => {
                                            const pct = g.target
                                                ? (g.saved / g.target) * 100
                                                : 0;

                                            return (
                                                <div
                                                    className="goal-line"
                                                    key={g.id}
                                                >
                                                    <div className="goal-line-top">
                                                        <span>{g.name}</span>
                                                        <span>{money(g.target)}</span>
                                                    </div>

                                                    <div className="progress-track">
                                                        <div
                                                            style={{
                                                                width: `${Math.min(
                                                                    100,
                                                                    pct
                                                                )}%`
                                                            }}
                                                        />
                                                    </div>

                                                    <small>
                                                        {Math.round(pct)}%
                                                    </small>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="empty">
                                            No savings goals yet.
                                            <button
                                                className="link-btn"
                                                onClick={() => setPage("goals")}
                                            >
                                                Create one
                                            </button>
                                        </div>
                                    )}
                                </section>
                            </div>
                        </>
                    )}

                    {page === "transactions" && (
                        <>
                            <section className="panel">
                                <div className="section-head">
                                    <h3>Add Transaction</h3>
                                </div>

                                <form
                                    className="form-grid"
                                    onSubmit={async e => {
                                        e.preventDefault();

                                        if (!tx.description.trim()) {
                                            setError("Please enter a transaction description.");
                                            return;
                                        }
                                        if (!Number.isFinite(Number(tx.amount)) || Number(tx.amount) <= 0) {
                                            setError("Amount must be greater than zero.");
                                            return;
                                        }
                                        if (!tx.categoryId || !Number.isFinite(Number(tx.categoryId))) {
                                            setError("Please select a saved category.");
                                            return;
                                        }

                                        const ok = await save(
                                            endpoints.transactions,
                                            "POST",
                                            {
                                                title: tx.description.trim(),
                                                amount: Number(tx.amount),
                                                type: tx.type,
                                                categoryId: Number(tx.categoryId),
                                                date: tx.date
                                            }
                                        );

                                        if (ok) {
                                            setTx({
                                                description: "",
                                                amount: "",
                                                type: "EXPENSE",
                                                categoryId: "",
                                                date: today()
                                            });
                                        }
                                    }}
                                >
                                    <label>
                                        Description
                                        <input
                                            required
                                            placeholder="e.g. Grocery shopping"
                                            value={tx.description}
                                            onChange={e =>
                                                setTx({
                                                    ...tx,
                                                    description: e.target.value
                                                })
                                            }
                                        />
                                    </label>

                                    <label>
                                        Amount (₹)
                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            required
                                            value={tx.amount}
                                            onChange={e =>
                                                setTx({
                                                    ...tx,
                                                    amount: e.target.value
                                                })
                                            }
                                        />
                                    </label>

                                    <label>
                                        Transaction type
                                        <select
                                            value={tx.type}
                                            onChange={e =>
                                                setTx({
                                                    ...tx,
                                                    type: e.target.value,
                                                    categoryId: ""
                                                })
                                            }
                                        >
                                            <option value="EXPENSE">Expense</option>
                                            <option value="INCOME">Income</option>
                                        </select>
                                    </label>

                                    <label>
                                        Category
                                        <select
                                            required
                                            value={tx.categoryId}
                                            onChange={e =>
                                                setTx({
                                                    ...tx,
                                                    categoryId: e.target.value
                                                })
                                            }
                                        >
                                            <option value="">
                                                Choose category
                                            </option>

                                            {categories
                                                .filter(c => !c.type || String(c.type).toUpperCase() === tx.type)
                                                .map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                        </select>
                                    </label>

                                    <label>
                                        Date
                                        <input
                                            type="date"
                                            required
                                            value={tx.date}
                                            onChange={e =>
                                                setTx({
                                                    ...tx,
                                                    date: e.target.value
                                                })
                                            }
                                        />
                                    </label>

                                    <div className="form-action">
                                        <button
                                            className="btn primary"
                                            disabled={busy}
                                        >
                                            <Plus size={17} />
                                            Save Transaction
                                        </button>
                                    </div>
                                </form>
                            </section>

                            <section className="panel">
                                <div className="section-head">
                                    <h3>Transaction History</h3>
                                    <div className="transaction-filter">
                                        <input aria-label="Filter transaction history" placeholder="Search transactions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                                        <span>{filteredTransactions.length} records</span>
                                    </div>
                                </div>

                                <TransactionTable
                                    items={filteredTransactions}
                                    categoryName={categoryName}
                                    remove={id => setDeleteDialog({
                                        name: "transaction",
                                        path: `${endpoints.transactions}/${id}`
                                    })}
                                />
                            </section>
                        </>
                    )}

                    {page === "budgets" && (
                        <>
                            <section className="panel">
                                <div className="section-head">
                                    <h3>Create Monthly Budget</h3>
                                </div>

                                <form
                                    className="form-grid"
                                    onSubmit={e => {
                                        e.preventDefault();

                                        save(endpoints.budgets, "POST", {
                                            categoryId: Number(budget.categoryId),
                                            amount: Number(budget.amount),
                                            month: Number(budget.month),
                                            year: Number(budget.year)
                                        });
                                    }}
                                >
                                    <label>
                                        Category
                                        <select
                                            required
                                            value={budget.categoryId}
                                            onChange={e =>
                                                setBudget({
                                                    ...budget,
                                                    categoryId: e.target.value
                                                })
                                            }
                                        >
                                            <option value="">
                                                Choose category
                                            </option>

                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>
                                        Monthly limit (₹)
                                        <input
                                            required
                                            type="number"
                                            min="1"
                                            value={budget.amount}
                                            onChange={e =>
                                                setBudget({
                                                    ...budget,
                                                    amount: e.target.value
                                                })
                                            }
                                        />
                                    </label>

                                    <label>
                                        Month
                                        <select
                                            value={budget.month}
                                            onChange={e =>
                                                setBudget({
                                                    ...budget,
                                                    month: e.target.value
                                                })
                                            }
                                        >
                                            {Array.from(
                                                { length: 12 },
                                                (_, i) => (
                                                    <option
                                                        key={i}
                                                        value={i + 1}
                                                    >
                                                        {new Date(
                                                            2026,
                                                            i,
                                                            1
                                                        ).toLocaleString("en", {
                                                            month: "long"
                                                        })}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </label>

                                    <label>
                                        Year
                                        <input
                                            required
                                            type="number"
                                            min="2020"
                                            value={budget.year}
                                            onChange={e =>
                                                setBudget({
                                                    ...budget,
                                                    year: e.target.value
                                                })
                                            }
                                        />
                                    </label>

                                    <div className="form-action">
                                        <button
                                            className="btn primary"
                                            disabled={busy}
                                        >
                                            <Plus size={17} />
                                            Create Budget
                                        </button>
                                    </div>
                                </form>
                            </section>

                            <section className="panel">
                                <div className="section-head">
                                    <h3>Your Budgets</h3>
                                </div>

                                {!budgets.length && (
                                    <div className="empty">
                                        No budgets created yet.
                                    </div>
                                )}

                                <div className="budget-list">
                                    {budgets.map((b, i) => {
                                        const limit = Number(
                                            b.amount ?? b.limitAmount ?? 0
                                        );

                                        const spent = budgetSpent(b);
                                        const pct = limit
                                            ? (spent / limit) * 100
                                            : 0;

                                        return (
                                            <div
                                                className="budget-item"
                                                key={b.id ?? i}
                                            >
                                                <div className="progress-label">
                                                    <div>
                                                        <strong>
                                                            {categoryName(b)}
                                                        </strong>

                                                        <small>
                                                            {b.month}/{b.year}
                                                        </small>
                                                    </div>

                                                    <span>
                            {money(spent)} of {money(limit)}
                          </span>
                                                </div>

                                                <div className="progress-track">
                                                    <div
                                                        style={{
                                                            width: `${Math.min(
                                                                pct,
                                                                100
                                                            )}%`,
                                                            background:
                                                                pct > 100
                                                                    ? "#ed7794"
                                                                    : "#8068ff"
                                                        }}
                                                    />
                                                </div>

                                                <div className="budget-footer">
                          <span>
                            {Math.round(pct)}% used
                          </span>

                                                    <button
                                                        className="icon-btn danger"
                                                        onClick={() => setDeleteDialog({
                                                            name: "budget",
                                                            path: `${endpoints.budgets}/${b.id}`
                                                        })}
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        </>
                    )}

                    {page === "categories" && (
                        <>
                            <section className="panel">
                                <div className="section-head">
                                    <h3>Create Custom Category</h3>
                                </div>

                                <form
                                    className="form-grid"
                                    onSubmit={async e => {
                                        e.preventDefault();

                                        const ok = await save(
                                            endpoints.categories,
                                            "POST",
                                            {
                                                name: catName,
                                                type: catType
                                            }
                                        );

                                        if (ok) setCatName("");
                                    }}
                                >
                                    <label>
                                        Category name
                                        <input
                                            required
                                            value={catName}
                                            placeholder="e.g. Groceries"
                                            onChange={e =>
                                                setCatName(e.target.value)
                                            }
                                        />
                                    </label>

                                    <label>
                                        Type
                                        <select
                                            value={catType}
                                            onChange={e =>
                                                setCatType(e.target.value)
                                            }
                                        >
                                            <option value="EXPENSE">
                                                Expense
                                            </option>
                                            <option value="INCOME">
                                                Income
                                            </option>
                                        </select>
                                    </label>

                                    <div className="form-action">
                                        <button
                                            className="btn primary"
                                            disabled={busy}
                                        >
                                            <Plus size={17} />
                                            Add Category
                                        </button>
                                    </div>
                                </form>
                            </section>

                            <section className="panel">
                                <div className="section-head">
                                    <h3>Your Categories</h3>
                                    <span>
                    {categories.length} saved
                  </span>
                                </div>

                                <div className="chip-list">
                                    {categories.map(c => (
                                        <div
                                            className="category-chip"
                                            key={c.id}
                                        >
                                            {c.name}

                                            <button
                                                className="icon-btn danger"
                                                title="Delete category"
                                                onClick={() => setDeleteDialog({
                                                    name: c.name,
                                                    path: `${endpoints.categories}/${c.id}`
                                                })}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    {!categories.length && (
                                        <div className="empty">
                                            No saved categories.
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className="panel">
                                <div className="section-head">
                                    <h3>Suggested Categories</h3>
                                    <span>
                    Click to add to your account
                  </span>
                                </div>

                                {Object.entries(
                                    CATEGORY_GROUPS
                                ).map(([group, names]) => (
                                    <div
                                        className="category-group"
                                        key={group}
                                    >
                                        <h4>{group}</h4>

                                        <div className="chip-list">
                                            {names.map(name => {
                                                const exists =
                                                    categories.some(
                                                        c =>
                                                            c.name.toLowerCase() ===
                                                            name.toLowerCase()
                                                    );

                                                return (
                                                    <button
                                                        key={name}
                                                        className="suggestion"
                                                        disabled={exists || busy}
                                                        onClick={() =>
                                                            save(
                                                                endpoints.categories,
                                                                "POST",
                                                                {
                                                                    name,
                                                                    type:
                                                                        INCOME_CATEGORIES.includes(
                                                                            name
                                                                        )
                                                                            ? "INCOME"
                                                                            : "EXPENSE"
                                                                }
                                                            )
                                                        }
                                                    >
                                                        {exists ? "✓" : "+"}
                                                        {name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </section>
                        </>
                    )}

                    {page === "analytics" && (
                        <>
                            <div className="stats-grid">
                                <Stat title="Income" value={income} />
                                <Stat title="Expenses" value={expense} />
                                <Stat
                                    title="Net Balance"
                                    value={balance}
                                />
                                <Stat
                                    title="Total savings"
                                    value={saved}
                                />
                            </div>

                            <div className="dashboard-grid">
                                <section className="panel analytics-income-panel">
                                    <h3>Income vs Expenses</h3>

                                    <div className="chart-box">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >

                                            <BarChart
                                                data={monthly}
                                                barCategoryGap="12%"
                                                barGap={5}
                                                margin={{
                                                    top: 10,
                                                    right: 20,
                                                    left: 35,
                                                    bottom: 10
                                                }}
                                            >
                                                <CartesianGrid
                                                    vertical={false}
                                                    strokeDasharray="3 3"
                                                />

                                                <XAxis
                                                    dataKey="month"
                                                    axisLine={false}
                                                    tickLine={false}
                                                />

                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    width={75}
                                                    tickMargin={10}
                                                    tickFormatter={value =>
                                                        value >= 1000
                                                            ? `${Math.round(value / 1000)}k`
                                                            : value
                                                    }
                                                />

                                                <Tooltip
                                                    formatter={v => money(v)}
                                                />

                                                <Legend />

                                                <Bar
                                                    isAnimationActive={false}
                                                    dataKey="Income"
                                                    fill="#8068ff"
                                                    radius={[8, 8, 0, 0]}
                                                    maxBarSize={65}
                                                />

                                                <Bar
                                                    isAnimationActive={false}
                                                    dataKey="Expense"
                                                    fill="#bcb0ff"
                                                    radius={[8, 8, 0, 0]}
                                                    maxBarSize={65}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>

                                    </div>
                                </section>

                                <section className="panel">
                                    <h3>Spending by Category</h3>

                                    {breakdown.length ? (
                                        <div className="chart-box" style={{ height: 340, minHeight: 340 }}>
                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <PieChart>
                                                    <Pie
                                                        isAnimationActive={false}
                                                        data={breakdown}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%"
                                                        cy="45%"
                                                        innerRadius={0}
                                                        outerRadius="70%"
                                                        paddingAngle={0}
                                                    >
                                                        {breakdown.map(
                                                            (_, i) => (
                                                                <Cell
                                                                    key={i}
                                                                    fill={
                                                                        COLORS[
                                                                        i % COLORS.length
                                                                            ]
                                                                    }
                                                                />
                                                            )
                                                        )}
                                                    </Pie>

                                                    <Tooltip
                                                        formatter={v => money(v)}
                                                    />

                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="empty">
                                            No expense data yet.
                                        </div>
                                    )}
                                </section>
                            </div>
                        </>
                    )}

                    {page === "goals" && (
                        <>
                            <section className="panel">
                                <div className="section-head">
                                    <h3>Create Savings Goal</h3>
                                </div>

                                <p className="muted">
                                    Savings goals are currently saved
                                    in this browser.
                                </p>

                                <form
                                    className="form-grid"
                                    onSubmit={e => {
                                        e.preventDefault();

                                        setGoals([
                                            ...goals,
                                            {
                                                id: crypto.randomUUID(),
                                                name: goal.name,
                                                target: Number(goal.target),
                                                saved: Number(
                                                    goal.saved || 0
                                                )
                                            }
                                        ]);

                                        setGoal({
                                            name: "",
                                            target: "",
                                            saved: ""
                                        });
                                    }}
                                >
                                    <label>
                                        Goal name
                                        <input
                                            required
                                            placeholder="e.g. Emergency fund"
                                            value={goal.name}
                                            onChange={e =>
                                                setGoal({
                                                    ...goal,
                                                    name: e.target.value
                                                })
                                            }
                                        />
                                    </label>

                                    <label>
                                        Target amount
                                        <input
                                            required
                                            type="number"
                                            min="1"
                                            value={goal.target}
                                            onChange={e =>
                                                setGoal({
                                                    ...goal,
                                                    target: e.target.value
                                                })
                                            }
                                        />
                                    </label>

                                    <label>
                                        Already saved
                                        <input
                                            type="number"
                                            min="0"
                                            value={goal.saved}
                                            onChange={e =>
                                                setGoal({
                                                    ...goal,
                                                    saved: e.target.value
                                                })
                                            }
                                        />
                                    </label>

                                    <div className="form-action">
                                        <button className="btn primary">
                                            <Plus size={17} />
                                            Add Goal
                                        </button>
                                    </div>
                                </form>
                            </section>

                            <div className="goal-grid">
                                {goals.map(g => {
                                    const pct = g.target
                                        ? (g.saved / g.target) * 100
                                        : 0;

                                    return (
                                        <div
                                            className="panel"
                                            key={g.id}
                                        >
                                            <div className="section-head">
                                                <h3>{g.name}</h3>

                                                <button
                                                    className="icon-btn danger"
                                                    onClick={() =>
                                                        setGoals(
                                                            goals.filter(
                                                                x => x.id !== g.id
                                                            )
                                                        )
                                                    }
                                                >
                                                    <Trash2 size={17} />
                                                </button>
                                            </div>

                                            <strong className="goal-amount">
                                                {money(g.saved)}
                                            </strong>

                                            <p className="muted">
                                                of {money(g.target)}
                                            </p>

                                            <div className="progress-track">
                                                <div
                                                    style={{
                                                        width: `${Math.min(
                                                            100,
                                                            pct
                                                        )}%`
                                                    }}
                                                />
                                            </div>

                                            <p className="muted">
                                                {Math.round(pct)}% completed
                                            </p>

                                            <button
                                                className="btn secondary"
                                                onClick={() => {
                                                    const amount =
                                                        window.prompt(
                                                            "Amount to add (₹)"
                                                        );

                                                    if (amount === null) return;

                                                    const n = Number(amount);

                                                    if (
                                                        !Number.isFinite(n) ||
                                                        n <= 0
                                                    ) {
                                                        return;
                                                    }

                                                    setGoals(
                                                        goals.map(x =>
                                                            x.id === g.id
                                                                ? {
                                                                    ...x,
                                                                    saved:
                                                                        Number(
                                                                            x.saved
                                                                        ) + n
                                                                }
                                                                : x
                                                        )
                                                    );
                                                }}
                                            >
                                                + Add Savings
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {!goals.length && (
                                <div className="empty">
                                    Create your first savings goal.
                                </div>
                            )}
                        </>
                    )}

                    {page === "settings" && (
                        <section className="panel settings-panel">
                            <h3>Preferences</h3>

                            <div className="setting-row">
                                <div>
                                    <strong>Dark mode</strong>
                                    <p>
                                        Change the application appearance.
                                    </p>
                                </div>

                                <button
                                    className="btn secondary"
                                    onClick={() => setDark(!dark)}
                                >
                                    {dark
                                        ? "Use light mode"
                                        : "Use dark mode"}
                                </button>
                            </div>

                            <div className="setting-row">
                                <div>
                                    <strong>Currency</strong>
                                    <p>
                                        Currently using Indian Rupees.
                                    </p>
                                </div>

                                <span>₹ INR</span>
                            </div>

                            <div className="setting-row">
                                <div>
                                    <strong>Account</strong>
                                    <p>
                                        Sign out of your BudgetFlow account.
                                    </p>
                                </div>

                                <button
                                    className="btn secondary"
                                    onClick={logout}
                                >
                                    Logout
                                </button>
                            </div>
                        </section>
                    )}
                </div>
            </main>
            <DeleteConfirmModal
                item={deleteDialog}
                busy={busy}
                onCancel={() => setDeleteDialog(null)}
                onConfirm={async () => {
                    if (!deleteDialog || busy) return;
                    const deleted = await save(deleteDialog.path, "DELETE");
                    if (deleted) setDeleteDialog(null);
                }}
            />
        </div>
    );
}
