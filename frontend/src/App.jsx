/*
  Acadience Attendance — UI built as a faithful clone of coinbase.com
  - Inter font, white bg, #0052FF blue accent
  - Sticky frosted nav with mega-menus
  - Hero: large left text + right dark-gradient phone mockup card
  - Section alternation: white / #F2F2F2 gray
  - Dark rounded asset table (black bg, tabs, price rows)
  - Coinbase-One-style feature sections with phone mockup
  - 3-col article grid, CTA with circle cluster, multi-col footer
  - Dashboard: stats cards, sortable table, sidebar with blue card
*/

import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

const API_BASE = "https://acadience-attendance-api.sedegahkimathi.workers.dev";
const getAuthHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
import {
    Wifi, MapPin, Lock, AlertTriangle, BarChart2, Cloud,
    FolderOpen, Calendar, Users, Download, Shield, Bell,
    Smartphone, Camera, CheckCircle, Zap, Search,
    Settings, GraduationCap, Home, ClipboardList, Database,
    Ruler, RotateCcw, Check, X, ChevronLeft, ChevronRight,
    ChevronDown, User, RefreshCw, QrCode, LogOut,
    LayoutDashboard, BookOpen, AlertCircle, TrendingUp,
    TrendingDown, Activity, ArrowRight, Plus, Filter,
    CheckCircle2, XCircle, Scan
} from "lucide-react";

/* ────────────────────────────────────────────────────────────
   STYLES  (verbatim from Coinbase source, content swapped)
──────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --blue:#0052FF;--blue-hover:#0039B3;--black:#050F19;--white:#FFFFFF;
  --gray-50:#F5F5F5;--gray-100:#EBEBEB;--gray-200:#D8D8D8;
  --gray-400:#9B9B9B;--gray-500:#6B7280;--gray-600:#5B616E;
  --green:#05B169;--red:#CF304A;--text:#050F19;
}
html{scroll-behavior:smooth}
body{font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:var(--text);-webkit-font-smoothing:antialiased;font-size:16px;line-height:1.5;overflow-x:hidden}
button{font-family:inherit;cursor:pointer}
input,select,textarea{font-family:inherit}
a{text-decoration:none;color:inherit}

/* ── NAV (exact Coinbase) ── */
.cb-nav{
  position:sticky;top:0;z-index:300;
  background:rgba(255,255,255,0.97);backdrop-filter:blur(12px);
  border-bottom:1px solid var(--gray-100);
  height:64px;display:flex;align-items:center;padding:0 32px;
}
.cb-nav-inner{max-width:1440px;width:100%;margin:0 auto;display:flex;align-items:center;position:relative}
.cb-logo{display:flex;align-items:center;gap:10px;margin-right:32px;cursor:pointer;user-select:none;text-decoration:none}
.cb-logo-icon{width:38px;height:38px;background:var(--blue);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:#fff;flex-shrink:0}
.cb-logo-text{font-size:18px;font-weight:600;color:var(--text);letter-spacing:-0.5px}
.cb-nav-links{display:flex;align-items:center;list-style:none;gap:0;flex:1}
.cb-nav-item{position:relative}
.cb-nav-btn{display:flex;align-items:center;gap:4px;padding:10px 18px;font-size:15px;font-weight:500;color:var(--text);background:transparent;border:none;border-radius:999px;cursor:pointer;transition:background .12s;white-space:nowrap}
.cb-nav-btn:hover,.cb-nav-btn.open{background:var(--gray-50)}
.cb-nav-actions{display:flex;align-items:center;gap:8px;margin-left:auto}
.cb-icon-btn{width:38px;height:38px;border-radius:50%;border:1.5px solid var(--gray-200);background:white;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;color:var(--gray-600);transition:background .12s}
.cb-icon-btn:hover{background:var(--gray-50)}
.cb-btn-signin{padding:9px 20px;font-size:15px;font-weight:600;color:var(--text);background:var(--gray-50);border:none;border-radius:100px;cursor:pointer;transition:background .12s}
.cb-btn-signin:hover{background:var(--gray-100)}
.cb-btn-signup{padding:9px 20px;font-size:15px;font-weight:600;color:#fff;background:var(--blue);border:none;border-radius:100px;cursor:pointer;transition:background .12s}
.cb-btn-signup:hover{background:var(--blue-hover)}

/* ── MEGA MENU (exact Coinbase) ── */
.cb-mega{
  position:absolute;top:calc(100% + 8px);left:0;
  background:white;border:1px solid var(--gray-100);border-radius:16px;
  box-shadow:0 20px 60px rgba(0,0,0,.12);
  padding:28px 32px;min-width:860px;
  display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;
  z-index:400;animation:megaIn .15s ease;
}
@keyframes megaIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
.cb-mega-col{display:flex;flex-direction:column;gap:4px;padding-right:24px}
.cb-mega-col:last-child{padding-right:0}
.cb-mega-section-title{font-size:12px;font-weight:700;color:var(--gray-400);text-transform:uppercase;letter-spacing:.6px;padding:4px 10px 8px;margin-top:4px}
.cb-mega-item{display:flex;align-items:flex-start;gap:16px;padding:12px 14px;border-radius:12px;text-decoration:none;color:var(--text);transition:background .1s;cursor:pointer}
.cb-mega-item:hover{background:var(--gray-50)}
.cb-mega-icon{width:36px;height:36px;border-radius:10px;background:var(--gray-50);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px}
.cb-mega-title{font-size:14px;font-weight:600;color:var(--text)}
.cb-mega-desc{font-size:13px;color:var(--gray-500);margin-top:1px;line-height:1.4}
.cb-mega-promo-col{display:flex;flex-direction:column;gap:12px;padding-left:24px;border-left:1px solid var(--gray-100)}
.cb-mega-promo-card{width:100px;height:100px;border-radius:16px;background:var(--blue);display:flex;align-items:center;justify-content:center;font-size:40px;flex-shrink:0}
.cb-mega-promo-title{font-size:20px;font-weight:400;color:#111;margin-bottom:6px;line-height:1.2}
.cb-mega-promo-desc{font-size:16px;color:var(--gray-500);margin-bottom:12px;line-height:1.3}
.cb-mega-promo-link{font-size:14px;font-weight:700;color:var(--text);text-decoration:underline;text-underline-offset:3px}
.cb-mega-promo-inner{display:flex;gap:16px;align-items:flex-start}

/* ── HERO ── */
.cb-hero{
  max-width:1440px;margin:0 auto;
  padding:60px 80px 80px;
  display:grid;grid-template-columns:1fr 1fr;
  align-items:center;gap:60px;
  min-height:calc(100vh - 64px);
}
.cb-hero-title{font-size:clamp(44px,5.5vw,72px);font-weight:400;line-height:1.06;letter-spacing:-3px;color:var(--text);margin-bottom:20px}
.cb-hero-sub{font-size:17px;color:var(--gray-500);margin-bottom:32px;line-height:1.6;max-width:440px}
.cb-hero-form{display:flex;gap:8px;max-width:460px}
.cb-hero-form input{flex:1;padding:14px 18px;font-size:15px;border:1.5px solid var(--gray-200);border-radius:100px;outline:none;color:var(--text)}
.cb-hero-form input::placeholder{color:var(--gray-400)}
.cb-hero-form input:focus{border-color:var(--blue)}
.cb-hero-form-btn{padding:14px 28px;font-size:15px;font-weight:700;background:var(--blue);color:#fff;border:none;border-radius:100px;cursor:pointer}
.cb-hero-form-btn:hover{background:var(--blue-hover)}
.cb-hero-disclaimer{font-size:12px;color:var(--gray-400);margin-top:14px}

/* Phone card on right side of hero */
.cb-phone-bg{
  background:linear-gradient(155deg,#1A49D4 0%,#0A1855 55%,#050F35 100%);
  border-radius:28px;width:100%;max-width:600px;
  padding:40px 60px 50px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  position:relative;min-height:440px;
}
.cb-phone-mockup{background:white;border-radius:24px;width:240px;box-shadow:0 32px 80px rgba(0,0,0,.45);overflow:hidden;display:flex;flex-direction:column}
.cb-phone-topbar{height:36px;background:#fafafa;border-bottom:1px solid #eee;display:flex;align-items:center;padding:0 8px;gap:5px}
.cb-phone-search{flex:1;height:24px;background:#f0f0f0;border-radius:8px;display:flex;align-items:center;padding:0 8px;gap:4px;font-size:10px;color:#888}
.cb-phone-body{padding:12px 12px 10px}
.cb-phone-bal{font-size:21px;font-weight:700;letter-spacing:-0.5px}
.cb-phone-chg{font-size:11px;color:var(--green);font-weight:500;margin:2px 0 10px}
.cb-phone-chart{height:80px;margin-bottom:10px}
.cb-phone-chart svg{width:100%;height:100%}
.cb-phone-tabs{display:flex;gap:3px;margin-bottom:8px}
.cb-phone-tab{font-size:10px;font-weight:500;padding:3px 6px;border-radius:5px;color:#888;border:none;background:transparent;cursor:pointer}
.cb-phone-tab.active{background:var(--blue);color:white;font-weight:600}
.cb-phone-row{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f5f5f5}
.cb-phone-row:last-child{border:none}
.cb-phone-row-icon{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0}
.cb-phone-row-name{font-size:12px;font-weight:600}
.cb-phone-row-val{font-size:12px;font-weight:600}
.cb-phone-row-val.up{color:var(--green)}

/* ── SHARED LAYOUT ── */
.cb-sec-gray{background:#F2F2F2;padding:80px}
.cb-sec-white{background:#fff}
.cb-inner{max-width:1440px;margin:0 auto}
.cb-two-col{max-width:1440px;margin:0 auto;padding:80px;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.cb-h2{font-size:clamp(28px,3.2vw,48px);font-weight:600;letter-spacing:-1.5px;line-height:1.1;margin-bottom:14px;color:var(--text)}
.cb-p{font-size:16px;color:var(--gray-500);line-height:1.7;margin-bottom:28px}
.cb-btn-dark{display:inline-block;padding:13px 24px;font-size:15px;font-weight:700;background:var(--text);color:white;border:none;border-radius:100px;text-decoration:none;cursor:pointer;transition:opacity .12s}
.cb-btn-dark:hover{opacity:.82}

/* ── DARK ASSET TABLE (exact Coinbase) ── */
.cb-asset-table{background:#0b0c0e;border-radius:36px;overflow:hidden;padding:21px 21px 8px}
.cb-asset-tabs{display:flex;justify-content:center;gap:18px;padding:5px 0 15px}
.cb-asset-tab{font-size:12px;font-weight:600;color:rgba(255,255,255,.9);padding:8px 15px;border-radius:999px;cursor:pointer;border:none;background:transparent;transition:background .12s}
.cb-asset-tab:hover{background:rgba(255,255,255,.06)}
.cb-asset-tab.active{background:rgba(255,255,255,.12);color:white}
.cb-asset-row{display:flex;align-items:center;justify-content:space-between;padding:15px 15px;border-top:1px solid rgba(255,255,255,.06);cursor:pointer;transition:background .1s}
.cb-asset-row:hover{background:rgba(255,255,255,.04)}
.cb-asset-left{display:flex;align-items:center;gap:14px}
.cb-asset-icon{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.cb-asset-name{font-size:30px;font-weight:400;color:white;letter-spacing:-0.5px}
.cb-asset-price{font-size:21px;font-weight:700;color:white;letter-spacing:-0.4px}
.cb-asset-chg{font-size:15px;font-weight:600}
.cb-asset-chg.up{color:var(--green)}
.cb-asset-chg.dn{color:var(--red)}

/* ── COINBASE ONE STYLE BADGE ── */
.cb-badge-pill{display:inline-flex;align-items:center;gap:8px;background:white;border:1.5px solid var(--gray-200);border-radius:100px;padding:6px 14px;font-size:13px;font-weight:600;color:var(--text);margin-bottom:20px;letter-spacing:.2px}
.cb-badge-dot{width:20px;height:20px;background:var(--blue);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;color:white}

/* Feature phone (Coinbase One / Base App style) */
.cb-feat-wrap{background:#F2F2F2;border-radius:28px;display:flex;align-items:center;justify-content:center;padding:30px;aspect-ratio:1}
.cb-feat-phone{background:white;border-radius:30px;box-shadow:0 24px 60px rgba(0,0,0,.1);width:68%;aspect-ratio:9/16;overflow:hidden;display:flex;flex-direction:column;padding:18px 16px 16px;gap:10px}
.cb-feat-phone-status{display:flex;justify-content:space-between;font-size:10px;color:#888}

/* QR on dark bg */
.cb-qr-dark{background:#0b0c0e;border-radius:36px;padding:32px;display:flex;flex-direction:column;align-items:center;gap:16px}
.cb-qr-canvas{width:180px;height:180px;background:white;border-radius:16px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 8px rgba(255,255,255,.06)}
.cb-qr-grid{display:grid;grid-template-columns:repeat(12,1fr);grid-template-rows:repeat(12,1fr);gap:2px;width:150px;height:150px}
.cb-qr-cell{border-radius:1.5px}
.cb-qr-label{font-size:11px;color:rgba(255,255,255,.4);letter-spacing:.1em;text-transform:uppercase;margin-bottom:3px;text-align:center}
.cb-qr-timer{font-size:28px;font-weight:700;letter-spacing:3px;font-variant-numeric:tabular-nums;text-align:center}
.cb-qr-timer.ok{color:white}
.cb-qr-timer.warn{color:#FBBF24}
.cb-qr-timer.danger{color:#F87171;animation:qrblink 1s step-start infinite}
@keyframes qrblink{50%{opacity:.4}}
.cb-qr-bar{width:100%;height:4px;background:rgba(255,255,255,.1);border-radius:99px;overflow:hidden}
.cb-qr-bar-fill{height:100%;border-radius:99px;transition:width 1s linear,background .3s}
.cb-qr-course{font-size:12px;color:rgba(255,255,255,.4)}
.cb-qr-refresh{padding:9px 22px;font-size:13px;font-weight:600;background:rgba(255,255,255,.08);color:rgba(255,255,255,.85);border:1.5px solid rgba(255,255,255,.12);border-radius:100px;cursor:pointer;transition:background .15s}
.cb-qr-refresh:hover{background:rgba(255,255,255,.14)}

/* ── ARTICLES (exact Coinbase) ── */
.cb-articles{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.cb-article{background:white;border-radius:16px;overflow:hidden;color:var(--text);transition:transform .2s,box-shadow .2s;display:block;cursor:pointer;border:1px solid var(--gray-100)}
.cb-article:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,.1)}
.cb-article-img{height:200px;display:flex;align-items:center;justify-content:center;font-size:52px}
.cb-article-body{padding:24px}
.cb-article-body h3{font-size:19px;font-weight:700;letter-spacing:-.5px;margin-bottom:10px;line-height:1.3}
.cb-article-body p{font-size:14px;color:var(--gray-500);line-height:1.6}

/* ── CTA SECTION (exact Coinbase) ── */
.cb-cta-section{max-width:1440px;margin:0 auto;padding:80px;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.cb-cta-h2{font-size:clamp(36px,4.5vw,68px);font-weight:500;letter-spacing:-2.5px;line-height:1.08;margin-bottom:14px}
.cb-cta-p{font-size:17px;color:var(--gray-500);margin-bottom:32px}
.cb-cta-form{display:flex;gap:8px;max-width:460px}
.cb-cta-form input{flex:1;padding:14px 18px;font-size:15px;border:1.5px solid var(--gray-200);border-radius:100px;outline:none;color:var(--text)}
.cb-cta-form input:focus{border-color:var(--blue)}
.cb-cta-form input::placeholder{color:var(--gray-400)}
.cb-cta-btn{padding:14px 28px;font-size:15px;font-weight:700;background:var(--blue);color:white;border:none;border-radius:100px;cursor:pointer}
.cb-cta-btn:hover{background:var(--blue-hover)}
.cb-circles{position:relative;width:380px;height:380px}
.cb-cc{position:absolute;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;box-shadow:0 8px 24px rgba(0,0,0,.12)}

/* ── FOOTER (exact Coinbase) ── */
.cb-footer{background:#F2F2F2;padding:60px 80px 40px;border-top:1px solid var(--gray-200)}
.cb-footer-grid{display:grid;grid-template-columns:160px 1fr 1fr 1fr 1fr;gap:24px;max-width:1440px;margin:0 auto}
.cb-footer-col h4{font-size:14px;font-weight:700;color:var(--text);margin-bottom:14px}
.cb-footer-col ul{list-style:none;display:flex;flex-direction:column;gap:10px}
.cb-footer-col a{font-size:14px;color:var(--gray-500);text-decoration:none;line-height:1.4;transition:color .12s}
.cb-footer-col a:hover{color:var(--text)}
.cb-footer-bottom{display:flex;align-items:center;justify-content:space-between;padding-top:28px;margin-top:48px;border-top:1px solid var(--gray-200);flex-wrap:wrap;gap:16px;max-width:1440px;margin-left:auto;margin-right:auto}
.cb-footer-bottom-left{font-size:14px;color:var(--gray-500)}
.cb-footer-bottom-links{display:flex;gap:24px}
.cb-footer-bottom-links a{font-size:14px;color:var(--gray-500);text-decoration:none}
.cb-footer-bottom-links a:hover{color:var(--text)}

/* ── DASHBOARD / INTERNAL ── */
.cb-dash-page{max-width:1440px;margin:0 auto;padding:40px 32px;display:flex;gap:28px}
.cb-dash-main{flex:1;min-width:0}
.cb-dash-sidebar{width:280px;flex-shrink:0;display:flex;flex-direction:column;gap:20px}

/* Stats cards */
.cb-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px}
.cb-stat-card{background:white;border:1.5px solid var(--gray-100);border-radius:16px;padding:22px 20px 18px;transition:box-shadow .2s,transform .2s}
.cb-stat-card:hover{box-shadow:0 8px 24px rgba(0,0,0,.07);transform:translateY(-2px)}
.cb-stat-lbl{font-size:13px;color:var(--gray-500);margin-bottom:8px}
.cb-stat-val{font-size:30px;font-weight:800;letter-spacing:-1.5px;color:var(--text);line-height:1;margin-bottom:6px}
.cb-stat-sub{font-size:13px;font-weight:500}
.cb-stat-sub.up{color:var(--green)}
.cb-stat-sub.dn{color:var(--red)}
.cb-stat-sub.neu{color:var(--gray-500)}
.cb-stat-bar{height:4px;background:var(--gray-100);border-radius:99px;overflow:hidden;margin-top:12px}
.cb-stat-bar-fill{height:100%;border-radius:99px}

/* Table wrapper */
.cb-tbl-wrap{border:1.5px solid var(--gray-100);border-radius:16px;overflow:hidden;margin-bottom:28px;background:white}
.cb-tbl-top{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1.5px solid var(--gray-100);flex-wrap:wrap;gap:12px}
.cb-tbl-title{font-size:17px;font-weight:700;color:var(--text)}
.cb-tbl-filters{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.cb-filter-pill{padding:7px 16px;font-size:13px;font-weight:500;border:1.5px solid var(--gray-200);border-radius:100px;background:white;cursor:pointer;color:var(--text);transition:all .12s}
.cb-filter-pill:hover,.cb-filter-pill.active{border-color:var(--blue);color:var(--blue);background:rgba(0,82,255,.04)}
.cb-search-box{display:flex;align-items:center;gap:8px;background:var(--gray-50);border:1.5px solid var(--gray-100);border-radius:100px;padding:7px 16px}
.cb-search-box input{background:transparent;border:none;outline:none;font-size:14px;color:var(--text);width:160px}
.cb-search-box input::placeholder{color:var(--gray-400)}
table.cb-tbl{width:100%;border-collapse:collapse}
table.cb-tbl th{padding:12px 20px;font-size:13px;font-weight:600;color:var(--gray-500);text-align:left;white-space:nowrap;border-bottom:1.5px solid var(--gray-100)}
table.cb-tbl th.r{text-align:right}
table.cb-tbl th.c{text-align:center}
table.cb-tbl td{padding:14px 20px;font-size:14px;color:var(--gray-600);border-bottom:1px solid var(--gray-100);vertical-align:middle}
table.cb-tbl td.r{text-align:right}
table.cb-tbl td.c{text-align:center}
table.cb-tbl tr:last-child td{border-bottom:none}
table.cb-tbl tbody tr{cursor:pointer;transition:background .1s}
table.cb-tbl tbody tr:hover{background:var(--gray-50)}

/* trade btn */
.cb-trade-btn{padding:8px 20px;font-size:13px;font-weight:700;background:var(--blue);color:white;border:none;border-radius:100px;cursor:pointer;transition:background .12s}
.cb-trade-btn:hover{background:var(--blue-hover)}

/* badges */
.cb-bdg{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;white-space:nowrap}
.cb-bdg.green{background:rgba(5,177,105,.1);color:var(--green)}
.cb-bdg.red{background:rgba(207,48,74,.1);color:var(--red)}
.cb-bdg.blue{background:rgba(0,82,255,.08);color:var(--blue)}
.cb-bdg.yellow{background:rgba(234,179,8,.1);color:#b45309}
.cb-bdg.gray{background:var(--gray-100);color:var(--gray-500)}
.cb-bdg-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex-shrink:0}

/* sidebar blue card (Coinbase "get started") */
.cb-side-blue{background:var(--blue);border-radius:16px;padding:22px;color:white;position:relative;overflow:hidden}
.cb-side-blue h3{font-size:18px;font-weight:600;margin-bottom:6px}
.cb-side-blue p{font-size:13px;opacity:.8;margin-bottom:16px}
.cb-side-blue-btn{padding:10px 22px;background:white;color:var(--blue);border-radius:100px;font-size:14px;font-weight:700;border:none;cursor:pointer}
.cb-side-deco{position:absolute;right:-10px;top:-10px;font-size:80px;opacity:.15;pointer-events:none}

/* sidebar movers / newon cards (exact Coinbase) */
.cb-side-card{background:white;border:1px solid var(--gray-100);border-radius:16px;padding:20px}
.cb-side-card-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
.cb-side-card-hdr h3{font-size:17px;font-weight:700}
.cb-side-nav{display:flex;gap:4px}
.cb-side-nav button{width:28px;height:28px;border-radius:50%;border:1.5px solid var(--gray-200);background:white;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center}
.cb-side-nav button:hover{background:var(--gray-50)}
.cb-mover-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.cb-mover-tile{border:1.5px solid var(--gray-100);border-radius:12px;padding:14px 12px;display:flex;flex-direction:column;gap:8px;cursor:pointer}
.cb-mover-tile:hover{border-color:var(--gray-200)}
.cb-mover-icon{width:36px;height:36px;border-radius:50%;background:var(--gray-50);display:flex;align-items:center;justify-content:center;font-size:18px}
.cb-mover-ticker{font-size:12px;color:var(--gray-500);font-weight:500}
.cb-mover-chg{font-size:16px;font-weight:700}
.cb-mover-chg.up{color:var(--green)}
.cb-mover-chg.dn{color:var(--red)}
.cb-mover-price{font-size:12px;color:var(--gray-500)}

/* attend rows in sidebar */
.cb-attend-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--gray-100)}
.cb-attend-row:last-child{border:none}
.cb-attend-av{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#0052FF,#6366F1);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:white;flex-shrink:0}
.cb-attend-name{font-size:14px;font-weight:600;color:var(--text);flex:1}
.cb-attend-time{font-size:12px;color:var(--gray-400)}

/* progress bar in sidebar */
.cb-prog-bar{height:6px;background:var(--gray-100);border-radius:99px;overflow:hidden}
.cb-prog-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--blue),#6366F1);transition:width .4s}

/* ── MODAL ── */
.cb-modal-bg{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.45);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;animation:mfade .15s ease}
@keyframes mfade{from{opacity:0}to{opacity:1}}
.cb-modal{background:white;border-radius:20px;width:520px;max-width:calc(100vw - 32px);max-height:90vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,.18);animation:mslide .2s cubic-bezier(.34,1.56,.64,1)}
@keyframes mslide{from{transform:translateY(14px) scale(.97);opacity:0}to{transform:none;opacity:1}}
.cb-modal-hdr{display:flex;align-items:center;justify-content:space-between;padding:22px 24px 18px;border-bottom:1px solid var(--gray-100)}
.cb-modal-hdr-title{font-size:18px;font-weight:600;letter-spacing:-.4px;color:var(--text)}
.cb-modal-close{width:34px;height:34px;border-radius:50%;border:1.5px solid var(--gray-200);background:white;font-size:16px;display:flex;align-items:center;justify-content:center;cursor:pointer}
.cb-modal-close:hover{background:var(--gray-50)}
.cb-modal-body{padding:24px}
.cb-form-row{margin-bottom:18px}
.cb-form-lbl{display:block;font-size:13px;font-weight:600;color:var(--text);margin-bottom:7px}
.cb-form-input{width:100%;padding:12px 16px;font-size:14px;border:1.5px solid var(--gray-200);border-radius:12px;outline:none;color:var(--text);transition:border-color .15s}
.cb-form-input:focus{border-color:var(--blue)}
.cb-form-input::placeholder{color:var(--gray-400)}
.cb-form-select{width:100%;padding:12px 16px;font-size:14px;border:1.5px solid var(--gray-200);border-radius:12px;outline:none;color:var(--text);background:white;-webkit-appearance:none}
.cb-form-select:focus{border-color:var(--blue)}
.cb-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.cb-form-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:24px}
.cb-geo-preview{background:var(--gray-50);border:1.5px solid var(--gray-100);border-radius:12px;height:130px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.cb-geo-ring{border-radius:50%;border:1.5px solid rgba(0,82,255,.25);position:absolute;animation:geoP 3s ease-in-out infinite}
.cb-geo-dot{width:10px;height:10px;border-radius:50%;background:var(--blue);box-shadow:0 0 12px rgba(0,82,255,.4);position:absolute;z-index:2}
@keyframes geoP{0%{opacity:.7;transform:scale(.9)}50%{opacity:.2;transform:scale(1.1)}100%{opacity:.7;transform:scale(.9)}}
.cb-geo-lbl{position:absolute;bottom:10px;left:12px;font-size:11px;color:var(--gray-400)}

/* ── TABS (internal pages) ── */
.cb-tabs{display:flex;border-bottom:1.5px solid var(--gray-100);margin-bottom:24px}
.cb-tab{padding:10px 22px;font-size:14px;font-weight:500;color:var(--gray-500);border:none;background:transparent;border-bottom:2.5px solid transparent;margin-bottom:-1.5px;cursor:pointer;transition:all .15s}
.cb-tab:hover{color:var(--text)}
.cb-tab.active{color:var(--blue);border-bottom-color:var(--blue);font-weight:600}

/* ── FLAGGED ── */
.cb-flag-card{background:white;border:1.5px solid #FEF3C7;border-radius:14px;padding:18px;display:flex;gap:16px;align-items:flex-start;margin-bottom:14px;transition:box-shadow .15s}
.cb-flag-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.06)}
.cb-flag-icon{width:40px;height:40px;flex-shrink:0;border-radius:10px;background:#FEF3C7;color:#D97706;display:flex;align-items:center;justify-content:center;font-size:18px}
.cb-flag-name{font-size:14px;font-weight:700;color:var(--text)}
.cb-flag-reason{font-size:13px;color:#D97706;margin-top:2px}
.cb-flag-meta{font-size:12px;color:var(--gray-500);margin-top:4px}
.cb-flag-actions{display:flex;gap:8px;margin-top:12px}
.cb-flag-approve{padding:7px 16px;font-size:13px;font-weight:600;background:rgba(5,177,105,.08);color:var(--green);border:1.5px solid rgba(5,177,105,.2);border-radius:100px;cursor:pointer}
.cb-flag-approve:hover{background:rgba(5,177,105,.14)}
.cb-flag-reject{padding:7px 16px;font-size:13px;font-weight:600;background:rgba(207,48,74,.08);color:var(--red);border:1.5px solid rgba(207,48,74,.2);border-radius:100px;cursor:pointer}
.cb-flag-reject:hover{background:rgba(207,48,74,.14)}

/* ── STUDENT SUBMIT ── */
.cb-submit-page{min-height:100vh;background:radial-gradient(1000px 600px at 50% 18%,rgba(0,82,255,.06),#fff);display:flex;align-items:center;justify-content:center;padding:40px 18px}
.cb-submit-card{background:white;border:1.5px solid var(--gray-100);border-radius:20px;width:100%;max-width:440px;padding:36px 32px;box-shadow:0 24px 60px rgba(0,0,0,.07)}
.cb-submit-logo{text-align:center;margin-bottom:28px}
.cb-submit-icon{width:52px;height:52px;background:var(--blue);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:white;margin-bottom:12px}
.cb-submit-title{font-size:22px;font-weight:600;letter-spacing:-.5px}
.cb-submit-sub{font-size:14px;color:var(--gray-500);margin-top:4px}
.cb-submit-success{text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px;padding:16px 0}
.cb-submit-success-icon{width:64px;height:64px;border-radius:50%;background:rgba(5,177,105,.1);border:2px solid var(--green);display:flex;align-items:center;justify-content:center;font-size:26px;animation:spop .4s cubic-bezier(.34,1.56,.64,1)}
@keyframes spop{from{transform:scale(.5);opacity:0}to{transform:scale(1);opacity:1}}
.cb-receipt{background:var(--gray-50);border-radius:12px;padding:16px 18px;width:100%}
.cb-receipt-row{display:flex;justify-content:space-between;font-size:14px;margin-bottom:8px}
.cb-receipt-row:last-child{margin-bottom:0}
.cb-receipt-k{color:var(--gray-500)}
.cb-receipt-v{font-weight:600}

/* ── TOAST ── */
.cb-toast-wrap{position:fixed;bottom:24px;right:24px;z-index:999;display:flex;flex-direction:column;gap:8px}
.cb-toast{background:white;border:1.5px solid var(--gray-200);border-radius:12px;padding:13px 18px;font-size:14px;color:var(--text);display:flex;align-items:center;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,.1);animation:tfade .25s ease}
@keyframes tfade{from{transform:translateY(10px);opacity:0}to{transform:none;opacity:1}}
.cb-toast.success{border-left:4px solid var(--green)}
.cb-toast.error{border-left:4px solid var(--red)}
.cb-toast.warn{border-left:4px solid #D97706}

@media(max-width:1100px){
  .cb-hero,.cb-two-col,.cb-cta-section{padding:48px 32px;gap:40px}
  .cb-sec-gray,.cb-footer{padding:48px 32px}
  .cb-stats{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:768px){
  .cb-hero,.cb-two-col,.cb-cta-section{grid-template-columns:1fr}
  .cb-footer-grid{grid-template-columns:1fr 1fr}
  .cb-articles{grid-template-columns:1fr}
  .cb-stats{grid-template-columns:1fr}
  .cb-nav{padding:0 16px}
  .cb-nav-links{display:none}
}
`;

/* ────────── DATA (live from API) ────────── */
const NAV_MENUS = {
    Features: {
        promo: { title: "How Acadience works", desc: "QR codes, geofencing and device locks in one workflow.", link: "Watch demo", bg: "#0052FF", icon: <Wifi size={18} /> },
        cols: [
            {
                items: [
                    { icon: <Wifi size={18} />, title: "Dynamic QR", desc: "HMAC-signed tokens rotate every 30 s" },
                    { icon: <MapPin size={18} />, title: "Geofencing", desc: "Haversine GPS validation per session" },
                    { icon: <Lock size={18} />, title: "Device fingerprint", desc: "One device = one submission per session" },
                ]
            },
            {
                items: [
                    { icon: <AlertTriangle size={18} />, title: "Flagged review", desc: "Approve or reject suspicious submissions" },
                    { icon: <BarChart2 size={18} />, title: "Analytics", desc: "Real-time rates and CSV export" },
                    { icon: <Cloud size={18} />, title: "Serverless", desc: "Cloudflare Workers + D1, zero cold starts" },
                ]
            },
        ],
    },
    Lecturers: {
        promo: { title: "Everything lecturers need.", desc: "Dashboard, QR panel, flagged review, CSV.", link: "Open dashboard", bg: "#0052FF", icon: <GraduationCap size={80} strokeWidth={1} /> },
        cols: [
            {
                items: [
                    { icon: <FolderOpen size={18} />, title: "Courses", desc: "Manage courses and enrollments" },
                    { icon: <Calendar size={18} />, title: "Sessions", desc: "Create sessions and display QR" },
                    { icon: <Users size={18} />, title: "Students", desc: "View per-student attendance records" },
                ]
            },
            {
                items: [
                    { icon: <Download size={18} />, title: "CSV Export", desc: "One-click download for registers" },
                    { icon: <Shield size={18} />, title: "Access control", desc: "Cloudflare Access for auth" },
                    { icon: <Bell size={18} />, title: "Alerts", desc: "Flag notifications by email" },
                ]
            },
        ],
    },
    Students: {
        promo: { title: "No app needed.", desc: "Students just scan the QR with any phone browser.", link: "Try check-in", bg: "#0039B3", icon: <Smartphone size={18} /> },
        cols: [
            {
                items: [
                    { icon: <Camera size={18} />, title: "Scan QR", desc: "Open camera, scan, submit" },
                    { icon: <MapPin size={18} />, title: "GPS check", desc: "Location validated automatically" },
                    { icon: <CheckCircle size={18} />, title: "Confirmation", desc: "Instant receipt on submission" },
                ]
            },
            {
                items: [
                    { icon: <Lock size={18} />, title: "No account", desc: "Students need no login at all" },
                    { icon: <Zap size={18} />, title: "Instant", desc: "Submissions processed in < 200 ms" },
                    { icon: <Wifi size={18} />, title: "Works offline?", desc: "Requires GPS + internet to submit" },
                ]
            },
        ],
    },
};
const FOOTER_COLS = {
    Platform: ["Dashboard", "Sessions", "Courses", "Enrollments", "CSV Export", "API Docs"],
    Lecturers: ["Getting started", "QR display", "Geofence setup", "Flagged review", "Analytics", "Access control"],
    Students: ["How to check in", "QR troubleshooting", "Privacy policy", "Contact support"],
    Company: ["About", "Blog", "Careers", "Security", "Status", "Changelog"],
};
const fmt = n => n < 10 ? "0" + n : "" + n;
const pct = (a, b) => b ? Math.round((a / b) * 100) : 0;

/* ────────── TOAST ────────── */
function useToast() {
    const [ts, setTs] = useState([]);
    const add = useCallback((msg, type = "success") => {
        const id = Date.now();
        setTs(t => [...t, { id, msg, type }]);
        setTimeout(() => setTs(t => t.filter(x => x.id !== id)), 3400);
    }, []);
    return { ts, add };
}
function Toasts({ ts }) {
    const ic = { success: <CheckCircle2 size={14} />, error: <XCircle size={14} />, warn: <AlertTriangle size={14} /> };
    return (
        <div className="cb-toast-wrap">
            {ts.map(t => (
                <div key={t.id} className={`cb-toast ${t.type}`}>
                    <span style={{ color: t.type === "success" ? "var(--green)" : t.type === "error" ? "var(--red)" : "#D97706" }}>{ic[t.type]}</span>
                    {t.msg}
                </div>
            ))}
        </div>
    );
}

/* ────────── QR PATTERN ────────── */
function QRPattern({ seed }) {
    let s = (seed || 1) * 9301 + 49297;
    const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    const fnd = new Set();
    [[0, 0], [0, 1], [1, 0], [0, 2], [1, 2], [2, 0], [2, 1], [2, 2], [9, 0], [10, 0], [11, 0], [9, 1], [11, 1], [9, 2], [10, 2], [11, 2], [0, 9], [1, 9], [2, 9], [0, 10], [2, 10], [0, 11], [1, 11], [2, 11]].forEach(([r, c]) => fnd.add(`${r},${c}`));
    const cells = [];
    for (let r = 0; r < 12; r++) for (let c = 0; c < 12; c++) {
        const filled = fnd.has(`${r},${c}`)
            ? (r % 12 <= 2 || (r % 12 >= 9 && r % 12 <= 11)) && (c % 12 <= 2 || (c % 12 >= 9 && c % 12 <= 11))
            : rng() > 0.45;
        cells.push({ r, c, filled });
    }
    return (
        <div className="cb-qr-grid">
            {cells.map(({ r, c, filled }) => (
                <div key={`${r}-${c}`} className="cb-qr-cell" style={{ background: filled ? "#050F19" : "transparent" }} />
            ))}
        </div>
    );
}

/* ────────── MEGA MENU ────────── */
function MegaMenu({ data, onClose }) {
    return (
        <div className="cb-mega" onMouseLeave={onClose}>
            <div className="cb-mega-col">
                {data.cols[0]?.items.map(item => (
                    <div key={item.title} className="cb-mega-item">
                        <div className="cb-mega-icon">{item.icon}</div>
                        <div><div className="cb-mega-title">{item.title}</div><div className="cb-mega-desc">{item.desc}</div></div>
                    </div>
                ))}
            </div>
            <div className="cb-mega-col">
                {data.cols[1]?.items.map(item => (
                    <div key={item.title} className="cb-mega-item">
                        <div className="cb-mega-icon">{item.icon}</div>
                        <div><div className="cb-mega-title">{item.title}</div><div className="cb-mega-desc">{item.desc}</div></div>
                    </div>
                ))}
            </div>
            <div className="cb-mega-promo-col">
                <div className="cb-mega-promo-inner">
                    <div className="cb-mega-promo-card" style={{ background: data.promo.bg }}>{data.promo.icon}</div>
                    <div>
                        <div className="cb-mega-promo-title">{data.promo.title}</div>
                        <div className="cb-mega-promo-desc">{data.promo.desc}</div>
                        <span className="cb-mega-promo-link">{data.promo.link}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ────────── NAV (home) ────────── */
function Nav({ setPage, toast }) {
    const [open, setOpen] = useState(null);
    const ref = useRef(null);
    useEffect(() => {
        const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(null); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);
    return (
        <nav className="cb-nav" ref={ref}>
            <div className="cb-nav-inner">
                <div className="cb-logo" onClick={() => setPage("home")}>
                    <img src="/logo.png" style={{ height: 38, width: 38, objectFit: "contain" }} />
                    <span className="cb-logo-text">Acadience</span>
                </div>
                <ul className="cb-nav-links">
                    {Object.keys(NAV_MENUS).map(name => (
                        <li key={name} className="cb-nav-item">
                            <button className={`cb-nav-btn${open === name ? " open" : ""}`}
                                onMouseEnter={() => setOpen(name)} onClick={() => setOpen(p => p === name ? null : name)}>
                                {name} <span style={{ fontSize: 11, opacity: .6 }}>▾</span>
                            </button>
                            {open === name && <MegaMenu data={NAV_MENUS[name]} onClose={() => setOpen(null)} />}
                        </li>
                    ))}
                    <li><button className="cb-nav-btn" onClick={() => toast.add("Pricing coming soon", "warn")}>Pricing</button></li>
                </ul>
                <div className="cb-nav-actions">
                    <button className="cb-icon-btn"><Search size={18} /></button>
                    <button className="cb-btn-signin" onClick={() => setPage("login")}>Sign in</button>
                    <button className="cb-btn-signup" onClick={() => setPage("student")}>Student check-in</button>
                </div>
            </div>
        </nav>
    );
}

/* ────────── DASHBOARD NAV ────────── */
function DashNav({ tab, setTab, setPage, onLogout }) {
    return (
        <nav className="cb-nav">
            <div className="cb-nav-inner">
                <div className="cb-logo" onClick={() => setPage("home")}>
                    <img src="/logo.png" style={{ height: 38, width: 38, objectFit: "contain" }} />
                    <span className="cb-logo-text">Acadience</span>
                </div>
                <ul className="cb-nav-links">
                    {["Dashboard", "Sessions", "Courses", "Flagged", "Students"].map(t => (
                        <li key={t}><button className={`cb-nav-btn${tab === t ? " open" : ""}`} style={tab === t ? { background: "var(--gray-50)", fontWeight: 600 } : {}} onClick={() => setTab(t)}>{t}</button></li>
                    ))}
                </ul>
                <div className="cb-nav-actions">
                    <button className="cb-icon-btn"><Bell size={18} /></button>
                    <button className="cb-icon-btn"><Settings size={18} /></button>
                    {onLogout && <button className="cb-icon-btn" onClick={onLogout} title="Sign out"><LogOut size={18} /></button>}
                </div>
            </div>
        </nav>
    );
}

/* ────────── QR PANEL (dark) ────────── */
function QRPanel({ session, onRefresh }) {
    const [secs, setSecs] = useState(47);
    const [seed, setSeed] = useState(() => Math.floor(Math.random() * 9999) + 1);
    useEffect(() => {
        const t = setInterval(() => setSecs(s => {
            if (s <= 1) { setSeed(Math.floor(Math.random() * 9999) + 1); return 30; }
            return s - 1;
        }), 1000);
        return () => clearInterval(t);
    }, []);
    const refresh = () => { setSeed(Math.floor(Math.random() * 9999) + 1); setSecs(30); onRefresh?.(); };
    const tc = secs <= 5 ? "danger" : secs <= 10 ? "warn" : "ok";
    return (
        <div className="cb-qr-dark">
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", letterSpacing: ".1em", textTransform: "uppercase", alignSelf: "flex-start" }}>Live Session QR</div>
            <div className="cb-qr-canvas"><QRPattern seed={seed} /></div>
            <div style={{ textAlign: "center" }}>
                <div className="cb-qr-label">ROTATES IN</div>
                <div className={`cb-qr-timer ${tc}`}>{fmt(0)}:{fmt(secs)}</div>
            </div>
            <div className="cb-qr-bar">
                <div className="cb-qr-bar-fill" style={{ width: `${(secs / 30) * 100}%`, background: secs <= 5 ? "#F87171" : secs <= 10 ? "#FBBF24" : "var(--blue)" }} />
            </div>
            <div className="cb-qr-course">{session?.courseName || "CS401"} · Session #{session?.id || 1}</div>
            <button className="cb-qr-refresh" onClick={refresh}><RotateCcw size={13} /> &nbsp;Refresh QR</button>
        </div>
    );
}

/* ────────── PHONE MOCKUP (hero) ────────── */
function PhoneMockup({ tab, setTab }) {
    const rows = [
        { icon: <Calendar size={18} />, ibg: "#EBF0FF", name: "Sessions", val: "1 active", up: false },
        { icon: <Users size={18} />, ibg: "#F0FDF4", name: "Students", val: "↗ 215", up: true },
        { icon: <CheckCircle size={18} />, ibg: "#F0FDF4", name: "Attendance", val: "↗ 91%", up: true },
        { icon: <AlertTriangle size={18} />, ibg: "#FFFBEB", name: "Flagged", val: "2 pending", up: false },
        { icon: <BarChart2 size={13} />, ibg: "#F5F3FF", name: "Reports", val: "CSV ready", up: false },
    ];
    return (
        <div className="cb-phone-mockup">
            <div className="cb-phone-topbar">
                <div className="cb-phone-search"><Search size={10} /> Search</div>
                <div style={{ display: "flex", gap: 3 }}>
                    {[<Bell size={9} />, <ChevronRight size={9} />, <User size={9} />].map((ic, idx) => <span key={idx} style={{ width: 20, height: 20, borderRadius: "50%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}>{ic}</span>)}
                </div>
            </div>
            <div className="cb-phone-body">
                <div className="cb-phone-bal">91.4%</div>
                <div className="cb-phone-chg" style={{ display: "flex", alignItems: "center", gap: 2 }}><TrendingUp size={11} /> Avg attendance rate</div>
                <div className="cb-phone-chart">
                    <svg viewBox="0 0 220 80" fill="none" preserveAspectRatio="none">
                        <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0052FF" stopOpacity=".18" /><stop offset="100%" stopColor="#0052FF" stopOpacity="0" /></linearGradient></defs>
                        <path d="M0,68 C15,65 25,70 45,62 C65,54 75,58 95,48 C115,38 125,42 145,30 C165,18 180,22 200,12 L220,6 L220,80 L0,80Z" fill="url(#pg)" />
                        <path d="M0,68 C15,65 25,70 45,62 C65,54 75,58 95,48 C115,38 125,42 145,30 C165,18 180,22 200,12 L220,6" stroke="#0052FF" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                        <circle cx="220" cy="6" r="3.5" fill="#0052FF" />
                    </svg>
                </div>
                <div className="cb-phone-tabs">
                    {["1H", "1D", "1W", "Term"].map(t => (
                        <button key={t} className={`cb-phone-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>{t}</button>
                    ))}
                </div>
                {rows.map(r => (
                    <div key={r.name} className="cb-phone-row">
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <div className="cb-phone-row-icon" style={{ background: r.ibg }}>{r.icon}</div>
                            <span className="cb-phone-row-name">{r.name}</span>
                        </div>
                        <span className={`cb-phone-row-val${r.up ? " up" : ""}`}>{r.up && <TrendingUp size={9} />} {r.val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ────────── [] ASSET TABLE (dark, Coinbase Explore style) ────────── */
function SessionsAssetTable({ sessions = [] }) {
    const [activeTab, setActiveTab] = useState("All");
    const tabs = ["All", "Active", "Closed"];
    const rows = sessions.filter(s => activeTab === "All" || s.status === (activeTab === "Active" ? "active" : "closed"));
    const icons = { CS401: <Ruler size={16} />, CS302: <Database size={16} />, EE210: <Zap size={16} />, MATH310: <BarChart2 size={16} /> };
    const ibg = { CS401: "#EBF0FF", CS302: "#F0FDF4", EE210: "#FEF3C7", MATH310: "#F5F3FF" };
    return (
        <div className="cb-asset-table">
            <div className="cb-asset-tabs">
                {tabs.map(t => (
                    <button key={t} className={`cb-asset-tab${activeTab === t ? " active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
                ))}
            </div>
            {rows.map(s => (
                <div key={s.id} className="cb-asset-row">
                    <div className="cb-asset-left">
                        <div className="cb-asset-icon" style={{ background: ibg[s.courseName] || "#333", fontSize: 18 }}>{icons[s.courseName] || "<ClipboardList size={14}/>"}</div>
                        <div>
                            <div className="cb-asset-name">{s.courseName}</div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 1 }}>{s.date} · {s.time}</div>
                        </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div className="cb-asset-price">{pct(s.attended, s.total)}%</div>
                        <div className={`cb-asset-chg ${s.attended / s.total >= .8 ? "up" : "dn"}`}>
                            {s.attended / s.total >= .8 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {s.attended}/{s.total} present
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ────────── FEATURE PHONE (Coinbase One style) ────────── */
function FeaturePhone() {
    return (
        <div className="cb-feat-wrap">
            <div className="cb-feat-phone">
                <div className="cb-feat-phone-status"><span>9:41</span><span>▪▪ WiFi 100%</span></div>
                {/* Success screen */}
                <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                        <Check size={24} color="white" strokeWidth={3} />
                        <div style={{ position: "absolute", bottom: -3, right: -3, width: 18, height: 18, background: "#FFD700", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={9} color="white" /></div>
                    </div>
                </div>
                <div style={{ textAlign: "center", fontWeight: 700, fontSize: 14 }}>Attendance recorded!</div>
                <div style={{ textAlign: "center", fontSize: 11, color: "#888", marginBottom: 8 }}>CS401 · 27 Feb · 09:07</div>
                {/* receipt */}
                <div style={{ background: "#F5F5F5", borderRadius: 10, padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                    {[["Student", "10024"], ["Name", "Kwame Boateng"], ["GPS", "<Check size={13}/> In range"], ["Device", "<Check size={13}/> Verified"]].map(([k, v]) => (
                        <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                            <span style={{ color: "#888" }}>{k}</span>
                            <span style={{ fontWeight: 600, color: v.startsWith("<Check size={13}/>") ? "var(--green)" : undefined }}>{v}</span>
                        </div>
                    ))}
                </div>
                {/* geo preview */}
                <div style={{ background: "#F0F4FF", borderRadius: 10, height: 60, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 4 }}>
                    {[70, 46, 24].map((d, i) => <div key={d} style={{ position: "absolute", width: d, height: d, borderRadius: "50%", border: "1.5px solid rgba(0,82,255,.25)", animation: `geoP 3s ease-in-out ${i * .5}s infinite` }} />)}
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--blue)", position: "relative", zIndex: 2, boxShadow: "0 0 8px rgba(0,82,255,.5)" }} />
                    <div style={{ position: "absolute", bottom: 5, left: 8, fontSize: 9, color: "#888" }}>100 m radius · GPS <Check size={13} /></div>
                </div>
                {/* bottom nav */}
                <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1px solid #f0f0f0", paddingTop: 8, marginTop: "auto" }}>
                    {[<Home size={14} />, <Search size={14} />, <ClipboardList size={14} />, <Bell size={14} />, <User size={14} />].map((ic, i) => <span key={i} style={{ color: i === 2 ? "var(--blue)" : "#bbb" }}>{ic}</span>)}
                </div>
            </div>
        </div>
    );
}

/* ────────── ARTICLES ────────── */
const ARTICLES = [
    { bg: "radial-gradient(circle at 50% 60%,#0052FF 0%,#001266 55%,#000 100%)", icon: <Wifi size={18} />, title: "How rotating QR codes stop proxy attendance", excerpt: "HMAC-signed tokens that expire every 30 seconds make it impossible to share screenshots from a previous class..." },
    { bg: "linear-gradient(135deg,#0052FF,#2775FF)", icon: <MapPin size={18} />, title: "Geofencing 101: keeping attendance honest", excerpt: "Haversine distance calculations verify that each student's GPS coordinates fall within the lecture radius at check-in time..." },
    { bg: "#8FAAA4", icon: <BarChart2 size={18} />, title: "Using attendance data to predict student outcomes", excerpt: "Research shows attendance is the single strongest early-warning indicator for at-risk students — even before midterm grades..." },
];

/* ────────── HOME PAGE ────────── */
function HomePage({ setPage, toast }) {
    const [heroTab, setHeroTab] = useState("1D");
    const [email, setEmail] = useState("");
    const circles = [
        { w: 115, bg: "#0052FF", l: 100, t: 130, c: <img src="/logo.png" style={{ width: 50, height: 50, objectFit: "contain" }} /> },
        { w: 88, bg: "#1B2744", l: 178, t: 30, c: <QrCode size={32} color="white" /> },
        { w: 88, bg: "#22C55E", l: 258, t: 110, c: <Check size={26} color="white" /> },
        { w: 115, bg: "#F59E0B", l: 170, t: 165, c: <MapPin size={32} color="white" /> },
        { w: 88, bg: "#6366F1", l: 82, t: 252, c: <Users size={26} color="white" /> },
        { w: 88, bg: "#1A3980", l: 248, t: 235, c: <BarChart2 size={18} color="white" /> },
        { w: 78, bg: "#8EA9D7", l: 172, t: 285, c: <Lock size={22} color="white" /> },
    ];
    return (
        <div style={{ background: "white", color: "var(--text)" }}>

            {/* ── HERO ── */}
            <section>
                <div className="cb-hero">
                    <div>
                        <h1 className="cb-hero-title">The future of<br />attendance<br />is here.</h1>
                        <p className="cb-hero-sub">QR-based, geofenced, and serverless. Acadience makes attendance fraud-proof for lecturers and effortless for students.</p>
                        <div className="cb-hero-form">
                            <input type="email" placeholder="institution@university.edu" value={email} onChange={e => setEmail(e.target.value)} />
                            <button className="cb-hero-form-btn" onClick={() => setPage("login")}>Get started</button>
                        </div>
                        <p className="cb-hero-disclaimer">Free for up to 3 courses. No credit card required. Student data stays on your Cloudflare account.</p>
                    </div>
                    <div>
                        <div className="cb-phone-bg">
                            <PhoneMockup tab={heroTab} setTab={setHeroTab} />
                            <p style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,.4)" }}>Live attendance dashboard. Updates in real time.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── EXPLORE / [] (gray section, dark table) ── */}
            <section className="cb-sec-gray">
                <div style={{ maxWidth: 1440, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
                    <div>
                        <h2 className="cb-h2">Track every lecture,<br />course, and student.</h2>
                        <p className="cb-p">Real-time attendance rates, per-student records, flagged submission review, and one-click CSV exports — all in one dashboard.</p>
                        <button className="cb-btn-dark" onClick={() => setPage("login")} style={{ display: "flex", alignItems: "center", gap: 6 }}>Open dashboard <ArrowRight size={16} /></button>
                    </div>
                    <SessionsAssetTable sessions={[]} />
                </div>
            </section>

            {/* ── QR SECTION (white, phone right) ── */}
            <section>
                <div className="cb-two-col">
                    <div style={{ background: "#F2F2F2", borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", padding: 30, aspectRatio: "1" }}>
                        <QRPanel session={{ id: 1, courseName: "CS401", attended: 38, total: 48, flagged: 0, status: "active", duration: 90 }} onRefresh={() => toast.add("QR refreshed", "success")} />
                    </div>
                    <div>
                        <div className="cb-badge-pill"><div className="cb-badge-dot">QR</div> DYNAMIC QR CODES</div>
                        <h2 className="cb-h2">One scan.<br />Instant, verified attendance.</h2>
                        <p className="cb-p">Each session generates a time-bound QR code signed with HMAC. Codes rotate every 30 seconds — screenshots from yesterday simply won't work. Lecturers can force-refresh any time.</p>
                        <button className="cb-btn-dark" onClick={() => setPage("student")} style={{ display: "flex", alignItems: "center", gap: 6 }}>Try student check-in <ArrowRight size={16} /></button>
                    </div>
                </div>
            </section>

            {/* ── GEOFENCE SECTION (gray, visual left) ── */}
            <section className="cb-sec-gray">
                <div className="cb-two-col">
                    <div>
                        <div className="cb-badge-pill"><div className="cb-badge-dot"><MapPin size={18} color="var(--blue)" /></div> GEOFENCING</div>
                        <h2 className="cb-h2">They have to be there<br />to mark themselves present.</h2>
                        <p className="cb-p">Haversine-formula GPS validation checks that each student is within your configurable radius. Submissions from outside are automatically flagged for lecturer review.</p>
                        <button className="cb-btn-dark" onClick={() => setPage("login")} style={{ display: "flex", alignItems: "center", gap: 6 }}>Review flagged <ArrowRight size={16} /></button>
                    </div>
                    <div style={{ background: "white", borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", aspectRatio: "1", boxShadow: "0 2px 20px rgba(0,0,0,.06)" }}>
                        <div style={{ position: "relative", width: 260, height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {[240, 160, 90].map((d, i) => (
                                <div key={d} style={{ position: "absolute", width: d, height: d, borderRadius: "50%", background: `rgba(0,82,255,${.04 + i * .02})`, border: "1.5px solid rgba(0,82,255,.18)" }} />
                            ))}
                            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(0,82,255,.12)", border: "2px solid var(--blue)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, zIndex: 2 }}><MapPin size={18} color="var(--blue)" /></div>
                            {[["-16px", "50%", true], ["20%", "calc(100% - 20px)", true], ["calc(100% - 16px)", "28%", true], ["10%", "12%", false]].map(([t, l, ok], i) => (
                                <div key={i} style={{ position: "absolute", top: t, left: l, width: 30, height: 30, borderRadius: "50%", background: ok ? "rgba(5,177,105,.12)" : "rgba(207,48,74,.1)", border: `2px solid ${ok ? "var(--green)" : "var(--red)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                                    {ok ? <Check size={12} /> : <X size={12} />}
                                </div>
                            ))}
                            <div style={{ position: "absolute", bottom: 8, right: 12, fontSize: 11, color: "var(--gray-500)" }}>Radius: 100 m</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── STUDENT CHECK-IN SECTION (Coinbase One style) ── */}
            <section>
                <div className="cb-two-col">
                    <div>
                        <div className="cb-badge-pill"><div className="cb-badge-dot"><Smartphone size={32} /></div> STUDENT CHECK-IN</div>
                        <h2 className="cb-h2">No app.<br />No account.<br />Just scan.</h2>
                        <p className="cb-p">Students open any browser, scan the QR code displayed in class, fill in their student ID and name — done in under 10 seconds. No app download, no login, no friction.</p>
                        <button className="cb-btn-dark" onClick={() => setPage("student")} style={{ display: "flex", alignItems: "center", gap: 6 }}>Try it now <ArrowRight size={16} /></button>
                    </div>
                    <FeaturePhone />
                </div>
            </section>

            {/* ── LEARN / BLOG (gray) ── */}
            <section className="cb-sec-gray">
                <div style={{ maxWidth: 1440, margin: "0 auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "end", marginBottom: 48 }}>
                        <h2 style={{ fontSize: "clamp(32px,4vw,54px)", fontWeight: 800, letterSpacing: "-2px", lineHeight: 1.1 }}>
                            Better attendance.<br />Better outcomes.
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: 16, justifyContent: "flex-end" }}>
                            <p style={{ fontSize: 15, color: "var(--gray-500)", lineHeight: 1.6, maxWidth: 400 }}>Attendance is the strongest early-warning indicator for at-risk students. Acadience gives you the data to act before it's too late.</p>
                            <div><button className="cb-btn-dark">Read more</button></div>
                        </div>
                    </div>
                    <div className="cb-articles">
                        {ARTICLES.map((a, i) => (
                            <div key={i} className="cb-article" onClick={() => toast.add("Article opening…", "success")}>
                                <div className="cb-article-img" style={{ background: a.bg }}>{a.icon}</div>
                                <div className="cb-article-body"><h3>{a.title}</h3><p>{a.excerpt}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section>
                <div className="cb-cta-section">
                    <div>
                        <h2 className="cb-cta-h2">Take control<br />of attendance.</h2>
                        <p className="cb-cta-p">Start your first session today and see attendance fraud eliminated.</p>
                        <div className="cb-cta-form">
                            <input type="email" placeholder="institution@university.edu" value={email} onChange={e => setEmail(e.target.value)} />
                            <button className="cb-cta-btn" onClick={() => setPage("login")}>Get started</button>
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div className="cb-circles">
                            {circles.map((c, i) => (
                                <div key={i} className="cb-cc" style={{ width: c.w, height: c.w, background: c.bg, left: c.l, top: c.t }}>{c.c}</div>
                            ))}
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: "center", fontSize: 13, color: "var(--gray-400)", padding: "20px 80px 40px", borderTop: "1px solid var(--gray-100)", maxWidth: 1440, margin: "0 auto" }}>
                    Built on Cloudflare Workers + D1. Authentication via Cloudflare Access. Student data never leaves your account.
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="cb-footer">
                <div className="cb-footer-grid">
                    <div>
                        <img src="/logo.png" style={{ height: 42, width: 42, objectFit: "contain" }} />
                    </div>
                    {Object.entries(FOOTER_COLS).map(([col, links]) => (
                        <div key={col} className="cb-footer-col">
                            <h4>{col}</h4>
                            <ul>{links.map(l => <li key={l}><a href="#">{l}</a></li>)}</ul>
                        </div>
                    ))}
                </div>
                <div className="cb-footer-bottom">
                    <div className="cb-footer-bottom-left">© 2025 Acadience. Serverless attendance on Cloudflare.</div>
                    <div className="cb-footer-bottom-links"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Security</a></div>
                </div>
            </footer>
        </div>
    );
}

/* ────────── DASHBOARD INTERNALS ────────── */
function StatsRow({ sessions = [], courses = [], flags = [] }) {
    const activeSessions = sessions.filter(s => s.status === "active").length;
    const allSessions = sessions.filter(s => s.total > 0);
    const avgRate = allSessions.length ? Math.round(allSessions.reduce((a, s) => a + pct(s.attended_count || s.attended || 0, s.total || 1), 0) / allSessions.length) : 0;
    const stats = [
        { lbl: "Active Sessions", val: String(activeSessions), sub: `${activeSessions} live now`, dir: "up", color: "#0052FF", bar: Math.min(100, activeSessions * 33) },
        { lbl: "Total Courses", val: String(courses.length), sub: `${courses.length} courses`, dir: "neu", color: "#6366F1", bar: 100 },
        { lbl: "Avg Attendance", val: `${avgRate}%`, sub: "this term", dir: "up", color: "var(--green)", bar: avgRate },
        { lbl: "Flagged", val: String(flags.filter(f => f.status === "pending").length), sub: "Need review", dir: "dn", color: "#D97706", bar: 15 },
    ];
    return (
        <div className="cb-stats">
            {stats.map(s => (
                <div key={s.lbl} className="cb-stat-card">
                    <div className="cb-stat-lbl">{s.lbl}</div>
                    <div className="cb-stat-val" style={{ color: s.color }}>{s.val}</div>
                    <div className={`cb-stat-sub ${s.dir}`}>{s.sub}</div>
                    <div className="cb-stat-bar"><div className="cb-stat-bar-fill" style={{ width: `${s.bar}%`, background: s.color }} /></div>
                </div>
            ))}
        </div>
    );
}

function SessionsTable({ onView, onNew, toast, sessions = [], courses = [] }) {
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const rows = sessions.filter(s => {
        if (filter === "active" && s.status !== "active") return false;
        if (filter === "closed" && s.status !== "closed") return false;
        return s.courseName.toLowerCase().includes(search.toLowerCase());
    });
    return (
        <div className="cb-tbl-wrap">
            <div className="cb-tbl-top">
                <div className="cb-tbl-title">Sessions</div>
                <div className="cb-tbl-filters">
                    {["all", "active", "closed"].map(f => (
                        <button key={f} className={`cb-filter-pill${filter === f ? " active" : ""}`} onClick={() => setFilter(f)}>
                            {f === "all" ? "All" : f === "active" ? "Live" : "Closed"}
                        </button>
                    ))}
                    <div className="cb-search-box">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                        <input placeholder="Search sessions…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button className="cb-btn-signup" style={{ padding: "8px 16px", fontSize: 13 }} onClick={onNew}>+ New Session</button>
                </div>
            </div>
            <table className="cb-tbl">
                <thead><tr>
                    <th>Course</th><th>Date</th><th>Time</th>
                    <th className="c">Status</th><th className="r">Attendance</th>
                    <th className="r">Rate</th><th className="c">Flagged</th><th className="r">Actions</th>
                </tr></thead>
                <tbody>
                    {rows.length === 0
                        ? <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "var(--gray-400)" }}>No sessions found</td></tr>
                        : rows.map(s => (
                            <tr key={s.id} onClick={() => onView(s)}>
                                <td><span style={{ fontWeight: 700, color: "var(--text)" }}>{s.courseName}</span></td>
                                <td>{s.date}</td>
                                <td style={{ fontVariantNumeric: "tabular-nums" }}>{s.time}</td>
                                <td className="c">
                                    <span className={`cb-bdg ${s.status === "active" ? "green" : "gray"}`}>
                                        {s.status === "active" && <span className="cb-bdg-dot" />}
                                        {s.status === "active" ? "LIVE" : "CLOSED"}
                                    </span>
                                </td>
                                <td className="r" style={{ fontVariantNumeric: "tabular-nums" }}>{s.attended} / {s.total}</td>
                                <td className="r"><span style={{ fontWeight: 600, color: pct(s.attended, s.total) >= 80 ? "var(--green)" : pct(s.attended, s.total) >= 60 ? "#D97706" : "var(--red)" }}>{pct(s.attended, s.total)}%</span></td>
                                <td className="c">{s.flagged > 0 ? <span className="cb-bdg yellow"><AlertTriangle size={18} /> {s.flagged}</span> : <span style={{ color: "var(--gray-400)" }}>—</span>}</td>
                                <td className="r" onClick={e => e.stopPropagation()}>
                                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                        <button className="cb-btn-signin" style={{ padding: "6px 14px", fontSize: 12 }} onClick={() => onView(s)}>View</button>
                                        {s.status === "active" && <button className="cb-trade-btn" style={{ padding: "6px 14px", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }} onClick={() => toast.add("QR refreshed", "success")}><RotateCcw size={12} /> QR</button>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
}

function AttendanceTable({ session }) {
    const [search, setSearch] = useState("");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!session?.id) return;
        setLoading(true);
        axios.get(`${API_BASE}/api/lecturer/sessions/${session.id}/attendance`, { headers: getAuthHeaders() })
            .then(r => setStudents(Array.isArray(r.data) ? r.data : []))
            .catch(() => setStudents([]))
            .finally(() => setLoading(false));
    }, [session?.id]);
    const rows = students.filter(s => (s.student_name || s.name || "").toLowerCase().includes(search.toLowerCase()) || (s.student_id || s.id || "").toString().includes(search));
    return (
        <div className="cb-tbl-wrap">
            <div className="cb-tbl-top">
                <div className="cb-tbl-title">Attendance — {session?.courseName} · {session?.date}</div>
                <div className="cb-tbl-filters">
                    <div className="cb-search-box">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                        <input placeholder="Student ID or name…" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button className="cb-btn-dark" style={{ padding: "8px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><Download size={14} /> Export CSV</button>
                </div>
            </div>
            <table className="cb-tbl">
                <thead><tr><th>Student ID</th><th>Name</th><th>Course</th><th>Check-in</th><th>Geofence</th><th className="c">Status</th></tr></thead>
                <tbody>
                    {loading && <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--gray-400)" }}>Loading…</td></tr>}
                    {!loading && rows.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "var(--gray-400)" }}>No records yet</td></tr>}
                    {rows.map(s => {
                        const sid = s.student_id || s.id;
                        const name = s.student_name || s.name || "—";
                        const course = s.course_code || s.course || session?.courseName || "—";
                        const time = s.submitted_at ? new Date(s.submitted_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : s.time || "—";
                        const geoOk = s.geo_valid !== false && (s.geo || "").toLowerCase() !== "out of range";
                        const flagged = s.flagged || s.flag || false;
                        return (
                            <tr key={sid}>
                                <td style={{ fontVariantNumeric: "tabular-nums", color: "var(--text)", fontWeight: 500 }}>{sid}</td>
                                <td style={{ fontWeight: 600, color: "var(--text)" }}>{name}</td>
                                <td>{course}</td>
                                <td style={{ fontVariantNumeric: "tabular-nums" }}>{time}</td>
                                <td style={{ fontSize: 13, color: geoOk ? "var(--green)" : "#D97706", display: "flex", alignItems: "center", gap: 4 }}>{geoOk ? <><Check size={13} />In range</> : <><AlertTriangle size={13} />{s.geo || "Out of range"}</>}</td>
                                <td className="c"><span className={`cb-bdg ${flagged ? "yellow" : "green"}`}>{flagged ? <><AlertTriangle size={12} /> Flagged</> : <><Check size={12} /> Verified</>}</span></td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function FlaggedView({ toast }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        axios.get(`${API_BASE}/api/lecturer/flags`, { headers: getAuthHeaders() })
            .then(r => setItems(Array.isArray(r.data) ? r.data : []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);
    const handle = async (id, action) => {
        try {
            await axios.post(`${API_BASE}/api/lecturer/flags/${id}/${action}`, {}, { headers: getAuthHeaders() });
            setItems(it => it.map(i => i.id === id ? { ...i, status: action === "approve" ? "approved" : "rejected" } : i));
            toast.add(action === "approve" ? "Submission approved" : "Submission rejected", action === "approve" ? "success" : "error");
        } catch (e) { toast.add("Action failed", "error"); }
    };
    const pending = items.filter(i => i.status === "pending");
    const resolved = items.filter(i => i.status !== "pending");
    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.8px" }}>Flagged Submissions</h2>
                    <p style={{ fontSize: 14, color: "var(--gray-500)", marginTop: 4 }}>{pending.length} awaiting review</p>
                </div>
            </div>
            {pending.length === 0 && <div style={{ textAlign: "center", padding: 48, color: "var(--gray-400)" }}><Check size={13} /> All submissions reviewed</div>}
            {pending.map(f => (
                <div key={f.id} className="cb-flag-card">
                    <div className="cb-flag-icon"><AlertTriangle size={18} /></div>
                    <div style={{ flex: 1 }}>
                        <div className="cb-flag-name">{f.student_name || f.student || "Unknown"} <span style={{ fontSize: 12, fontWeight: 400, color: "var(--gray-500)" }}>#{f.student_id || f.sid}</span></div>
                        <div className="cb-flag-reason">{f.rejection_reason || f.reason}</div>
                        <div className="cb-flag-meta">{f.course_code || f.session} · {f.submitted_at ? new Date(f.submitted_at).toLocaleDateString() : ""}</div>
                        <div className="cb-flag-actions">
                            <button className="cb-flag-approve" onClick={() => handle(f.id, "approved")} style={{ display: "flex", alignItems: "center", gap: 4 }}><Check size={12} /> Approve</button>
                            <button className="cb-flag-reject" onClick={() => handle(f.id, "rejected")} style={{ display: "flex", alignItems: "center", gap: 4 }}><X size={12} /> Reject</button>
                        </div>
                    </div>
                </div>
            ))}
            {resolved.length > 0 && (
                <div style={{ marginTop: 28 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 14 }}>Resolved</div>
                    {resolved.map(f => (
                        <div key={f.id} className="cb-flag-card" style={{ opacity: .55 }}>
                            <div className="cb-flag-icon" style={{ opacity: .6 }}><AlertCircle size={18} /></div>
                            <div><div className="cb-flag-name">{f.student}</div><div className="cb-flag-reason">{f.reason}</div><span className={`cb-bdg ${f.status === "approved" ? "green" : "red"}`} style={{ marginTop: 6, display: "inline-flex" }}>{f.status}</span></div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function CoursesView({ toast, courses = [], onAdd }) {
    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                <div><h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.8px" }}>Courses</h2><p style={{ fontSize: 14, color: "var(--gray-500)", marginTop: 4 }}>{courses.length} courses</p></div>
                <button className="cb-btn-signup" style={{ padding: "10px 22px" }} onClick={onAdd}>+ Add Course</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
                {courses.map(c => (
                    <div key={c.id} className="cb-stat-card" style={{ cursor: "pointer" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                            <div>
                                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.5px" }}>{c.code || c.course_code}</div>
                                <div style={{ fontSize: 13, color: "var(--gray-500)", marginTop: 2 }}>{c.department || c.dept || ""}</div>
                            </div>
                            <span className="cb-bdg blue">{c.enrolled_count || c.enrolled || 0} students</span>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 16 }}>{c.name}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="cb-filter-pill" style={{ flex: 1, padding: "8px", fontSize: 13 }} onClick={() => toast.add("Viewing " + c.code, "success")}>View</button>
                            <button className="cb-filter-pill" style={{ flex: 1, padding: "8px", fontSize: 13 }} onClick={() => toast.add("Enrollments for " + c.code, "success")}>Enrollments</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function NewSessionModal({ onClose, onSave, toast, courses = [] }) {
    const [form, setForm] = useState({ course: "", date: new Date().toISOString().split("T")[0], time: "09:00", duration: "90", radius: "100" });
    const [submitting, setSubmitting] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const submit = async () => {
        if (!form.course) { toast.add("Please select a course", "warn"); return; }
        const c = courses.find(x => (x.code || x.course_code) === form.course);
        if (!c) { toast.add("Course not found", "error"); return; }
        setSubmitting(true);
        try {
            await axios.post(`${API_BASE}/api/lecturer/sessions`, { courseId: c.id, latitude: 0, longitude: 0, radius: parseInt(form.radius) || 100 }, { headers: getAuthHeaders() });
            toast.add("Session started", "success");
            onSave();
        } catch (e) { toast.add(e?.response?.data?.error || "Failed to create session", "error"); }
        finally { setSubmitting(false); }
    };
    return (
        <div className="cb-modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="cb-modal">
                <div className="cb-modal-hdr">
                    <div className="cb-modal-hdr-title">Create New Session</div>
                    <button className="cb-modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <div className="cb-modal-body">
                    <div className="cb-form-row">
                        <label className="cb-form-lbl">Course</label>
                        <select className="cb-form-select" value={form.course} onChange={e => set("course", e.target.value)}>
                            <option value="">Select a course…</option>
                            {courses.map(c => <option key={c.id} value={c.code || c.course_code}>{c.code || c.course_code} — {c.name || c.course_name}</option>)}
                        </select>
                    </div>
                    <div className="cb-form-grid">
                        <div className="cb-form-row"><label className="cb-form-lbl">Date</label><input className="cb-form-input" type="date" value={form.date} onChange={e => set("date", e.target.value)} /></div>
                        <div className="cb-form-row"><label className="cb-form-lbl">Start Time</label><input className="cb-form-input" type="time" value={form.time} onChange={e => set("time", e.target.value)} /></div>
                        <div className="cb-form-row"><label className="cb-form-lbl">Duration (min)</label><input className="cb-form-input" type="number" value={form.duration} onChange={e => set("duration", e.target.value)} placeholder="90" /></div>
                        <div className="cb-form-row"><label className="cb-form-lbl">Geofence Radius (m)</label><input className="cb-form-input" type="number" value={form.radius} onChange={e => set("radius", e.target.value)} placeholder="100" /></div>
                    </div>
                    <div className="cb-form-row">
                        <label className="cb-form-lbl">Location Preview</label>
                        <div className="cb-geo-preview">
                            <div className="cb-geo-ring" style={{ width: 120, height: 120 }} />
                            <div className="cb-geo-ring" style={{ width: 80, height: 80, animationDelay: ".5s" }} />
                            <div className="cb-geo-ring" style={{ width: 40, height: 40, animationDelay: "1s" }} />
                            <div className="cb-geo-dot" />
                            <div className="cb-geo-lbl">Radius: {form.radius} m · GPS locks on session start</div>
                        </div>
                    </div>
                    <div className="cb-form-actions">
                        <button className="cb-btn-signin" onClick={onClose}>Cancel</button>
                        <button className="cb-btn-signup" style={{ padding: "11px 24px", fontSize: 14, opacity: submitting ? .8 : 1 }} onClick={submit} disabled={submitting}>{submitting ? "Creating…" : "Create Session"}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}


/* ────────── NEW COURSE MODAL ────────── */
function NewCourseModal({ onClose, onSave, toast }) {
    const [form, setForm] = useState({ course_code: "", title: "" });
    const [submitting, setSubmitting] = useState(false);
    const submit = async (e) => {
        e.preventDefault();
        if (!form.course_code || !form.title) { toast.add("All fields required", "warn"); return; }
        setSubmitting(true);
        try {
            await axios.post(`${API_BASE}/api/lecturer/courses`, form, { headers: getAuthHeaders() });
            toast.add("Course created", "success");
            onSave();
        } catch (e) { toast.add(e?.response?.data?.error || "Failed to create course", "error"); }
        finally { setSubmitting(false); }
    };
    return (
        <div className="cb-modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="cb-modal" style={{ maxWidth: 400 }}>
                <div className="cb-modal-hdr">
                    <div className="cb-modal-hdr-title">Add New Course</div>
                    <button className="cb-modal-close" onClick={onClose}><X size={16} /></button>
                </div>
                <form onSubmit={submit} className="cb-modal-body">
                    <div className="cb-form-row">
                        <label className="cb-form-lbl">Course Code</label>
                        <input className="cb-form-input" placeholder="CS401" value={form.course_code} onChange={e => setForm({ ...form, course_code: e.target.value.toUpperCase() })} required />
                    </div>
                    <div className="cb-form-row">
                        <label className="cb-form-lbl">Course Title</label>
                        <input className="cb-form-input" placeholder="Database Systems" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div className="cb-form-actions">
                        <button type="button" className="cb-btn-signin" onClick={onClose}>Cancel</button>
                        <button type="submit" className="cb-btn-signup" disabled={submitting} style={{ opacity: submitting ? .7 : 1 }}>{submitting ? "Adding..." : "Add Course"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SessionDetail({ session, onBack, toast }) {
    const [tab, setTab] = useState("attendance");
    return (
        <div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                <button className="cb-btn-signin" onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 4 }}><ChevronLeft size={15} /> Back</button>
                <div>
                    <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.8px" }}>{session.courseName} — Session #{session.id}</h2>
                    <p style={{ fontSize: 14, color: "var(--gray-500)", marginTop: 2 }}>{session.date} · {session.time} · {session.duration} min</p>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
                    <span className={`cb-bdg ${session.status === "active" ? "green" : "gray"}`}>{session.status === "active" ? <><span className="cb-bdg-dot" />LIVE</> : "CLOSED"}</span>
                    <button className="cb-btn-dark" style={{ padding: "8px 16px", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }} onClick={() => toast.add("CSV downloaded", "success")}><Download size={14} /> CSV</button>
                </div>
            </div>
            <div className="cb-tabs">
                {["attendance", "flagged", "analytics"].map(t => (
                    <button key={t} className={`cb-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                        {t === "flagged" && session.flagged > 0 && <span style={{ marginLeft: 6, background: "#D97706", color: "white", fontSize: 10, fontWeight: 700, borderRadius: 4, padding: "1px 6px" }}>{session.flagged}</span>}
                    </button>
                ))}
            </div>
            {tab === "attendance" && <AttendanceTable session={session} />}
            {tab === "flagged" && <FlaggedView toast={toast} />}
            {tab === "analytics" && (
                <div className="cb-stats">
                    {[{ lbl: "Total Enrolled", val: session.total, color: "var(--blue)" }, { lbl: "Present", val: session.attended, color: "var(--green)" }, { lbl: "Absent", val: session.total - session.attended, color: "var(--red)" }, { lbl: "Flagged", val: session.flagged, color: "#D97706" }].map(s => (
                        <div key={s.lbl} className="cb-stat-card"><div className="cb-stat-lbl">{s.lbl}</div><div className="cb-stat-val" style={{ color: s.color, fontSize: 40 }}>{s.val}</div></div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── DASHBOARD SIDEBAR (Coinbase Explore sidebar style) ── */
function DashSidebar({ toast, sessions = [], students = [], onNewSession }) {
    const s = sessions.find(x => x.status === "active") || sessions[0] || { courseName: "—", attended: 0, total: 0, duration: 0, flagged: 0, id: null };
    return (
        <div className="cb-dash-sidebar">
            {/* blue get-started card */}
            <div className="cb-side-blue">
                <div className="cb-side-deco"><GraduationCap size={80} strokeWidth={1} /></div>
                <h3>Quick start</h3>
                <p>Create a session and show the live QR to start taking attendance.</p>
                <button className="cb-side-blue-btn" onClick={onNewSession}>+ New Session</button>
            </div>
            {/* QR panel */}
            <QRPanel session={s} onRefresh={() => toast.add("QR refreshed", "success")} />
            {/* session progress */}
            <div className="cb-side-card">
                <div className="cb-side-card-hdr">
                    <h3>Active Session</h3>
                    <span className="cb-bdg green" style={{ fontSize: 11 }}><span className="cb-bdg-dot" />LIVE</span>
                </div>
                <div className="cb-prog-bar" style={{ marginBottom: 8 }}><div className="cb-prog-fill" style={{ width: `${pct(s.attended_count || s.attended || 0, s.total || 1)}%` }} /></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--gray-500)", marginBottom: 14 }}><span>{s.attended_count || s.attended || 0} present</span><span>{pct(s.attended_count || s.attended || 0, s.total || 1)}%</span></div>
                {[["Course", s.course_code || s.courseName || "—"], ["Duration", `${s.duration || 0} min`], ["Present", `${s.attended_count || s.attended || 0}/${s.total || 0}`], ["Flagged", `${s.flagged || 0} submissions`]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid var(--gray-100)" }}>
                        <span style={{ color: "var(--gray-500)" }}>{k}</span>
                        <span style={{ fontWeight: 500, color: k === "Flagged" && s.flagged > 0 ? "#D97706" : "var(--text)" }}>{v}</span>
                    </div>
                ))}
            </div>
            {/* recent check-ins (Coinbase "Top movers" style) */}
            <div className="cb-side-card">
                <div className="cb-side-card-hdr"><h3>Recent Check-ins</h3><div className="cb-side-nav"><button>←</button><button>→</button></div></div>
                <div style={{ fontSize: 12, color: "var(--gray-400)", marginBottom: 12 }}>Today · CS401</div>
                <div className="cb-mover-grid">
                    {students.filter(s => !s.flag && !s.flagged).slice(0, 4).map(s => (
                        <div key={s.id} className="cb-mover-tile">
                            <div className="cb-mover-icon">{(s.student_name || s.name || "?")[0]}</div>
                            <div className="cb-mover-ticker">{s.student_id || s.id}</div>
                            <div className="cb-mover-chg up" style={{ display: "flex", alignItems: "center", gap: 3 }}><Check size={11} /> {s.submitted_at ? new Date(s.submitted_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : s.time || ""}</div>
                            <div className="cb-mover-price">{(s.student_name || s.name || "").split(" ")[0]}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Dashboard({ toast }) {
    const [tab, setTab] = useState("Dashboard");
    const [sel, setSel] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [user, setUser] = useState(() => localStorage.getItem("token") ? { token: localStorage.getItem("token") } : null);
    const [courses, setCourses] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [flags, setFlags] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const h = { headers: getAuthHeaders() };
            const [c, s, f] = await Promise.all([
                axios.get(`${API_BASE}/api/lecturer/courses`, h).catch(() => ({ data: [] })),
                axios.get(`${API_BASE}/api/lecturer/sessions`, h).catch(() => ({ data: [] })),
                axios.get(`${API_BASE}/api/lecturer/flags`, h).catch(() => ({ data: [] })),
            ]);
            setCourses(Array.isArray(c.data) ? c.data : []);
            setSessions(Array.isArray(s.data) ? s.data : []);
            setFlags(Array.isArray(f.data) ? f.data : []);
            // Fetch students from the active session if any
            const active = (Array.isArray(s.data) ? s.data : []).find(x => x.status === "active");
            if (active) {
                axios.get(`${API_BASE}/api/lecturer/sessions/${active.id}/attendance`, { headers: getAuthHeaders() })
                    .then(r => setStudents(Array.isArray(r.data) ? r.data : []))
                    .catch(() => { });
            }
        } catch (e) { toast.add("Failed to load data", "error"); }
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const r = await axios.post(`${API_BASE}/api/lecturer/login`, { email: e.target.email.value, password: e.target.password.value });
            localStorage.setItem("token", r.data.token);
            setUser({ token: r.data.token });
        } catch (e) { toast.add(e?.response?.data?.error || "Invalid credentials", "error"); }
    };

    if (!user) {
        return (
            <div className="cb-submit-page">
                <div className="cb-submit-card">
                    <div className="cb-submit-logo">
                        <div><img src="/logo.png" style={{ height: 52, width: 52, objectFit: "contain" }} /></div>
                        <div className="cb-submit-title">Lecturer Sign In</div>
                        <div className="cb-submit-sub">Sign in to access your dashboard</div>
                    </div>
                    <form onSubmit={handleLogin}>
                        <div className="cb-form-row"><label className="cb-form-lbl">Email</label><input className="cb-form-input" name="email" type="email" required placeholder="you@university.edu" /></div>
                        <div className="cb-form-row"><label className="cb-form-lbl">Password</label><input className="cb-form-input" name="password" type="password" required placeholder="••••••••" /></div>
                        <button className="cb-btn-signup" style={{ width: "100%", padding: 14, fontSize: 15, borderRadius: 100 }} type="submit">Sign In</button>
                    </form>
                </div>
            </div>
        );
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const showSidebar = tab === "Dashboard" && !sel;
    const renderMain = () => {
        if (sel) return <SessionDetail session={sel} onBack={() => setSel(null)} toast={toast} />;
        if (tab === "Dashboard") return (
            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
                    <div><h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.8px" }}>Dashboard</h2><p style={{ fontSize: 14, color: "var(--gray-500)", marginTop: 4 }}>{dateStr} · {timeStr}</p></div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button className="cb-btn-signin" style={{ display: "flex", alignItems: "center", gap: 6 }} onClick={() => toast.add("No data to export yet", "warn")}><Download size={14} /> Report</button>
                        <button className="cb-btn-signup" style={{ padding: "10px 22px" }} onClick={() => setShowModal(true)}>+ New Session</button>
                    </div>
                </div>
                <StatsRow sessions={sessions} courses={courses} flags={flags} />
                <SessionsTable onView={setSel} onNew={() => setShowModal(true)} toast={toast} sessions={sessions} courses={courses} />
            </div>
        );
        if (tab === "Sessions") return <div><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}><h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.8px" }}>Sessions</h2><button className="cb-btn-signup" style={{ padding: "10px 22px" }} onClick={() => setShowModal(true)}>+ New Session</button></div><SessionsTable onView={setSel} onNew={() => setShowModal(true)} toast={toast} sessions={sessions} courses={courses} /></div>;
        if (tab === "Courses") return <CoursesView toast={toast} courses={courses} onAdd={() => setShowCourseModal(true)} />;
        if (tab === "Flagged") return <FlaggedView toast={toast} />;
        if (tab === "Students") return <div><h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-.8px", marginBottom: 24 }}>Students</h2><AttendanceTable session={sessions.find(s => s.status === "active") || sessions[0] || null} /></div>;
    };
    return (
        <div>
            <DashNav tab={sel ? "Dashboard" : tab} setTab={t => { setTab(t); setSel(null); }} setPage={() => { }} onLogout={() => { localStorage.removeItem("token"); setUser(null); }} />
            <div className="cb-dash-page">
                <div className="cb-dash-main">{renderMain()}</div>
                {showSidebar && <DashSidebar toast={toast} sessions={sessions} students={students} onNewSession={() => setShowModal(true)} />}
            </div>
            {showModal && <NewSessionModal onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); fetchAll(); }} toast={toast} courses={courses} />}
            {showCourseModal && <NewCourseModal onClose={() => setShowCourseModal(false)} onSave={() => { setShowCourseModal(false); fetchAll(); }} toast={toast} />}
        </div>
    );
}

/* ────────── STUDENT SUBMIT ────────── */
function StudentPage({ setPage }) {
    const [step, setStep] = useState("form");
    const [form, setForm] = useState({ sid: "", name: "", course: "", error: "" });
    const [loading, setLoading] = useState(false);
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
    const submit = async () => {
        if (!form.sid || !form.name || !form.course) return;
        setLoading(true);
        try {
            // Get current GPS position
            const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 })).catch(() => null);
            const payload = {
                studentId: form.sid,
                studentName: form.name,
                courseCode: form.course,
                latitude: pos?.coords?.latitude || 0,
                longitude: pos?.coords?.longitude || 0,
                accuracy: pos?.coords?.accuracy || 999,
                token: new URLSearchParams(window.location.search).get("token") || "",
            };
            await axios.post(`${API_BASE}/api/student/submit`, payload);
            setStep("success");
        } catch (e) {
            const msg = e?.response?.data?.error || "Submission failed. Check your QR code is still valid.";
            // Show error but don't crash
            setForm(f => ({ ...f, error: msg }));
        }
        finally { setLoading(false); }
    };
    return (
        <div className="cb-submit-page">
            <div className="cb-submit-card">
                <div className="cb-submit-logo">
                    <div><img src="/logo.png" style={{ height: 52, width: 52, objectFit: "contain" }} /></div>
                    <div className="cb-submit-title">Acadience Attendance</div>
                    <div className="cb-submit-sub">Scan QR · Enter details · Submit</div>
                </div>
                {step === "form" && (
                    <div>
                        <div className="cb-form-row"><label className="cb-form-lbl">Student ID</label><input className="cb-form-input" placeholder="e.g. 10001234" value={form.sid} onChange={e => set("sid", e.target.value)} /></div>
                        <div className="cb-form-row"><label className="cb-form-lbl">Full Name</label><input className="cb-form-input" placeholder="Your full name" value={form.name} onChange={e => set("name", e.target.value)} /></div>
                        <div className="cb-form-row">
                            <label className="cb-form-lbl">Course</label>
                            <select className="cb-form-select" value={form.course} onChange={e => set("course", e.target.value)}>
                                <option value="">Select your course…</option>
                                {/* courses loaded from URL params or public endpoint */}
                            </select>
                        </div>
                        <div className="cb-form-row">
                            <label className="cb-form-lbl">Location</label>
                            <div className="cb-geo-preview">
                                <div className="cb-geo-ring" style={{ width: 100, height: 100 }} /><div className="cb-geo-ring" style={{ width: 64, height: 64, animationDelay: ".6s" }} /><div className="cb-geo-ring" style={{ width: 32, height: 32, animationDelay: "1.2s" }} /><div className="cb-geo-dot" />
                                <div className="cb-geo-lbl">Acquiring GPS location…</div>
                            </div>
                        </div>
                        {form.error && <div style={{ background: "#FEF2F2", color: "var(--red)", border: "1.5px solid rgba(207,48,74,.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 12 }}>{form.error}</div>}<button className="cb-btn-signup" style={{ width: "100%", padding: 14, fontSize: 15, borderRadius: 100, opacity: loading ? .75 : 1 }} onClick={submit} disabled={loading}>{loading ? "Submitting…" : "Submit Attendance"}</button>
                        <p style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "var(--gray-400)" }}>Geofenced · Device-fingerprinted · Time-window enforced</p>
                        <button onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 4, margin: "16px auto 0", background: "none", border: "none", fontSize: 13, color: "var(--gray-400)", cursor: "pointer" }}><ChevronLeft size={13} /> Back to home</button>
                    </div>
                )}
                {step === "success" && (
                    <div className="cb-submit-success">
                        <div className="cb-submit-success-icon"><Check size={28} strokeWidth={3} /></div>
                        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.5px" }}>Attendance Recorded!</div>
                        <p style={{ fontSize: 14, color: "var(--gray-500)", textAlign: "center", lineHeight: 1.6 }}>Your attendance for <strong>{form.course}</strong> has been recorded.</p>
                        <div className="cb-receipt">
                            {[["Student ID", form.sid], ["Name", form.name], ["Course", form.course], ["Time", new Date().toLocaleTimeString()], ["Status", "Verified <Check size={13}/>"]].map(([k, v]) => (
                                <div key={k} className="cb-receipt-row"><span className="cb-receipt-k">{k}</span><span className="cb-receipt-v" style={k === "Status" ? { color: "var(--green)" } : {}}>{v}</span></div>
                            ))}
                        </div>
                        <button className="cb-btn-dark" style={{ width: "100%", padding: 13, borderRadius: 100 }} onClick={() => { setStep("form"); setForm({ sid: "", name: "", course: "", error: "" }); }}>Submit Another</button>
                        <button onClick={() => setPage("home")} style={{ background: "none", border: "none", fontSize: 13, color: "var(--gray-400)", cursor: "pointer", marginTop: 8 }} style={{ display: "flex", alignItems: "center", gap: 4 }}><ChevronLeft size={13} /> Back to home</button>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ────────── ROOT ────────── */

/* ────────── AUTH PAGE (Login/Signup) ────────── */
function AuthPage({ initialMode = "login", onAuth, toast }) {
    const [mode, setMode] = useState(initialMode);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "", name: "", confirm: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === "signup") {
                if (form.password !== form.confirm) throw new Error("Passwords do not match");
                await axios.post(`${API_BASE}/api/lecturer/register`, {
                    email: form.email,
                    full_name: form.name,
                    password: form.password
                });
                toast.add("Registration successful! Please sign in.");
                setMode("login");
            } else {
                const res = await axios.post(`${API_BASE}/api/lecturer/login`, {
                    email: form.email,
                    password: form.password
                });
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("lecturer", JSON.stringify(res.data.lecturer));
                onAuth();
            }
        } catch (err) {
            toast.add(err.response?.data?.error || err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cb-submit-page" style={{ minHeight: "100vh", padding: "80px 20px" }}>
            <div className="cb-submit-card" style={{ maxWidth: 400, margin: "0 auto" }}>
                <div className="cb-submit-logo">
                    <div><img src="/logo.png" style={{ height: 52, width: 52, objectFit: "contain" }} /></div>
                    <div className="cb-submit-title">Lecturer {mode === "login" ? "Sign In" : "Sign Up"}</div>
                    <div className="cb-submit-sub">{mode === "login" ? "Access your attendance dashboard" : "Create an account to manage your sessions"}</div>
                </div>
                <form onSubmit={handleSubmit}>
                    {mode === "signup" && (
                        <div className="cb-form-row">
                            <label className="cb-form-lbl">Full Name</label>
                            <input className="cb-form-input" placeholder="Dr. Jane Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                        </div>
                    )}
                    <div className="cb-form-row">
                        <label className="cb-form-lbl">Email Address</label>
                        <input className="cb-form-input" type="email" placeholder="lecturer@university.edu" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div className="cb-form-row">
                        <label className="cb-form-lbl">Password</label>
                        <input className="cb-form-input" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                    </div>
                    {mode === "signup" && (
                        <div className="cb-form-row">
                            <label className="cb-form-lbl">Confirm Password</label>
                            <input className="cb-form-input" type="password" placeholder="••••••••" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
                        </div>
                    )}
                    <button type="submit" className="cb-btn-signup" style={{ width: "100%", padding: 14, fontSize: 15, borderRadius: 100, marginTop: 10 }} disabled={loading}>
                        {loading ? "Processing..." : (mode === "login" ? "Sign In" : "Create Account")}
                    </button>
                </form>
                <div style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--gray-500)" }}>
                    {mode === "login" ? "Don't have an account?" : "Already have an account?"} {" "}
                    <button onClick={() => setMode(mode === "login" ? "signup" : "login")} style={{ background: "none", border: "none", color: "var(--blue)", fontWeight: 600, cursor: "pointer" }}>
                        {mode === "login" ? "Sign up" : "Sign in"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function App() {
    const [page, setPage] = useState(() => {
        const p = window.location.pathname.replace("/", "");
        if (["login", "signup", "dashboard", "student"].includes(p)) return p;
        return "home";
    });
    const toast = useToast();

    const navigate = (p) => {
        window.history.pushState({}, "", "/" + (p === "home" ? "" : p));
        setPage(p);
        window.scrollTo(0, 0);
    };

    useEffect(() => {
        const handlePop = () => {
            const p = window.location.pathname.replace("/", "");
            setPage(["login", "signup", "dashboard", "student"].includes(p) ? p : "home");
        };
        window.addEventListener("popstate", handlePop);
        return () => window.removeEventListener("popstate", handlePop);
    }, []);

    const isAuth = !!localStorage.getItem("token");

    return (
        <>
            <style>{CSS}</style>
            {page === "home" && (
                <>
                    <Nav setPage={navigate} toast={toast} />
                    <HomePage setPage={navigate} toast={toast} />
                </>
            )}
            {(page === "login" || page === "signup") && (
                <AuthPage
                    initialMode={page}
                    onAuth={() => navigate("dashboard")}
                    toast={toast}
                />
            )}
            {page === "dashboard" && (
                isAuth ? <Dashboard toast={toast} /> : <AuthPage initialMode="login" onAuth={() => navigate("dashboard")} toast={toast} />
            )}
            {page === "student" && <StudentPage setPage={navigate} />}
            <Toasts ts={toast.ts} />
        </>
    );
}
